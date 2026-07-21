/**
 * Server-to-server settlement of a registered PASHA transaction — shared by
 * the bank's callback route and the reconciliation sweep (lib/payments/
 * pasha-reconciliation.ts), since both need to apply the exact same
 * paid/failed decision to Payment + Order and must not double-process if
 * they race each other.
 */
import { OrderStatus, PaymentStatus, type Prisma } from "@prisma/client";
import { getTransactionResult } from "@/lib/payments/pasha";
import { prisma } from "@/lib/prisma";

export type PashaSettlementResult =
  | {
      outcome: "paid" | "failed";
      resultCode: string | null;
      rrn: string | null;
      approvalCode: string | null;
      error: string | null;
    }
  | { outcome: "already_resolved" };

/**
 * Calls getTransactionResult (command=c) and applies the result to
 * Payment/Order. The write is a conditional updateMany keyed on the payment
 * still being PENDING — if some other caller (the live callback, or a
 * concurrent reconciliation pass) already resolved it, this is a no-op and
 * "already_resolved" is returned instead of re-applying a status change or
 * double-firing side effects like notifications.
 */
export async function settlePashaTransaction(
  paymentId: string,
  orderId: string,
  transId: string
): Promise<PashaSettlementResult> {
  const { paid, resultCode, rrn, approvalCode, error, raw } = await getTransactionResult(transId);

  const metadata = paid
    ? { lastResult: raw, resultCode, rrn, approvalCode }
    : { lastResult: raw, resultCode, rrn, approvalCode, error };

  const updates: Prisma.PrismaPromise<Prisma.BatchPayload>[] = [
    prisma.payment.updateMany({
      where: { id: paymentId, status: PaymentStatus.PENDING },
      data: {
        status: paid ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
        metadata,
      },
    }),
  ];

  if (paid) {
    updates.push(
      prisma.order.updateMany({
        where: { id: orderId, status: OrderStatus.AWAITING_PAYMENT },
        data: { status: OrderStatus.PAID },
      })
    );
  }

  const results = await prisma.$transaction(updates);

  if (results[0].count === 0) {
    return { outcome: "already_resolved" };
  }

  return { outcome: paid ? "paid" : "failed", resultCode, rrn, approvalCode, error };
}

/**
 * Admin-triggered reversal of a completed PASHA transaction. Unlike
 * pasha-settlement.ts (which races the bank callback against a reconciliation
 * sweep and needs a compare-and-swap-style conditional update), this is a
 * single admin-paced action, so a pre-check that the payment is still
 * COMPLETED before ever calling the bank is enough to guard against
 * double-refunding — there's no transient "REFUNDING" status to claim first.
 */
import { OrderStatus, PaymentStatus, type Prisma } from "@prisma/client";
import { reverseTransaction } from "@/lib/payments/pasha";
import { prisma } from "@/lib/prisma";
import { orderInclude } from "@/lib/orders/orders";

export function isPaymentRefundable(status: PaymentStatus): boolean {
  return status === PaymentStatus.COMPLETED;
}

export type PashaRefundResult =
  | {
      outcome: "refunded";
      partial: boolean;
      resultCode: string | null;
      rrn: string | null;
      approvalCode: string | null;
    }
  | {
      outcome: "failed";
      result: string | null;
      resultCode: string | null;
      error: string | null;
    }
  | { outcome: "not_refundable" };

/**
 * amountMinor undefined => full reversal (also flips Order.status to
 * REFUNDED and restocks inventory for every line item). amountMinor present
 * => partial reversal (Order.status and inventory are left untouched — TODO:
 * support restocking specific line items on partial refund once there's a UI
 * for picking which ones).
 */
export async function refundPashaTransaction(
  orderId: string,
  amountMinor: number | undefined,
  actor: { id: string | null; email: string | null }
): Promise<PashaRefundResult> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  });

  if (!order?.payment || !order.payment.transactionId || !isPaymentRefundable(order.payment.status)) {
    return { outcome: "not_refundable" };
  }

  const payment = order.payment;
  const completion = await reverseTransaction(payment.transactionId as string, amountMinor);

  if (!completion.paid) {
    return {
      outcome: "failed",
      result: completion.result,
      resultCode: completion.resultCode,
      error: completion.error,
    };
  }

  const partial = amountMinor !== undefined;
  const existingMetadata =
    payment.metadata && typeof payment.metadata === "object" && !Array.isArray(payment.metadata)
      ? (payment.metadata as Record<string, unknown>)
      : {};

  const metadata = {
    ...existingMetadata,
    lastRefundResult: completion.raw,
    refundedAt: new Date().toISOString(),
    refundedBy: actor,
    refundAmountMinor: amountMinor,
    partial,
  };

  const updates: Prisma.PrismaPromise<unknown>[] = [
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.REFUNDED, metadata },
    }),
  ];

  if (!partial) {
    updates.push(
      prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.REFUNDED },
      })
    );

    for (const item of order.items) {
      if (!item.variantId) continue;
      updates.push(
        prisma.inventory.updateMany({
          where: { variantId: item.variantId },
          data: { quantity: { increment: item.quantity } },
        })
      );
    }
  }

  await prisma.$transaction(updates);

  return {
    outcome: "refunded",
    partial,
    resultCode: completion.resultCode,
    rrn: completion.rrn,
    approvalCode: completion.approvalCode,
  };
}

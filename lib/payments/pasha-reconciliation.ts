/**
 * Safety net for the PASHA callback round trip: the bank's redirect back to
 * our callback URL is configured on the bank's side (there's no back_url
 * field in registerTransaction — see lib/payments/pasha.ts), so if that
 * configuration is ever wrong, missing, or the customer's browser just never
 * makes it back, a payment would otherwise sit registered at the bank
 * forever with the order stuck AWAITING_PAYMENT and nobody told.
 *
 * This sweeps Payments that were registered (transactionId set) more than
 * STALE_AFTER_MS ago, are still PENDING, and whose order is still
 * AWAITING_PAYMENT, then asks the bank directly (same getTransactionResult /
 * command=c call the callback uses) and settles them. Safe to run
 * concurrently with the live callback and with itself: settlePashaTransaction
 * does the actual write as a conditional update, so whichever of them (this
 * sweep, or the callback) gets there first wins and the other is a no-op.
 */
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { getOrderById } from "@/lib/orders/orders";
import { isPashaEnabled } from "@/lib/payments/pasha";
import { settlePashaTransaction } from "@/lib/payments/pasha-settlement";
import { notifyOrderPaid, notifyPashaReconciliationGap } from "@/lib/telegram";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

const STALE_AFTER_MS = 5 * 60 * 1000;

export type ReconciliationSummary = {
  checked: number;
  settled: number;
};

export async function reconcilePendingPashaPayments(
  now: Date = new Date()
): Promise<ReconciliationSummary> {
  if (!isPashaEnabled()) {
    return { checked: 0, settled: 0 };
  }

  const staleBefore = new Date(now.getTime() - STALE_AFTER_MS);

  const stalePayments = await prisma.payment.findMany({
    where: {
      status: PaymentStatus.PENDING,
      transactionId: { not: null },
      updatedAt: { lte: staleBefore },
      order: { status: OrderStatus.AWAITING_PAYMENT },
    },
    include: { order: { select: { id: true, orderNumber: true } } },
  });

  let settled = 0;

  for (const payment of stalePayments) {
    // Guaranteed non-null by the where clause above; Prisma's type doesn't
    // narrow on that, so guard explicitly rather than casting.
    const transId = payment.transactionId;
    if (!transId) continue;

    try {
      const settlement = await settlePashaTransaction(payment.id, payment.orderId, transId);

      if (settlement.outcome === "already_resolved") {
        // The live callback (or a previous sweep) resolved this between our
        // SELECT and the settlement's conditional UPDATE — we lost the race,
        // not a gap. No alert.
        continue;
      }

      settled++;
      logger.warn("PASHA reconciliation: settled a payment the callback never resolved", {
        orderNumber: payment.order.orderNumber,
        transactionId: transId,
        outcome: settlement.outcome,
      });

      void notifyPashaReconciliationGap({
        orderNumber: payment.order.orderNumber,
        orderId: payment.order.id,
        outcome: settlement.outcome,
        resultCode: settlement.resultCode,
      });

      if (settlement.outcome === "paid") {
        const order = await getOrderById(payment.orderId);
        if (order) void notifyOrderPaid(order);
      }
    } catch (error) {
      logger.error("PASHA reconciliation: failed to resolve stale payment", {
        paymentId: payment.id,
        transactionId: transId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { checked: stalePayments.length, settled };
}

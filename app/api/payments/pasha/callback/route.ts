/**
 * The completion page the bank redirects/POSTs the customer back to after
 * 3D-Secure. Per the integration spec: we NEVER trust this redirect by
 * itself — the paid/failed decision always comes from the server-to-server
 * settlePashaTransaction() (getTransactionResult / command=c) call below,
 * shared with the reconciliation sweep (lib/payments/pasha-reconciliation.ts)
 * so the two can't double-process if they race.
 *
 * Both the paid and not-paid outcomes land the customer on the same
 * confirmation URL — that page renders a different state depending on
 * order.status, so it doubles as the "payment failed, retry" experience.
 * This also means the single result URL we show/email guests before they
 * leave for the bank (see CheckoutWizard / sendGuestPaymentLinkEmail) is
 * correct no matter how the payment turns out.
 */
import { NextResponse } from "next/server";
import { PaymentStatus } from "@prisma/client";
import { logger } from "@/lib/logger";
import { getOrderById } from "@/lib/orders/orders";
import { isPashaEnabled } from "@/lib/payments/pasha";
import { settlePashaTransaction } from "@/lib/payments/pasha-settlement";
import { prisma } from "@/lib/prisma";
import { notifyOrderPaid } from "@/lib/telegram";

function confirmationUrl(request: Request, orderNumber: string, guestToken: string | null) {
  const url = new URL(`/checkout/confirmation/${orderNumber}`, request.url);
  if (guestToken) {
    url.searchParams.set("token", guestToken);
  }
  return url;
}

export async function POST(request: Request) {
  if (!isPashaEnabled()) {
    return NextResponse.redirect(new URL("/checkout", request.url));
  }

  // TODO(PASHA CardSuite ECOMM doc, completion-redirect chapter): confirm the
  // exact field name(s) the bank includes in this POST-back — assumed here to
  // be a form-encoded `trans_id`. We only use it to look up which transaction
  // to check; it is never used to decide payment status.
  let transId: string | null = null;
  try {
    const formData = await request.formData();
    transId = formData.get("trans_id")?.toString() ?? null;
  } catch {
    transId = null;
  }

  if (!transId) {
    logger.error("PASHA callback missing trans_id", {});
    return NextResponse.redirect(new URL("/checkout?payment=error", request.url));
  }

  const payment = await prisma.payment.findUnique({
    where: { transactionId: transId },
    include: { order: true },
  });

  if (!payment) {
    logger.error("PASHA callback: no payment found for trans_id", { transId });
    return NextResponse.redirect(new URL("/checkout?payment=error", request.url));
  }

  const dest = confirmationUrl(request, payment.order.orderNumber, payment.order.guestToken);

  // Idempotent: already resolved (by an earlier hit on this same callback,
  // or by the reconciliation sweep) — just land them on the status page,
  // which reflects whatever the current state is.
  if (payment.status !== PaymentStatus.PENDING) {
    return NextResponse.redirect(dest);
  }

  try {
    const settlement = await settlePashaTransaction(payment.id, payment.orderId, transId);

    if (settlement.outcome === "paid") {
      const order = await getOrderById(payment.orderId);
      if (order) void notifyOrderPaid(order);
    } else if (settlement.outcome === "failed") {
      // Not paid: RESULT !== "OK", RESULT missing/unrecognized, or an error
      // field was present. Never inferred from RRN/APPROVAL_CODE, never
      // defaults to success. Order stays AWAITING_PAYMENT so the customer
      // can retry from the confirmation page.
      // TODO(PASHA CardSuite ECOMM doc chapter 8): map the full RESULT_CODE
      // enumeration — not needed to decide paid vs not-paid, but useful
      // detail for support/debugging.
      logger.warn("PASHA transaction did not complete", {
        transId,
        resultCode: settlement.resultCode,
        error: settlement.error,
      });
    }
    // "already_resolved": the reconciliation sweep settled this in the tiny
    // window between our PENDING check above and this write — nothing left
    // to do, dest already reflects the resolved state.

    return NextResponse.redirect(dest);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "PASHA completion check failed";
    logger.error("PASHA getTransactionResult failed", { transId, error: message });
    // Payment stays PENDING (this threw before any write) — send them to the
    // status page anyway; it offers a retry, and the reconciliation sweep
    // will pick this up on its own if they never come back.
    return NextResponse.redirect(dest);
  }
}

/**
 * Skeleton only — gated by PASHA_ENABLED, not wired into live checkout.
 *
 * This is the completion page the bank redirects/POSTs the customer back to
 * after 3D-Secure. Per the integration spec: we NEVER trust this redirect by
 * itself — the paid/failed decision always comes from the server-to-server
 * getTransactionResult() (command=c) call below.
 */
import { NextResponse } from "next/server";
import { PaymentStatus, OrderStatus } from "@prisma/client";
import { logger } from "@/lib/logger";
import { getTransactionResult, isPashaEnabled } from "@/lib/payments/pasha";
import { prisma } from "@/lib/prisma";

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

  // Idempotent: a repeat hit on an already-completed payment just re-lands
  // on the confirmation page instead of re-running the completion call.
  if (payment.status === PaymentStatus.COMPLETED) {
    return NextResponse.redirect(
      confirmationUrl(request, payment.order.orderNumber, payment.order.guestToken)
    );
  }

  try {
    const { paid, result, resultCode, rrn, approvalCode, error: pashaError, raw } =
      await getTransactionResult(transId);

    if (paid) {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.COMPLETED,
            metadata: { lastResult: raw, resultCode, rrn, approvalCode },
          },
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: { status: OrderStatus.PAID },
        }),
      ]);

      return NextResponse.redirect(
        confirmationUrl(request, payment.order.orderNumber, payment.order.guestToken)
      );
    }

    // Not paid: RESULT !== "OK", RESULT missing/unrecognized, or an error
    // field was present. Never inferred from RRN/APPROVAL_CODE, never
    // defaults to success. Payment -> FAILED, order stays AWAITING_PAYMENT
    // so the customer can retry.
    // TODO(PASHA CardSuite ECOMM doc chapter 8): map the full RESULT_CODE
    // enumeration — not needed to decide paid vs not-paid, but useful detail
    // for support/debugging.
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
        metadata: { lastResult: raw, resultCode, rrn, approvalCode, error: pashaError },
      },
    });

    logger.warn("PASHA transaction did not complete", { transId, result, resultCode, error: pashaError });

    return NextResponse.redirect(new URL("/checkout?payment=failed", request.url));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "PASHA completion check failed";
    logger.error("PASHA getTransactionResult failed", { transId, error: message });
    return NextResponse.redirect(new URL("/checkout?payment=error", request.url));
  }
}

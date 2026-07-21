/**
 * Registers a PASHA transaction and returns the ClientHandler redirect URL.
 * Gated by PASHA_ENABLED. See lib/payments/pasha.ts for the wire format.
 */
import { auth } from "@/auth";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { toNumber } from "@/lib/admin/serialize";
import { apiError, apiSuccess } from "@/lib/api-response";
import { isNotificationEnabled, sendEmail } from "@/lib/email";
import { pashaGuestPaymentLinkEmail } from "@/lib/email-templates";
import { logger } from "@/lib/logger";
import { buildRedirectUrl, isPashaEnabled, registerTransaction } from "@/lib/payments/pasha";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/site-url";
import { pashaStartSchema } from "@/lib/validations/pasha";

// Best-effort belt-and-suspenders for guests: the confirmation/result URL
// (containing their guestToken) is already shown to them client-side before
// the browser leaves for the bank, but if their browser never makes it back
// (closed tab, crash, callback misconfigured at the bank — see
// lib/payments/pasha-reconciliation.ts) an emailed copy is their only other
// way back to the order. Silently a no-op if SMTP isn't configured or the
// order has no email address.
async function sendGuestPaymentLinkEmail(
  order: { orderNumber: string; guestToken: string | null; customerEmail: string | null }
): Promise<void> {
  if (!order.guestToken || !order.customerEmail) return;

  try {
    const enabled = await isNotificationEnabled("orderConfirmationOn");
    if (!enabled) return;

    const resultUrl = new URL(
      `/checkout/confirmation/${order.orderNumber}`,
      getBaseUrl()
    );
    resultUrl.searchParams.set("token", order.guestToken);

    const { subject, html } = pashaGuestPaymentLinkEmail({
      orderNumber: order.orderNumber,
      resultUrl: resultUrl.toString(),
    });

    const sent = await sendEmail({ to: order.customerEmail, subject, html });
    if (!sent) {
      logger.warn("PASHA guest payment-link email not sent", { orderNumber: order.orderNumber });
    }
  } catch (error) {
    logger.error("PASHA guest payment-link email threw unexpectedly", {
      orderNumber: order.orderNumber,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function POST(request: Request) {
  if (!isPashaEnabled()) {
    return apiError("PASHA Bank payment is not enabled", 503);
  }

  const session = await auth();
  const userId = session?.user?.id ?? null;

  try {
    const body = await request.json();
    const parsed = pashaStartSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
    }

    const { orderId, guestToken } = parsed.data;

    if (!userId && !guestToken) {
      return apiError("Unauthorized", 401);
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        ...(userId ? { userId } : { guestToken }),
      },
      include: { payment: true },
    });

    if (!order || !order.payment) {
      return apiError("Order not found", 404);
    }

    if (order.status !== OrderStatus.AWAITING_PAYMENT) {
      return apiError("Order is not awaiting payment", 409);
    }

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "0.0.0.0";

    const { transactionId, raw } = await registerTransaction({
      amount: toNumber(order.payment.amount),
      currency: order.payment.currency,
      clientIp,
      description: `Order ${order.orderNumber}`,
    });

    await prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        transactionId,
        status: PaymentStatus.PENDING,
        metadata: { lastRegisterResponse: raw },
      },
    });

    // Fire-and-forget: never block the redirect on email delivery.
    void sendGuestPaymentLinkEmail(order);

    return apiSuccess({ redirectUrl: buildRedirectUrl(transactionId) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "PASHA transaction registration failed";
    logger.error("PASHA transaction registration failed", { userId, error: message });
    return apiError(message, 502);
  }
}

import { isNotificationEnabled, sendEmail } from "@/lib/email";
import { orderConfirmationEmail } from "@/lib/email-templates";
import { logger } from "@/lib/logger";
import { getBaseUrl } from "@/lib/site-url";
import { notifyEmailFailure } from "@/lib/telegram";
import type { formatOrder } from "@/lib/orders/orders";

type FormattedOrder = ReturnType<typeof formatOrder>;

function confirmationUrl(orderNumber: string, guestToken: string | null): string {
  const url = new URL(`/checkout/confirmation/${orderNumber}`, getBaseUrl());
  if (guestToken) {
    url.searchParams.set("token", guestToken);
  }
  return url.toString();
}

/**
 * Fires once a payment is confirmed PAID — from either the PASHA callback
 * or the reconciliation sweep (the only two places an order transitions to
 * paid). Never fatal to the caller: email delivery failing must never
 * affect payment processing, so every error path here is caught, logged,
 * and reported via Telegram instead of thrown.
 */
export async function sendOrderConfirmationEmail(
  order: FormattedOrder,
  guestToken: string | null
): Promise<void> {
  const to = order.customerEmail ?? order.customer.email;
  if (!to) return;

  try {
    const enabled = await isNotificationEnabled("orderConfirmationOn");
    if (!enabled) return;

    const { subject, html } = await orderConfirmationEmail({
      locale: order.locale,
      orderNumber: order.orderNumber,
      customerName: order.shippingAddress?.fullName ?? order.customer.name ?? "",
      currency: order.currency,
      items: order.items.map((item) => ({
        productName: item.productName,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        total: item.total,
      })),
      subtotal: order.subtotal,
      discount: order.discount,
      shipping: order.shipping,
      tax: order.tax,
      total: order.total,
      shippingAddress: order.shippingAddress,
      shippingMethod: order.shippingMethod,
      confirmationUrl: confirmationUrl(order.orderNumber, guestToken),
    });

    const sent = await sendEmail({ to, subject, html });
    if (!sent) {
      logger.warn("[Email] Order confirmation not sent", { orderNumber: order.orderNumber });
      void notifyEmailFailure({
        context: "order confirmation",
        orderNumber: order.orderNumber,
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("[Email] Order confirmation threw unexpectedly", {
      orderNumber: order.orderNumber,
      error: message,
    });
    void notifyEmailFailure({
      context: "order confirmation",
      orderNumber: order.orderNumber,
      error: message,
    });
  }
}

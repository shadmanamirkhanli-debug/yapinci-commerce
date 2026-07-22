import { logger } from "@/lib/logger";
import { getBaseUrl } from "@/lib/site-url";
import type { formatOrder } from "@/lib/orders/orders";

type FormattedOrder = ReturnType<typeof formatOrder>;

export async function sendTelegramMessage(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    logger.warn("[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing, skipping notification");
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      logger.error("[Telegram] Send failed", { status: response.status, body });
      return false;
    }

    return true;
  } catch (error) {
    logger.error("[Telegram] Send failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

function buildOrderMessage(order: FormattedOrder): string {
  const customerName = order.shippingAddress?.fullName ?? order.customer.name ?? "—";
  const adminUrl = `${getBaseUrl()}/admin/orders/${order.id}`;

  const itemLines = order.items
    .map((item) => {
      const variant = [item.size, item.color].filter(Boolean).join(" / ");
      const variantLabel = variant ? ` (${variant})` : "";
      return `• ${item.productName}${variantLabel} × ${item.quantity} — ${item.total} ${order.currency}`;
    })
    .join("\n");

  return [
    "🛒 <b>Yeni sifariş!</b>",
    "",
    `Sifariş №: <b>${order.orderNumber}</b>`,
    `Müştəri: ${customerName}`,
    `Telefon: ${order.customerPhone}`,
    `E-poçt: ${order.customerEmail}`,
    "",
    "Məhsullar:",
    itemLines,
    "",
    `Cəmi: <b>${order.total} ${order.currency}</b>`,
    "",
    `Admin panel: ${adminUrl}`,
  ].join("\n");
}

export async function notifyNewOrder(order: FormattedOrder): Promise<void> {
  try {
    const sent = await sendTelegramMessage(buildOrderMessage(order));
    if (!sent) {
      logger.warn("[Telegram] Order notification not sent", { orderNumber: order.orderNumber });
    }
  } catch (error) {
    logger.error("[Telegram] Order notification threw unexpectedly", {
      orderNumber: order.orderNumber,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

function buildPaymentReceivedMessage(order: FormattedOrder): string {
  const adminUrl = `${getBaseUrl()}/admin/orders/${order.id}`;

  return [
    "✅ <b>Ödəniş alındı!</b>",
    "",
    `Sifariş №: <b>${order.orderNumber}</b>`,
    `Cəmi: <b>${order.total} ${order.currency}</b>`,
    "",
    `Admin panel: ${adminUrl}`,
  ].join("\n");
}

/** Fires once a PASHA payment is confirmed PAID — from either the callback or the reconciliation sweep. */
export async function notifyOrderPaid(order: FormattedOrder): Promise<void> {
  try {
    const sent = await sendTelegramMessage(buildPaymentReceivedMessage(order));
    if (!sent) {
      logger.warn("[Telegram] Payment notification not sent", { orderNumber: order.orderNumber });
    }
  } catch (error) {
    logger.error("[Telegram] Payment notification threw unexpectedly", {
      orderNumber: order.orderNumber,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Fires when the reconciliation sweep (lib/payments/pasha-reconciliation.ts)
 * has to settle a payment itself — meaning the bank's callback never resolved
 * it. That's evidence the callback round trip may be broken (e.g. the ECOMM
 * back_url configured at the bank is wrong), which is worth knowing about
 * regardless of whether the payment itself turned out paid or failed.
 */
/**
 * Fires whenever a transactional email fails to send — email delivery must
 * never block the order flow (see lib/orders/order-emails.ts), so this is
 * the only thing that tells anyone email is broken instead of it failing
 * silently.
 */
export async function notifyEmailFailure(params: {
  context: string;
  orderNumber?: string;
  error?: string;
}): Promise<void> {
  const text = [
    "🚨 <b>E-poçt göndərilmədi</b>",
    "",
    `Kontekst: ${params.context}`,
    params.orderNumber ? `Sifariş №: <b>${params.orderNumber}</b>` : null,
    params.error ? `Xəta: ${params.error}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const sent = await sendTelegramMessage(text);
    if (!sent) {
      logger.warn("[Telegram] Email failure alert not sent", { context: params.context });
    }
  } catch (error) {
    logger.error("[Telegram] Email failure alert threw unexpectedly", {
      context: params.context,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function notifyPashaReconciliationGap(params: {
  orderNumber: string;
  orderId: string;
  outcome: "paid" | "failed";
  resultCode: string | null;
}): Promise<void> {
  const adminUrl = `${getBaseUrl()}/admin/orders/${params.orderId}`;
  const outcomeLabel = params.outcome === "paid" ? "ÖDƏNİLDİ" : "UĞURSUZ";
  const resultCodeSuffix = params.resultCode ? ` (kod ${params.resultCode})` : "";

  const text = [
    "⚠️ <b>PASHA callback həll etmədi — reconciliation araya girdi</b>",
    "",
    `Sifariş №: <b>${params.orderNumber}</b>`,
    `Nəticə: <b>${outcomeLabel}</b>${resultCodeSuffix}`,
    "",
    "Bank callback-i bu sifarişi HEÇ VAXT həll etmədi. PASHA-nın merchant panelində ECOMM back_url konfiqurasiyasını yoxlayın.",
    "",
    `Admin panel: ${adminUrl}`,
  ].join("\n");

  try {
    const sent = await sendTelegramMessage(text);
    if (!sent) {
      logger.warn("[Telegram] Reconciliation gap alert not sent", { orderNumber: params.orderNumber });
    }
  } catch (error) {
    logger.error("[Telegram] Reconciliation gap alert threw unexpectedly", {
      orderNumber: params.orderNumber,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

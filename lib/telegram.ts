import { logger } from "@/lib/logger";
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
  const adminUrl = `${process.env.AUTH_URL ?? ""}/admin/orders/${order.id}`;

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

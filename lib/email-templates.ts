import { createTranslator } from "use-intl/core";
import { formatAmount } from "@/components/ui/Price";
import { routing } from "@/i18n/routing";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function passwordResetEmail(resetUrl: string): { subject: string; html: string } {
  const subject = "Şifrə Bərpası — Yapinci";
  const html =
    "<div style=\"font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;\">" +
    "<h2>Şifrə Bərpası</h2>" +
    "<p>Şifrənizi bərpa etmək üçün aşağıdakı düyməyə klikləyin. Link 1 saat ərzində keçərlidir.</p>" +
    "<p><a href=\"" + resetUrl + "\" style=\"display: inline-block; padding: 12px 24px; background: #111; color: #fff; text-decoration: none; border-radius: 6px;\">Şifrəni Bərpa Et</a></p>" +
    "<p style=\"color: #666; font-size: 12px;\">Əgər bu sorğunu siz göndərməmisinizsə, bu e-poçtu nəzərə almayın.</p>" +
    "</div>";
  return { subject, html };
}

export type OrderConfirmationEmailItem = {
  productName: string;
  size?: string | null;
  color?: string | null;
  quantity: number;
  total: number;
};

export type OrderConfirmationEmailAddress = {
  fullName: string;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  country: string;
};

export type OrderConfirmationEmailParams = {
  locale: string;
  orderNumber: string;
  customerName: string;
  currency: string;
  items: OrderConfirmationEmailItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: OrderConfirmationEmailAddress | null;
  shippingMethod: string | null;
  confirmationUrl: string;
};

// Sent once payment is confirmed (bank callback or reconciliation sweep —
// see lib/orders/order-emails.ts), never at order creation, since that's
// the point a guest checkout actually becomes a real, paid order. Localized
// with the order's own `locale` (captured at checkout) via use-intl/core
// directly rather than next-intl/server's getTranslations: the sender may
// run outside any HTTP request (the reconciliation sweep), so there's no
// cookie to derive a locale from.
export async function orderConfirmationEmail(
  params: OrderConfirmationEmailParams
): Promise<{ subject: string; html: string }> {
  const locale = (routing.locales as readonly string[]).includes(params.locale)
    ? (params.locale as (typeof routing.locales)[number])
    : routing.defaultLocale;

  const messages = (await import(`../messages/${locale}.json`)).default;

  const t = createTranslator({ locale, messages, namespace: "OrderConfirmationEmail" });
  const tSummary = createTranslator({ locale, messages, namespace: "OrderSummary" });
  const tShipping = createTranslator({ locale, messages, namespace: "ShippingMethods" });

  const money = (amount: number) => escapeHtml(formatAmount(amount, params.currency));

  const itemRows = params.items
    .map((item) => {
      const variant = [item.size, item.color].filter(Boolean).join(" · ");
      const variantLabel = variant ? ` (${escapeHtml(variant)})` : "";
      return (
        "<tr>" +
        "<td style=\"padding: 8px 0; border-bottom: 1px solid #eee;\">" +
        escapeHtml(item.productName) +
        variantLabel +
        " × " +
        item.quantity +
        "</td>" +
        "<td style=\"padding: 8px 0; border-bottom: 1px solid #eee; text-align: right; white-space: nowrap;\">" +
        money(item.total) +
        "</td>" +
        "</tr>"
      );
    })
    .join("");

  const summaryRow = (label: string, valueHtml: string) =>
    "<tr>" +
    "<td style=\"padding: 4px 0; color: #444;\">" + escapeHtml(label) + "</td>" +
    "<td style=\"padding: 4px 0; text-align: right;\">" + valueHtml + "</td>" +
    "</tr>";

  const summaryRows =
    summaryRow(tSummary("subtotal"), money(params.subtotal)) +
    (params.discount > 0 ? summaryRow(tSummary("discount"), "-" + money(params.discount)) : "") +
    summaryRow(tSummary("shipping"), params.shipping === 0 ? escapeHtml(tSummary("free")) : money(params.shipping)) +
    (params.tax > 0 ? summaryRow(tSummary("tax"), money(params.tax)) : "");

  const address = params.shippingAddress;
  const addressHtml = address
    ? [
        escapeHtml(address.fullName),
        escapeHtml(address.line1),
        address.line2 ? escapeHtml(address.line2) : null,
        escapeHtml([address.city, address.state].filter(Boolean).join(", ")),
        escapeHtml(address.country),
      ]
        .filter(Boolean)
        .join("<br/>")
    : "";

  const shippingMethodLabel =
    params.shippingMethod === "express" ? tShipping("expressLabel") : tShipping("standardLabel");

  const subject = t("subject", { orderNumber: params.orderNumber });

  const html =
    "<div style=\"font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111;\">" +
    "<h2>" + escapeHtml(t("heading", { name: params.customerName })) + "</h2>" +
    "<p>" + escapeHtml(t("intro")) + "</p>" +
    "<p><strong>" + escapeHtml(t("orderNumberLabel")) + ":</strong> " + escapeHtml(params.orderNumber) + "</p>" +
    "<h3>" + escapeHtml(t("itemsHeading")) + "</h3>" +
    "<table style=\"width: 100%; border-collapse: collapse;\">" + itemRows + "</table>" +
    "<table style=\"width: 100%; border-collapse: collapse; margin-top: 12px;\">" +
    summaryRows +
    "<tr>" +
    "<td style=\"padding: 8px 0; border-top: 2px solid #111; font-weight: bold;\">" + escapeHtml(tSummary("total")) + "</td>" +
    "<td style=\"padding: 8px 0; border-top: 2px solid #111; font-weight: bold; text-align: right;\">" + money(params.total) + "</td>" +
    "</tr>" +
    "</table>" +
    (address
      ? "<h3>" + escapeHtml(t("shippingAddressHeading")) + "</h3><p>" + addressHtml + "</p>"
      : "") +
    "<h3>" + escapeHtml(t("shippingMethodHeading")) + "</h3>" +
    "<p>" + escapeHtml(shippingMethodLabel) + "</p>" +
    "<p style=\"margin-top: 24px;\">" +
    "<a href=\"" + params.confirmationUrl + "\" style=\"display: inline-block; padding: 12px 24px; background: #111; color: #fff; text-decoration: none; border-radius: 6px;\">" +
    escapeHtml(t("viewOrderCta")) +
    "</a>" +
    "</p>" +
    "<p style=\"color: #666; font-size: 12px; margin-top: 24px;\">" + escapeHtml(t("footerNote")) + "</p>" +
    "</div>";

  return { subject, html };
}

export function pashaGuestPaymentLinkEmail(params: {
  orderNumber: string;
  resultUrl: string;
}): { subject: string; html: string } {
  const subject = "Sifariş Linkiniz — " + params.orderNumber;
  const html =
    "<div style=\"font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;\">" +
    "<h2>Ödənişə yönləndirilirsiniz</h2>" +
    "<p>Sifariş <strong>" + params.orderNumber + "</strong> üçün ödəniş səhifəsinə yönləndirilirsiniz.</p>" +
    "<p>Bu linki saxlayın — ödəniş tamamlanmasa belə, sifarişinizin statusunu yoxlamaq və ya ödənişi yenidən cəhd etmək üçün bundan istifadə edə bilərsiniz:</p>" +
    "<p><a href=\"" + params.resultUrl + "\" style=\"display: inline-block; padding: 12px 24px; background: #111; color: #fff; text-decoration: none; border-radius: 6px;\">Sifarişimə Bax</a></p>" +
    "<p style=\"color: #666; font-size: 12px;\">" + params.resultUrl + "</p>" +
    "</div>";
  return { subject, html };
}

export function adminNewOrderEmail(params: {
  orderNumber: string;
  total: string;
  customerEmail: string;
}): { subject: string; html: string } {
  const subject = "Yeni Sifariş — " + params.orderNumber;
  const html =
    "<div style=\"font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;\">" +
    "<h2>Yeni Sifariş Daxil Oldu</h2>" +
    "<p><strong>Sifariş nömrəsi:</strong> " + params.orderNumber + "</p>" +
    "<p><strong>Müştəri:</strong> " + params.customerEmail + "</p>" +
    "<p><strong>Cəmi:</strong> " + params.total + "</p>" +
    "</div>";
  return { subject, html };
}

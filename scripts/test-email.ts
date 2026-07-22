/**
 * Sends a real order-confirmation email through Resend using fabricated
 * order data — no DB, no order, no payment involved. Lets you verify the
 * RESEND_API_KEY / sender domain / template render without placing a real
 * paid order.
 *
 * Run with: npx tsx scripts/test-email.ts <address> [locale]
 * (locale defaults to "az"; accepts az/en/ru)
 */
import "dotenv/config";
import { sendEmail } from "../lib/email";
import { orderConfirmationEmail } from "../lib/email-templates";

async function main() {
  const to = process.argv[2];
  const locale = process.argv[3] || "az";

  if (!to) {
    console.error("Usage: npx tsx scripts/test-email.ts <address> [locale]");
    process.exitCode = 1;
    return;
  }

  const { subject, html } = await orderConfirmationEmail({
    locale,
    orderNumber: "YAP-2026-TEST",
    customerName: "Test Müştəri",
    currency: "AZN",
    items: [
      { productName: "Test Palto", size: "M", color: "Qara", quantity: 1, total: 120 },
      { productName: "Test Şərf", size: null, color: "Bej", quantity: 2, total: 40 },
    ],
    subtotal: 160,
    discount: 10,
    shipping: 0,
    tax: 0,
    total: 150,
    shippingAddress: {
      fullName: "Test Müştəri",
      line1: "Nizami küçəsi 10",
      line2: null,
      city: "Bakı",
      state: null,
      country: "Azərbaycan",
    },
    shippingMethod: "standard",
    confirmationUrl: "https://yapinci.az/checkout/confirmation/YAP-2026-TEST?token=test",
  });

  const sent = await sendEmail({ to, subject, html });

  console.log(JSON.stringify({ sent, to, locale, subject }));

  if (!sent) {
    process.exitCode = 1;
  }
}

main();

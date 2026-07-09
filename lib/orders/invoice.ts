import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatOrder } from "@/lib/orders/orders";

type FormattedOrder = ReturnType<typeof formatOrder>;

export async function generateInvoicePdf(order: FormattedOrder) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = 780;

  const draw = (text: string, size = 11, useBold = false) => {
    page.drawText(text, {
      x: 50,
      y,
      size,
      font: useBold ? bold : font,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= size + 8;
  };

  draw("YAPINCI COMMERCE", 18, true);
  draw("INVOICE", 14, true);
  draw(`Order: ${order.orderNumber}`);
  draw(`Date: ${new Date(order.createdAt).toLocaleDateString("az-AZ")}`);
  draw(`Status: ${order.status}`);
  y -= 10;

  if (order.shippingAddress) {
    draw("Bill To:", 12, true);
    draw(order.shippingAddress.fullName);
    draw(order.shippingAddress.line1);
    draw(`${order.shippingAddress.city}, ${order.shippingAddress.country}`);
    if (order.shippingAddress.phone) draw(order.shippingAddress.phone);
    y -= 10;
  }

  draw("Items:", 12, true);
  for (const item of order.items) {
    draw(
      `${item.productName} x${item.quantity} — ${item.total} ${order.currency}`
    );
  }

  y -= 10;
  draw(`Subtotal: ${order.subtotal} ${order.currency}`);
  draw(`Discount: -${order.discount} ${order.currency}`);
  draw(`Shipping: ${order.shipping} ${order.currency}`);
  draw(`Tax: ${order.tax} ${order.currency}`);
  draw(`Total: ${order.total} ${order.currency}`, 13, true);

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}

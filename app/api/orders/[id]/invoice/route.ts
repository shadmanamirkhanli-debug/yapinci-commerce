import { auth } from "@/auth";
import { apiError } from "@/lib/api-response";
import { generateInvoicePdf } from "@/lib/orders/invoice";
import { getOrderById } from "@/lib/orders/orders";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const { id } = await params;
  const order = await getOrderById(id, session.user.id);

  if (!order) {
    return apiError("Order not found", 404);
  }

  const pdf = await generateInvoicePdf(order);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${order.orderNumber}.pdf"`,
    },
  });
}

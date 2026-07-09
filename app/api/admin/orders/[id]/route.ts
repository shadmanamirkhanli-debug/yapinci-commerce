import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { apiError, apiSuccess } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { formatOrder, orderInclude } from "@/lib/orders/orders";
import { orderStatusUpdateSchema, uuidSchema } from "@/lib/validations/common";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const idResult = uuidSchema.safeParse(id);

  if (!idResult.success) {
    return apiError("Invalid order id", 400);
  }

  const order = await prisma.order.findUnique({
    where: { id: idResult.data },
    include: orderInclude,
  });

  if (!order) {
    return apiError("Order not found", 404);
  }

  return apiSuccess(formatOrder(order));
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const idResult = uuidSchema.safeParse(id);

  if (!idResult.success) {
    return apiError("Invalid order id", 400);
  }

  try {
    const body = await request.json();
    const parsed = orderStatusUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid request", 400);
    }

    const { status, trackingNumber, adminNotes } = parsed.data;

    const order = await prisma.order.update({
      where: { id: idResult.data },
      data: {
        ...(status ? { status } : {}),
        ...(trackingNumber !== undefined ? { trackingNumber } : {}),
        ...(adminNotes !== undefined ? { adminNotes } : {}),
      },
      include: orderInclude,
    });

    return apiSuccess(formatOrder(order));
  } catch (updateError) {
    logger.error("Order update failed", {
      orderId: id,
      error: updateError instanceof Error ? updateError.message : "Unknown error",
    });
    return apiError("Failed to update order", 500);
  }
}

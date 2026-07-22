import * as Sentry from "@sentry/nextjs";
import { toMinorUnits } from "@/lib/payments/pasha";
import { refundPashaTransaction } from "@/lib/payments/pasha-refund";
import { requireAdminAudited } from "@/lib/admin/require-admin";
import { apiError, apiSuccess } from "@/lib/api-response";
import { toNumber } from "@/lib/admin/serialize";
import { logger } from "@/lib/logger";
import { formatOrder, orderInclude } from "@/lib/orders/orders";
import { notifyOrderRefundFailed, notifyOrderRefunded } from "@/lib/telegram";
import { prisma } from "@/lib/prisma";
import { orderRefundSchema, uuidSchema } from "@/lib/validations/common";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const idResult = uuidSchema.safeParse(id);

  if (!idResult.success) {
    return apiError("Invalid order id", 400);
  }

  const { session, error } = await requireAdminAudited(request, {
    action: "order.refund",
    entityType: "Order",
    entityId: idResult.data,
  });
  if (error) return error;

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = orderRefundSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid request", 400);
    }

    const order = await prisma.order.findUnique({
      where: { id: idResult.data },
      include: orderInclude,
    });

    if (!order) {
      return apiError("Order not found", 404);
    }

    if (!order.payment) {
      return apiError("Order has no payment to refund", 400);
    }

    const paidAmount = toNumber(order.payment.amount);
    const { amount } = parsed.data;

    if (amount !== undefined && amount > paidAmount) {
      return apiError("Refund amount cannot exceed the amount paid", 400);
    }

    const amountMinor = amount !== undefined ? toMinorUnits(amount) : undefined;

    const actorEmail = session?.user?.email ?? null;
    const result = await refundPashaTransaction(idResult.data, amountMinor, {
      id: session?.user?.id ?? null,
      email: actorEmail,
    });

    if (result.outcome === "not_refundable") {
      return apiError("Payment is not eligible for refund", 400);
    }

    if (result.outcome === "failed") {
      const message = [result.result ?? "FAILED", result.error].filter(Boolean).join(": ");

      void notifyOrderRefundFailed(formatOrder(order), {
        error: result.error,
        resultCode: result.resultCode,
        actorEmail: actorEmail ?? "unknown",
      });
      Sentry.captureMessage(`PASHA reversal failed for order ${order.orderNumber}: ${message}`, "error");

      return apiError(`Refund failed: ${message}`, 502);
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id: idResult.data },
      include: orderInclude,
    });

    const formattedOrder = formatOrder(updatedOrder!);

    void notifyOrderRefunded(formattedOrder, {
      amount: amount ?? paidAmount,
      partial: result.partial,
      actorEmail: actorEmail ?? "unknown",
    });

    return apiSuccess(formattedOrder);
  } catch (refundError) {
    logger.error("Order refund failed", {
      orderId: id,
      error: refundError instanceof Error ? refundError.message : "Unknown error",
    });
    Sentry.captureException(refundError);
    return apiError("Refund failed", 500);
  }
}

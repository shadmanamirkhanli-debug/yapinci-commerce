/**
 * Skeleton only — gated by PASHA_ENABLED, not wired into live checkout.
 * See lib/payments/pasha.ts for the outstanding TODOs on exact wire format.
 */
import { auth } from "@/auth";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { toNumber } from "@/lib/admin/serialize";
import { apiError, apiSuccess } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { buildRedirectUrl, isPashaEnabled, registerTransaction } from "@/lib/payments/pasha";
import { prisma } from "@/lib/prisma";
import { pashaStartSchema } from "@/lib/validations/pasha";

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

    return apiSuccess({ redirectUrl: buildRedirectUrl(transactionId) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "PASHA transaction registration failed";
    logger.error("PASHA transaction registration failed", { userId, error: message });
    return apiError(message, 502);
  }
}

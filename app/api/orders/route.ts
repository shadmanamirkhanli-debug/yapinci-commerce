import { auth } from "@/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import {
  createOrderFromCheckout,
  getUserOrders,
} from "@/lib/orders/orders";
import { checkoutOrderSchema } from "@/lib/validations/checkout";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const orders = await getUserOrders(session.user.id);
  return apiSuccess(orders);
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  try {
    const body = await request.json();
    const parsed = checkoutOrderSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
    }

    const { order, guestToken } = await createOrderFromCheckout(userId, parsed.data);
    return apiSuccess({ ...order, guestToken }, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Order creation failed";
    logger.error("Order creation failed", {
      userId,
      error: message,
    });
    return apiError(message, 400);
  }
}

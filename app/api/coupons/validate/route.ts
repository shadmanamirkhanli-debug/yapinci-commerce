import { validateCoupon } from "@/lib/orders/coupons";
import { apiError, apiSuccess } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { couponValidateSchema } from "@/lib/validations/common";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = couponValidateSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid request", 400);
    }

    const result = await validateCoupon(parsed.data.code, parsed.data.subtotal);

    if (!result.valid) {
      return apiError(result.error, 400);
    }

    return apiSuccess({
      code: result.code,
      discountType: result.discountType,
      discountAmount: result.discountAmount,
      freeShipping: result.freeShipping,
    });
  } catch (error) {
    logger.error("Coupon validation failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return apiError("Validation failed", 500);
  }
}

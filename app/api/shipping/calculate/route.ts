import { calculateOrderTotals, validateCoupon } from "@/lib/orders/coupons";
import { getShippingPrice, getFreeShippingThreshold } from "@/lib/orders/shipping";
import { calculateTax } from "@/lib/orders/tax";
import { apiError, apiSuccess } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { shippingCalculateSchema } from "@/lib/validations/common";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = shippingCalculateSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid request", 400);
    }

    const { subtotal, shippingMethod, couponCode } = parsed.data;

    let discount = 0;
    let freeShipping = false;

    if (couponCode) {
      const result = await validateCoupon(couponCode, subtotal);
      if (!result.valid) {
        return apiError(result.error, 400);
      }
      discount = result.discountAmount;
      freeShipping = result.freeShipping;
    }

    const freeShippingThreshold = await getFreeShippingThreshold();
    if (!freeShipping && freeShippingThreshold !== null && subtotal >= freeShippingThreshold) {
      freeShipping = true;
    }
    const shipping = await getShippingPrice(shippingMethod, freeShipping);
    const tax = calculateTax(subtotal - discount);
    const totals = calculateOrderTotals({
      subtotal,
      discount,
      shipping,
      tax,
    });

    return apiSuccess({
      ...totals,
      currency: "AZN",
      freeShipping,
    });
  } catch (error) {
    logger.error("Shipping calculation failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return apiError("Calculation failed", 500);
  }
}

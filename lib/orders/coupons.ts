import { DiscountType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/admin/serialize";

export type CouponValidationResult =
  | {
      valid: true;
      couponId: string;
      code: string;
      discountType: DiscountType;
      discountValue: number;
      freeShipping: boolean;
      discountAmount: number;
    }
  | { valid: false; error: string };

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<CouponValidationResult> {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase().trim() },
  });

  if (!coupon) {
    return { valid: false, error: "Kupon kodu tapılmadı" };
  }

  if (!coupon.active) {
    return { valid: false, error: "Kupon aktiv deyil" };
  }

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    return { valid: false, error: "Kupon hələ aktiv deyil" };
  }

  if (coupon.expiresAt && coupon.expiresAt < now) {
    return { valid: false, error: "Kuponun vaxtı keçib" };
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: "Kupon istifadə limitinə çatıb" };
  }

  const minOrder = coupon.minOrderValue ? toNumber(coupon.minOrderValue) : 0;
  if (subtotal < minOrder) {
    return {
      valid: false,
      error: `Minimum sifariş məbləği ${minOrder} AZN olmalıdır`,
    };
  }

  const discountValue = toNumber(coupon.discountValue);
  let discountAmount = 0;
  let freeShipping = false;

  if (coupon.discountType === DiscountType.PERCENTAGE) {
    discountAmount = Math.round(subtotal * (discountValue / 100) * 100) / 100;
  } else if (coupon.discountType === DiscountType.FIXED) {
    discountAmount = Math.min(subtotal, discountValue);
  } else if (coupon.discountType === DiscountType.FREE_SHIPPING) {
    freeShipping = true;
    discountAmount = 0;
  }

  return {
    valid: true,
    couponId: coupon.id,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue,
    freeShipping,
    discountAmount,
  };
}

export function calculateOrderTotals({
  subtotal,
  discount,
  shipping,
  tax,
}: {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
}) {
  const total = Math.max(0, subtotal - discount + shipping + tax);
  return {
    subtotal,
    discount,
    shipping,
    tax,
    total: Math.round(total * 100) / 100,
  };
}

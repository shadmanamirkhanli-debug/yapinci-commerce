import { z } from "zod";
import { DiscountType } from "@prisma/client";

const numberField = () =>
  z.preprocess(
    (value) => {
      if (value === "" || value == null) return undefined;
      return Number(value);
    },
    z.number()
  );

export const couponSchema = z.object({
  code: z.string().min(1, "Kod tələb olunur"),
  description: z.string().optional(),
  discountType: z.nativeEnum(DiscountType),
  discountValue: numberField().refine((value) => value >= 0),
  minOrderValue: z.preprocess(
    (value) => {
      if (value === "" || value == null) return null;
      return Number(value);
    },
    z.number().min(0).nullable().optional()
  ),
  maxUses: z.preprocess(
    (value) => {
      if (value === "" || value == null) return null;
      return Number(value);
    },
    z.number().int().min(1).nullable().optional()
  ),
  active: z.boolean().default(true),
  startsAt: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
});

export type CouponInput = z.infer<typeof couponSchema>;

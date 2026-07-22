import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional().default(""),
});

export const couponValidateSchema = z.object({
  code: z.string().min(1, "Kupon kodu tələb olunur"),
  subtotal: z.coerce.number().min(0),
});

export const shippingCalculateSchema = z.object({
  subtotal: z.coerce.number().min(0),
  shippingMethod: z.enum(["standard", "express"]),
  couponCode: z.string().optional(),
});

export const wishlistMutationSchema = z.object({
  productId: uuidSchema,
});

export const orderStatusUpdateSchema = z.object({
  status: z
    .enum([
      "PENDING",
      "AWAITING_PAYMENT",
      "CONFIRMED",
      "PAID",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
    ])
    .optional(),
  trackingNumber: z.string().max(100).optional(),
  adminNotes: z.string().max(2000).optional(),
});

export const orderRefundSchema = z.object({
  // Major currency units (e.g. 12.34 AZN). Omitted => full refund.
  amount: z.coerce.number().positive().optional(),
});

import { z } from "zod";

export const checkoutCustomerSchema = z.object({
  firstName: z.string().min(1, "Ad tələb olunur"),
  lastName: z.string().min(1, "Soyad tələb olunur"),
  email: z.string().email("Düzgün e-poçt daxil edin"),
  phone: z.string().min(7, "Telefon tələb olunur"),
});

export const checkoutAddressSchema = z.object({
  country: z.string().min(1, "Ölkə tələb olunur"),
  city: z.string().min(1, "Şəhər tələb olunur"),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  address: z.string().min(1, "Ünvan tələb olunur"),
});

export const checkoutShippingSchema = z.object({
  shippingMethod: z.enum(["standard", "express"]),
});

export const checkoutOrderSchema = z.object({
  customer: checkoutCustomerSchema,
  address: checkoutAddressSchema,
  shippingMethod: z.enum(["standard", "express"]),
  couponCode: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
  notes: z.string().optional(),
});

export type CheckoutCustomerInput = z.infer<typeof checkoutCustomerSchema>;
export type CheckoutAddressInput = z.infer<typeof checkoutAddressSchema>;
export type CheckoutOrderInput = z.infer<typeof checkoutOrderSchema>;

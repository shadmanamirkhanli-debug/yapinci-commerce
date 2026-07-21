import { z } from "zod";

export const shippingSettingsSchema = z.object({
  standardPrice: z.number().min(0),
  expressPrice: z.number().min(0),
  freeShippingThreshold: z.number().min(0).nullable(),
});

export type ShippingSettingsInput = z.infer<typeof shippingSettingsSchema>;

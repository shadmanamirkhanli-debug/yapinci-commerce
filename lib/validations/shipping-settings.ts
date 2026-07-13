import { z } from "zod";

export const shippingSettingsSchema = z.object({
  standardPrice: z.number().min(0),
  standardDays: z.string().min(1),
  expressPrice: z.number().min(0),
  expressDays: z.string().min(1),
  internationalPrice: z.number().min(0),
  internationalDays: z.string().min(1),
  internationalActive: z.boolean(),
  freeShippingThreshold: z.number().min(0).nullable(),
});

export type ShippingSettingsInput = z.infer<typeof shippingSettingsSchema>;

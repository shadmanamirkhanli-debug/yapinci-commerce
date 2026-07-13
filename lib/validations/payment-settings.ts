import { z } from "zod";

export const paymentSettingsSchema = z.object({
  provider: z.enum(["test", "abb", "pashabank"]),
  testMode: z.boolean(),
  merchantId: z.string().optional(),
  apiKey: z.string().optional(),
  secretKey: z.string().optional(),
  webhookSecret: z.string().optional(),
});

export type PaymentSettingsInput = z.infer<typeof paymentSettingsSchema>;

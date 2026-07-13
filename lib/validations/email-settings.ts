import { z } from "zod";

export const emailSettingsSchema = z.object({
  smtpHost: z.string().optional(),
  smtpPort: z.number().int().min(1).max(65535),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  fromEmail: z.string().email("Düzgün email daxil edin"),
  fromName: z.string().min(1),
  orderConfirmationOn: z.boolean(),
  passwordResetOn: z.boolean(),
  adminNotificationOn: z.boolean(),
  adminNotificationEmail: z.string().optional(),
});

export type EmailSettingsInput = z.infer<typeof emailSettingsSchema>;

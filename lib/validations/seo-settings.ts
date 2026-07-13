import { z } from "zod";

export const seoSettingsSchema = z.object({
  metaTitle: z.string().min(1, "Meta title tələb olunur"),
  metaDescription: z.string().min(1, "Meta description tələb olunur"),
  ogImageUrl: z.string().optional(),
});

export type SeoSettingsInput = z.infer<typeof seoSettingsSchema>;

import { z } from "zod";

export const settingsSchema = z.object({
  storeName: z.string().min(1, "Mağaza adı tələb olunur"),
  email: z.string().email("Düzgün email daxil edin"),
  phone: z.string().min(1, "Telefon nömrəsi tələb olunur"),
  address: z.string().min(1, "Ünvan tələb olunur"),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  tiktok: z.string().optional(),
  whatsapp: z.string().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

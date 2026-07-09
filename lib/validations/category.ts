import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Ad tələb olunur"),
  slug: z.string().min(1, "Slug tələb olunur"),
  description: z.string().optional(),
  parentId: z.string().uuid().nullable().optional(),
  imageUrl: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const categoryBulkSchema = z.object({
  action: z.enum(["delete"]),
  ids: z.array(z.string().uuid()).min(1),
});

export type CategoryInput = z.infer<typeof categorySchema>;

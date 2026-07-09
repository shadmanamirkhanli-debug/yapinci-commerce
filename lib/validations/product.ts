import { z } from "zod";

const numberField = (message = "Invalid number") =>
  z.preprocess(
    (value) => {
      if (value === "" || value == null) return undefined;
      return Number(value);
    },
    z.number({ error: message })
  );

const optionalNumberField = z.preprocess(
  (value) => {
    if (value === "" || value == null) return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  },
  z.number().min(0).optional()
);

export const productVariantSchema = z.object({
  id: z.string().uuid().optional(),
  sku: z.string().min(1, "SKU tələb olunur"),
  size: z.string().optional(),
  color: z.string().optional(),
  material: z.string().optional(),
  price: optionalNumberField,
  quantity: numberField().default(0),
  reserved: numberField().default(0),
  lowStockAt: numberField().default(5),
});

export const productImageSchema = z.object({
  id: z.string().uuid().optional(),
  url: z.string().min(1, "Şəkil URL tələb olunur"),
  alt: z.string().optional(),
  sortOrder: numberField().default(0),
  isPrimary: z.boolean().default(false),
});

export const productSchema = z.object({
  name: z.string().min(1, "Ad tələb olunur"),
  slug: z.string().min(1, "Slug tələb olunur"),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  brand: z.string().optional(),
  collection: z.string().optional(),
  categoryId: z.string().uuid().optional().nullable(),
  price: numberField("Qiymət 0-dan böyük olmalıdır").refine((value) => value >= 0, {
    message: "Qiymət 0-dan böyük olmalıdır",
  }),
  comparePrice: optionalNumberField,
  costPrice: optionalNumberField,
  discount: optionalNumberField,
  lowStockAlert: numberField().default(5),
  currency: z.string().default("AZN"),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  variants: z.array(productVariantSchema).default([]),
  images: z.array(productImageSchema).default([]),
});

export const productBulkSchema = z.object({
  action: z.enum(["delete", "update"]),
  ids: z.array(z.string().uuid()).min(1),
  data: z
    .object({
      published: z.boolean().optional(),
      featured: z.boolean().optional(),
      categoryId: z.string().uuid().nullable().optional(),
    })
    .optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
export type ProductImageInput = z.infer<typeof productImageSchema>;

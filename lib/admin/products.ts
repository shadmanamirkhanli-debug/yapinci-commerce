import {
  parseContentMeta,
  serializeContentMeta,
  parseVariantColor,
  serializeVariantColor,
  type ProductMeta,
} from "@/lib/admin/content-meta";
import { toNumber } from "@/lib/admin/serialize";
import type { ProductInput } from "@/lib/validations/product";
import type { Prisma } from "@prisma/client";

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    images: true;
    variants: { include: { inventory: true } };
  };
}>;

export function formatAdminProduct(product: ProductWithRelations) {
  const { meta, body } = parseContentMeta<ProductMeta>(product.description);
  const totalStock = product.variants.reduce((sum, variant) => {
    return sum + (variant.inventory?.quantity ?? 0);
  }, 0);
  const totalReserved = product.variants.reduce((sum, variant) => {
    return sum + (variant.inventory?.reserved ?? 0);
  }, 0);
  const primarySku = product.variants[0]?.sku ?? "";

  return {
    id: product.id,
    name: product.name,
    nameEn: product.nameEn ?? "",
    nameRu: product.nameRu ?? "",
    slug: product.slug,
    description: body,
    descriptionEn: product.descriptionEn ?? "",
    descriptionRu: product.descriptionRu ?? "",
    shortDescription: meta.shortDescription ?? "",
    brand: meta.brand ?? "",
    collection: meta.collection ?? "",
    categoryId: product.categoryId,
    category: product.category,
    price: toNumber(product.price),
    comparePrice: meta.comparePrice ?? 0,
    costPrice: meta.costPrice ?? 0,
    discount: meta.discount ?? 0,
    currency: product.currency,
    published: product.published,
    featured: product.featured,
    newArrival: meta.newArrival ?? false,
    bestSeller: meta.bestSeller ?? false,
    lowStockAlert: meta.lowStockAlert ?? 5,
    seoTitle: meta.seoTitle ?? product.name,
    seoDescription: meta.seoDescription ?? meta.shortDescription ?? "",
    sku: primarySku,
    stockQuantity: totalStock,
    reserved: totalReserved,
    available: Math.max(0, totalStock - totalReserved),
    status: product.published ? "published" : "draft",
    images: product.images
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => ({
        id: image.id,
        url: image.url,
        alt: image.alt ?? undefined,
        sortOrder: image.sortOrder,
        isPrimary: image.isPrimary,
      })),
    variants: product.variants.map((variant) => {
      const { color, material } = parseVariantColor(variant.color);
      return {
        id: variant.id,
        sku: variant.sku,
        size: variant.size ?? "",
        color,
        material,
        price: variant.price ? toNumber(variant.price) : undefined,
        quantity: variant.inventory?.quantity ?? 0,
        reserved: variant.inventory?.reserved ?? 0,
        available: Math.max(
          0,
          (variant.inventory?.quantity ?? 0) - (variant.inventory?.reserved ?? 0)
        ),
        lowStockAt: variant.inventory?.lowStockAt ?? 5,
      };
    }),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export function buildProductWriteData(input: ProductInput) {
  const meta: ProductMeta = {
    shortDescription: input.shortDescription,
    brand: input.brand,
    collection: input.collection,
    comparePrice: input.comparePrice,
    costPrice: input.costPrice,
    discount: input.discount,
    lowStockAlert: input.lowStockAlert,
    newArrival: input.newArrival,
    bestSeller: input.bestSeller,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
  };

  return {
    name: input.name,
    nameEn: input.nameEn || null,
    nameRu: input.nameRu || null,
    slug: input.slug,
    description: serializeContentMeta(meta, input.description ?? ""),
    descriptionEn: input.descriptionEn || null,
    descriptionRu: input.descriptionRu || null,
    price: input.price,
    currency: input.currency,
    published: input.published,
    featured: input.featured,
    categoryId: input.categoryId ?? null,
  };
}

export function buildVariantWriteData(variant: ProductInput["variants"][number]) {
  return {
    sku: variant.sku,
    size: variant.size || null,
    color: serializeVariantColor(variant.color ?? "", variant.material),
    price: variant.price ?? null,
    inventory: {
      create: {
        quantity: variant.quantity,
        reserved: variant.reserved,
        lowStockAt: variant.lowStockAt,
      },
    },
  };
}

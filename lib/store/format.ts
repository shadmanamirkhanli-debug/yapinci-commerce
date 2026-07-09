import {
  parseContentMeta,
  parseVariantColor,
  type ProductMeta,
} from "@/lib/admin/content-meta";
import { toNumber } from "@/lib/admin/serialize";
import type { Prisma } from "@prisma/client";
import type { StoreProduct, StoreReview, StoreVariant } from "@/lib/store/types";

export const productInclude = {
  category: true,
  images: true,
  variants: { include: { inventory: true } },
  reviews: {
    where: { published: true },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" as const },
  },
} satisfies Prisma.ProductInclude;

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

export function formatStoreProduct(product: ProductWithRelations): StoreProduct {
  const { meta, body } = parseContentMeta<ProductMeta>(product.description);

  const variants: StoreVariant[] = product.variants.map((variant) => {
    const { color, material } = parseVariantColor(variant.color);
    const quantity = variant.inventory?.quantity ?? 0;
    const reserved = variant.inventory?.reserved ?? 0;

    return {
      id: variant.id,
      sku: variant.sku,
      size: variant.size ?? "",
      color,
      material,
      price: variant.price ? toNumber(variant.price) : undefined,
      quantity,
      reserved,
      available: Math.max(0, quantity - reserved),
    };
  });

  const available = variants.reduce((sum, variant) => sum + variant.available, 0);
  const images = product.images
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt ?? undefined,
      isPrimary: image.isPrimary,
    }));

  const primaryImage =
    images.find((image) => image.isPrimary)?.url ?? images[0]?.url;

  const ratings = product.reviews.map((review) => review.rating);
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : 0;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: toNumber(product.price),
    comparePrice: meta.comparePrice,
    currency: product.currency,
    description: body,
    shortDescription: meta.shortDescription ?? body.slice(0, 160),
    brand: meta.brand ?? "Yapinci",
    collection: meta.collection ?? "",
    featured: product.featured,
    newArrival: meta.newArrival ?? false,
    bestSeller: meta.bestSeller ?? false,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        }
      : null,
    images,
    primaryImage,
    variants,
    available,
    averageRating,
    reviewCount: product.reviews.length,
    seoTitle: meta.seoTitle ?? product.name,
    seoDescription: meta.seoDescription ?? meta.shortDescription ?? body.slice(0, 160),
    createdAt: product.createdAt.toISOString(),
  };
}

export function formatStoreReviews(product: ProductWithRelations): StoreReview[] {
  return product.reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    title: review.title ?? undefined,
    comment: review.comment ?? undefined,
    customer: review.user.name ?? review.user.email,
    createdAt: review.createdAt.toISOString(),
  }));
}

export function getUniqueVariantValues(products: StoreProduct[]) {
  const colors = new Set<string>();
  const sizes = new Set<string>();
  const materials = new Set<string>();
  const collections = new Set<string>();

  for (const product of products) {
    if (product.collection) collections.add(product.collection);
    for (const variant of product.variants) {
      if (variant.color) colors.add(variant.color);
      if (variant.size) sizes.add(variant.size);
      if (variant.material) materials.add(variant.material);
    }
  }

  return {
    colors: Array.from(colors).sort(),
    sizes: Array.from(sizes).sort(),
    materials: Array.from(materials).sort(),
    collections: Array.from(collections).sort(),
  };
}

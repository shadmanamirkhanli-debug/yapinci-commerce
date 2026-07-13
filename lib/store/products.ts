import { prisma } from "@/lib/prisma";
import {
  formatStoreProduct,
  formatStoreReviews,
  productInclude,
  type StoreLocale,
} from "@/lib/store/format";
import type {
  FilterOptions,
  ProductFilters,
  StoreCategory,
  StoreProduct,
  StoreReview,
} from "@/lib/store/types";

const DEFAULT_LIMIT = 12;

function getOrderBy(sort?: ProductFilters["sort"]) {
  switch (sort) {
    case "price-asc":
      return { price: "asc" as const };
    case "price-desc":
      return { price: "desc" as const };
    case "name":
      return { name: "asc" as const };
    case "newest":
    default:
      return { createdAt: "desc" as const };
  }
}

function matchesMetaFlag(description: string | null, flag: string) {
  return description?.includes(`"${flag}":true`) ?? false;
}

function productMatchesFilters(
  product: StoreProduct,
  filters: ProductFilters
) {
  if (filters.newArrival && !product.newArrival) return false;
  if (filters.bestSeller && !product.bestSeller) return false;
  if (filters.collection && product.collection !== filters.collection) return false;

  if (filters.minPrice !== undefined && product.price < filters.minPrice) {
    return false;
  }
  if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
    return false;
  }

  if (filters.inStock && product.available <= 0) return false;

  if (filters.colors?.length) {
    const hasColor = product.variants.some((variant) =>
      filters.colors!.some(
        (color) => variant.color.toLowerCase() === color.toLowerCase()
      )
    );
    if (!hasColor) return false;
  }

  if (filters.sizes?.length) {
    const hasSize = product.variants.some((variant) =>
      filters.sizes!.includes(variant.size)
    );
    if (!hasSize) return false;
  }

  if (filters.materials?.length) {
    const hasMaterial = product.variants.some((variant) =>
      filters.materials!.some(
        (material) =>
          variant.material.toLowerCase() === material.toLowerCase()
      )
    );
    if (!hasMaterial) return false;
  }

  return true;
}

export async function getStoreProducts(
  filters: ProductFilters = {},
  locale: StoreLocale = "az"
) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? DEFAULT_LIMIT;

  const products = await prisma.product.findMany({
    where: {
      published: true,
      ...(filters.featured ? { featured: true } : {}),
      ...(filters.categorySlug
        ? { category: { slug: filters.categorySlug } }
        : {}),
      ...(filters.search
        ? {
            OR: [
              { name: { contains: filters.search, mode: "insensitive" } },
              { slug: { contains: filters.search, mode: "insensitive" } },
              { description: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: productInclude,
    orderBy: getOrderBy(filters.sort),
  });

  let formatted = products.map((product) => formatStoreProduct(product, locale));

  if (filters.newArrival || filters.bestSeller || filters.collection) {
    const rawProducts = await prisma.product.findMany({
      where: { published: true },
      select: { id: true, description: true },
    });

    const metaMap = new Map(
      rawProducts.map((product) => [
        product.id,
        {
          newArrival: matchesMetaFlag(product.description, "newArrival"),
          bestSeller: matchesMetaFlag(product.description, "bestSeller"),
        },
      ])
    );

    formatted = formatted.map((product) => ({
      ...product,
      newArrival: product.newArrival || metaMap.get(product.id)?.newArrival || false,
      bestSeller: product.bestSeller || metaMap.get(product.id)?.bestSeller || false,
    }));
  }

  formatted = formatted.filter((product) => productMatchesFilters(product, filters));

  const total = formatted.length;
  const items = formatted.slice((page - 1) * limit, page * limit);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getStoreProductBySlug(slug: string, locale: StoreLocale = "az") {
  const product = await prisma.product.findFirst({
    where: { slug, published: true },
    include: productInclude,
  });

  if (!product) return null;

  return {
    product: formatStoreProduct(product, locale),
    reviews: formatStoreReviews(product),
  };
}

export async function getRelatedProducts(
  productId: string,
  categoryId?: string | null,
  limit = 4,
  locale: StoreLocale = "az"
) {
  const products = await prisma.product.findMany({
    where: {
      published: true,
      NOT: { id: productId },
      ...(categoryId ? { categoryId } : {}),
    },
    include: productInclude,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  return products.map((product) => formatStoreProduct(product, locale));
}

export async function getProductsBySlugs(slugs: string[], locale: StoreLocale = "az") {
  if (!slugs.length) return [];

  const products = await prisma.product.findMany({
    where: { slug: { in: slugs }, published: true },
    include: productInclude,
  });

  const map = new Map(
    products.map((product) => [product.slug, formatStoreProduct(product, locale)])
  );
  return slugs
    .map((slug) => map.get(slug))
    .filter((product): product is StoreProduct => !!product);
}

export async function getPublishedProductSlugs() {
  const products = await prisma.product.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return products.map((product) => product.slug);
}

export async function getHomePageData(locale: StoreLocale = "az") {
  const [allPublished, categories] = await Promise.all([
    prisma.product.findMany({
      where: { published: true },
      include: productInclude,
      orderBy: { createdAt: "desc" },
    }),
    getStoreCategories(locale),
  ]);

  const allProducts = allPublished.map((product) => formatStoreProduct(product, locale));
  const featured = allProducts.filter((product) => product.featured).slice(0, 8);
  const newArrivals = allProducts.slice(0, 4);
  const bestSellers = allProducts
    .filter((product) => product.bestSeller || product.featured)
    .slice(0, 4);

  const collections = [...new Set(allProducts.map((p) => p.collection).filter(Boolean))];

  return {
    featured,
    newArrivals: newArrivals.length ? newArrivals : allProducts.slice(0, 4),
    bestSellers: bestSellers.length ? bestSellers : allProducts.slice(0, 4),
    collections,
    categories,
  };
}

export async function getStoreCategories(
  locale: StoreLocale = "az"
): Promise<StoreCategory[]> {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return categories.map((category) => {
    const description = category.description ?? "";
    let imageUrl: string | undefined;

    if (description.startsWith("---meta\n")) {
      try {
        const end = description.indexOf("\n---\n");
        const meta = JSON.parse(description.slice(8, end)) as { imageUrl?: string };
        imageUrl = meta.imageUrl;
      } catch {
        imageUrl = undefined;
      }
    }

    const bodyDescription = description.startsWith("---meta\n")
      ? description.slice(description.indexOf("\n---\n") + 5)
      : description;

    return {
      id: category.id,
      slug: category.slug,
      name:
        locale === "en" && category.nameEn
          ? category.nameEn
          : locale === "ru" && category.nameRu
            ? category.nameRu
            : category.name,
      description:
        locale === "en" && category.descriptionEn
          ? category.descriptionEn
          : locale === "ru" && category.descriptionRu
            ? category.descriptionRu
            : bodyDescription,
      imageUrl,
      productCount: category._count.products,
    };
  });
}

export async function getStoreCategoryBySlug(slug: string, locale: StoreLocale = "az") {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { _count: { select: { products: true } } },
  });

  if (!category) return null;

  return {
    id: category.id,
    slug: category.slug,
    name:
      locale === "en" && category.nameEn
        ? category.nameEn
        : locale === "ru" && category.nameRu
          ? category.nameRu
          : category.name,
    description:
      locale === "en" && category.descriptionEn
        ? category.descriptionEn
        : locale === "ru" && category.descriptionRu
          ? category.descriptionRu
          : category.description ?? "",
    productCount: category._count.products,
  };
}

export async function getFilterOptions(locale: StoreLocale = "az"): Promise<FilterOptions> {
  // Sequential queries: Prisma Dev only allows one concurrent connection.
  const categories = await getStoreCategories(locale);
  const products = await prisma.product.findMany({
    where: { published: true },
    include: productInclude,
  });

  const formatted = products.map((product) => formatStoreProduct(product, locale));
  const variantValues = formatted.reduce(
    (acc, product) => {
      if (product.collection) acc.collections.add(product.collection);
      for (const variant of product.variants) {
        if (variant.color) acc.colors.add(variant.color);
        if (variant.size) acc.sizes.add(variant.size);
        if (variant.material) acc.materials.add(variant.material);
      }
      acc.prices.push(product.price);
      return acc;
    },
    {
      collections: new Set<string>(),
      colors: new Set<string>(),
      sizes: new Set<string>(),
      materials: new Set<string>(),
      prices: [] as number[],
    }
  );

  return {
    categories,
    collections: Array.from(variantValues.collections).sort(),
    colors: Array.from(variantValues.colors).sort(),
    sizes: Array.from(variantValues.sizes).sort(),
    materials: Array.from(variantValues.materials).sort(),
    priceRange: {
      min: variantValues.prices.length ? Math.min(...variantValues.prices) : 0,
      max: variantValues.prices.length ? Math.max(...variantValues.prices) : 1000,
    },
  };
}

export function parseProductFilters(
  searchParams: Record<string, string | string[] | undefined>
): ProductFilters {
  const get = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const getArray = (key: string) => {
    const value = searchParams[key];
    if (!value) return undefined;
    return (Array.isArray(value) ? value : value.split(",")).filter(Boolean);
  };

  return {
    search: get("q") || get("search") || undefined,
    categorySlug: get("category") || undefined,
    collection: get("collection") || undefined,
    minPrice: get("minPrice") ? Number(get("minPrice")) : undefined,
    maxPrice: get("maxPrice") ? Number(get("maxPrice")) : undefined,
    colors: getArray("color"),
    sizes: getArray("size"),
    materials: getArray("material"),
    inStock: get("inStock") === "true",
    sort: (get("sort") as ProductFilters["sort"]) || "newest",
    page: get("page") ? Number(get("page")) : 1,
    limit: get("limit") ? Number(get("limit")) : DEFAULT_LIMIT,
  };
}

export type { StoreReview };

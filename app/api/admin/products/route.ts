import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { apiError, apiSuccess } from "@/lib/api-response";
import { parseListQuery, paginate } from "@/lib/admin/query-params";
import {
  buildProductWriteData,
  buildVariantWriteData,
  formatAdminProduct,
} from "@/lib/admin/products";
import { productSchema } from "@/lib/validations/product";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const query = parseListQuery(searchParams, { sort: "createdAt", limit: 10 });
  const status = searchParams.get("status");
  const categoryId = searchParams.get("categoryId");

  const where = {
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" as const } },
            { slug: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(status === "published" ? { published: true } : {}),
    ...(status === "draft" ? { published: false } : {}),
    ...(categoryId ? { categoryId } : {}),
  };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        category: true,
        images: true,
        variants: { include: { inventory: true } },
      },
      orderBy: { [query.sort]: query.order },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);

  return apiSuccess({
    items: products.map(formatAdminProduct),
    pagination: paginate(total, query.page, query.limit),
  });
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
    }

    const existing = await prisma.product.findUnique({
      where: { slug: parsed.data.slug },
    });

    if (existing) {
      return apiError("Slug already exists", 409);
    }

    const product = await prisma.product.create({
      data: {
        ...buildProductWriteData(parsed.data),
        images: {
          create: parsed.data.images.map((image, index) => ({
            url: image.url,
            alt: image.alt,
            sortOrder: image.sortOrder ?? index,
            isPrimary: image.isPrimary ?? index === 0,
          })),
        },
        variants: {
          create: parsed.data.variants.map((variant) => buildVariantWriteData(variant)),
        },
      },
      include: {
        category: true,
        images: true,
        variants: { include: { inventory: true } },
      },
    });

    return apiSuccess(formatAdminProduct(product), 201);
  } catch {
    return apiError("Failed to create product", 500);
  }
}

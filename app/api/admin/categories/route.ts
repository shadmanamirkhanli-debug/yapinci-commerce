import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAdminAudited } from "@/lib/admin/require-admin";
import { apiError, apiSuccess } from "@/lib/api-response";
import { parseListQuery, paginate } from "@/lib/admin/query-params";
import {
  buildCategoryWriteData,
  formatAdminCategory,
} from "@/lib/admin/categories";
import { categorySchema } from "@/lib/validations/category";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const query = parseListQuery(searchParams, { sort: "name", limit: 20 });

  const where = query.search
    ? {
        OR: [
          { name: { contains: query.search, mode: "insensitive" as const } },
          { slug: { contains: query.search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [total, categories] = await Promise.all([
    prisma.category.count({ where }),
    prisma.category.findMany({
      where,
      include: {
        parent: true,
        _count: { select: { products: true, children: true } },
      },
      orderBy: { [query.sort]: query.order },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);

  return apiSuccess({
    items: categories.map(formatAdminCategory),
    pagination: paginate(total, query.page, query.limit),
  });
}

export async function POST(request: Request) {
  const { error } = await requireAdminAudited(request, {
    action: "category.create",
    entityType: "Category",
  });
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
    }

    const existing = await prisma.category.findUnique({
      where: { slug: parsed.data.slug },
    });

    if (existing) {
      return apiError("Slug already exists", 409);
    }

    const category = await prisma.category.create({
      data: buildCategoryWriteData(parsed.data),
      include: {
        parent: true,
        _count: { select: { products: true, children: true } },
      },
    });

    return apiSuccess(formatAdminCategory(category), 201);
  } catch {
    return apiError("Failed to create category", 500);
  }
}

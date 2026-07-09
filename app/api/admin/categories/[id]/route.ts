import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { apiError, apiSuccess } from "@/lib/api-response";
import {
  buildCategoryWriteData,
  formatAdminCategory,
} from "@/lib/admin/categories";
import { categorySchema } from "@/lib/validations/category";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      parent: true,
      _count: { select: { products: true, children: true } },
    },
  });

  if (!category) {
    return apiError("Category not found", 404);
  }

  return apiSuccess(formatAdminCategory(category));
}

export async function PUT(request: Request, context: RouteContext) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
    }

    const existing = await prisma.category.findFirst({
      where: { slug: parsed.data.slug, NOT: { id } },
    });

    if (existing) {
      return apiError("Slug already exists", 409);
    }

    const category = await prisma.category.update({
      where: { id },
      data: buildCategoryWriteData(parsed.data),
      include: {
        parent: true,
        _count: { select: { products: true, children: true } },
      },
    });

    return apiSuccess(formatAdminCategory(category));
  } catch {
    return apiError("Failed to update category", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;

  try {
    await prisma.category.delete({ where: { id } });
    return apiSuccess({ deleted: true });
  } catch {
    return apiError("Failed to delete category", 404);
  }
}

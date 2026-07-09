import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { apiError, apiSuccess } from "@/lib/api-response";
import { parseListQuery, paginate } from "@/lib/admin/query-params";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const query = parseListQuery(searchParams, { sort: "createdAt", limit: 10 });
  const published = searchParams.get("published");

  const where = {
    ...(query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: "insensitive" as const } },
            { product: { name: { contains: query.search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
    ...(published === "true" ? { published: true } : {}),
    ...(published === "false" ? { published: false } : {}),
  };

  const [total, reviews] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true, slug: true } },
      },
      orderBy: { [query.sort]: query.order },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);

  return apiSuccess({
    items: reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      published: review.published,
      customer: review.user.name ?? review.user.email,
      product: review.product.name,
      productSlug: review.product.slug,
      createdAt: review.createdAt.toISOString(),
    })),
    pagination: paginate(total, query.page, query.limit),
  });
}

export async function PATCH(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const { ids, published } = body as { ids: string[]; published: boolean };

    await prisma.review.updateMany({
      where: { id: { in: ids } },
      data: { published },
    });

    return apiSuccess({ updated: ids.length });
  } catch {
    return apiError("Failed to update reviews", 500);
  }
}

export async function DELETE(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const { ids } = body as { ids: string[] };

    await prisma.review.deleteMany({
      where: { id: { in: ids } },
    });

    return apiSuccess({ deleted: ids.length });
  } catch {
    return apiError("Failed to delete reviews", 500);
  }
}

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { apiSuccess } from "@/lib/api-response";
import { parseListQuery, paginate } from "@/lib/admin/query-params";
import { toNumber } from "@/lib/admin/serialize";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const query = parseListQuery(searchParams, { sort: "createdAt", limit: 10 });
  const status = searchParams.get("status");

  const where = {
    ...(query.search
      ? {
          OR: [
            { orderNumber: { contains: query.search, mode: "insensitive" as const } },
            { user: { email: { contains: query.search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
    ...(status ? { status: status as never } : {}),
  };

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { [query.sort]: query.order },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);

  return apiSuccess({
    items: orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: order.user.name ?? order.user.email,
      total: toNumber(order.total),
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    })),
    pagination: paginate(total, query.page, query.limit),
  });
}

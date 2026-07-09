import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { apiSuccess } from "@/lib/api-response";
import { parseListQuery, paginate } from "@/lib/admin/query-params";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const query = parseListQuery(searchParams, { sort: "createdAt", limit: 10 });

  const where = query.search
    ? {
        OR: [
          { name: { contains: query.search, mode: "insensitive" as const } },
          { email: { contains: query.search, mode: "insensitive" as const } },
        ],
        role: { slug: "customer" },
      }
    : { role: { slug: "customer" } };

  const [total, customers] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: { _count: { select: { orders: true } } },
      orderBy: { [query.sort]: query.order },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);

  return apiSuccess({
    items: customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      orders: customer._count.orders,
      createdAt: customer.createdAt.toISOString(),
    })),
    pagination: paginate(total, query.page, query.limit),
  });
}

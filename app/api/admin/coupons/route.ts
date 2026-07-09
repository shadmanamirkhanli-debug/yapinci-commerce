import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { apiError, apiSuccess } from "@/lib/api-response";
import { parseListQuery, paginate } from "@/lib/admin/query-params";
import { toNumber } from "@/lib/admin/serialize";
import { couponSchema } from "@/lib/validations/coupon";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const query = parseListQuery(searchParams, { sort: "createdAt", limit: 10 });

  const where = query.search
    ? { code: { contains: query.search, mode: "insensitive" as const } }
    : {};

  const [total, coupons] = await Promise.all([
    prisma.coupon.count({ where }),
    prisma.coupon.findMany({
      where,
      orderBy: { [query.sort]: query.order },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);

  return apiSuccess({
    items: coupons.map((coupon) => ({
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: toNumber(coupon.discountValue),
      active: coupon.active,
      usedCount: coupon.usedCount,
      maxUses: coupon.maxUses,
      createdAt: coupon.createdAt.toISOString(),
    })),
    pagination: paginate(total, query.page, query.limit),
  });
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = couponSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: parsed.data.code.toUpperCase(),
        description: parsed.data.description,
        discountType: parsed.data.discountType,
        discountValue: parsed.data.discountValue,
        minOrderValue: parsed.data.minOrderValue,
        maxUses: parsed.data.maxUses,
        active: parsed.data.active,
        startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      },
    });

    return apiSuccess(coupon, 201);
  } catch {
    return apiError("Failed to create coupon", 500);
  }
}

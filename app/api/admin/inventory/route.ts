import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { apiError, apiSuccess } from "@/lib/api-response";
import { parseListQuery, paginate } from "@/lib/admin/query-params";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const query = parseListQuery(searchParams, { sort: "quantity", limit: 20 });
  const lowStock = searchParams.get("lowStock") === "true";

  const items = await prisma.inventory.findMany({
    include: {
      variant: {
        include: {
          product: { select: { id: true, name: true, slug: true } },
        },
      },
    },
    orderBy: { [query.sort]: query.order },
  });

  const filtered = items
    .filter((item) => {
      if (!query.search) return true;
      const search = query.search.toLowerCase();
      return (
        item.variant.sku.toLowerCase().includes(search) ||
        item.variant.product.name.toLowerCase().includes(search)
      );
    })
    .filter((item) => (lowStock ? item.quantity <= item.lowStockAt : true));

  const total = filtered.length;
  const paged = filtered.slice(
    (query.page - 1) * query.limit,
    query.page * query.limit
  );

  return apiSuccess({
    items: paged.map((item) => ({
      id: item.id,
      productId: item.variant.product.id,
      productName: item.variant.product.name,
      productSlug: item.variant.product.slug,
      variantId: item.variant.id,
      sku: item.variant.sku,
      size: item.variant.size,
      color: item.variant.color,
      quantity: item.quantity,
      reserved: item.reserved,
      available: Math.max(0, item.quantity - item.reserved),
      lowStockAt: item.lowStockAt,
      warehouse: item.warehouse,
    })),
    pagination: paginate(total, query.page, query.limit),
  });
}

export async function PATCH(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const { id, quantity, reserved, lowStockAt } = body as {
      id: string;
      quantity?: number;
      reserved?: number;
      lowStockAt?: number;
    };

    const inventory = await prisma.inventory.update({
      where: { id },
      data: {
        ...(quantity !== undefined ? { quantity } : {}),
        ...(reserved !== undefined ? { reserved } : {}),
        ...(lowStockAt !== undefined ? { lowStockAt } : {}),
      },
    });

    return apiSuccess(inventory);
  } catch {
    return apiError("Failed to update inventory", 500);
  }
}

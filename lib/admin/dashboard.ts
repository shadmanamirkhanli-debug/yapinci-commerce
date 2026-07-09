import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/admin/serialize";

export async function getDashboardStats() {
  const [
    productCount,
    customerCount,
    orderCount,
    revenueAggregate,
    recentOrders,
    lowStockCandidates,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.user.count({
      where: { role: { slug: "customer" } },
    }),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
      },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.inventory.findMany({
      take: 50,
      include: {
        variant: {
          include: {
            product: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { quantity: "asc" },
    }),
  ]);

  const lowStockItems = lowStockCandidates
    .filter((item) => item.quantity <= item.lowStockAt)
    .slice(0, 5);

  const salesChart = buildSalesChart();

  return {
    revenue: toNumber(revenueAggregate._sum.total),
    orders: orderCount,
    products: productCount,
    customers: customerCount,
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: order.user.name ?? order.user.email,
      total: toNumber(order.total),
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    })),
    lowStockProducts: lowStockItems.map((item) => ({
      id: item.id,
      productId: item.variant.product.id,
      productName: item.variant.product.name,
      productSlug: item.variant.product.slug,
      sku: item.variant.sku,
      quantity: item.quantity,
      lowStockAt: item.lowStockAt,
      available: Math.max(0, item.quantity - item.reserved),
    })),
    salesChart,
  };
}

function buildSalesChart() {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date;
  });

  return days.map((date) => {
    const label = date.toLocaleDateString("az-AZ", {
      weekday: "short",
    });
    const value = Math.round(800 + Math.random() * 2200);
    return { label, value };
  });
}

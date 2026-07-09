import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import QuickActions from "@/components/admin/QuickActions";
import SalesChart from "@/components/admin/SalesChart";
import StatCard from "@/components/admin/StatCard";
import { getDashboardStats } from "@/lib/admin/dashboard";
import { adminCardClass } from "@/lib/admin/styles";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Yapinci Commerce overview"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue"
          value={`${stats.revenue.toLocaleString("az-AZ")} AZN`}
        />
        <StatCard label="Orders" value={stats.orders} />
        <StatCard label="Products" value={stats.products} />
        <StatCard label="Customers" value={stats.customers} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SalesChart data={stats.salesChart} />
        </div>
        <QuickActions />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className={`${adminCardClass} p-6`}>
          <h2 className="text-sm font-medium uppercase tracking-[0.15em]">
            Recent Orders
          </h2>
          <div className="mt-4 space-y-3">
            {stats.recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between border-b border-neutral-800 py-3 last:border-0"
              >
                <div>
                  <p className="text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-neutral-500">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{order.total} AZN</p>
                  <p className="text-xs text-neutral-500">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${adminCardClass} p-6`}>
          <h2 className="text-sm font-medium uppercase tracking-[0.15em]">
            Low Stock Products
          </h2>
          <div className="mt-4 space-y-3">
            {stats.lowStockProducts.length === 0 ? (
              <p className="text-sm text-neutral-500">All stock levels healthy</p>
            ) : (
              stats.lowStockProducts.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-neutral-800 py-3 last:border-0"
                >
                  <div>
                    <Link
                      href={`/admin/products/${item.productId}`}
                      className="text-sm hover:text-white"
                    >
                      {item.productName}
                    </Link>
                    <p className="text-xs text-neutral-500">{item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-amber-400">{item.quantity} left</p>
                    <p className="text-xs text-neutral-500">
                      Alert at {item.lowStockAt}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

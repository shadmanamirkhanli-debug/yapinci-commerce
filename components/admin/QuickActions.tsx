import Link from "next/link";
import { adminCardClass } from "@/lib/admin/styles";

const actions = [
  { label: "Add Product", href: "/admin/products/new" },
  { label: "Add Category", href: "/admin/categories/new" },
  { label: "View Orders", href: "/admin/orders" },
  { label: "Inventory", href: "/admin/inventory" },
];

export default function QuickActions() {
  return (
    <div className={`${adminCardClass} p-6`}>
      <h2 className="text-sm font-medium uppercase tracking-[0.15em]">
        Quick Actions
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-lg border border-neutral-800 px-4 py-3 text-sm text-neutral-300 transition-colors hover:border-neutral-600 hover:bg-neutral-800 hover:text-white"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

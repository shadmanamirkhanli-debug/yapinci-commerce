import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import LogoutButton from "@/components/auth/LogoutButton";
import SidebarNav from "@/components/admin/SidebarNav";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen bg-neutral-950 text-white">
      <aside className="hidden w-64 shrink-0 border-r border-neutral-800 p-6 lg:block">
        <Link
          href="/admin"
          className="text-sm font-medium tracking-[0.25em] uppercase"
        >
          Yapinci Admin
        </Link>

        {session?.user && (
          <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-3">
            <p className="text-xs text-neutral-500">Daxil olundu</p>
            <p className="mt-1 truncate text-sm">{session.user.email}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-neutral-500">
              {session.user.role}
            </p>
          </div>
        )}

        <div className="mt-8">
          <SidebarNav />
        </div>

        <div className="mt-10 flex flex-col gap-3">
          <Link
            href="/"
            className="text-xs tracking-[0.15em] uppercase text-neutral-500 transition-colors hover:text-white"
          >
            ← Storefront
          </Link>
          <LogoutButton callbackUrl="/admin/login" label="Çıxış" />
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="border-b border-neutral-800 px-6 py-4 lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium tracking-[0.25em] uppercase">
              Yapinci Admin
            </p>
            <LogoutButton callbackUrl="/admin/login" label="Çıxış" />
          </div>
          <div className="mt-4">
            <SidebarNav />
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}

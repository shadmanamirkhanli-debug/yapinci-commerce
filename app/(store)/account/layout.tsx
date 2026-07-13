import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils/cn";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("AccountLayout");

  const links = [
    { href: "/account", key: "profile", label: t("profile") },
    { href: "/account/orders", key: "orders", label: t("orders") },
  ];

  return (
    <div>
      <nav className="mb-10 flex gap-3 border-b border-border pb-4">
        {links.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-muted transition-colors hover:bg-secondary hover:text-primary"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}

import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const links = [
  { href: "/account", label: "Profil" },
  { href: "/account/orders", label: "Sifarişlər" },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <nav className="mb-10 flex gap-3 border-b border-border pb-4">
        {links.map((link) => (
          <Link
            key={link.href}
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

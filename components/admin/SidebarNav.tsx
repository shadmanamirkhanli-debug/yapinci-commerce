"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavLinks } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {adminNavLinks.map((link) => {
        const isActive =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "block rounded-lg px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-white text-black"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

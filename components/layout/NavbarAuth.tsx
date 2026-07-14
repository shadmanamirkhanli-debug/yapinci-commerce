"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { cn } from "@/lib/utils/cn";

type NavbarAuthProps = {
  className?: string;
};

export default function NavbarAuth({ className }: NavbarAuthProps) {
  const { data: session, status } = useSession();
  const t = useTranslations("NavbarAuth");

  if (status === "loading") {
    return (
      <span className={cn("text-xs tracking-[0.15em] uppercase text-muted", className)}>
        ...
      </span>
    );
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className={cn(
          "text-xs font-medium tracking-[0.15em] uppercase text-muted transition-colors hover:text-primary",
          className
        )}
      >
        {t("login")}
      </Link>
    );
  }

  const isAdmin = session.user.role && ADMIN_ROLES.includes(session.user.role);

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <Link
        href="/account"
        className="text-xs font-medium tracking-[0.15em] uppercase text-muted transition-colors hover:text-primary"
      >
        {t("account")}
      </Link>
      {isAdmin && (
        <Link
          href="/admin"
          className="text-xs font-medium tracking-[0.15em] uppercase text-muted transition-colors hover:text-primary"
        >
          {t("admin")}
        </Link>
      )}
    </div>
  );
}

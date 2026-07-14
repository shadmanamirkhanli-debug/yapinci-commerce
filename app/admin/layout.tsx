import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { auth } from "@/auth";
import { ADMIN_ROLES } from "@/lib/auth/roles";

// Second layer behind proxy.ts: if the middleware guard is ever
// bypassed or misconfigured, this still keeps non-admins out.
export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  if (pathname !== "/admin/login") {
    const session = await auth();
    const role = session?.user?.role;

    if (!session?.user || !role || !ADMIN_ROLES.includes(role)) {
      redirect("/admin/login");
    }
  }

  // Admin lives outside app/[locale] (it's a single-language, az-only
  // panel), but shared components like LoginForm still call useTranslations
  // — give them a fixed-locale provider rather than next-intl's URL-driven one.
  const messages = (await import("@/messages/az.json")).default;

  return (
    <NextIntlClientProvider locale="az" messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

import { headers } from "next/headers";
import { redirect } from "next/navigation";
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

  return children;
}

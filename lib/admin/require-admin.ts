import { auth } from "@/auth";
import { apiError } from "@/lib/api-response";
import { ADMIN_ROLES } from "@/lib/auth/roles";

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.role || !ADMIN_ROLES.includes(session.user.role)) {
    return { session: null, error: apiError("Unauthorized", 401) };
  }

  return { session, error: null };
}

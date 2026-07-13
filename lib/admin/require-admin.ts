import { auth } from "@/auth";
import { apiError } from "@/lib/api-response";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { logAudit } from "@/lib/audit";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.role || !ADMIN_ROLES.includes(session.user.role)) {
    return { session: null, error: apiError("Unauthorized", 401) };
  }
  return { session, error: null };
}

type AuditContext = {
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
};

export async function requireAdminAudited(request: Request, context: AuditContext) {
  const result = await requireAdmin();
  if (result.error) return result;

  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  await logAudit({
    userId: result.session?.user?.id ?? null,
    userEmail: result.session?.user?.email ?? null,
    action: context.action,
    entityType: context.entityType,
    entityId: context.entityId,
    metadata: context.metadata,
    ipAddress,
  });

  return result;
}

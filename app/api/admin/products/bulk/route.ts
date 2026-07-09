import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { apiError, apiSuccess } from "@/lib/api-response";
import { productBulkSchema } from "@/lib/validations/product";

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = productBulkSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
    }

    if (parsed.data.action === "delete") {
      await prisma.product.deleteMany({
        where: { id: { in: parsed.data.ids } },
      });
      return apiSuccess({ deleted: parsed.data.ids.length });
    }

    if (parsed.data.action === "update" && parsed.data.data) {
      await prisma.product.updateMany({
        where: { id: { in: parsed.data.ids } },
        data: parsed.data.data,
      });
      return apiSuccess({ updated: parsed.data.ids.length });
    }

    return apiError("Invalid bulk action", 400);
  } catch {
    return apiError("Bulk operation failed", 500);
  }
}

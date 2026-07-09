import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { apiError, apiSuccess } from "@/lib/api-response";
import { categoryBulkSchema } from "@/lib/validations/category";

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = categoryBulkSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
    }

    await prisma.category.deleteMany({
      where: { id: { in: parsed.data.ids } },
    });

    return apiSuccess({ deleted: parsed.data.ids.length });
  } catch {
    return apiError("Bulk delete failed", 500);
  }
}

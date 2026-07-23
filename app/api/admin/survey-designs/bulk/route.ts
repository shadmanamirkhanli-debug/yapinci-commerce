import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { apiError, apiSuccess } from "@/lib/api-response";
import { surveyDesignBulkSchema } from "@/lib/validations/survey";

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = surveyDesignBulkSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
    }

    await prisma.surveyDesign.deleteMany({
      where: { id: { in: parsed.data.ids } },
    });

    return apiSuccess({ deleted: parsed.data.ids.length });
  } catch {
    return apiError("Bulk delete failed", 500);
  }
}

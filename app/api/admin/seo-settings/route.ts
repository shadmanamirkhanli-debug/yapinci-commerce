import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAdminAudited } from "@/lib/admin/require-admin";
import { apiError, apiSuccess } from "@/lib/api-response";
import { seoSettingsSchema } from "@/lib/validations/seo-settings";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const settings = await prisma.seoSettings.findUnique({
    where: { id: 1 },
  });

  if (!settings) {
    return apiSuccess({
      metaTitle: "Yapinci",
      metaDescription: "Azərbaycanın premium moda və əl işi məhsulları mağazası.",
      ogImageUrl: "",
    });
  }

  return apiSuccess({
    metaTitle: settings.metaTitle,
    metaDescription: settings.metaDescription,
    ogImageUrl: settings.ogImageUrl ?? "",
  });
}

export async function PUT(request: Request) {
  const { error } = await requireAdminAudited(request, {
    action: "seo_settings.update",
    entityType: "SeoSettings",
    entityId: "1",
  });
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = seoSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
    }

    const data = parsed.data;

    const updated = await prisma.seoSettings.upsert({
      where: { id: 1 },
      update: {
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        ogImageUrl: data.ogImageUrl || null,
      },
      create: {
        id: 1,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        ogImageUrl: data.ogImageUrl || null,
      },
    });

    return apiSuccess(updated);
  } catch {
    return apiError("Failed to update SEO settings", 500);
  }
}

import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAdminAudited } from "@/lib/admin/require-admin";
import { apiError, apiSuccess } from "@/lib/api-response";
import { shippingSettingsSchema } from "@/lib/validations/shipping-settings";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const settings = await prisma.shippingSettings.findUnique({
    where: { id: 1 },
  });

  if (!settings) {
    return apiSuccess({
      standardPrice: 10,
      standardDays: "3-5 iş günü",
      expressPrice: 25,
      expressDays: "1-2 iş günü",
      internationalPrice: 50,
      internationalDays: "7-14 iş günü",
      internationalActive: false,
      freeShippingThreshold: null,
    });
  }

  return apiSuccess({
    standardPrice: Number(settings.standardPrice),
    standardDays: settings.standardDays,
    expressPrice: Number(settings.expressPrice),
    expressDays: settings.expressDays,
    internationalPrice: Number(settings.internationalPrice),
    internationalDays: settings.internationalDays,
    internationalActive: settings.internationalActive,
    freeShippingThreshold: settings.freeShippingThreshold
      ? Number(settings.freeShippingThreshold)
      : null,
  });
}

export async function PUT(request: Request) {
  const { error } = await requireAdminAudited(request, {
    action: "shipping_settings.update",
    entityType: "ShippingSettings",
    entityId: "1",
  });
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = shippingSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
    }

    const data = parsed.data;

    const updated = await prisma.shippingSettings.upsert({
      where: { id: 1 },
      update: {
        standardPrice: data.standardPrice,
        standardDays: data.standardDays,
        expressPrice: data.expressPrice,
        expressDays: data.expressDays,
        internationalPrice: data.internationalPrice,
        internationalDays: data.internationalDays,
        internationalActive: data.internationalActive,
        freeShippingThreshold: data.freeShippingThreshold,
      },
      create: {
        id: 1,
        standardPrice: data.standardPrice,
        standardDays: data.standardDays,
        expressPrice: data.expressPrice,
        expressDays: data.expressDays,
        internationalPrice: data.internationalPrice,
        internationalDays: data.internationalDays,
        internationalActive: data.internationalActive,
        freeShippingThreshold: data.freeShippingThreshold,
      },
    });

    return apiSuccess(updated);
  } catch {
    return apiError("Failed to update shipping settings", 500);
  }
}

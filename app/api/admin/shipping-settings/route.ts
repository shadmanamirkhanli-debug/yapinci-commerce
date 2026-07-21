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
      standardPrice: 0,
      expressPrice: 5,
      freeShippingThreshold: null,
    });
  }

  return apiSuccess({
    standardPrice: Number(settings.standardPrice),
    expressPrice: Number(settings.expressPrice),
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
        expressPrice: data.expressPrice,
        freeShippingThreshold: data.freeShippingThreshold,
      },
      create: {
        id: 1,
        standardPrice: data.standardPrice,
        expressPrice: data.expressPrice,
        freeShippingThreshold: data.freeShippingThreshold,
      },
    });

    return apiSuccess(updated);
  } catch {
    return apiError("Failed to update shipping settings", 500);
  }
}

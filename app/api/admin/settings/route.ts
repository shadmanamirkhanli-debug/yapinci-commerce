import { requireAdmin, requireAdminAudited } from "@/lib/admin/require-admin";
import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const settings = await prisma.storeSettings.findUnique({
    where: { id: 1 },
  });

  return apiSuccess(settings);
}

export async function PUT(request: Request) {
  const { error } = await requireAdminAudited(request, {
    action: "settings.update",
    entityType: "StoreSettings",
    entityId: "1",
  });
  if (error) return error;

  try {
    const body = await request.json();

    const {
      storeName,
      email,
      phone,
      address,
      instagram,
      facebook,
      tiktok,
      whatsapp,
      logoUrl,
      faviconUrl,
    } = body;

    if (!storeName || !email || !phone || !address) {
      return apiError("Store name, email, phone, and address are required", 400);
    }

    const updated = await prisma.storeSettings.upsert({
      where: { id: 1 },
      update: {
        storeName,
        email,
        phone,
        address,
        instagram: instagram || null,
        facebook: facebook || null,
        tiktok: tiktok || null,
        whatsapp: whatsapp || null,
        logoUrl: logoUrl || null,
        faviconUrl: faviconUrl || null,
      },
      create: {
        id: 1,
        storeName,
        email,
        phone,
        address,
        instagram: instagram || null,
        facebook: facebook || null,
        tiktok: tiktok || null,
        whatsapp: whatsapp || null,
        logoUrl: logoUrl || null,
        faviconUrl: faviconUrl || null,
      },
    });

    return apiSuccess(updated);
  } catch (updateError) {
    logger.error("Settings update failed", {
      error: updateError instanceof Error ? updateError.message : "Unknown error",
    });
    return apiError("Failed to update settings", 500);
  }
}

import { prisma } from "@/lib/prisma";

export async function getStoreSettings() {
  const settings = await prisma.storeSettings.findUnique({
    where: { id: 1 },
  });

  return (
    settings ?? {
      id: 1,
      storeName: "Yapinci",
      email: "info@yapinci.az",
      phone: "+994 12 345 67 89",
      address: "Bakı, Azərbaycan",
      instagram: "@yapinci.az",
      facebook: null,
      tiktok: null,
      whatsapp: null,
      logoUrl: null,
      faviconUrl: null,
      updatedAt: new Date(),
    }
  );
}

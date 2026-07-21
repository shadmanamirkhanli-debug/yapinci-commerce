import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";

export type ShippingMethodId = "standard" | "express";

type ShippingMethod = {
  id: ShippingMethodId;
  label: string;
  description: string;
  price: number;
  active: boolean;
};

async function getShippingSettings() {
  const settings = await prisma.shippingSettings.findUnique({
    where: { id: 1 },
  });

  if (settings) {
    return settings;
  }

  return {
    id: 1,
    standardPrice: 0,
    expressPrice: 5,
    freeShippingThreshold: null,
    updatedAt: new Date(),
  };
}

// Delivery is currently Baku-only, so the two methods and their wording are
// fixed policy (see messages/*.json "ShippingMethods") rather than
// admin-editable free text — only price is DB-configurable.
export async function getShippingMethods(): Promise<ShippingMethod[]> {
  const [settings, t] = await Promise.all([
    getShippingSettings(),
    getTranslations("ShippingMethods"),
  ]);

  return [
    {
      id: "standard",
      label: t("standardLabel"),
      description: t("standardDescription"),
      price: Number(settings.standardPrice),
      active: true,
    },
    {
      id: "express",
      label: t("expressLabel"),
      description: t("expressDescription"),
      price: Number(settings.expressPrice),
      active: true,
    },
  ];
}

export async function getShippingPrice(
  methodId: ShippingMethodId,
  freeShipping: boolean = false
): Promise<number> {
  if (freeShipping) {
    return 0;
  }

  const methods = await getShippingMethods();
  const found = methods.find(function (m) {
    return m.id === methodId;
  });

  if (found) {
    return found.price;
  }

  return 0;
}

export async function getFreeShippingThreshold(): Promise<number | null> {
  const settings = await getShippingSettings();

  if (settings.freeShippingThreshold) {
    return Number(settings.freeShippingThreshold);
  }

  return null;
}

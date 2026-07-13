import { prisma } from "@/lib/prisma";

export type ShippingMethodId = "standard" | "express" | "international";

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
    standardPrice: 10,
    standardDays: "3-5 iş günü",
    expressPrice: 25,
    expressDays: "1-2 iş günü",
    internationalPrice: 50,
    internationalDays: "7-14 iş günü",
    internationalActive: false,
    freeShippingThreshold: null,
    updatedAt: new Date(),
  };
}

export async function getShippingMethods(): Promise<ShippingMethod[]> {
  const settings = await getShippingSettings();

  const methods: ShippingMethod[] = [];

  methods.push({
    id: "standard",
    label: "Standard Çatdırılma",
    description: settings.standardDays,
    price: Number(settings.standardPrice),
    active: true,
  });

  methods.push({
    id: "express",
    label: "Sürətli Çatdırılma",
    description: settings.expressDays,
    price: Number(settings.expressPrice),
    active: true,
  });

  if (settings.internationalActive) {
    methods.push({
      id: "international",
      label: "Beynəlxalq Çatdırılma",
      description: settings.internationalDays,
      price: Number(settings.internationalPrice),
      active: true,
    });
  }

  return methods;
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

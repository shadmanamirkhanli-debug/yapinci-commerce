export const SHIPPING_METHODS = {
  standard: {
    id: "standard",
    label: "Standard Shipping",
    description: "3-5 iş günü",
    price: Number(process.env.SHIPPING_STANDARD_PRICE ?? 10),
    estimatedDays: 5,
  },
  express: {
    id: "express",
    label: "Express Shipping",
    description: "1-2 iş günü",
    price: Number(process.env.SHIPPING_EXPRESS_PRICE ?? 25),
    estimatedDays: 2,
  },
} as const;

export type ShippingMethodId = keyof typeof SHIPPING_METHODS;

export function getShippingPrice(
  methodId: ShippingMethodId,
  freeShipping = false
) {
  if (freeShipping) return 0;
  return SHIPPING_METHODS[methodId]?.price ?? 0;
}

export function getShippingMethods() {
  return Object.values(SHIPPING_METHODS);
}

import { randomBytes } from "crypto";
import type { Prisma } from "@prisma/client";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { toNumber } from "@/lib/admin/serialize";
import { calculateOrderTotals, validateCoupon } from "@/lib/orders/coupons";
import {
  getShippingPrice,
  getFreeShippingThreshold,
  type ShippingMethodId,
} from "@/lib/orders/shipping";
import { calculateTax } from "@/lib/orders/tax";
import { prisma } from "@/lib/prisma";
import { notifyNewOrder } from "@/lib/telegram";
import type { CheckoutOrderInput } from "@/lib/validations/checkout";

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: { select: { name: true, slug: true } };
        variant: { select: { sku: true, size: true, color: true } };
      };
    };
    shippingAddress: true;
    payment: true;
    coupon: true;
    user: { select: { name: true, email: true } };
  };
}>;

export function formatOrder(order: OrderWithRelations) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    subtotal: toNumber(order.subtotal),
    discount: toNumber(order.discount),
    shipping: toNumber(order.shipping),
    tax: toNumber(order.tax),
    total: toNumber(order.total),
    currency: order.currency,
    notes: order.notes,
    adminNotes: order.adminNotes,
    trackingNumber: order.trackingNumber,
    shippingMethod: order.shippingMethod,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    coupon: order.coupon
      ? { code: order.coupon.code, discountType: order.coupon.discountType }
      : null,
    payment: order.payment
      ? {
          id: order.payment.id,
          status: order.payment.status,
          provider: order.payment.provider,
          amount: toNumber(order.payment.amount),
        }
      : null,
    shippingAddress: order.shippingAddress,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      productName: item.product.name,
      productSlug: item.product.slug,
      sku: item.variant?.sku,
      size: item.variant?.size,
      color: item.variant?.color,
      quantity: item.quantity,
      unitPrice: toNumber(item.unitPrice),
      total: toNumber(item.total),
    })),
    customer: order.user
      ? { name: order.user.name, email: order.user.email }
      : { name: null, email: order.customerEmail },
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export const orderInclude = {
  items: {
    include: {
      product: { select: { name: true, slug: true } },
      variant: { select: { sku: true, size: true, color: true } },
    },
  },
  shippingAddress: true,
  payment: true,
  coupon: true,
  user: { select: { name: true, email: true } },
} satisfies Prisma.OrderInclude;

async function generateOrderNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.order.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01`),
      },
    },
  });
  return `YAP-${year}-${String(count + 1).padStart(4, "0")}`;
}

export async function createOrderFromCheckout(
  userId: string | null,
  input: CheckoutOrderInput
) {
  const variants = await prisma.productVariant.findMany({
    where: {
      id: { in: input.items.map((item) => item.variantId) },
    },
    include: {
      product: true,
      inventory: true,
    },
  });

  if (variants.length !== input.items.length) {
    throw new Error("Bəzi məhsul variantları tapılmadı");
  }

  let subtotal = 0;
  const lineItems: {
    productId: string;
    variantId: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[] = [];

  for (const item of input.items) {
    const variant = variants.find((v) => v.id === item.variantId);
    if (!variant) throw new Error("Variant tapılmadı");

    const available =
      (variant.inventory?.quantity ?? 0) - (variant.inventory?.reserved ?? 0);
    if (available < item.quantity) {
      throw new Error(`${variant.product.name} üçün kifayət qədər stok yoxdur`);
    }

    const unitPrice = variant.price
      ? toNumber(variant.price)
      : toNumber(variant.product.price);
    const total = unitPrice * item.quantity;
    subtotal += total;

    lineItems.push({
      productId: variant.productId,
      variantId: variant.id,
      quantity: item.quantity,
      unitPrice,
      total,
    });
  }

  let discount = 0;
  let couponId: string | null = null;
  let freeShipping = false;

  if (input.couponCode) {
    const couponResult = await validateCoupon(input.couponCode, subtotal);
    if (!couponResult.valid) {
      throw new Error(couponResult.error);
    }
    discount = couponResult.discountAmount;
    couponId = couponResult.couponId;
    freeShipping = couponResult.freeShipping;
  }

  const freeShippingThreshold = await getFreeShippingThreshold();
  if (!freeShipping && freeShippingThreshold !== null && subtotal >= freeShippingThreshold) {
    freeShipping = true;
  }

  const shipping = await getShippingPrice(
    input.shippingMethod as ShippingMethodId,
    freeShipping
  );
  const tax = calculateTax(subtotal - discount);
  const totals = calculateOrderTotals({ subtotal, discount, shipping, tax });

  const fullName = `${input.customer.firstName} ${input.customer.lastName}`.trim();
  const orderNumber = await generateOrderNumber();
  const guestToken = userId ? null : randomBytes(32).toString("hex");

  const order = await prisma.$transaction(async (tx) => {
    const address = await tx.address.create({
      data: {
        userId,
        label: "Checkout",
        fullName,
        line1: input.address.address,
        city: input.address.city,
        state: input.address.region,
        country: input.address.country,
        postalCode: input.address.postalCode,
        phone: input.customer.phone,
        isDefault: false,
      },
    });

    const createdOrder = await tx.order.create({
      data: {
        orderNumber,
        userId,
        couponId,
        shippingAddressId: address.id,
        guestToken,
        status: OrderStatus.AWAITING_PAYMENT,
        subtotal: totals.subtotal,
        discount: totals.discount,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
        currency: "AZN",
        notes: input.notes,
        shippingMethod: input.shippingMethod,
        customerPhone: input.customer.phone,
        customerEmail: input.customer.email,
        items: {
          create: lineItems.map((line) => ({
            productId: line.productId,
            variantId: line.variantId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            total: line.total,
          })),
        },
        payment: {
          create: {
            amount: totals.total,
            currency: "AZN",
            status: PaymentStatus.PENDING,
            provider: "pasha_bank",
            metadata: {
              integration: "pending",
              checkoutReady: true,
            },
          },
        },
      },
      include: orderInclude,
    });

    for (const item of input.items) {
      await tx.inventory.updateMany({
        where: { variantId: item.variantId },
        data: { quantity: { decrement: item.quantity } },
      });
    }

    if (couponId) {
      await tx.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    return createdOrder;
  });

  const formattedOrder = formatOrder(order);

  // Fire-and-forget: notification failures must never affect the order response.
  void notifyNewOrder(formattedOrder);

  return { order: formattedOrder, guestToken };
}

export async function getOrderByNumber(
  orderNumber: string,
  identity: { userId?: string; guestToken?: string } = {}
) {
  const { userId, guestToken } = identity;

  if (!userId && !guestToken) {
    return null;
  }

  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      ...(userId ? { userId } : { guestToken }),
    },
    include: orderInclude,
  });

  return order ? formatOrder(order) : null;
}

export async function getOrderById(id: string, userId?: string) {
  const order = await prisma.order.findFirst({
    where: {
      id,
      ...(userId ? { userId } : {}),
    },
    include: orderInclude,
  });

  return order ? formatOrder(order) : null;
}

export async function getUserOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });

  return orders.map(formatOrder);
}

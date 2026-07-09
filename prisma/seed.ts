import { PrismaClient, DiscountType, OrderStatus, PaymentStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding Yapinci Commerce database...\n");

  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.address.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  await prisma.role.deleteMany();

  const superAdminRole = await prisma.role.create({
    data: {
      name: "Super Administrator",
      slug: "super-admin",
      description: "Full platform control including admin management",
    },
  });

  const adminRole = await prisma.role.create({
    data: {
      name: "Administrator",
      slug: "admin",
      description: "Full platform access",
    },
  });

  const customerRole = await prisma.role.create({
    data: {
      name: "Customer",
      slug: "customer",
      description: "Storefront customer access",
    },
  });

  const passwordHash = await bcrypt.hash("Password123!", 12);

  await prisma.user.create({
    data: {
      email: "superadmin@yapinci.az",
      name: "Yapinci Super Admin",
      password: passwordHash,
      roleId: superAdminRole.id,
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@yapinci.az",
      name: "Yapinci Admin",
      password: passwordHash,
      roleId: adminRole.id,
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: "customer@yapinci.az",
      name: "Leyla Məmmədova",
      password: passwordHash,
      roleId: customerRole.id,
    },
  });

  const outerwear = await prisma.category.create({
    data: {
      name: "Xarici Geyim",
      slug: "outerwear",
      description: "Premium palto və kaftanlar",
    },
  });

  const sets = await prisma.category.create({
    data: {
      name: "Setlər",
      slug: "sets",
      description: "İki parçalı minimalist setlər",
    },
  });

  const shirvanPalto = await prisma.product.create({
    data: {
      name: "Şirvan Palto",
      slug: "shirvan-palto",
      description:
        "Şirvan regionunun ənənəvi naxışlarından ilham alan, premium yun parçadan hazırlanmış palto.",
      price: 289,
      currency: "AZN",
      published: true,
      featured: true,
      categoryId: outerwear.id,
      images: {
        create: [
          {
            url: "/images/products/shirvan-palto-01.jpg",
            alt: "Şirvan Palto — ön görünüş",
            sortOrder: 0,
            isPrimary: true,
          },
          {
            url: "/images/products/shirvan-palto-02.jpg",
            alt: "Şirvan Palto — detal",
            sortOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: "YP-SHRV-S-BLK",
            size: "S",
            color: "Qara",
            inventory: { create: { quantity: 12, lowStockAt: 3 } },
          },
          {
            sku: "YP-SHRV-M-BLK",
            size: "M",
            color: "Qara",
            inventory: { create: { quantity: 18, lowStockAt: 5 } },
          },
          {
            sku: "YP-SHRV-L-BLK",
            size: "L",
            color: "Qara",
            inventory: { create: { quantity: 8, lowStockAt: 3 } },
          },
        ],
      },
    },
  });

  const qarabagKaftan = await prisma.product.create({
    data: {
      name: "Qarabağ Kaftan",
      slug: "qarabag-kaftan",
      description:
        "Qarabağ mədəniyyətinin zəngin rəng palitrasını əks etdirən, əl işi detallı kaftan.",
      price: 349,
      currency: "AZN",
      published: true,
      featured: true,
      categoryId: outerwear.id,
      images: {
        create: [
          {
            url: "/images/products/qarabag-kaftan-01.jpg",
            alt: "Qarabağ Kaftan",
            sortOrder: 0,
            isPrimary: true,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: "YP-QRB-M-GLD",
            size: "M",
            color: "Qızılı",
            inventory: { create: { quantity: 6, lowStockAt: 2 } },
          },
          {
            sku: "YP-QRB-L-GLD",
            size: "L",
            color: "Qızılı",
            inventory: { create: { quantity: 4, lowStockAt: 2 } },
          },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Bakı Linen Set",
      slug: "baki-linen-set",
      description:
        "Yay kolleksiyası üçün ideal, təbii linendən hazırlanmış minimalist iki parçalı set.",
      price: 219,
      currency: "AZN",
      published: true,
      featured: true,
      categoryId: sets.id,
      images: {
        create: [
          {
            url: "/images/products/baki-linen-set-01.jpg",
            alt: "Bakı Linen Set",
            sortOrder: 0,
            isPrimary: true,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: "YP-BKI-S-NAT",
            size: "S",
            color: "Təbii",
            inventory: { create: { quantity: 20, lowStockAt: 5 } },
          },
          {
            sku: "YP-BKI-M-NAT",
            size: "M",
            color: "Təbii",
            inventory: { create: { quantity: 15, lowStockAt: 5 } },
          },
        ],
      },
    },
  });

  const welcomeCoupon = await prisma.coupon.create({
    data: {
      code: "YAPINCI10",
      description: "İlk sifariş üçün 10% endirim",
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      minOrderValue: 100,
      maxUses: 500,
      active: true,
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  const shippingAddress = await prisma.address.create({
    data: {
      userId: customerUser.id,
      label: "Ev",
      fullName: "Leyla Məmmədova",
      line1: "Nizami küçəsi 45",
      line2: "Mənzil 12",
      city: "Bakı",
      country: "AZ",
      postalCode: "AZ1000",
      phone: "+994501234567",
      isDefault: true,
    },
  });

  await prisma.wishlist.create({
    data: {
      userId: customerUser.id,
      productId: qarabagKaftan.id,
    },
  });

  await prisma.review.create({
    data: {
      userId: customerUser.id,
      productId: shirvanPalto.id,
      rating: 5,
      title: "Mükəmməl keyfiyyət",
      comment:
        "Parça keyfiyyəti və tikmə detalları gözləntilərimdən çox yuxarıdır. Premium hiss olunur.",
      published: true,
    },
  });

  const shirvanVariant = await prisma.productVariant.findFirst({
    where: { productId: shirvanPalto.id, size: "M" },
  });

  const order = await prisma.order.create({
    data: {
      orderNumber: "YAP-2026-0001",
      userId: customerUser.id,
      couponId: welcomeCoupon.id,
      shippingAddressId: shippingAddress.id,
      status: OrderStatus.PAID,
      subtotal: 289,
      discount: 28.9,
      shipping: 0,
      tax: 0,
      total: 260.1,
      currency: "AZN",
      items: {
        create: [
          {
            productId: shirvanPalto.id,
            variantId: shirvanVariant?.id,
            quantity: 1,
            unitPrice: 289,
            total: 289,
          },
        ],
      },
      payment: {
        create: {
          amount: 260.1,
          currency: "AZN",
          status: PaymentStatus.COMPLETED,
          provider: "stripe",
          transactionId: "txn_yapinci_demo_001",
        },
      },
    },
  });

  await prisma.coupon.update({
    where: { id: welcomeCoupon.id },
    data: { usedCount: 1 },
  });

  console.log("✅ Seed completed successfully\n");
  console.log(`   Roles:      3`);
  console.log(
    `   Users:      3 (superadmin@yapinci.az, admin@yapinci.az, customer@yapinci.az)`
  );
  console.log(`   Categories: 2`);
  console.log(`   Products:   3`);
  console.log(`   Coupons:    1 (YAPINCI10)`);
  console.log(`   Orders:     1 (${order.orderNumber})`);
  console.log(`   Password:   Password123!`);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

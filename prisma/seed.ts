import { PrismaClient, DiscountType, OrderStatus, PaymentStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function withMeta(meta: Record<string, unknown>, body: string) {
  return `---meta\n${JSON.stringify(meta)}\n---\n${body}`;
}

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

  const tshirts = await prisma.category.create({
    data: {
      name: "Futbolkalar",
      slug: "t-shirts",
      description: withMeta(
        { imageUrl: "/images/products/baku-skyline-tee.png" },
        "Premium oversized və embroidered futbolkalar"
      ),
    },
  });

  const accessories = await prisma.category.create({
    data: {
      name: "Aksesuarlar",
      slug: "accessories",
      description: withMeta(
        { imageUrl: "/images/products/dragon-baseball-cap.png" },
        "Papaq, bandana və şəhər aksesuarları"
      ),
    },
  });

  const bags = await prisma.category.create({
    data: {
      name: "Çantalar",
      slug: "bags",
      description: withMeta(
        { imageUrl: "/images/products/dragon-recon-backpack.png" },
        "Funksional və hekayə daşıyan çantalar"
      ),
    },
  });

  await prisma.product.create({
    data: {
      name: "Dragon Recon Backpack",
      slug: "dragon-recon-backpack",
      description: withMeta(
        {
          collection: "Dragon",
          brand: "Yapinci",
          newArrival: true,
          bestSeller: true,
          shortDescription:
            "The Dragon: an ancient talisman of protection — technical recon backpack.",
        },
        "Ripstop parça, çoxlu bölmə və qədim Azərbaycan əjdaha motivi ilə bəzədilmiş premium sırt çantası. RECON modeli şəhər və səyahət üçün hazırlanıb."
      ),
      price: 189,
      currency: "AZN",
      published: true,
      featured: true,
      categoryId: bags.id,
      images: {
        create: [
          {
            url: "/images/products/dragon-recon-backpack.png",
            alt: "Dragon Recon Backpack",
            sortOrder: 0,
            isPrimary: true,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: "YP-DRG-BPK-SLATE",
            size: "One Size",
            color: "Göy-boz",
            inventory: { create: { quantity: 24, lowStockAt: 5 } },
          },
        ],
      },
    },
  });

  const dragonTeeMaroon = await prisma.product.create({
    data: {
      name: "Dragon Talisman Tee — Maroon",
      slug: "dragon-talisman-tee-maroon",
      description: withMeta(
        {
          collection: "Dragon",
          brand: "Yapinci",
          newArrival: true,
          bestSeller: true,
          shortDescription:
            "Ancient Azerbaijani carpet element — oversized maroon tee.",
        },
        "Ağır çəkili oversized parçadan hazırlanmış bordó futbolka. Mərkəzdə əjdaha motivi, qol və etiket detalları ilə tamamlanmış Dragon kolleksiyasının əsas parçasıdır."
      ),
      price: 129,
      currency: "AZN",
      published: true,
      featured: true,
      categoryId: tshirts.id,
      images: {
        create: [
          {
            url: "/images/products/dragon-talisman-tee-maroon.png",
            alt: "Dragon Talisman Tee Maroon",
            sortOrder: 0,
            isPrimary: true,
          },
        ],
      },
      variants: {
        create: [
          { sku: "YP-DRG-MRN-S", size: "S", color: "Bordó", inventory: { create: { quantity: 18, lowStockAt: 4 } } },
          { sku: "YP-DRG-MRN-M", size: "M", color: "Bordó", inventory: { create: { quantity: 22, lowStockAt: 5 } } },
          { sku: "YP-DRG-MRN-L", size: "L", color: "Bordó", inventory: { create: { quantity: 16, lowStockAt: 4 } } },
          { sku: "YP-DRG-MRN-XL", size: "XL", color: "Bordó", inventory: { create: { quantity: 10, lowStockAt: 3 } } },
        ],
      },
    },
  });

  const dragonTeeBlack = await prisma.product.create({
    data: {
      name: "Dragon Talisman Tee — Black",
      slug: "dragon-talisman-tee-black",
      description: withMeta(
        {
          collection: "Dragon",
          brand: "Yapinci",
          newArrival: true,
          shortDescription:
            "Shielding the soul through geometric symbolism — black oversized tee.",
        },
        "Qara oversized futbolka. Sinə hissəsində qədim talisman motivi və The Dragon hekayəsi ilə tamamlanmış, premium street-luxury görünüş."
      ),
      price: 129,
      currency: "AZN",
      published: true,
      featured: true,
      categoryId: tshirts.id,
      images: {
        create: [
          {
            url: "/images/products/dragon-talisman-tee-black.png",
            alt: "Dragon Talisman Tee Black",
            sortOrder: 0,
            isPrimary: true,
          },
        ],
      },
      variants: {
        create: [
          { sku: "YP-DRG-BLK-S", size: "S", color: "Qara", inventory: { create: { quantity: 20, lowStockAt: 5 } } },
          { sku: "YP-DRG-BLK-M", size: "M", color: "Qara", inventory: { create: { quantity: 24, lowStockAt: 5 } } },
          { sku: "YP-DRG-BLK-L", size: "L", color: "Qara", inventory: { create: { quantity: 18, lowStockAt: 4 } } },
          { sku: "YP-DRG-BLK-XL", size: "XL", color: "Qara", inventory: { create: { quantity: 12, lowStockAt: 3 } } },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Dragon Carpet Bucket Hat",
      slug: "dragon-bucket-hat",
      description: withMeta(
        {
          collection: "Dragon",
          brand: "Yapinci",
          newArrival: true,
          shortDescription: "Ancient Azerbaijani carpet element bucket hat.",
        },
        "Kanvas toxuma bucket hat. Əjdaha motivi, chovkan brend detalı və Azərbaycan bayrağı ilə tamamlanmış üç rəng variantı."
      ),
      price: 79,
      currency: "AZN",
      published: true,
      featured: true,
      categoryId: accessories.id,
      images: {
        create: [
          {
            url: "/images/products/dragon-bucket-hat.png",
            alt: "Dragon Carpet Bucket Hat",
            sortOrder: 0,
            isPrimary: true,
          },
        ],
      },
      variants: {
        create: [
          { sku: "YP-DRG-BKT-GRN", size: "One Size", color: "Yaşıl", inventory: { create: { quantity: 15, lowStockAt: 4 } } },
          { sku: "YP-DRG-BKT-BLU", size: "One Size", color: "Mavi", inventory: { create: { quantity: 14, lowStockAt: 4 } } },
          { sku: "YP-DRG-BKT-BRD", size: "One Size", color: "Bordó", inventory: { create: { quantity: 12, lowStockAt: 3 } } },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Baku Skyline Embroidered Tee",
      slug: "baku-skyline-tee",
      description: withMeta(
        {
          collection: "Baku",
          brand: "Yapinci",
          newArrival: true,
          bestSeller: true,
          shortDescription: "Hand-embroidered Baku skyline on premium white cotton.",
        },
        "Ağ premium parça üzərində əl tikməsi Bakı panoraması — Flame Towers, TV qülləsi və Xəzər sahil xətti. Baku kolleksiyasının şəhər hekayəsini daşıyan əsas parça."
      ),
      price: 149,
      currency: "AZN",
      published: true,
      featured: true,
      categoryId: tshirts.id,
      images: {
        create: [
          {
            url: "/images/products/baku-skyline-tee.png",
            alt: "Baku Skyline Embroidered Tee",
            sortOrder: 0,
            isPrimary: true,
          },
          {
            url: "/images/products/baku-skyline-tee-lifestyle.png",
            alt: "Baku Skyline Tee lifestyle",
            sortOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          { sku: "YP-BKU-SKY-S", size: "S", color: "Ağ", inventory: { create: { quantity: 16, lowStockAt: 4 } } },
          { sku: "YP-BKU-SKY-M", size: "M", color: "Ağ", inventory: { create: { quantity: 20, lowStockAt: 5 } } },
          { sku: "YP-BKU-SKY-L", size: "L", color: "Ağ", inventory: { create: { quantity: 14, lowStockAt: 4 } } },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Dragon Carpet Baseball Cap",
      slug: "dragon-baseball-cap",
      description: withMeta(
        {
          collection: "Dragon",
          brand: "Yapinci",
          bestSeller: true,
          shortDescription: "Six-panel cap with ancient carpet dragon motif.",
        },
        "Premium papaq — ön hissədə əjdaha xalçası elementi, yanda chovkan və Azərbaycan bayrağı detalları."
      ),
      price: 69,
      currency: "AZN",
      published: true,
      featured: true,
      categoryId: accessories.id,
      images: {
        create: [
          {
            url: "/images/products/dragon-baseball-cap.png",
            alt: "Dragon Carpet Baseball Cap",
            sortOrder: 0,
            isPrimary: true,
          },
        ],
      },
      variants: {
        create: [
          { sku: "YP-DRG-CAP-GRN", size: "One Size", color: "Yaşıl", inventory: { create: { quantity: 20, lowStockAt: 5 } } },
          { sku: "YP-DRG-CAP-BRD", size: "One Size", color: "Bordó", inventory: { create: { quantity: 18, lowStockAt: 4 } } },
          { sku: "YP-DRG-CAP-NVY", size: "One Size", color: "Tünd Mavi", inventory: { create: { quantity: 16, lowStockAt: 4 } } },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Azərbaycan Script Vintage Cap",
      slug: "azerbaijan-vintage-cap",
      description: withMeta(
        {
          collection: "Heritage",
          brand: "Yapinci",
          newArrival: true,
          shortDescription: "Distressed vintage cap with script Azərbaycan embroidery.",
        },
        "Yuyulmuş vintage effektli papaq. Ön hissədə krem rəngli əlyazma Azərbaycan yazısı — Heritage Symbols kolleksiyasının şəhər və mədəniyyət ifadəsi."
      ),
      price: 59,
      currency: "AZN",
      published: true,
      featured: true,
      categoryId: accessories.id,
      images: {
        create: [
          {
            url: "/images/products/azerbaijan-vintage-cap.png",
            alt: "Azərbaycan Script Vintage Cap",
            sortOrder: 0,
            isPrimary: true,
          },
        ],
      },
      variants: {
        create: [
          { sku: "YP-HRT-CAP-BRD", size: "One Size", color: "Bordó", inventory: { create: { quantity: 14, lowStockAt: 4 } } },
          { sku: "YP-HRT-CAP-GRY", size: "One Size", color: "Boz", inventory: { create: { quantity: 12, lowStockAt: 3 } } },
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
      productId: dragonTeeBlack.id,
    },
  });

  await prisma.review.create({
    data: {
      userId: customerUser.id,
      productId: dragonTeeMaroon.id,
      rating: 5,
      title: "Əla keyfiyyət",
      comment:
        "Parça ağırlığı və tikmə detalları gözləntilərimdən çox yuxarıdır. Dragon kolleksiyası premium hiss olunur.",
      published: true,
    },
  });

  const orderVariant = await prisma.productVariant.findFirst({
    where: { productId: dragonTeeMaroon.id, size: "M" },
  });

  const order = await prisma.order.create({
    data: {
      orderNumber: "YAP-2026-0001",
      userId: customerUser.id,
      couponId: welcomeCoupon.id,
      shippingAddressId: shippingAddress.id,
      status: OrderStatus.PAID,
      subtotal: 129,
      discount: 12.9,
      shipping: 0,
      tax: 0,
      total: 116.1,
      currency: "AZN",
      items: {
        create: [
          {
            productId: dragonTeeMaroon.id,
            variantId: orderVariant?.id,
            quantity: 1,
            unitPrice: 129,
            total: 129,
          },
        ],
      },
      payment: {
        create: {
          amount: 116.1,
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
  console.log(`   Categories: 3`);
  console.log(`   Products:   7`);
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

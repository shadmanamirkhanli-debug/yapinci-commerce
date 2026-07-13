-- CreateTable
CREATE TABLE "StoreSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "storeName" TEXT NOT NULL DEFAULT 'Yapinci',
    "email" TEXT NOT NULL DEFAULT 'info@yapinci.az',
    "phone" TEXT NOT NULL DEFAULT '+994 12 345 67 89',
    "address" TEXT NOT NULL DEFAULT 'Bakı, Azərbaycan',
    "instagram" TEXT,
    "facebook" TEXT,
    "tiktok" TEXT,
    "whatsapp" TEXT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);

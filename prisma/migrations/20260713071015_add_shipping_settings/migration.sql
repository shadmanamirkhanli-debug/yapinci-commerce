-- CreateTable
CREATE TABLE "ShippingSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "standardPrice" DECIMAL(10,2) NOT NULL DEFAULT 10,
    "standardDays" TEXT NOT NULL DEFAULT '3-5 iş günü',
    "expressPrice" DECIMAL(10,2) NOT NULL DEFAULT 25,
    "expressDays" TEXT NOT NULL DEFAULT '1-2 iş günü',
    "internationalPrice" DECIMAL(10,2) NOT NULL DEFAULT 50,
    "internationalDays" TEXT NOT NULL DEFAULT '7-14 iş günü',
    "internationalActive" BOOLEAN NOT NULL DEFAULT false,
    "freeShippingThreshold" DECIMAL(10,2),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingSettings_pkey" PRIMARY KEY ("id")
);

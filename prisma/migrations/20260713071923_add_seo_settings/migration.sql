-- CreateTable
CREATE TABLE "SeoSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "metaTitle" TEXT NOT NULL DEFAULT 'Yapinci',
    "metaDescription" TEXT NOT NULL DEFAULT 'Azərbaycanın premium moda və əl işi məhsulları mağazası.',
    "ogImageUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyDesign" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "titleEn" TEXT,
    "titleRu" TEXT,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurveyDesign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" UUID NOT NULL,
    "designId" UUID NOT NULL,
    "visitorId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "wouldBuy" BOOLEAN NOT NULL,
    "suggestion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SurveyDesign_createdAt_idx" ON "SurveyDesign"("createdAt");

-- CreateIndex
CREATE INDEX "SurveyResponse_designId_idx" ON "SurveyResponse"("designId");

-- CreateIndex
CREATE INDEX "SurveyResponse_visitorId_idx" ON "SurveyResponse"("visitorId");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyResponse_designId_visitorId_key" ON "SurveyResponse"("designId", "visitorId");

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_designId_fkey" FOREIGN KEY ("designId") REFERENCES "SurveyDesign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

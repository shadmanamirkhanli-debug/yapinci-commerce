-- CreateEnum
CREATE TYPE "PriceBand" AS ENUM ('UNDER_25', 'FROM_25_TO_40', 'FROM_40_TO_55', 'FROM_55_TO_70', 'OVER_70');

-- CreateEnum
CREATE TYPE "AgeBand" AS ENUM ('UNDER_18', 'AGE_18_24', 'AGE_25_34', 'AGE_35_44', 'AGE_45_PLUS', 'UNSPECIFIED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('FEMALE', 'MALE', 'OTHER', 'UNSPECIFIED');

-- AlterTable
ALTER TABLE "SurveyResponse" ADD COLUMN     "priceBand" "PriceBand";

-- CreateTable
CREATE TABLE "SurveyVisitor" (
    "id" TEXT NOT NULL,
    "ageBand" "AgeBand",
    "gender" "Gender",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurveyVisitor_pkey" PRIMARY KEY ("id")
);

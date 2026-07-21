-- Baku-only shipping: drop international delivery and free-text day fields
-- (delivery windows are now fixed copy in messages/*.json), reset
-- standard/express pricing to the new policy (standard free, express 5 AZN).
ALTER TABLE "ShippingSettings" DROP COLUMN "standardDays";
ALTER TABLE "ShippingSettings" DROP COLUMN "expressDays";
ALTER TABLE "ShippingSettings" DROP COLUMN "internationalPrice";
ALTER TABLE "ShippingSettings" DROP COLUMN "internationalDays";
ALTER TABLE "ShippingSettings" DROP COLUMN "internationalActive";

ALTER TABLE "ShippingSettings" ALTER COLUMN "standardPrice" SET DEFAULT 0;
ALTER TABLE "ShippingSettings" ALTER COLUMN "expressPrice" SET DEFAULT 5;

-- Apply the new policy to any already-configured settings row.
UPDATE "ShippingSettings" SET "standardPrice" = 0, "expressPrice" = 5, "freeShippingThreshold" = NULL;

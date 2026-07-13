-- CreateTable
CREATE TABLE "EmailSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "smtpHost" TEXT,
    "smtpPort" INTEGER NOT NULL DEFAULT 587,
    "smtpUser" TEXT,
    "smtpPassword" TEXT,
    "fromEmail" TEXT NOT NULL DEFAULT 'no-reply@yapinci.az',
    "fromName" TEXT NOT NULL DEFAULT 'Yapinci',
    "orderConfirmationOn" BOOLEAN NOT NULL DEFAULT true,
    "passwordResetOn" BOOLEAN NOT NULL DEFAULT true,
    "adminNotificationOn" BOOLEAN NOT NULL DEFAULT true,
    "adminNotificationEmail" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSettings_pkey" PRIMARY KEY ("id")
);

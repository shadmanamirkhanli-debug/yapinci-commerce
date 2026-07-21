import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { sendEmail, isNotificationEnabled } from "@/lib/email";
import { passwordResetEmail } from "@/lib/email-templates";
import { getBaseUrl } from "@/lib/site-url";

const RESET_TOKEN_EXPIRY_HOURS = 1;

export async function POST(request: Request) {
  const t = await getTranslations("Auth");

  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? t("invalidData") },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({
        message: t("resetLinkSent"),
      });
    }

    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(
      Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
    );

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    const resetUrl = getBaseUrl() + "/reset-password?token=" + token;

    const notificationsEnabled = await isNotificationEnabled("passwordResetOn");

    if (notificationsEnabled) {
      const { subject, html } = passwordResetEmail(resetUrl);
      await sendEmail({ to: email, subject, html });
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[Forgot Password] Reset link for " + email + ": " + resetUrl);
    }

    return NextResponse.json({
      message: t("resetLinkSent"),
      ...(process.env.NODE_ENV === "development" && { resetUrl }),
    });
  } catch {
    return NextResponse.json(
      { error: t("forgotPasswordError") },
      { status: 500 }
    );
  }
}

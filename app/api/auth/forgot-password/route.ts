import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth";

const RESET_TOKEN_EXPIRY_HOURS = 1;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Yanlış məlumat" },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({
        message:
          "Əgər bu e-poçt qeydiyyatdadırsa, şifrə sıfırlama linki göndərildi",
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

    const appUrl = process.env.AUTH_URL ?? "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    if (process.env.NODE_ENV === "development") {
      console.log(`[Forgot Password] Reset link for ${email}: ${resetUrl}`);
    }

    return NextResponse.json({
      message:
        "Əgər bu e-poçt qeydiyyatdadırsa, şifrə sıfırlama linki göndərildi",
      ...(process.env.NODE_ENV === "development" && { resetUrl }),
    });
  } catch {
    return NextResponse.json(
      { error: "Sorğu zamanı xəta baş verdi" },
      { status: 500 }
    );
  }
}

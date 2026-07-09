import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { resetPasswordSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Yanlış məlumat" },
        { status: 400 }
      );
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: parsed.data.token },
      include: { user: true },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Token etibarsızdır və ya vaxtı keçib" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: passwordHash },
      }),
      prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      }),
    ]);

    return NextResponse.json({
      message: "Şifrəniz uğurla yeniləndi",
    });
  } catch {
    return NextResponse.json(
      { error: "Şifrə yenilənərkən xəta baş verdi" },
      { status: 500 }
    );
  }
}

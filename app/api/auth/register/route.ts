import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { ROLES } from "@/lib/auth/roles";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Yanlış məlumat" },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu e-poçt artıq qeydiyyatdan keçib" },
        { status: 409 }
      );
    }

    const customerRole = await prisma.role.findUnique({
      where: { slug: ROLES.CUSTOMER },
    });

    if (!customerRole) {
      return NextResponse.json(
        { error: "Sistem konfiqurasiya xətası" },
        { status: 500 }
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email,
        password: passwordHash,
        roleId: customerRole.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return NextResponse.json(
      { message: "Qeydiyyat uğurla tamamlandı", user },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Qeydiyyat zamanı xəta baş verdi" },
      { status: 500 }
    );
  }
}

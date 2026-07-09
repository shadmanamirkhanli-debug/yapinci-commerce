import "dotenv/config";
import { verifyPassword } from "../lib/auth/password";
import { prisma } from "../lib/prisma";

async function main() {
  const customer = await prisma.user.findUnique({
    where: { email: "customer@yapinci.az" },
    include: { role: true },
  });
  const admin = await prisma.user.findUnique({
    where: { email: "admin@yapinci.az" },
    include: { role: true },
  });

  if (!customer || !admin) {
    throw new Error("Seed users missing");
  }

  const customerValid = await verifyPassword("Password123!", customer.password);
  const adminValid = await verifyPassword("Password123!", admin.password);

  console.log(
    JSON.stringify({
      customerRole: customer.role.slug,
      adminRole: admin.role.slug,
      customerValid,
      adminValid,
    })
  );

  await prisma.$disconnect();
}

main();

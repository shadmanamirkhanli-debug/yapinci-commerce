import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const [users, products, orders] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
  ]);

  console.log(JSON.stringify({ users, products, orders }));
  await prisma.$disconnect();
}

main();

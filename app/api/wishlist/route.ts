import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { wishlistMutationSchema } from "@/lib/validations/common";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const wishlists = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    select: {
      productId: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(
    wishlists.map((item) => ({
      productId: item.productId,
      createdAt: item.createdAt.toISOString(),
    }))
  );
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  try {
    const body = await request.json();
    const parsed = wishlistMutationSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid request", 400);
    }

    const product = await prisma.product.findFirst({
      where: { id: parsed.data.productId, published: true },
      select: { id: true },
    });

    if (!product) {
      return apiError("Product not found", 404);
    }

    await prisma.wishlist.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: parsed.data.productId,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        productId: parsed.data.productId,
      },
    });

    return apiSuccess({ added: true }, 201);
  } catch (error) {
    logger.error("Wishlist add failed", {
      userId: session.user.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return apiError("Failed to add to wishlist", 500);
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  try {
    const body = await request.json();
    const parsed = wishlistMutationSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid request", 400);
    }

    await prisma.wishlist.deleteMany({
      where: {
        userId: session.user.id,
        productId: parsed.data.productId,
      },
    });

    return apiSuccess({ removed: true });
  } catch (error) {
    logger.error("Wishlist remove failed", {
      userId: session.user.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return apiError("Failed to remove from wishlist", 500);
  }
}

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { apiError, apiSuccess } from "@/lib/api-response";
import {
  buildProductWriteData,
  buildVariantWriteData,
  formatAdminProduct,
} from "@/lib/admin/products";
import { productSchema } from "@/lib/validations/product";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: true,
      variants: { include: { inventory: true } },
    },
  });

  if (!product) {
    return apiError("Product not found", 404);
  }

  return apiSuccess(formatAdminProduct(product));
}

export async function PUT(request: Request, context: RouteContext) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
    }

    const existing = await prisma.product.findFirst({
      where: { slug: parsed.data.slug, NOT: { id } },
    });

    if (existing) {
      return apiError("Slug already exists", 409);
    }

    await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.inventory.deleteMany({
        where: { variant: { productId: id } },
      });
      await tx.productVariant.deleteMany({ where: { productId: id } });

      await tx.product.update({
        where: { id },
        data: {
          ...buildProductWriteData(parsed.data),
          images: {
            create: parsed.data.images.map((image, index) => ({
              url: image.url,
              alt: image.alt,
              sortOrder: image.sortOrder ?? index,
              isPrimary: image.isPrimary ?? index === 0,
            })),
          },
          variants: {
            create: parsed.data.variants.map((variant) =>
              buildVariantWriteData(variant)
            ),
          },
        },
      });
    });

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        variants: { include: { inventory: true } },
      },
    });

    return apiSuccess(formatAdminProduct(product!));
  } catch {
    return apiError("Failed to update product", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;

  try {
    await prisma.product.delete({ where: { id } });
    return apiSuccess({ deleted: true });
  } catch {
    return apiError("Failed to delete product", 404);
  }
}

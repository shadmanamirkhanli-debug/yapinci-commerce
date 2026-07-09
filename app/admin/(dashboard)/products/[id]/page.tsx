import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProductForm from "@/components/admin/ProductForm";
import { formatAdminProduct } from "@/lib/admin/products";
import { prisma } from "@/lib/prisma";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        variants: { include: { inventory: true } },
      },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!product) {
    notFound();
  }

  const formatted = formatAdminProduct(product);

  return (
    <div>
      <AdminPageHeader
        title="Edit Product"
        description={formatted.name}
      />
      <ProductForm
        productId={id}
        categories={categories}
        initialData={{
          name: formatted.name,
          slug: formatted.slug,
          description: formatted.description,
          shortDescription: formatted.shortDescription,
          brand: formatted.brand,
          collection: formatted.collection,
          categoryId: formatted.categoryId,
          price: formatted.price,
          comparePrice: formatted.comparePrice,
          costPrice: formatted.costPrice,
          discount: formatted.discount,
          lowStockAlert: formatted.lowStockAlert,
          currency: formatted.currency,
          published: formatted.published,
          featured: formatted.featured,
          newArrival: formatted.newArrival,
          bestSeller: formatted.bestSeller,
          seoTitle: formatted.seoTitle,
          seoDescription: formatted.seoDescription,
          images: formatted.images,
          variants: formatted.variants,
        }}
      />
    </div>
  );
}

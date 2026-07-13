import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import CategoryForm from "@/components/admin/CategoryForm";
import { formatAdminCategory } from "@/lib/admin/categories";
import { prisma } from "@/lib/prisma";

type EditCategoryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;

  const [category, parents] = await Promise.all([
    prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        _count: { select: { products: true, children: true } },
      },
    }),
    prisma.category.findMany({
      where: { NOT: { id } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!category) {
    notFound();
  }

  const formatted = formatAdminCategory(category);

  return (
    <div>
      <AdminPageHeader
        title="Edit Category"
        description={formatted.name}
      />
      <CategoryForm
        categoryId={id}
        parents={parents}
        initialData={{
          name: formatted.name,
          nameEn: formatted.nameEn,
          nameRu: formatted.nameRu,
          slug: formatted.slug,
          description: formatted.description,
          descriptionEn: formatted.descriptionEn,
          descriptionRu: formatted.descriptionRu,
          parentId: formatted.parentId,
          imageUrl: formatted.imageUrl,
          seoTitle: formatted.seoTitle,
          seoDescription: formatted.seoDescription,
        }}
      />
    </div>
  );
}

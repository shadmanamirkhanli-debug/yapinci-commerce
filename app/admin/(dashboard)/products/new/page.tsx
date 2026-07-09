import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProductForm from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <AdminPageHeader
        title="Add Product"
        description="Create a new product in your catalog"
      />
      <ProductForm categories={categories} />
    </div>
  );
}

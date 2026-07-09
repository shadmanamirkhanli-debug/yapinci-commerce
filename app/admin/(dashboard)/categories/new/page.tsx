import AdminPageHeader from "@/components/admin/AdminPageHeader";
import CategoryForm from "@/components/admin/CategoryForm";
import { prisma } from "@/lib/prisma";

export default async function NewCategoryPage() {
  const parents = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <AdminPageHeader
        title="Add Category"
        description="Create a new product category"
      />
      <CategoryForm parents={parents} />
    </div>
  );
}

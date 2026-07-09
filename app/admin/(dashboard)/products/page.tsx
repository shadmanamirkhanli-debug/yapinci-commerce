import { Suspense } from "react";
import ProductsTable from "@/components/admin/ProductsTable";
import Spinner from "@/components/ui/Spinner";
import { prisma } from "@/lib/prisma";

export default async function AdminProductsPage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      }
    >
      <ProductsTable categories={categories} />
    </Suspense>
  );
}

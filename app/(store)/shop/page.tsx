import type { Metadata } from "next";
import { Suspense } from "react";
import Container from "@/components/ui/Container";
import Spinner from "@/components/ui/Spinner";
import ShopExperience from "@/components/store/ShopExperience";
import {
  getFilterOptions,
  getStoreProducts,
  parseProductFilters,
} from "@/lib/store/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop",
  description: "Yapinci premium geyim kolleksiyası — bütün məhsullar.",
};

type ShopPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const filters = parseProductFilters(params);
  const [result, filterOptions] = await Promise.all([
    getStoreProducts(filters),
    getFilterOptions(),
  ]);

  return (
    <Container as="section" className="py-20 lg:py-28">
      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        }
      >
        <ShopExperience
          initialProducts={result.items}
          pagination={result.pagination}
          filterOptions={filterOptions}
        />
      </Suspense>
    </Container>
  );
}

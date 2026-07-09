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
  title: "Search",
  description: "Yapinci məhsul axtarışı",
};

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
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
          basePath="/search"
          title={query ? `"${query}" üçün nəticələr` : "Axtarış Nəticələri"}
          description={
            query
              ? `${result.pagination.total} məhsul tapıldı`
              : "Axtarmaq istədiyiniz məhsulu daxil edin"
          }
        />
      </Suspense>
    </Container>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Spinner from "@/components/ui/Spinner";
import ShopExperience from "@/components/store/ShopExperience";
import {
  getFilterOptions,
  getStoreProducts,
  parseProductFilters,
} from "@/lib/store/products";
import type { StoreLocale } from "@/lib/store/format";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Shop");
  return {
    title: "Shop",
    description: t("metaDescription"),
  };
}

type ShopPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const locale = (await getLocale()) as StoreLocale;
  const filters = parseProductFilters(params);
  const [result, filterOptions] = await Promise.all([
    getStoreProducts(filters, locale),
    getFilterOptions(locale),
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

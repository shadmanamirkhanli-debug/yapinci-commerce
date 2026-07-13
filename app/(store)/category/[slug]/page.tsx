import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Spinner from "@/components/ui/Spinner";
import ShopExperience from "@/components/store/ShopExperience";
import {
  getFilterOptions,
  getStoreCategoryBySlug,
  getStoreProducts,
  parseProductFilters,
} from "@/lib/store/products";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getStoreCategoryBySlug(slug);
  const t = await getTranslations("Category");

  if (!category) {
    return { title: t("notFoundTitle") };
  }

  return {
    title: category.name,
    description: t("metaDescription", { name: category.name }),
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const category = await getStoreCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const t = await getTranslations("Category");
  const filters = parseProductFilters({ ...query, category: slug });
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
          basePath={`/category/${slug}`}
          title={category.name}
          description={t("productCount", { count: category.productCount })}
        />
      </Suspense>
    </Container>
  );
}

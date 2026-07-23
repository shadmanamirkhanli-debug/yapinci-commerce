import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import BrandStorySection from "@/components/store/home/BrandStorySection";
import CollectionSpotlightSection from "@/components/store/home/CollectionSpotlightSection";
import HeroSection from "@/components/store/home/HeroSection";
import JournalSection from "@/components/store/home/JournalSection";
import ProductShowcaseSection from "@/components/store/home/ProductShowcaseSection";
import { homeCollections } from "@/lib/constants";
import { getHomePageData } from "@/lib/store/products";
import type { StoreProduct } from "@/lib/store/types";
import type { StoreLocale } from "@/lib/store/format";
import { createPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Home");
  const locale = await getLocale();

  return createPageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/",
    locale,
  });
}

function findProductBySlug(
  products: StoreProduct[],
  slug: string
): StoreProduct | undefined {
  return products.find((product) => product.slug === slug);
}

export default async function HomePage() {
  const locale = (await getLocale()) as StoreLocale;
  const { featured, newArrivals, bestSellers } = await getHomePageData(locale);
  const t = await getTranslations("Home");
  const tCollections = await getTranslations("HomeCollections");

  const allProducts = [...featured, ...newArrivals, ...bestSellers];

  return (
    <>
      <HeroSection featuredProduct={featured[0]} />

      {homeCollections.map((collection, index) => (
        <CollectionSpotlightSection
          key={collection.slug}
          title={tCollections(`${collection.key}.title`)}
          description={tCollections(`${collection.key}.description`)}
          shopHref={collection.shopHref}
          product={findProductBySlug(allProducts, collection.productSlug)}
          reversed={index % 2 === 1}
        />
      ))}

      <ProductShowcaseSection
        title={t("bestSellers")}
        products={bestSellers}
        ctaHref="/shop"
        ctaLabel={t("shopAllCta")}
        variant="light"
      />

      <ProductShowcaseSection
        title={t("newArrivals")}
        products={newArrivals}
        ctaHref="/shop?sort=newest"
        ctaLabel={t("viewAllCta")}
        variant="muted"
      />

      <BrandStorySection />
      <JournalSection />
    </>
  );
}

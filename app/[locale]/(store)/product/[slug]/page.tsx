import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import ProductDetailView from "@/components/store/ProductDetailView";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import { createPageMetadata } from "@/lib/seo/metadata";
import {
  getRelatedProducts,
  getStoreProductBySlug,
} from "@/lib/store/products";
import type { StoreLocale } from "@/lib/store/format";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = (await getLocale()) as StoreLocale;
  const data = await getStoreProductBySlug(slug, locale);

  if (!data) {
    const t = await getTranslations("Product");
    return { title: t("notFoundTitle") };
  }

  const { product } = data;
  const base = await createPageMetadata({
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.shortDescription,
    path: `/product/${slug}`,
    locale,
  });

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      title: product.seoTitle || product.name,
      description: product.seoDescription || product.shortDescription,
      images: product.primaryImage ? [{ url: product.primaryImage }] : [],
      type: "website",
    },
    twitter: {
      ...base.twitter,
      title: product.seoTitle || product.name,
      description: product.seoDescription || product.shortDescription,
      images: product.primaryImage ? [product.primaryImage] : base.twitter?.images,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const locale = (await getLocale()) as StoreLocale;
  const data = await getStoreProductBySlug(slug, locale);

  if (!data) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(
    data.product.id,
    data.product.category?.id,
    4,
    locale
  );

  return (
    <>
      <ProductJsonLd product={data.product} locale={locale} />
      <Container as="section" className="py-16 lg:py-24">
        <ProductDetailView
          product={data.product}
          reviews={data.reviews}
          relatedProducts={relatedProducts}
        />
      </Container>
    </>
  );
}

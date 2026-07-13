import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import ProductDetailView from "@/components/store/ProductDetailView";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import { createPageMetadata } from "@/lib/seo/metadata";
import {
  getRelatedProducts,
  getStoreProductBySlug,
} from "@/lib/store/products";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getStoreProductBySlug(slug);

  if (!data) {
    return { title: "Məhsul tapılmadı" };
  }

  const { product } = data;

  return {
    ...(await createPageMetadata({
      title: product.seoTitle || product.name,
      description: product.seoDescription || product.shortDescription,
      path: `/product/${slug}`,
    })),
    openGraph: {
      title: product.seoTitle || product.name,
      description: product.seoDescription || product.shortDescription,
      images: product.primaryImage ? [{ url: product.primaryImage }] : [],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const data = await getStoreProductBySlug(slug);

  if (!data) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(
    data.product.id,
    data.product.category?.id
  );

  return (
    <>
      <ProductJsonLd product={data.product} />
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

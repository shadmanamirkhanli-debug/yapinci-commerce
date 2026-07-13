import type { StoreProduct } from "@/lib/store/types";
import type { StoreLocale } from "@/lib/store/format";

type ProductJsonLdProps = {
  product: StoreProduct;
  locale?: StoreLocale;
};

export default function ProductJsonLd({ product, locale = "az" }: ProductJsonLdProps) {
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.seoDescription || product.shortDescription,
    image: product.primaryImage ? [product.primaryImage] : undefined,
    inLanguage: locale,
    sku: product.variants[0]?.sku,
    brand: {
      "@type": "Brand",
      name: product.brand || "Yapinci",
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/product/${product.slug}`,
      priceCurrency: product.currency,
      price: product.price,
      availability:
        product.available > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.averageRating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

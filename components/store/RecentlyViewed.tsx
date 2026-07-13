"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import ProductCard from "@/components/ui/ProductCard";
import ProductGrid from "@/components/ui/ProductGrid";
import SectionHeader from "@/components/ui/SectionHeader";
import type { StoreProduct } from "@/lib/store/types";

const STORAGE_KEY = "yapinci-recently-viewed";

type RecentlyViewedProps = {
  currentSlug: string;
};

export function trackRecentlyViewed(slug: string) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const current = stored ? (JSON.parse(stored) as string[]) : [];
    const next = [slug, ...current.filter((item) => item !== slug)].slice(0, 8);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors
  }
}

export default function RecentlyViewed({ currentSlug }: RecentlyViewedProps) {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const t = useTranslations("RecentlyViewed");

  useEffect(() => {
    trackRecentlyViewed(currentSlug);

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const slugs = stored
        ? (JSON.parse(stored) as string[]).filter((slug) => slug !== currentSlug)
        : [];

      if (!slugs.length) return;

      fetch(`/api/products?slugs=${slugs.join(",")}`)
        .then((response) => response.json())
        .then((result) => {
          if (result.success) setProducts(result.data);
        })
        .catch(() => undefined);
    } catch {
      // ignore
    }
  }, [currentSlug]);

  if (!products.length) return null;

  return (
    <section className="border-t border-border py-16 lg:py-20">
      <SectionHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        className="mb-10"
      />
      <ProductGrid>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ProductGrid>
    </section>
  );
}

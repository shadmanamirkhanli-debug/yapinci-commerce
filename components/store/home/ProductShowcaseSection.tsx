import Button from "@/components/ui/Button";
import CarpetPattern from "@/components/ui/CarpetPattern";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/ui/ProductCard";
import ProductGrid from "@/components/ui/ProductGrid";
import type { StoreProduct } from "@/lib/store/types";
import { cn } from "@/lib/utils/cn";

type ProductShowcaseSectionProps = {
  title: string;
  products: StoreProduct[];
  ctaHref: string;
  ctaLabel?: string;
  variant?: "light" | "muted";
};

export default function ProductShowcaseSection({
  title,
  products,
  ctaHref,
  ctaLabel = "View All",
  variant = "light",
}: ProductShowcaseSectionProps) {
  if (products.length === 0) return null;

  return (
    <section
      className={cn(
        "relative overflow-hidden border-t border-border section-padding",
        variant === "muted" ? "bg-secondary" : "bg-background"
      )}
    >
      <CarpetPattern name={`showcase-${variant}`} />
      <Container as="section">
        <div className="mb-12 flex flex-col items-center gap-6 lg:mb-14">
          <div className="flex w-full items-center gap-6">
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
            <h2 className="text-display shrink-0 text-xl text-primary sm:text-2xl lg:text-3xl">
              {title}
            </h2>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
          </div>
          <Button href={ctaHref} variant="ghost" size="sm">
            {ctaLabel} →
          </Button>
        </div>
        <ProductGrid>
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              className={
                index === 1
                  ? "animation-delay-100"
                  : index === 2
                    ? "animation-delay-200"
                    : index === 3
                      ? "animation-delay-300"
                      : undefined
              }
            />
          ))}
        </ProductGrid>
      </Container>
    </section>
  );
}

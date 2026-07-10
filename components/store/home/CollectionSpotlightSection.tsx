import Link from "next/link";
import Container from "@/components/ui/Container";
import OptimizedImage from "@/components/ui/OptimizedImage";
import type { StoreProduct } from "@/lib/store/types";
import { cn } from "@/lib/utils/cn";

type CollectionSpotlightSectionProps = {
  title: string;
  description: string;
  shopHref: string;
  product?: StoreProduct;
  reversed?: boolean;
};

export default function CollectionSpotlightSection({
  title,
  description,
  shopHref,
  product,
  reversed = false,
}: CollectionSpotlightSectionProps) {
  return (
    <section className="border-t border-border bg-background">
      <Container as="section" className="section-padding">
        <div className="mb-10 flex items-center gap-6">
          <span className="h-px flex-1 bg-border" aria-hidden="true" />
          <h2 className="text-display shrink-0 text-xl text-primary sm:text-2xl lg:text-3xl">
            {title}
          </h2>
          <span className="h-px flex-1 bg-border" aria-hidden="true" />
        </div>

        <Link
          href={shopHref}
          className={cn(
            "group grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16",
            reversed && "lg:[&>*:first-child]:order-2"
          )}
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-secondary">
            {product?.primaryImage ? (
              <OptimizedImage
                src={product.primaryImage}
                alt={product.name}
                fill
                className="image-zoom object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-6xl font-extralight tracking-[0.3em] text-border">
                  {title.slice(0, 1)}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-primary/0 transition-colors duration-500 group-hover:bg-primary/10" />
          </div>

          <div className="flex flex-col justify-center px-2 lg:px-6">
            <p className="text-sm leading-relaxed text-muted sm:text-base">
              {description}
            </p>
            <p className="mt-8 text-xs font-medium tracking-[0.2em] uppercase text-primary transition-colors group-hover:text-accent">
              Explore Collection →
            </p>
          </div>
        </Link>
      </Container>
    </section>
  );
}

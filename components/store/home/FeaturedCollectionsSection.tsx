import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import type { StoreProduct } from "@/lib/store/types";
import { cn } from "@/lib/utils/cn";

type FeaturedCollectionsSectionProps = {
  collections: string[];
  products: StoreProduct[];
};

function getCollectionImage(
  collection: string,
  products: StoreProduct[]
): string | undefined {
  return products.find((product) => product.collection === collection)
    ?.primaryImage;
}

export default function FeaturedCollectionsSection({
  collections,
  products,
}: FeaturedCollectionsSectionProps) {
  if (collections.length === 0) return null;

  const items = collections.slice(0, 3);

  return (
    <section className="border-t border-border bg-background section-padding">
      <Container as="section">
        <SectionHeader
          eyebrow="Collections"
          title="Featured Collections"
          description="Curated edits that weave Azerbaijani heritage into contemporary wardrobes."
          className="mb-14 lg:mb-16"
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {items.map((collection, index) => {
            const image = getCollectionImage(collection, products);
            return (
              <Link
                key={collection}
                href={`/shop?collection=${encodeURIComponent(collection)}`}
                className={cn(
                  "group card-lift relative block overflow-hidden rounded-3xl bg-secondary",
                  index === 1 && "md:mt-8"
                )}
              >
                <div className="aspect-[3/4] overflow-hidden">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt={collection}
                      className="image-zoom h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-primary/5">
                      <span className="text-5xl font-extralight tracking-[0.2em] text-border">
                        {collection.slice(0, 1)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent transition-opacity duration-500 group-hover:from-primary/80" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8">
                  <p className="text-eyebrow text-accent/90">Collection</p>
                  <h3 className="mt-2 text-xl font-light tracking-tight text-white sm:text-2xl">
                    {collection}
                  </h3>
                  <p className="mt-3 text-xs tracking-[0.15em] uppercase text-white/60 transition-colors group-hover:text-white">
                    Explore →
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import type { StoreCategory } from "@/lib/store/types";

type FeaturedCategoriesSectionProps = {
  categories: StoreCategory[];
};

export default function FeaturedCategoriesSection({
  categories,
}: FeaturedCategoriesSectionProps) {
  if (categories.length === 0) return null;

  return (
    <section className="border-t border-border bg-background section-padding">
      <Container as="section">
        <SectionHeader
          eyebrow="Categories"
          title="Featured Categories"
          description="Explore the foundations of the Yapinci wardrobe."
          align="center"
          className="mb-14 lg:mb-16"
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {categories.slice(0, 8).map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group card-lift overflow-hidden rounded-2xl border border-border bg-secondary"
            >
              <div className="aspect-square overflow-hidden bg-white">
                {category.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="image-zoom h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-3xl font-extralight text-border">
                    {category.name.slice(0, 1)}
                  </div>
                )}
              </div>
              <div className="p-4 lg:p-5">
                <h3 className="text-sm font-medium tracking-wide text-primary transition-colors group-hover:text-accent">
                  {category.name}
                </h3>
                <p className="mt-1 text-xs text-muted">
                  {category.productCount} items
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

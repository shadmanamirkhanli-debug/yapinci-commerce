import Link from "next/link";
import Container from "@/components/ui/Container";
import type { StoreCategory } from "@/lib/store/types";

const galleryImages = [
  "/images/products/shirvan-palto-01.jpg",
  "/images/products/qarabag-kaftan-01.jpg",
  "/images/products/baki-linen-set-01.jpg",
  "/images/products/shirvan-palto-02.jpg",
  "/images/products/qarabag-kaftan-01.jpg",
  "/images/products/baki-linen-set-01.jpg",
];

type InstagramGalleryProps = {
  categories?: StoreCategory[];
};

export default function InstagramGallery({ categories = [] }: InstagramGalleryProps) {
  const images =
    categories
      .map((category) => category.imageUrl)
      .filter((url): url is string => !!url)
      .concat(galleryImages)
      .slice(0, 6);

  return (
    <section className="border-t border-border bg-secondary">
      <Container as="section" className="py-20 lg:py-24">
        <div className="mb-10 text-center">
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-accent">
            @yapinci.az
          </p>
          <h2 className="mt-3 text-3xl font-light tracking-tight">
            Instagram Gallery
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-4">
          {images.map((src, index) => (
            <Link
              key={`${src}-${index}`}
              href="/shop"
              className="group relative aspect-square overflow-hidden rounded-2xl bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Yapinci gallery ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-primary/0 transition-colors group-hover:bg-primary/10" />
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

import Link from "next/link";
import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import { brand } from "@/lib/constants";
import type { StoreCategory } from "@/lib/store/types";

const galleryImages = [
  "/images/products/baku-skyline-tee.png",
  "/images/products/baku-skyline-tee-lifestyle.png",
  "/images/products/azerbaijan-vintage-cap.png",
  "/images/products/dragon-baseball-cap.png",
  "/images/products/dragon-bucket-hat.png",
  "/images/products/dragon-talisman-tee-black.png",
];

type InstagramGalleryProps = {
  categories?: StoreCategory[];
};

export default function InstagramGallery({ categories = [] }: InstagramGalleryProps) {
  const t = useTranslations("InstagramGallery");
  const images =
    categories
      .map((category) => category.imageUrl)
      .filter((url): url is string => !!url)
      .concat(galleryImages)
      .slice(0, 6);

  return (
    <section className="border-t border-border bg-background section-padding">
      <Container as="section">
        <div className="mb-12 text-center lg:mb-14">
          <p className="text-eyebrow text-accent">{brand.instagram}</p>
          <h2 className="text-display mt-4 text-2xl text-primary sm:text-3xl">
            {t("heading")}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted">
            {t("subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-4">
          {images.map((src, index) => (
            <Link
              key={`${src}-${index}`}
              href="/shop"
              className="group relative aspect-square overflow-hidden rounded-2xl bg-secondary"
              aria-label={t("imageAria", { index: index + 1 })}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="image-zoom h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-primary/0 transition-colors duration-500 group-hover:bg-primary/15" />
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

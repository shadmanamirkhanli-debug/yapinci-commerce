import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import OptimizedImage from "@/components/ui/OptimizedImage";
import YapinciLogo from "@/components/brand/YapinciLogo";
import type { StoreProduct } from "@/lib/store/types";

type HeroSectionProps = {
  featuredProduct?: StoreProduct;
};

export default function HeroSection({ featuredProduct }: HeroSectionProps) {
  const heroImage = featuredProduct?.primaryImage;
  const t = useTranslations("Brand");

  return (
    <section
      aria-label="Hero"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-primary"
    >
      <div className="absolute inset-0">
        {heroImage ? (
          <OptimizedImage
            src={heroImage}
            alt={featuredProduct?.name ?? t("hero.imageAlt")}
            fill
            priority
            className="object-cover object-center animate-scale-in opacity-0"
          />
        ) : (
          <div
            className="h-full w-full bg-gradient-to-br from-primary via-primary/90 to-accent/30"
            aria-hidden="true"
          />
        )}
      </div>

      <div
        className="absolute inset-0 bg-primary/55"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 text-center lg:px-10">
        <div className="animate-fade-in-up flex justify-center opacity-0">
          <YapinciLogo variant="light" size="lg" />
        </div>
        <h1 className="text-display animate-fade-in-up animation-delay-100 mx-auto mt-10 max-w-4xl text-4xl text-white opacity-0 sm:text-5xl lg:text-6xl xl:text-7xl">
          {t("hero.headline")}
        </h1>
        <div className="animate-fade-in-up animation-delay-200 mt-12 opacity-0">
          <Button href="/shop" variant="accent" size="lg">
            {t("hero.cta")}
          </Button>
        </div>
      </div>
    </section>
  );
}

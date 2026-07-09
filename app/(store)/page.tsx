import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/ui/ProductCard";
import ProductGrid from "@/components/ui/ProductGrid";
import SectionHeader from "@/components/ui/SectionHeader";
import NewsletterSection from "@/components/store/NewsletterSection";
import InstagramGallery from "@/components/store/InstagramGallery";
import { brand } from "@/lib/constants";
import { getHomePageData } from "@/lib/store/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Home",
  description: brand.description,
  openGraph: {
    title: "Yapinci Commerce",
    description: brand.description,
  },
};

export default async function HomePage() {
  const { featured, newArrivals, bestSellers, collections, categories } =
    await getHomePageData();

  return (
    <>
      <section className="relative overflow-hidden">
        <Container
          as="section"
          className="flex min-h-[calc(100vh-4rem)] flex-col justify-center py-20 lg:min-h-[calc(100vh-5rem)] lg:py-32"
        >
          <div className="absolute right-0 top-1/2 hidden h-96 w-96 -translate-y-1/2 rounded-full bg-secondary lg:block" />
          <div className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="max-w-3xl">
              <p className="animate-fade-in-up mb-6 text-xs font-medium tracking-[0.3em] uppercase text-accent opacity-0">
                {brand.tagline}
              </p>
              <h1 className="animate-fade-in-up animation-delay-100 text-4xl font-light leading-[1.12] tracking-tight text-primary opacity-0 sm:text-5xl lg:text-6xl xl:text-7xl">
                Azərbaycan Mədəniyyətindən İlham Alan Premium Geyim
              </h1>
              <p className="animate-fade-in-up animation-delay-200 mt-8 max-w-xl text-base leading-relaxed text-muted opacity-0 sm:text-lg">
                Yapinci — ənənəvi estetikanı müasir dizaynla birləşdirən, hər
                parçası diqqətlə hazırlanmış premium geyim kolleksiyası.
              </p>
              <div className="animate-fade-in-up animation-delay-300 mt-12 flex flex-col gap-4 opacity-0 sm:flex-row sm:items-center">
                <Button href="/shop">Kolleksiyaya Bax</Button>
                <Button href="/about" variant="secondary">
                  Haqqımızda
                </Button>
              </div>
            </div>
            {featured[0]?.primaryImage && (
              <div className="hidden overflow-hidden rounded-[2rem] lg:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featured[0].primaryImage}
                  alt={featured[0].name}
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
            )}
          </div>
        </Container>
      </section>

      {collections.length > 0 && (
        <section className="border-t border-border bg-white">
          <Container as="section" className="py-20 lg:py-28">
            <SectionHeader
              eyebrow="Kolleksiyalar"
              title="Featured Collections"
              className="mb-14"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.slice(0, 3).map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="group overflow-hidden rounded-3xl border border-border bg-secondary"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-white">
                    {category.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl font-extralight text-border">
                        {category.name.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-light">{category.name}</h3>
                    <p className="mt-2 text-sm text-muted">
                      {category.productCount} məhsul
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="border-t border-border bg-white">
        <Container as="section" className="py-20 lg:py-28">
          <div className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeader eyebrow="Yeni" title="New Arrivals" />
            <Button href="/shop?sort=newest" variant="ghost" size="sm">
              Hamısına Bax →
            </Button>
          </div>
          <ProductGrid>
            {newArrivals.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                className={index === 1 ? "animation-delay-100" : index === 2 ? "animation-delay-200" : undefined}
              />
            ))}
          </ProductGrid>
        </Container>
      </section>

      <section className="border-t border-border bg-secondary">
        <Container as="section" className="py-20 lg:py-28">
          <div className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeader eyebrow="Populyar" title="Best Sellers" />
            <Button href="/shop" variant="ghost" size="sm">
              Mağazaya Keç →
            </Button>
          </div>
          <ProductGrid>
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ProductGrid>
        </Container>
      </section>

      <section className="border-t border-border bg-white">
        <Container as="section" className="py-20 lg:py-28">
          <SectionHeader
            eyebrow="Kolleksiya"
            title="Featured Products"
            className="mb-14"
          />
          <ProductGrid>
            {featured.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                className={index === 1 ? "animation-delay-100" : index === 2 ? "animation-delay-200" : undefined}
              />
            ))}
          </ProductGrid>
        </Container>
      </section>

      <section className="border-t border-border bg-secondary">
        <Container as="section" className="py-20 lg:py-28">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <SectionHeader eyebrow="Hekayə" title="The Yapinci Story" />
            <div className="space-y-6 text-sm leading-relaxed text-muted sm:text-base">
              <p>
                Yapinci — Azərbaycanın zəngin mədəni irsinə hörmət edən,
                müasir dünyanın tələblərinə cavab verən premium geyim
                brendidir. Hər kolleksiya ənənəvi naxışlar, təbii parçalar və
                minimalist estetikanın harmoniyasını əks etdirir.
              </p>
              <p>
                Biz inanırıq ki, geyim yalnız funksional deyil — o, kimliyin
                və mədəniyyətin ifadəsidir. Yapinci ilə hər gün öz
                hekayənizi danışın.
              </p>
              <Button href="/about" variant="ghost" size="sm">
                Daha Ətraflı →
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <NewsletterSection />
      <InstagramGallery categories={categories} />

      <section className="border-t border-border">
        <Container as="section" className="py-16 lg:py-20">
          <div className="flex flex-col items-center justify-between gap-8 rounded-3xl bg-primary px-8 py-12 text-center sm:flex-row sm:text-left lg:px-16 lg:py-16">
            <div>
              <p className="text-xs font-medium tracking-[0.3em] uppercase text-accent">
                Yeni Kolleksiya
              </p>
              <h2 className="mt-3 text-2xl font-light tracking-tight text-white sm:text-3xl">
                Premium Geyim Kəşf Edin
              </h2>
            </div>
            <Button href="/shop" variant="accent">
              İndi Alış-veriş Et
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

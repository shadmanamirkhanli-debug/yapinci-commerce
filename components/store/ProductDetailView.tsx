"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProductGalleryZoom from "@/components/store/ProductGalleryZoom";
import RecentlyViewed from "@/components/store/RecentlyViewed";
import Button from "@/components/ui/Button";
import Price from "@/components/ui/Price";
import Rating from "@/components/ui/Rating";
import ProductCard from "@/components/ui/ProductCard";
import ProductGrid from "@/components/ui/ProductGrid";
import Accordion from "@/components/ui/Accordion";
import { useCart } from "@/components/providers/CartProvider";
import { cn } from "@/lib/utils/cn";
import type { StoreProduct, StoreReview } from "@/lib/store/types";

type ProductDetailViewProps = {
  product: StoreProduct;
  reviews: StoreReview[];
  relatedProducts: StoreProduct[];
};

export default function ProductDetailView({
  product,
  reviews,
  relatedProducts,
}: ProductDetailViewProps) {
  const { addItem } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState(
    product.variants.find((variant) => variant.size)?.size ?? ""
  );
  const [selectedColor, setSelectedColor] = useState(
    product.variants.find((variant) => variant.color)?.color ?? ""
  );
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    let cancelled = false;
    void (async () => {
      const response = await fetch("/api/wishlist");
      if (!response.ok || cancelled) return;

      const result = await response.json();
      if (!result.success || cancelled) return;

      const isWishlisted = result.data.some(
        (item: { productId: string }) => item.productId === product.id
      );
      setWishlisted(isWishlisted);
    })();

    return () => {
      cancelled = true;
    };
  }, [session?.user, product.id]);

  const sizes = [...new Set(product.variants.map((v) => v.size).filter(Boolean))];
  const colors = [...new Set(product.variants.map((v) => v.color).filter(Boolean))];

  const selectedVariant = useMemo(() => {
    return (
      product.variants.find(
        (variant) =>
          (!selectedSize || variant.size === selectedSize) &&
          (!selectedColor || variant.color === selectedColor)
      ) ?? product.variants[0]
    );
  }, [product.variants, selectedSize, selectedColor]);

  const galleryImages = product.images.map((image) => ({
    id: image.id,
    src: image.url,
    alt: image.alt ?? product.name,
  }));

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.available <= 0) {
      setMessage("Bu variant hazırda stokda deyil.");
      return;
    }

    addItem(
      {
        productId: product.id,
        variantId: selectedVariant.id,
        slug: product.slug,
        name: product.name,
        price: selectedVariant.price ?? product.price,
        currency: product.currency,
        image: product.primaryImage,
        size: selectedVariant.size,
        color: selectedVariant.color,
      },
      quantity
    );
    setMessage("Məhsul səbətə əlavə edildi.");
  };

  const handleWishlist = async () => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=/product/${product.slug}`);
      return;
    }

    const response = await fetch("/api/wishlist", {
      method: wishlisted ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    });

    if (response.ok) {
      setWishlisted((value) => !value);
      setMessage(wishlisted ? "Wishlist-dən silindi." : "Wishlist-ə əlavə edildi.");
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
        <ProductGalleryZoom images={galleryImages} />

        <div className="flex flex-col justify-center">
          {product.category && (
            <p className="text-xs font-medium tracking-[0.3em] uppercase text-accent">
              {product.category.name}
            </p>
          )}
          <h1 className="mt-3 text-3xl font-light tracking-tight text-primary sm:text-4xl lg:text-5xl">
            {product.name}
          </h1>

          {product.reviewCount > 0 && (
            <div className="mt-4">
              <Rating value={product.averageRating} showValue />
              <span className="ml-2 text-sm text-muted">
                ({product.reviewCount} rəy)
              </span>
            </div>
          )}

          <div className="mt-4">
            <Price
              amount={selectedVariant?.price ?? product.price}
              currency={product.currency}
              compareAt={product.comparePrice}
              size="lg"
            />
          </div>

          <p className="mt-6 text-sm leading-relaxed text-muted sm:text-base">
            {product.shortDescription || product.description}
          </p>

          {sizes.length > 0 && (
            <div className="mt-8">
              <p className="mb-3 text-xs font-medium tracking-[0.15em] uppercase text-muted">
                Ölçü
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    aria-label={`Ölçü ${size}`}
                    aria-pressed={selectedSize === size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-xs font-medium transition-all",
                      selectedSize === size
                        ? "bg-primary text-white"
                        : "bg-secondary text-muted hover:bg-primary hover:text-white"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-xs font-medium tracking-[0.15em] uppercase text-muted">
                Rəng
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Rəng ${color}`}
                    aria-pressed={selectedColor === color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs font-medium transition-all",
                      selectedColor === color
                        ? "border-primary bg-primary text-white"
                        : "border-border text-muted hover:border-primary"
                    )}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <p className="text-xs font-medium tracking-[0.15em] uppercase text-muted">
              Miqdar
            </p>
            <div className="flex items-center rounded-full border border-border">
              <button
                type="button"
                aria-label="Miqdarı azalt"
                className="px-4 py-2 text-sm"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              >
                −
              </button>
              <span className="min-w-8 text-center text-sm" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Miqdarı artır"
                className="px-4 py-2 text-sm"
                onClick={() => setQuantity((value) => value + 1)}
              >
                +
              </button>
            </div>
            <span className="text-xs text-muted">
              {selectedVariant?.available ?? product.available} ədəd mövcuddur
            </span>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button onClick={handleAddToCart}>Səbətə Əlavə Et</Button>
            <Button variant="secondary" onClick={handleWishlist}>
              {wishlisted ? "Wishlist-də" : "Wishlist-ə Əlavə Et"}
            </Button>
          </div>

          {message && (
            <p className="mt-4 text-sm text-accent" role="status">
              {message}
            </p>
          )}

          <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted">Brend</dt>
              <dd>{product.brand}</dd>
            </div>
            {product.collection && (
              <div>
                <dt className="text-muted">Kolleksiya</dt>
                <dd>{product.collection}</dd>
              </div>
            )}
            {selectedVariant?.sku && (
              <div>
                <dt className="text-muted">SKU</dt>
                <dd>{selectedVariant.sku}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <section className="mt-16 border-t border-border pt-12">
        <Accordion
          items={[
            {
              id: "about",
              title: "Məhsul Haqqında",
              content: (
                <p className="text-sm leading-relaxed text-muted">
                  {product.description}
                </p>
              ),
            },
            {
              id: "shipping",
              title: "Çatdırılma Məlumatı",
              content: (
                <ul className="space-y-2 text-sm text-muted">
                  <li>Bakı daxilində 1-2 iş günü</li>
                  <li>Azərbaycan üzrə 3-5 iş günü</li>
                  <li>100 AZN üzərində pulsuz çatdırılma</li>
                  <li>14 gün ərzində geri qaytarma</li>
                </ul>
              ),
            },
          ]}
        />
      </section>

      {reviews.length > 0 && (
        <section className="mt-16 border-t border-border pt-12">
          <h2 className="text-2xl font-light tracking-tight">Rəylər</h2>
          <div className="mt-8 space-y-6">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-2xl border border-border p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium">{review.customer}</p>
                  <Rating value={review.rating} size="sm" />
                </div>
                {review.title && (
                  <h3 className="mt-3 text-sm font-medium">{review.title}</h3>
                )}
                {review.comment && (
                  <p className="mt-2 text-sm text-muted">{review.comment}</p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-border pt-12">
          <h2 className="mb-8 text-2xl font-light tracking-tight">
            Əlaqəli Məhsullar
          </h2>
          <ProductGrid>
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </ProductGrid>
        </section>
      )}

      <RecentlyViewed currentSlug={product.slug} />
    </>
  );
}

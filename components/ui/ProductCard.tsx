import Link from "next/link";
import type { StoreProduct } from "@/lib/store/types";
import Badge from "@/components/ui/Badge";
import OptimizedImage from "@/components/ui/OptimizedImage";
import Price from "@/components/ui/Price";
import Rating from "@/components/ui/Rating";
import { cn } from "@/lib/utils/cn";
import { transition } from "@/lib/ui/styles";

type ProductCardProps = {
  product: StoreProduct;
  className?: string;
  showRating?: boolean;
};

export default function ProductCard({
  product,
  className,
  showRating = true,
}: ProductCardProps) {
  const showFeatured = product.featured;
  const showNew = product.newArrival;
  const showBest = product.bestSeller;

  return (
    <article className={cn("group animate-fade-in-up opacity-0", className)}>
      <Link
        href={`/product/${product.slug}`}
        className={cn(
          "block overflow-hidden rounded-2xl",
          transition,
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
        )}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
          {product.primaryImage ? (
            <OptimizedImage
              src={product.primaryImage}
              alt={product.name}
              fill
              className={cn(
                transition,
                "group-hover:scale-105"
              )}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-extralight tracking-widest text-border">
                {product.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <div
            className={cn(
              "absolute inset-0 bg-primary/0",
              transition,
              "group-hover:bg-primary/5"
            )}
          />
          <div className="absolute left-4 top-4 flex flex-col gap-2">
            {showFeatured && (
              <Badge variant="accent" size="sm">
                Seçilmiş
              </Badge>
            )}
            {showNew && (
              <Badge variant="default" size="sm">
                Yeni
              </Badge>
            )}
            {showBest && (
              <Badge variant="outline" size="sm">
                Best Seller
              </Badge>
            )}
          </div>
          {product.available <= 0 && (
            <div className="absolute right-4 top-4">
              <Badge variant="default" size="sm">
                Stokda yoxdur
              </Badge>
            </div>
          )}
          <div
            className={cn(
              "absolute bottom-4 left-4 rounded-full bg-background/90 px-3 py-1 text-[10px] font-medium tracking-[0.15em] uppercase text-foreground opacity-0 backdrop-blur-sm",
              transition,
              "group-hover:opacity-100"
            )}
          >
            Bax
          </div>
        </div>
      </Link>

      <div className="mt-5 flex flex-col gap-3 px-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            {product.category && (
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted">
                {product.category.name}
              </p>
            )}
            <h3 className="text-sm font-medium uppercase tracking-wide text-foreground">
              {product.name}
            </h3>
          </div>
          <Price
            amount={product.price}
            currency={product.currency}
            compareAt={product.comparePrice}
            size="sm"
          />
        </div>
        {showRating && product.reviewCount > 0 && (
          <Rating value={product.averageRating} size="sm" showValue />
        )}
        <Link
          href={`/product/${product.slug}`}
          className={cn(
            "inline-flex w-fit text-xs font-medium tracking-[0.15em] uppercase text-muted",
            transition,
            "hover:text-accent active:text-foreground",
            "focus-visible:outline-none focus-visible:underline"
          )}
        >
          Ətraflı Bax →
        </Link>
      </div>
    </article>
  );
}

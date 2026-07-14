import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("ProductCard");
  const tCommon = useTranslations("Common");
  const showFeatured = product.featured;
  const showNew = product.newArrival;
  const showBest = product.bestSeller;

  return (
    <article className={cn("group animate-fade-in-up opacity-0", className)}>
      <Link
        href={`/product/${product.slug}`}
        className={cn(
          "card-lift block overflow-hidden rounded-2xl border border-transparent bg-background",
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
              className="image-zoom"
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
              <Badge variant="premium" size="sm">
                {t("featured")}
              </Badge>
            )}
            {showNew && (
              <Badge variant="default" size="sm">
                {t("new")}
              </Badge>
            )}
            {showBest && (
              <Badge variant="outline" size="sm">
                {t("bestSeller")}
              </Badge>
            )}
          </div>
          {product.available <= 0 && (
            <div className="absolute right-4 top-4">
              <Badge variant="default" size="sm">
                {t("soldOut")}
              </Badge>
            </div>
          )}
          <div
            className={cn(
              "absolute inset-x-4 bottom-4 translate-y-2 rounded-full bg-background/95 px-4 py-2.5 text-center text-[10px] font-medium tracking-[0.2em] uppercase text-foreground opacity-0 backdrop-blur-sm",
              transition,
              "group-hover:translate-y-0 group-hover:opacity-100"
            )}
          >
            {tCommon("viewProduct")}
          </div>
        </div>
      </Link>

      <div className="mt-5 flex flex-col gap-2.5 px-0.5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {product.category && (
              <p className="text-eyebrow text-muted">
                {product.category.name}
              </p>
            )}
            <h3 className="mt-1 truncate text-sm font-medium tracking-wide text-foreground">
              {product.name}
            </h3>
          </div>
          <Price
            amount={product.price}
            currency={product.currency}
            compareAt={product.comparePrice}
            size="sm"
            className="shrink-0"
          />
        </div>
        {showRating && product.reviewCount > 0 && (
          <Rating value={product.averageRating} size="sm" showValue />
        )}
      </div>
    </article>
  );
}

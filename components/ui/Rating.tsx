import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { focusRing, transition } from "@/lib/ui/styles";

type RatingProps = {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (value: number) => void;
  className?: string;
};

const sizes = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-6 w-6",
} as const;

export default function Rating({
  value,
  max = 5,
  size = "md",
  showValue = false,
  interactive = false,
  onChange,
  className,
}: RatingProps) {
  const t = useTranslations("Rating");
  const stars = Array.from({ length: max }, (_, index) => index + 1);

  return (
    <div
      className={cn("inline-flex items-center gap-2", className)}
      role={interactive ? "radiogroup" : "img"}
      aria-label={t("starsAria", { value, max })}
    >
      <div className="inline-flex items-center gap-0.5">
        {stars.map((star) => {
          const filled = star <= Math.round(value);

          if (interactive && onChange) {
            return (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={star === Math.round(value)}
                aria-label={t("starAria", { star })}
                onClick={() => onChange(star)}
                className={cn(
                  transition,
                  focusRing,
                  "rounded-sm hover:scale-110 active:scale-95"
                )}
              >
                <StarIcon
                  className={cn(sizes[size], filled ? "text-accent" : "text-border")}
                  filled={filled}
                />
              </button>
            );
          }

          return (
            <StarIcon
              key={star}
              className={cn(sizes[size], filled ? "text-accent" : "text-border")}
              filled={filled}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm text-muted tabular-nums">{value.toFixed(1)}</span>
      )}
    </div>
  );
}

function StarIcon({
  className,
  filled,
}: {
  className?: string;
  filled: boolean;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M10 2.5l2.09 4.24 4.68.68-3.39 3.3.8 4.66L10 13.77l-4.18 2.2.8-4.66-3.39-3.3 4.68-.68L10 2.5z" />
    </svg>
  );
}

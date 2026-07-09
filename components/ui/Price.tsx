import { cn } from "@/lib/utils/cn";

type PriceProps = {
  amount: number;
  currency?: string;
  size?: "sm" | "md" | "lg";
  compareAt?: number;
  className?: string;
};

const sizes = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
} as const;

export default function Price({
  amount,
  currency = "AZN",
  size = "md",
  compareAt,
  className,
}: PriceProps) {
  const formatted = formatAmount(amount, currency);
  const hasDiscount = compareAt !== undefined && compareAt > amount;

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "font-medium tabular-nums",
          sizes[size],
          hasDiscount ? "text-accent" : "text-foreground"
        )}
      >
        {formatted}
      </span>
      {hasDiscount && compareAt !== undefined && (
        <span className="text-sm text-muted line-through tabular-nums">
          {formatAmount(compareAt, currency)}
        </span>
      )}
    </div>
  );
}

function formatAmount(amount: number, currency: string) {
  return `${amount.toLocaleString("az-AZ")} ${currency}`;
}

export { formatAmount };

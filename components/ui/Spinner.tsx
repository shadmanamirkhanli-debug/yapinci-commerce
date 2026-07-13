import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
};

const sizes = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-[3px]",
} as const;

export default function Spinner({
  size = "md",
  className,
  label,
}: SpinnerProps) {
  const t = useTranslations("Common");
  const resolvedLabel = label ?? t("loading");

  return (
    <div
      role="status"
      aria-label={resolvedLabel}
      className={cn("inline-flex items-center justify-center", className)}
    >
      <span
        className={cn(
          "animate-spin rounded-full border-accent border-t-transparent",
          sizes[size]
        )}
      />
      <span className="sr-only">{resolvedLabel}</span>
    </div>
  );
}

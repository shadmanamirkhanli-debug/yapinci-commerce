import { brand } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import YapinciLogoMark from "@/components/brand/YapinciLogoMark";

type YapinciLogoProps = {
  variant?: "light" | "dark" | "accent";
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
};

const sizes = {
  sm: { mark: "h-7 w-7", text: "text-sm tracking-[0.35em]", gap: "gap-2.5" },
  md: { mark: "h-8 w-8", text: "text-base tracking-[0.4em]", gap: "gap-3" },
  lg: { mark: "h-10 w-10", text: "text-lg tracking-[0.45em]", gap: "gap-3.5" },
} as const;

const variants = {
  light: "text-white",
  dark: "text-primary",
  accent: "text-accent",
} as const;

export default function YapinciLogo({
  variant = "dark",
  size = "md",
  showWordmark = true,
  className,
}: YapinciLogoProps) {
  const sizeStyles = sizes[size];

  return (
    <span
      className={cn(
        "inline-flex items-center",
        sizeStyles.gap,
        variants[variant],
        className
      )}
    >
      <YapinciLogoMark className={sizeStyles.mark} />
      {showWordmark && (
        <span className={cn("font-medium uppercase", sizeStyles.text)}>
          {brand.wordmark}
        </span>
      )}
    </span>
  );
}

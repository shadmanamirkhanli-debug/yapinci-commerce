import { cn } from "@/lib/utils/cn";
import { transition } from "@/lib/ui/styles";

const variants = {
  default: "bg-secondary text-foreground",
  accent: "bg-accent/15 text-accent",
  // Decorative/merit label (e.g. "Featured"). Gold is ornament only, so the
  // text stays in --foreground for readability — never text-accent-secondary.
  premium: "border border-accent-secondary/40 bg-accent-secondary/10 text-foreground",
  primary: "bg-primary text-background",
  outline: "border border-border bg-background text-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
} as const;

const sizes = {
  sm: "px-2.5 py-0.5 text-[10px]",
  md: "px-3 py-1 text-xs",
  lg: "px-4 py-1.5 text-sm",
} as const;

type BadgeProps = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: React.ReactNode;
};

export default function Badge({
  variant = "default",
  size = "md",
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium tracking-wide uppercase",
        transition,
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

import { cn } from "@/lib/utils/cn";
import { transition } from "@/lib/ui/styles";

const variants = {
  default: "border border-border bg-background",
  elevated: "border border-border bg-background shadow-md",
  filled: "border border-transparent bg-secondary",
  ghost: "border border-transparent bg-transparent",
} as const;

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const;

type CardProps = {
  variant?: keyof typeof variants;
  padding?: keyof typeof paddings;
  hoverable?: boolean;
  className?: string;
  children: React.ReactNode;
};

export default function Card({
  variant = "default",
  padding = "md",
  hoverable = false,
  className,
  children,
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl",
        transition,
        variants[variant],
        paddings[padding],
        hoverable && "hover:shadow-lg hover:-translate-y-0.5",
        className
      )}
    >
      {children}
    </div>
  );
}

type CardHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function CardHeader({
  title,
  description,
  action,
  className,
}: CardHeaderProps) {
  return (
    <div className={cn("mb-4 flex items-start justify-between gap-4", className)}>
      <div>
        <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-foreground">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function CardContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn(className)}>{children}</div>;
}

export function CardFooter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mt-6 flex items-center gap-3", className)}>
      {children}
    </div>
  );
}

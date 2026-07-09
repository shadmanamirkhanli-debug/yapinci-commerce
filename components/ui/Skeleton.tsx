import { cn } from "@/lib/utils/cn";

type SkeletonProps = {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
};

export default function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      style={{ width, height }}
      className={cn(
        "animate-shimmer bg-gradient-to-r from-secondary via-border to-secondary",
        variant === "text" && "h-4 rounded-md",
        variant === "circular" && "rounded-full",
        variant === "rectangular" && "rounded-xl",
        className
      )}
    />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          className={cn(index === lines - 1 && "w-4/5")}
        />
      ))}
    </div>
  );
}

export function SkeletonProductCard() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-[3/4] w-full" />
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" className="w-1/3" />
    </div>
  );
}

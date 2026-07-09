import { cn } from "@/lib/utils/cn";

type ProductGridProps = {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
};

const columnClasses = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
} as const;

export default function ProductGrid({
  children,
  columns = 3,
  className,
}: ProductGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-8 md:gap-10",
        columnClasses[columns],
        className
      )}
    >
      {children}
    </div>
  );
}

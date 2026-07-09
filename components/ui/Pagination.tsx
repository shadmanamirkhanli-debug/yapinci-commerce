"use client";

import { cn } from "@/lib/utils/cn";
import { focusRing, transition } from "@/lib/ui/styles";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-2", className)}
    >
      <PaginationButton
        label="Əvvəlki"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ←
      </PaginationButton>

      {pages.map((page, index) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-2 text-muted">
            ...
          </span>
        ) : (
          <PaginationButton
            key={page}
            label={`Səhifə ${page}`}
            active={page === currentPage}
            onClick={() => onPageChange(page)}
          >
            {page}
          </PaginationButton>
        )
      )}

      <PaginationButton
        label="Növbəti"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        →
      </PaginationButton>
    </nav>
  );
}

function PaginationButton({
  children,
  label,
  active = false,
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm",
        transition,
        focusRing,
        active
          ? "bg-primary text-background"
          : "text-muted hover:bg-secondary hover:text-foreground",
        "active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      )}
    >
      {children}
    </button>
  );
}

function getVisiblePages(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (current > 3) pages.push("ellipsis");

  for (
    let page = Math.max(2, current - 1);
    page <= Math.min(total - 1, current + 1);
    page += 1
  ) {
    pages.push(page);
  }

  if (current < total - 2) pages.push("ellipsis");

  pages.push(total);
  return pages;
}

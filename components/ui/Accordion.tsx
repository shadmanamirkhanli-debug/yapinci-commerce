"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { focusRing, transition } from "@/lib/ui/styles";

export type AccordionItem = {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
};

type AccordionProps = {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
};

export default function Accordion({
  items,
  allowMultiple = false,
  className,
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }

      return allowMultiple ? [...prev, id] : [id];
    });
  };

  return (
    <div className={cn("divide-y divide-border rounded-2xl border border-border", className)}>
      {items.map((item) => {
        const isOpen = openItems.includes(item.id);

        return (
          <div key={item.id}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`accordion-${item.id}`}
              disabled={item.disabled}
              onClick={() => toggleItem(item.id)}
              className={cn(
                "flex w-full items-center justify-between gap-4 px-5 py-4 text-left",
                transition,
                focusRing,
                "hover:bg-secondary active:bg-secondary/80",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              <span className="text-sm font-medium uppercase tracking-[0.1em] text-foreground">
                {item.title}
              </span>
              <span
                className={cn(
                  "text-muted transition-transform duration-300",
                  isOpen && "rotate-180"
                )}
                aria-hidden="true"
              >
                ▾
              </span>
            </button>
            <div
              id={`accordion-${item.id}`}
              className={cn(
                "overflow-hidden transition-all duration-300",
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="px-5 pb-5 text-sm leading-relaxed text-muted">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { focusRing, transition } from "@/lib/ui/styles";

export type DropdownItem = {
  label: string;
  value: string;
  disabled?: boolean;
  onSelect?: () => void;
};

type DropdownProps = {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
};

export default function Dropdown({
  trigger,
  items,
  align = "left",
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(transition, focusRing, "rounded-full active:scale-95")}
      >
        {trigger}
      </button>

      {open && (
        <ul
          role="menu"
          className={cn(
            "absolute z-50 mt-2 min-w-48 overflow-hidden rounded-2xl border border-border bg-background py-2 shadow-lg",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((item) => (
            <li key={item.value} role="none">
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  item.onSelect?.();
                  setOpen(false);
                }}
                className={cn(
                  "w-full px-4 py-2.5 text-left text-sm text-foreground",
                  transition,
                  focusRing,
                  "hover:bg-secondary active:bg-secondary/80",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

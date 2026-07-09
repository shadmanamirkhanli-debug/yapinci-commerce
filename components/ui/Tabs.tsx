"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { focusRing, transition } from "@/lib/ui/styles";

export type TabItem = {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
};

type TabsProps = {
  items: TabItem[];
  defaultTab?: string;
  className?: string;
};

export default function Tabs({ items, defaultTab, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? items[0]?.id);

  const activeContent = items.find((item) => item.id === activeTab)?.content;

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Tabs"
        className="flex flex-wrap gap-2 border-b border-border"
      >
        {items.map((item) => {
          const isActive = item.id === activeTab;

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${item.id}`}
              disabled={item.disabled}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "relative px-4 py-3 text-xs font-medium tracking-[0.15em] uppercase",
                transition,
                focusRing,
                "rounded-t-xl",
                isActive
                  ? "text-foreground"
                  : "text-muted hover:text-foreground active:text-accent",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {item.label}
              {isActive && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-accent" />
              )}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        className="py-6"
      >
        {activeContent}
      </div>
    </div>
  );
}

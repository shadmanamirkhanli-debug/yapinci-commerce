"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { focusRing, transition } from "@/lib/ui/styles";

export type GalleryImage = {
  id: string;
  src?: string;
  alt: string;
  label?: string;
};

type ProductGalleryProps = {
  images: GalleryImage[];
  className?: string;
};

export default function ProductGallery({
  images,
  className,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];

  if (!activeImage) return null;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-secondary">
        {activeImage.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeImage.src}
            alt={activeImage.alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-8xl font-extralight tracking-widest text-border">
              {activeImage.label ?? "01"}
            </span>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={image.id}
                type="button"
                aria-label={`Şəkil ${index + 1}`}
                aria-current={isActive}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border bg-secondary",
                  transition,
                  focusRing,
                  isActive
                    ? "border-accent ring-2 ring-accent/20"
                    : "border-border hover:border-muted active:scale-95"
                )}
              >
                {image.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-sm text-muted">
                    {image.label ?? String(index + 1).padStart(2, "0")}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

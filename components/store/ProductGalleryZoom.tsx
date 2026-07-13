"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { focusRing, transition } from "@/lib/ui/styles";
import type { GalleryImage } from "@/components/ui/ProductGallery";

type ProductGalleryZoomProps = {
  images: GalleryImage[];
  className?: string;
};

export default function ProductGalleryZoom({
  images,
  className,
}: ProductGalleryZoomProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zooming, setZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const imageRef = useRef<HTMLDivElement>(null);
  const activeImage = images[activeIndex] ?? images[0];
  const t = useTranslations("ProductGallery");

  if (!activeImage) return null;

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !activeImage.src) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        ref={imageRef}
        className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-secondary"
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={handleMouseMove}
      >
        {activeImage.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeImage.src}
            alt={activeImage.alt}
            className={cn(
              "h-full w-full object-cover transition-transform duration-200",
              zooming && "scale-150"
            )}
            style={
              zooming
                ? {
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }
                : undefined
            }
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
                aria-label={t("thumbnailAria", { index: index + 1 })}
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

"use client";

import { useCallback, useState } from "react";
import Button from "@/components/ui/Button";
import { adminCardClass } from "@/lib/admin/styles";
import type { ProductImageInput } from "@/lib/validations/product";

type ImageUploaderProps = {
  images: ProductImageInput[];
  onChange: (images: ProductImageInput[]) => void;
};

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const uploadFiles = async (files: FileList | File[]) => {
    setUploading(true);
    const uploaded: ProductImageInput[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        uploaded.push({
          url: result.data.url,
          alt: file.name,
          sortOrder: images.length + uploaded.length,
          isPrimary: images.length === 0 && uploaded.length === 0,
        });
      }
    }

    onChange([...images, ...uploaded]);
    setUploading(false);
  };

  const setPrimary = (index: number) => {
    onChange(
      images.map((image, imageIndex) => ({
        ...image,
        isPrimary: imageIndex === index,
      }))
    );
  };

  const removeImage = (index: number) => {
    const next = images.filter((_, imageIndex) => imageIndex !== index);
    if (next.length && !next.some((image) => image.isPrimary)) {
      next[0].isPrimary = true;
    }
    onChange(next.map((image, imageIndex) => ({ ...image, sortOrder: imageIndex })));
  };

  const reorder = useCallback(
    (from: number, to: number) => {
      if (from === to) return;
      const next = [...images];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      onChange(next.map((image, index) => ({ ...image, sortOrder: index })));
    },
    [images, onChange]
  );

  return (
    <div className={`${adminCardClass} p-6`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-[0.15em]">
          Product Images
        </h3>
        <label className="cursor-pointer">
          <span className="rounded-full border border-neutral-700 px-4 py-2 text-xs uppercase tracking-[0.15em] text-neutral-300 hover:bg-neutral-800">
            {uploading ? "Uploading..." : "Upload"}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              if (event.target.files?.length) {
                uploadFiles(event.target.files);
              }
            }}
          />
        </label>
      </div>

      <div
        className="rounded-xl border border-dashed border-neutral-700 bg-neutral-950 p-6 text-center"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (event.dataTransfer.files.length) {
            uploadFiles(event.dataTransfer.files);
          }
        }}
      >
        <p className="text-sm text-neutral-400">
          Drag & drop images here or click upload
        </p>
      </div>

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={`${image.url}-${index}`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) reorder(dragIndex, index);
                setDragIndex(null);
              }}
              className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950"
            >
              <div className="aspect-square bg-neutral-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.alt ?? "Product image"}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <button
                  type="button"
                  onClick={() => setPrimary(index)}
                  className={`text-[10px] uppercase tracking-wider ${
                    image.isPrimary ? "text-white" : "text-neutral-500"
                  }`}
                >
                  {image.isPrimary ? "Cover" : "Set cover"}
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeImage(index)}
                  className="!h-8 !px-3 text-neutral-400"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

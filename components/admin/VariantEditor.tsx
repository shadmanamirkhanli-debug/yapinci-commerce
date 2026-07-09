"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { adminCardClass, adminFieldClass } from "@/lib/admin/styles";
import type { ProductVariantInput } from "@/lib/validations/product";

type VariantEditorProps = {
  variants: ProductVariantInput[];
  onChange: (variants: ProductVariantInput[]) => void;
};

const emptyVariant: ProductVariantInput = {
  sku: "",
  size: "",
  color: "",
  material: "",
  price: undefined,
  quantity: 0,
  reserved: 0,
  lowStockAt: 5,
};

export default function VariantEditor({ variants, onChange }: VariantEditorProps) {
  const updateVariant = (index: number, patch: Partial<ProductVariantInput>) => {
    onChange(
      variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...patch } : variant
      )
    );
  };

  return (
    <div className={`${adminCardClass} p-6`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-[0.15em]">
          Variants
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...variants, { ...emptyVariant }])}
          className="border-neutral-700 text-neutral-200"
        >
          Add Variant
        </Button>
      </div>

      <div className="space-y-4">
        {variants.map((variant, index) => (
          <div
            key={index}
            className="rounded-xl border border-neutral-800 p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">
                Variant {index + 1}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  onChange(variants.filter((_, variantIndex) => variantIndex !== index))
                }
                className="text-neutral-400"
              >
                Remove
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Input
                label="SKU"
                value={variant.sku}
                onChange={(event) => updateVariant(index, { sku: event.target.value })}
                className={adminFieldClass}
              />
              <Input
                label="Size"
                value={variant.size ?? ""}
                onChange={(event) => updateVariant(index, { size: event.target.value })}
                className={adminFieldClass}
              />
              <Input
                label="Color"
                value={variant.color ?? ""}
                onChange={(event) => updateVariant(index, { color: event.target.value })}
                className={adminFieldClass}
              />
              <Input
                label="Material"
                value={variant.material ?? ""}
                onChange={(event) =>
                  updateVariant(index, { material: event.target.value })
                }
                className={adminFieldClass}
              />
              <Input
                label="Price"
                type="number"
                value={variant.price ?? ""}
                onChange={(event) =>
                  updateVariant(index, {
                    price: event.target.value ? Number(event.target.value) : undefined,
                  })
                }
                className={adminFieldClass}
              />
              <Input
                label="Quantity"
                type="number"
                value={variant.quantity}
                onChange={(event) =>
                  updateVariant(index, { quantity: Number(event.target.value) })
                }
                className={adminFieldClass}
              />
              <Input
                label="Reserved"
                type="number"
                value={variant.reserved}
                onChange={(event) =>
                  updateVariant(index, { reserved: Number(event.target.value) })
                }
                className={adminFieldClass}
              />
              <Input
                label="Low Stock Alert"
                type="number"
                value={variant.lowStockAt}
                onChange={(event) =>
                  updateVariant(index, { lowStockAt: Number(event.target.value) })
                }
                className={adminFieldClass}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import ImageUploader from "@/components/admin/ImageUploader";
import VariantEditor from "@/components/admin/VariantEditor";
import { slugify } from "@/lib/admin/slugify";
import { adminCardClass, adminFieldClass } from "@/lib/admin/styles";
import { productSchema, type ProductInput } from "@/lib/validations/product";

type CategoryOption = { id: string; name: string };

type ProductFormProps = {
  productId?: string;
  initialData?: ProductInput;
  categories: CategoryOption[];
};

const defaultValues: ProductInput = {
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  brand: "Yapinci",
  collection: "",
  categoryId: null,
  price: 0,
  comparePrice: 0,
  costPrice: 0,
  discount: 0,
  lowStockAlert: 5,
  currency: "AZN",
  published: false,
  featured: false,
  newArrival: false,
  bestSeller: false,
  seoTitle: "",
  seoDescription: "",
  variants: [],
  images: [],
};

export default function ProductForm({
  productId,
  initialData,
  categories,
}: ProductFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema) as Resolver<ProductInput>,
    defaultValues: initialData ?? defaultValues,
  });

  const name = useWatch({ control, name: "name" });
  const variants = useWatch({ control, name: "variants" });

  useEffect(() => {
    if (!productId && name) {
      setValue("slug", slugify(name));
      setValue("seoTitle", name);
    }
  }, [name, productId, setValue]);

  const onSubmit = async (data: ProductInput) => {
    setServerError(null);

    const response = await fetch(
      productId ? `/api/admin/products/${productId}` : "/api/admin/products",
      {
        method: productId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      setServerError(result.error ?? "Failed to save product");
      return;
    }

    router.push("/admin/products");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className={`${adminCardClass} p-6`}>
            <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.15em]">
              General
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Name"
                error={errors.name?.message}
                className={adminFieldClass}
                {...register("name")}
              />
              <Input
                label="Slug"
                error={errors.slug?.message}
                className={adminFieldClass}
                {...register("slug")}
              />
              <Input
                label="Brand"
                className={adminFieldClass}
                {...register("brand")}
              />
              <Input
                label="Collection"
                className={adminFieldClass}
                {...register("collection")}
              />
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Category"
                    options={categories.map((category) => ({
                      value: category.id,
                      label: category.name,
                    }))}
                    placeholder="Select category"
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(event.target.value || null)
                    }
                    className={adminFieldClass}
                  />
                )}
              />
              <Input
                label="SKU"
                helperText="Primary variant SKU"
                className={adminFieldClass}
                value={variants[0]?.sku ?? ""}
                onChange={(event) => {
                  const next = [...variants];
                  if (!next[0]) {
                    next[0] = {
                      sku: event.target.value,
                      quantity: 0,
                      reserved: 0,
                      lowStockAt: 5,
                    };
                  } else {
                    next[0] = { ...next[0], sku: event.target.value };
                  }
                  setValue("variants", next);
                }}
              />
            </div>
            <div className="mt-4 space-y-4">
              <Textarea
                label="Short Description"
                rows={3}
                className={adminFieldClass}
                {...register("shortDescription")}
              />
              <Textarea
                label="Description"
                rows={6}
                className={adminFieldClass}
                {...register("description")}
              />
            </div>
          </div>

          <div className={`${adminCardClass} p-6`}>
            <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.15em]">
              Pricing & Inventory
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Input
                label="Price"
                type="number"
                step="0.01"
                error={errors.price?.message}
                className={adminFieldClass}
                {...register("price")}
              />
              <Input
                label="Compare Price"
                type="number"
                step="0.01"
                className={adminFieldClass}
                {...register("comparePrice")}
              />
              <Input
                label="Cost Price"
                type="number"
                step="0.01"
                className={adminFieldClass}
                {...register("costPrice")}
              />
              <Input
                label="Discount"
                type="number"
                step="0.01"
                className={adminFieldClass}
                {...register("discount")}
              />
              <Input
                label="Low Stock Alert"
                type="number"
                className={adminFieldClass}
                {...register("lowStockAlert")}
              />
              <Input
                label="Currency"
                className={adminFieldClass}
                {...register("currency")}
              />
            </div>
          </div>

          <Controller
            name="images"
            control={control}
            render={({ field }) => (
              <ImageUploader images={field.value} onChange={field.onChange} />
            )}
          />

          <Controller
            name="variants"
            control={control}
            render={({ field }) => (
              <VariantEditor variants={field.value} onChange={field.onChange} />
            )}
          />

          <div className={`${adminCardClass} p-6`}>
            <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.15em]">
              SEO
            </h3>
            <div className="space-y-4">
              <Input
                label="SEO Title"
                className={adminFieldClass}
                {...register("seoTitle")}
              />
              <Textarea
                label="SEO Description"
                rows={4}
                className={adminFieldClass}
                {...register("seoDescription")}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`${adminCardClass} p-6`}>
            <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.15em]">
              Status
            </h3>
            <div className="space-y-4">
              <Controller
                name="published"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    label="Published"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />
                )}
              />
              <Controller
                name="featured"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    label="Featured"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />
                )}
              />
              <Controller
                name="newArrival"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    label="New Arrival"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />
                )}
              />
              <Controller
                name="bestSeller"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    label="Best Seller"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />
                )}
              />
            </div>
          </div>

          <div className={`${adminCardClass} p-6`}>
            <div className="flex flex-col gap-3">
              <Button type="submit" loading={isSubmitting} fullWidth>
                {productId ? "Update Product" : "Create Product"}
              </Button>
              <Button
                variant="outline"
                href="/admin/products"
                className="border-neutral-700 text-neutral-200"
              >
                Cancel
              </Button>
            </div>
            {serverError && (
              <p className="mt-4 text-sm text-red-400" role="alert">
                {serverError}
              </p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

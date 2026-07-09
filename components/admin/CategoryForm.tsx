"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { slugify } from "@/lib/admin/slugify";
import { adminCardClass, adminFieldClass } from "@/lib/admin/styles";
import { categorySchema, type CategoryInput } from "@/lib/validations/category";

type CategoryOption = { id: string; name: string };

type CategoryFormProps = {
  categoryId?: string;
  initialData?: CategoryInput;
  parents: CategoryOption[];
};

const defaultValues: CategoryInput = {
  name: "",
  slug: "",
  description: "",
  parentId: null,
  imageUrl: "",
  seoTitle: "",
  seoDescription: "",
};

export default function CategoryForm({
  categoryId,
  initialData,
  parents,
}: CategoryFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema) as Resolver<CategoryInput>,
    defaultValues: initialData ?? defaultValues,
  });

  const name = useWatch({ control, name: "name" });

  useEffect(() => {
    if (!categoryId && name) {
      setValue("slug", slugify(name));
      setValue("seoTitle", name);
    }
  }, [name, categoryId, setValue]);

  const onSubmit = async (data: CategoryInput) => {
    setServerError(null);

    const response = await fetch(
      categoryId
        ? `/api/admin/categories/${categoryId}`
        : "/api/admin/categories",
      {
        method: categoryId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      setServerError(result.error ?? "Failed to save category");
      return;
    }

    router.push("/admin/categories");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
      <div className={`${adminCardClass} p-6`}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Name"
            className={adminFieldClass}
            {...register("name")}
          />
          <Input
            label="Slug"
            className={adminFieldClass}
            {...register("slug")}
          />
          <Controller
            name="parentId"
            control={control}
            render={({ field }) => (
              <Select
                label="Parent Category"
                options={parents.map((parent) => ({
                  value: parent.id,
                  label: parent.name,
                }))}
                placeholder="None"
                value={field.value ?? ""}
                onChange={(event) =>
                  field.onChange(event.target.value || null)
                }
                className={adminFieldClass}
              />
            )}
          />
          <Input
            label="Image URL"
            className={adminFieldClass}
            {...register("imageUrl")}
          />
        </div>
        <div className="mt-4">
          <Textarea
            label="Description"
            rows={5}
            className={adminFieldClass}
            {...register("description")}
          />
        </div>
      </div>

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

      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={isSubmitting}>
          {categoryId ? "Update Category" : "Create Category"}
        </Button>
        <Button
          variant="outline"
          href="/admin/categories"
          className="border-neutral-700 text-neutral-200"
        >
          Cancel
        </Button>
      </div>

      {serverError && (
        <p className="text-sm text-red-400" role="alert">
          {serverError}
        </p>
      )}
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { adminCardClass, adminFieldClass } from "@/lib/admin/styles";
import { surveyDesignSchema, type SurveyDesignInput } from "@/lib/validations/survey";

const defaultValues: SurveyDesignInput = {
  title: "",
  titleEn: "",
  titleRu: "",
  imageUrl: "",
};

export default function SurveyDesignForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<SurveyDesignInput>({
    resolver: zodResolver(surveyDesignSchema) as Resolver<SurveyDesignInput>,
    defaultValues,
  });

  const imageUrl = useWatch({ control, name: "imageUrl" });

  const uploadImage = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    if (result.success) {
      setValue("imageUrl", result.data.url, { shouldValidate: true });
    }
    setUploading(false);
  };

  const onSubmit = async (data: SurveyDesignInput) => {
    setServerError(null);

    const response = await fetch("/api/admin/survey-designs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      setServerError(result.error ?? "Failed to save design");
      return;
    }

    router.push("/admin/survey");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <div className={`${adminCardClass} p-6`}>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.15em]">
          Image
        </h3>
        {imageUrl ? (
          <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Design preview" className="aspect-video w-full object-cover" />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-700 bg-neutral-950 p-6 text-center">
            <p className="text-sm text-neutral-400">No image uploaded yet</p>
          </div>
        )}
        <label className="mt-4 inline-block cursor-pointer">
          <span className="rounded-full border border-neutral-700 px-4 py-2 text-xs uppercase tracking-[0.15em] text-neutral-300 hover:bg-neutral-800">
            {uploading ? "Uploading..." : imageUrl ? "Replace image" : "Upload image"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) uploadImage(file);
            }}
          />
        </label>
        {errors.imageUrl && (
          <p className="mt-2 text-sm text-red-400" role="alert">
            {errors.imageUrl.message}
          </p>
        )}
      </div>

      <div className={`${adminCardClass} p-6`}>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.15em]">
          Title
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Title"
            className={adminFieldClass}
            error={errors.title?.message}
            {...register("title")}
          />
          <Input
            label="Title (English)"
            helperText="Falls back to Title if left empty"
            className={adminFieldClass}
            {...register("titleEn")}
          />
          <Input
            label="Title (Russian)"
            helperText="Falls back to Title if left empty"
            className={adminFieldClass}
            {...register("titleRu")}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={isSubmitting}>
          Upload Design
        </Button>
        <Button
          variant="outline"
          href="/admin/survey"
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { adminCardClass, adminFieldClass } from "@/lib/admin/styles";
import { settingsSchema, type SettingsInput } from "@/lib/validations/settings";

type SettingsFormProps = {
  initialData: SettingsInput;
};

export default function SettingsForm({ initialData }: SettingsFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema) as Resolver<SettingsInput>,
    defaultValues: initialData,
  });

  const logoUrl = watch("logoUrl");
  const faviconUrl = watch("faviconUrl");

  const uploadImage = async (
    file: File,
    field: "logoUrl" | "faviconUrl",
    setLoading: (value: boolean) => void
  ) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    if (result.success) {
      setValue(field, result.data.url);
    }
    setLoading(false);
  };

  const onSubmit = async (data: SettingsInput) => {
    setServerError(null);
    setSuccessMessage(null);

    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      setServerError(result.error ?? "Yadda saxlanılmadı");
      return;
    }

    setSuccessMessage("Tənzimləmələr uğurla yadda saxlanıldı");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
      <div className={`${adminCardClass} p-6`}>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em]">
          Mağaza Məlumatları
        </h2>
        <div className="space-y-4">
          <Input
            label="Mağaza Adı"
            className={adminFieldClass}
            {...register("storeName")}
          />
          <Input
            label="Email"
            className={adminFieldClass}
            {...register("email")}
          />
          <Input
            label="Telefon"
            className={adminFieldClass}
            {...register("phone")}
          />
          <Input
            label="Ünvan"
            className={adminFieldClass}
            {...register("address")}
          />
        </div>
      </div>

      <div className={`${adminCardClass} p-6`}>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em]">
          Sosial Şəbəkələr
        </h2>
        <div className="space-y-4">
          <Input
            label="Instagram"
            placeholder="@yapinci.az"
            className={adminFieldClass}
            {...register("instagram")}
          />
          <Input
            label="Facebook"
            placeholder="https://facebook.com/..."
            className={adminFieldClass}
            {...register("facebook")}
          />
          <Input
            label="TikTok"
            placeholder="@yapinci.az"
            className={adminFieldClass}
            {...register("tiktok")}
          />
          <Input
            label="WhatsApp"
            placeholder="+994501234567"
            className={adminFieldClass}
            {...register("whatsapp")}
          />
        </div>
      </div>

      <div className={`${adminCardClass} p-6`}>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em]">
          Logo və Favicon
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-neutral-400">
              Logo
            </p>
            {logoUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={logoUrl}
                alt="Logo"
                className="mb-3 h-16 w-auto rounded border border-neutral-800 bg-neutral-950 p-2"
              />
            )}
            <label className="cursor-pointer">
              <span className="rounded-full border border-neutral-700 px-4 py-2 text-xs uppercase tracking-[0.15em] text-neutral-300 hover:bg-neutral-800">
                {uploadingLogo ? "Yüklənir..." : "Logo Yüklə"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) uploadImage(file, "logoUrl", setUploadingLogo);
                }}
              />
            </label>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-neutral-400">
              Favicon
            </p>
            {faviconUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={faviconUrl}
                alt="Favicon"
                className="mb-3 h-16 w-16 rounded border border-neutral-800 bg-neutral-950 p-2"
              />
            )}
            <label className="cursor-pointer">
              <span className="rounded-full border border-neutral-700 px-4 py-2 text-xs uppercase tracking-[0.15em] text-neutral-300 hover:bg-neutral-800">
                {uploadingFavicon ? "Yüklənir..." : "Favicon Yüklə"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) uploadImage(file, "faviconUrl", setUploadingFavicon);
                }}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={isSubmitting}>
          Yadda Saxla
        </Button>
        {successMessage && (
          <p className="text-sm text-green-400">{successMessage}</p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-red-400" role="alert">
          {serverError}
        </p>
      )}
    </form>
  );
}

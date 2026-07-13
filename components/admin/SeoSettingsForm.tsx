"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { adminCardClass, adminFieldClass } from "@/lib/admin/styles";

export default function SeoSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");

  useEffect(() => {
    fetch("/api/admin/seo-settings")
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          setMetaTitle(result.data.metaTitle);
          setMetaDescription(result.data.metaDescription);
          setOgImageUrl(result.data.ogImageUrl);
        }
      })
      .finally(() => setLoading(false));
  }, []);

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
      setOgImageUrl(result.data.url);
    }
    setUploading(false);
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const response = await fetch("/api/admin/seo-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metaTitle, metaDescription, ogImageUrl }),
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error ?? "Xəta baş verdi");
      setSaving(false);
      return;
    }

    setMessage("SEO tənzimləmələri yadda saxlanıldı");
    setSaving(false);
  };

  if (loading) {
    return <p className="text-sm text-neutral-500">Yüklənir...</p>;
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      <div className={`${adminCardClass} p-6`}>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em]">
          Meta Teqlar
        </h2>
        <div className="space-y-4">
          <Input
            label="Meta Title"
            value={metaTitle}
            onChange={(event) => setMetaTitle(event.target.value)}
            className={adminFieldClass}
          />
          <Textarea
            label="Meta Description"
            value={metaDescription}
            onChange={(event) => setMetaDescription(event.target.value)}
            rows={4}
            className={adminFieldClass}
          />
        </div>
      </div>

      <div className={`${adminCardClass} p-6`}>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em]">
          Open Graph Şəkli
        </h2>
        {ogImageUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={ogImageUrl}
            alt="OG Image"
            className="mb-3 h-32 w-auto rounded border border-neutral-800 bg-neutral-950 p-2"
          />
        )}
        <label className="cursor-pointer">
          <span className="rounded-full border border-neutral-700 px-4 py-2 text-xs uppercase tracking-[0.15em] text-neutral-300 hover:bg-neutral-800">
            {uploading ? "Yüklənir..." : "Şəkil Yüklə"}
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
        <p className="mt-2 text-xs text-neutral-500">
          Tövsiyə olunan ölçü: 1200x630px. Bu şəkil sosial mediada paylaşılan
          linklərdə görünür.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={saving}>
          Yadda Saxla
        </Button>
        {message && <p className="text-sm text-green-400">{message}</p>}
      </div>
    </form>
  );
}

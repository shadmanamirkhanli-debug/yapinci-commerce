"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils/cn";

const locales = [
  { code: "az", label: "AZ" },
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
];

export default function LanguageSwitcher({ light = false }: { light?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(code: string) {
    document.cookie =
      "NEXT_LOCALE=" + code + "; path=/; max-age=31536000; SameSite=Lax";
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex items-center gap-0.5" aria-label="Language">
      {locales.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => switchTo(l.code)}
          disabled={isPending || locale === l.code}
          className={cn(
            "rounded-full px-2 py-1 text-[10px] font-semibold tracking-[0.15em] transition-colors duration-300",
            light
              ? locale === l.code
                ? "bg-white/20 text-white"
                : "text-white/60 hover:text-white"
              : locale === l.code
                ? "bg-secondary text-primary"
                : "text-muted hover:text-primary"
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const fallbackSiteName = "Yapinci";
const fallbackDescription =
  "Azərbaycanın premium moda və əl işi məhsulları mağazası.";

export async function getSeoSettings() {
  const settings = await prisma.seoSettings.findUnique({
    where: { id: 1 },
  });

  if (settings) {
    return settings;
  }

  return {
    id: 1,
    metaTitle: fallbackSiteName,
    metaDescription: fallbackDescription,
    ogImageUrl: null,
    updatedAt: new Date(),
  };
}

const OG_LOCALES: Record<string, string> = {
  az: "az_AZ",
  en: "en_US",
  ru: "ru_RU",
};

export function ogLocaleFor(locale: string): string {
  return OG_LOCALES[locale] ?? OG_LOCALES.az;
}

export function defaultOgImage(baseUrl: string): string {
  return baseUrl + "/og-image.png";
}

type Locale = (typeof routing.locales)[number];

export async function createPageMetadata({
  title,
  description,
  path,
  noIndex = false,
  locale = routing.defaultLocale,
}: {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  locale?: Locale;
}): Promise<Metadata> {
  const seo = await getSeoSettings();
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
  const finalDescription = description ?? seo.metaDescription;
  const image = seo.ogImageUrl ?? defaultOgImage(baseUrl);

  let alternates: Metadata["alternates"];
  let canonicalUrl = baseUrl;

  if (path) {
    const localizedPath = getPathname({ href: path, locale });
    canonicalUrl = baseUrl + localizedPath;

    const languages: Record<string, string> = {};
    for (const loc of routing.locales) {
      languages[loc] = baseUrl + getPathname({ href: path, locale: loc });
    }
    languages["x-default"] =
      baseUrl + getPathname({ href: path, locale: routing.defaultLocale });

    alternates = { canonical: canonicalUrl, languages };
  }

  return {
    title,
    description: finalDescription,
    robots: noIndex ? { index: false, follow: false } : undefined,
    alternates,
    openGraph: {
      title,
      description: finalDescription,
      url: canonicalUrl,
      siteName: seo.metaTitle,
      locale: ogLocaleFor(locale),
      type: "website",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: finalDescription,
      images: [image],
    },
  };
}

export const siteName = fallbackSiteName;
export const defaultDescription = fallbackDescription;

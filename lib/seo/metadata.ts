import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/site-url";

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

export async function createPageMetadata({
  title,
  description,
  path,
  noIndex = false,
  locale = "az",
}: {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  locale?: string;
}): Promise<Metadata> {
  const seo = await getSeoSettings();
  const baseUrl = getBaseUrl();
  const url = path ? baseUrl + path : baseUrl;
  const finalDescription = description ?? seo.metaDescription;
  const ogImage = seo.ogImageUrl || `${baseUrl}/og-image.png`;

  return {
    title,
    description: finalDescription,
    robots: noIndex ? { index: false, follow: false } : undefined,
    alternates: path ? { canonical: url } : undefined,
    openGraph: {
      title,
      description: finalDescription,
      url,
      siteName: seo.metaTitle,
      locale: ogLocaleFor(locale),
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: finalDescription,
      images: [ogImage],
    },
  };
}

export const siteName = fallbackSiteName;
export const defaultDescription = fallbackDescription;

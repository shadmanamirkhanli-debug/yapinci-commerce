import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

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

export async function createPageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}): Promise<Metadata> {
  const seo = await getSeoSettings();
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
  const url = path ? baseUrl + path : baseUrl;
  const finalDescription = description ?? seo.metaDescription;

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
      locale: "az_AZ",
      type: "website",
      images: seo.ogImageUrl ? [{ url: seo.ogImageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: finalDescription,
    },
  };
}

export const siteName = fallbackSiteName;
export const defaultDescription = fallbackDescription;

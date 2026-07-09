import type { Metadata } from "next";

const siteName = "Yapinci";
const defaultDescription =
  "Azərbaycanın premium moda və əl işi məhsulları mağazası.";

export function createPageMetadata({
  title,
  description = defaultDescription,
  path,
  noIndex = false,
}: {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
  const url = path ? `${baseUrl}${path}` : baseUrl;

  return {
    title,
    description,
    robots: noIndex ? { index: false, follow: false } : undefined,
    alternates: path ? { canonical: url } : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName,
      locale: "az_AZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export { siteName, defaultDescription };

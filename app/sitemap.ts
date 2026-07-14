import type { MetadataRoute } from "next";
import { getPublishedProductSlugs } from "@/lib/store/products";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";

// One <url> entry per (route x locale), each pointing every sibling locale's
// URL back via alternates.languages — the sitemap equivalent of hreflang.
function entriesFor(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number
): MetadataRoute.Sitemap {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = baseUrl + getPathname({ href: path, locale });
  }
  languages["x-default"] =
    baseUrl + getPathname({ href: path, locale: routing.defaultLocale });

  return routing.locales.map((locale) => ({
    url: baseUrl + getPathname({ href: path, locale }),
    changeFrequency,
    priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    ...entriesFor("/", "daily", 1),
    ...entriesFor("/shop", "daily", 0.9),
    ...entriesFor("/about", "monthly", 0.5),
    ...entriesFor("/contact", "monthly", 0.5),
  ];

  try {
    const products = await getPublishedProductSlugs();
    const productRoutes: MetadataRoute.Sitemap = products.flatMap((slug) =>
      entriesFor(`/product/${slug}`, "weekly", 0.8)
    );

    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}

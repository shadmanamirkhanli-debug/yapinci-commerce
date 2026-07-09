import type { MetadataRoute } from "next";
import { getPublishedProductSlugs } from "@/lib/store/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    const products = await getPublishedProductSlugs();
    const productRoutes: MetadataRoute.Sitemap = products.map((slug) => ({
      url: `${baseUrl}/product/${slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}

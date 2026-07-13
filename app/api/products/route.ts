import { cookies } from "next/headers";
import { apiSuccess } from "@/lib/api-response";
import { getProductsBySlugs, getStoreProducts } from "@/lib/store/products";
import type { StoreLocale } from "@/lib/store/format";

const LOCALES: StoreLocale[] = ["az", "en", "ru"];

async function resolveLocale(): Promise<StoreLocale> {
  const cookieStore = await cookies();
  const candidate = cookieStore.get("NEXT_LOCALE")?.value as StoreLocale | undefined;
  return candidate && LOCALES.includes(candidate) ? candidate : "az";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slugs = searchParams.get("slugs");
  const locale = await resolveLocale();

  if (slugs) {
    const products = await getProductsBySlugs(slugs.split(",").filter(Boolean), locale);
    return apiSuccess(products);
  }

  const result = await getStoreProducts({ limit: 100 }, locale);
  return apiSuccess(result.items);
}

export async function POST() {
  return apiSuccess({ message: "Use admin API for product creation" }, 201);
}

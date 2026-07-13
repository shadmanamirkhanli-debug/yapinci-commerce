import { cookies } from "next/headers";
import { getStoreProductBySlug } from "@/lib/store/products";
import type { StoreLocale } from "@/lib/store/format";
import { apiError, apiSuccess } from "@/lib/api-response";

const LOCALES: StoreLocale[] = ["az", "en", "ru"];

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const cookieStore = await cookies();
  const candidate = cookieStore.get("NEXT_LOCALE")?.value as StoreLocale | undefined;
  const locale: StoreLocale = candidate && LOCALES.includes(candidate) ? candidate : "az";
  const data = await getStoreProductBySlug(id, locale);

  if (!data) {
    return apiError("Product not found", 404);
  }

  return apiSuccess(data.product);
}

export async function POST() {
  return apiSuccess({ message: "Not implemented" }, 501);
}

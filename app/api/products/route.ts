import { apiSuccess } from "@/lib/api-response";
import { getProductsBySlugs, getStoreProducts } from "@/lib/store/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slugs = searchParams.get("slugs");

  if (slugs) {
    const products = await getProductsBySlugs(slugs.split(",").filter(Boolean));
    return apiSuccess(products);
  }

  const result = await getStoreProducts({ limit: 100 });
  return apiSuccess(result.items);
}

export async function POST() {
  return apiSuccess({ message: "Use admin API for product creation" }, 201);
}

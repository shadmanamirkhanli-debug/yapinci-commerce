import { getStoreProductBySlug } from "@/lib/store/products";
import { apiError, apiSuccess } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const data = await getStoreProductBySlug(id);

  if (!data) {
    return apiError("Product not found", 404);
  }

  return apiSuccess(data.product);
}

export async function POST() {
  return apiSuccess({ message: "Not implemented" }, 501);
}

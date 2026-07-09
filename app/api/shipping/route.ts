import { getShippingMethods } from "@/lib/orders/shipping";
import { apiSuccess } from "@/lib/api-response";

export async function GET() {
  return apiSuccess({ methods: getShippingMethods() });
}

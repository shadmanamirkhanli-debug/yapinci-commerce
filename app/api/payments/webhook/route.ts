import { apiSuccess } from "@/lib/api-response";

export async function POST() {
  return apiSuccess({ received: true });
}

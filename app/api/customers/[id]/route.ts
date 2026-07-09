import { apiSuccess } from "@/lib/api-response";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  return apiSuccess({ id, name: "Customer" });
}

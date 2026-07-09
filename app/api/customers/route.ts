import { apiSuccess } from "@/lib/api-response";

export async function GET() {
  return apiSuccess([]);
}

export async function POST() {
  return apiSuccess({ message: "Customer creation endpoint — not implemented" }, 201);
}

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getOrCreateVisitorId } from "@/lib/survey/visitor";
import { surveyResponseSchema } from "@/lib/validations/survey";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = surveyResponseSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
    }

    const visitorId = await getOrCreateVisitorId();

    const response = await prisma.surveyResponse.create({
      data: {
        designId: parsed.data.designId,
        visitorId,
        score: parsed.data.score,
        wouldBuy: parsed.data.wouldBuy,
        priceBand: parsed.data.priceBand ?? null,
        suggestion: parsed.data.suggestion || null,
      },
    });

    return apiSuccess({ id: response.id }, 201);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return apiError("Already submitted", 409);
    }
    return apiError("Failed to submit response", 500);
  }
}

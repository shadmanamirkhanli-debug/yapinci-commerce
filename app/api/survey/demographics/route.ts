import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getOrCreateVisitorId } from "@/lib/survey/visitor";
import { surveyDemographicsSchema } from "@/lib/validations/survey";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = surveyDemographicsSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
    }

    const visitorId = await getOrCreateVisitorId();
    const ageBand = parsed.data.ageBand ?? null;
    const gender = parsed.data.gender ?? null;

    await prisma.surveyVisitor.upsert({
      where: { id: visitorId },
      create: { id: visitorId, ageBand, gender },
      update: { ageBand, gender },
    });

    return apiSuccess({ ok: true });
  } catch {
    return apiError("Failed to save demographics", 500);
  }
}

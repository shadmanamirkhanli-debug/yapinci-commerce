import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api-response";
import { getOrCreateVisitorId } from "@/lib/survey/visitor";

function localizeTitle(
  locale: string,
  title: string,
  titleEn: string | null,
  titleRu: string | null
): string {
  if (locale === "en" && titleEn) return titleEn;
  if (locale === "ru" && titleRu) return titleRu;
  return title;
}

export async function GET() {
  const [locale, visitorId] = await Promise.all([
    getLocale(),
    getOrCreateVisitorId(),
  ]);

  const [designs, visitor] = await Promise.all([
    prisma.surveyDesign.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        responses: {
          where: { visitorId },
          select: { id: true },
        },
      },
    }),
    prisma.surveyVisitor.findUnique({ where: { id: visitorId } }),
  ]);

  return apiSuccess({
    hasAnsweredDemographics: !!visitor,
    designs: designs.map((design) => ({
      id: design.id,
      title: localizeTitle(locale, design.title, design.titleEn, design.titleRu),
      imageUrl: design.imageUrl,
      hasVoted: design.responses.length > 0,
    })),
  });
}

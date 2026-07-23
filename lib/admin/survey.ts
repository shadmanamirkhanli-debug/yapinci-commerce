import { prisma } from "@/lib/prisma";
import type { SurveyDesignInput } from "@/lib/validations/survey";
import type {
  AgeBand,
  Gender,
  PriceBand,
  SurveyDesign,
  SurveyResponse,
} from "@prisma/client";

export function formatAdminSurveyDesign(
  design: SurveyDesign & { _count?: { responses: number } }
) {
  return {
    id: design.id,
    title: design.title,
    titleEn: design.titleEn ?? "",
    titleRu: design.titleRu ?? "",
    imageUrl: design.imageUrl,
    responseCount: design._count?.responses ?? 0,
    createdAt: design.createdAt.toISOString(),
    updatedAt: design.updatedAt.toISOString(),
  };
}

export function buildSurveyDesignWriteData(input: SurveyDesignInput) {
  return {
    title: input.title,
    titleEn: input.titleEn || null,
    titleRu: input.titleRu || null,
    imageUrl: input.imageUrl,
  };
}

export const PRICE_BAND_LABELS: Record<PriceBand, string> = {
  UNDER_25: "Up to 25 AZN",
  FROM_25_TO_40: "25–40 AZN",
  FROM_40_TO_55: "40–55 AZN",
  FROM_55_TO_70: "55–70 AZN",
  OVER_70: "Over 70 AZN",
};

type NormalizedGender = "FEMALE" | "MALE" | "OTHER" | "UNKNOWN";
type NormalizedAgeBand =
  | "UNDER_18"
  | "AGE_18_24"
  | "AGE_25_34"
  | "AGE_35_44"
  | "AGE_45_PLUS"
  | "UNKNOWN";

// "UNSPECIFIED" (explicit "prefer not to say") and a missing visitor record
// (never asked) both carry the same lack of signal, so both collapse into
// the same "Not specified" reporting bucket.
function normalizeGender(gender: Gender | null | undefined): NormalizedGender {
  if (gender === "FEMALE" || gender === "MALE" || gender === "OTHER") return gender;
  return "UNKNOWN";
}

function normalizeAgeBand(ageBand: AgeBand | null | undefined): NormalizedAgeBand {
  if (
    ageBand === "UNDER_18" ||
    ageBand === "AGE_18_24" ||
    ageBand === "AGE_25_34" ||
    ageBand === "AGE_35_44" ||
    ageBand === "AGE_45_PLUS"
  ) {
    return ageBand;
  }
  return "UNKNOWN";
}

export const GENDER_LABELS: Record<NormalizedGender, string> = {
  FEMALE: "Female",
  MALE: "Male",
  OTHER: "Other",
  UNKNOWN: "Not specified",
};

export const AGE_BAND_LABELS: Record<NormalizedAgeBand, string> = {
  UNDER_18: "Under 18",
  AGE_18_24: "18–24",
  AGE_25_34: "25–34",
  AGE_35_44: "35–44",
  AGE_45_PLUS: "45+",
  UNKNOWN: "Not specified",
};

const GENDER_ORDER: NormalizedGender[] = ["FEMALE", "MALE", "OTHER", "UNKNOWN"];
const AGE_BAND_ORDER: NormalizedAgeBand[] = [
  "UNDER_18",
  "AGE_18_24",
  "AGE_25_34",
  "AGE_35_44",
  "AGE_45_PLUS",
  "UNKNOWN",
];

type SegmentBucket = { count: number; scoreSum: number; buyCount: number };

type SegmentSummary = {
  label: string;
  count: number;
  averageScore: number;
  wouldBuyPercent: number;
};

function segmentResponses<T extends string>(
  responses: SurveyResponse[],
  visitorMap: Map<string, { ageBand: AgeBand | null; gender: Gender | null }>,
  keyFn: (visitor?: { ageBand: AgeBand | null; gender: Gender | null }) => T,
  order: T[],
  labels: Record<T, string>
): SegmentSummary[] {
  const buckets = new Map<T, SegmentBucket>();

  for (const response of responses) {
    const key = keyFn(visitorMap.get(response.visitorId));
    const bucket = buckets.get(key) ?? { count: 0, scoreSum: 0, buyCount: 0 };
    bucket.count += 1;
    bucket.scoreSum += response.score;
    if (response.wouldBuy) bucket.buyCount += 1;
    buckets.set(key, bucket);
  }

  return order
    .filter((key) => buckets.has(key))
    .map((key) => {
      const bucket = buckets.get(key)!;
      return {
        label: labels[key],
        count: bucket.count,
        averageScore: bucket.scoreSum / bucket.count,
        wouldBuyPercent: (bucket.buyCount / bucket.count) * 100,
      };
    });
}

export async function getSurveyResults() {
  const designs = await prisma.surveyDesign.findMany({
    include: { responses: true },
  });

  const visitorIds = Array.from(
    new Set(designs.flatMap((design) => design.responses.map((response) => response.visitorId)))
  );
  const visitors = visitorIds.length
    ? await prisma.surveyVisitor.findMany({ where: { id: { in: visitorIds } } })
    : [];
  const visitorMap = new Map(visitors.map((visitor) => [visitor.id, visitor]));

  const results = designs.map((design) => {
    const responses = design.responses;
    const count = responses.length;
    const averageScore =
      count > 0
        ? responses.reduce((sum, response) => sum + response.score, 0) / count
        : 0;
    const wouldBuyCount = responses.filter((response) => response.wouldBuy).length;
    const wouldBuyPercent = count > 0 ? (wouldBuyCount / count) * 100 : 0;
    const suggestions = responses
      .map((response) => response.suggestion)
      .filter((suggestion): suggestion is string => !!suggestion && suggestion.trim().length > 0);

    const priceBandCounts = new Map<PriceBand, number>();
    for (const response of responses) {
      if (!response.priceBand) continue;
      priceBandCounts.set(response.priceBand, (priceBandCounts.get(response.priceBand) ?? 0) + 1);
    }
    let topPriceBand: { band: PriceBand; count: number } | null = null;
    for (const [band, bandCount] of priceBandCounts) {
      if (!topPriceBand || bandCount > topPriceBand.count) {
        topPriceBand = { band, count: bandCount };
      }
    }

    return {
      id: design.id,
      title: design.title,
      imageUrl: design.imageUrl,
      count,
      averageScore,
      wouldBuyPercent,
      suggestions,
      topPriceBand: topPriceBand
        ? { label: PRICE_BAND_LABELS[topPriceBand.band], count: topPriceBand.count }
        : null,
      genderSegments: segmentResponses(
        responses,
        visitorMap,
        (visitor) => normalizeGender(visitor?.gender),
        GENDER_ORDER,
        GENDER_LABELS
      ),
      ageSegments: segmentResponses(
        responses,
        visitorMap,
        (visitor) => normalizeAgeBand(visitor?.ageBand),
        AGE_BAND_ORDER,
        AGE_BAND_LABELS
      ),
    };
  });

  return results.sort((a, b) => b.averageScore - a.averageScore);
}

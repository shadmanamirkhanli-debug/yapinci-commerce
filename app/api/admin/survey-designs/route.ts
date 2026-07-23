import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAdminAudited } from "@/lib/admin/require-admin";
import { apiError, apiSuccess } from "@/lib/api-response";
import { parseListQuery, paginate } from "@/lib/admin/query-params";
import {
  buildSurveyDesignWriteData,
  formatAdminSurveyDesign,
} from "@/lib/admin/survey";
import { surveyDesignSchema } from "@/lib/validations/survey";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const query = parseListQuery(searchParams, { sort: "createdAt", limit: 20 });

  const where = query.search
    ? { title: { contains: query.search, mode: "insensitive" as const } }
    : {};

  const [total, designs] = await Promise.all([
    prisma.surveyDesign.count({ where }),
    prisma.surveyDesign.findMany({
      where,
      include: { _count: { select: { responses: true } } },
      orderBy: { [query.sort]: query.order },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);

  return apiSuccess({
    items: designs.map(formatAdminSurveyDesign),
    pagination: paginate(total, query.page, query.limit),
  });
}

export async function POST(request: Request) {
  const { error } = await requireAdminAudited(request, {
    action: "surveyDesign.create",
    entityType: "SurveyDesign",
  });
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = surveyDesignSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
    }

    const design = await prisma.surveyDesign.create({
      data: buildSurveyDesignWriteData(parsed.data),
      include: { _count: { select: { responses: true } } },
    });

    return apiSuccess(formatAdminSurveyDesign(design), 201);
  } catch {
    return apiError("Failed to create design", 500);
  }
}

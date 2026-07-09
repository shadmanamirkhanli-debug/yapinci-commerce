export type ListQuery = {
  page: number;
  limit: number;
  search: string;
  sort: string;
  order: "asc" | "desc";
};

export function parseListQuery(
  searchParams: URLSearchParams,
  defaults: { sort?: string; limit?: number } = {}
): ListQuery {
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get("limit") ?? defaults.limit ?? 10) || 10)
  );
  const search = searchParams.get("search")?.trim() ?? "";
  const sort = searchParams.get("sort") ?? defaults.sort ?? "createdAt";
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";

  return { page, limit, search, sort, order };
}

export function paginate(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

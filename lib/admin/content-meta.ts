const META_PREFIX = "---meta\n";
const META_SUFFIX = "\n---\n";

export type ProductMeta = {
  shortDescription?: string;
  brand?: string;
  collection?: string;
  comparePrice?: number;
  costPrice?: number;
  discount?: number;
  lowStockAlert?: number;
  newArrival?: boolean;
  bestSeller?: boolean;
  seoTitle?: string;
  seoDescription?: string;
};

export type CategoryMeta = {
  imageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export function parseContentMeta<T extends Record<string, unknown>>(
  raw: string | null | undefined
): { meta: T; body: string } {
  if (!raw?.startsWith(META_PREFIX)) {
    return { meta: {} as T, body: raw ?? "" };
  }

  const endIndex = raw.indexOf(META_SUFFIX, META_PREFIX.length);
  if (endIndex === -1) {
    return { meta: {} as T, body: raw };
  }

  try {
    const meta = JSON.parse(
      raw.slice(META_PREFIX.length, endIndex)
    ) as T;
    const body = raw.slice(endIndex + META_SUFFIX.length);
    return { meta, body };
  } catch {
    return { meta: {} as T, body: raw };
  }
}

export function serializeContentMeta<T extends Record<string, unknown>>(
  meta: T,
  body: string
) {
  const hasMeta = Object.values(meta).some(
    (value) => value !== undefined && value !== "" && value !== false && value !== 0
  );

  if (!hasMeta) {
    return body;
  }

  return `${META_PREFIX}${JSON.stringify(meta)}${META_SUFFIX}${body}`;
}

export function parseVariantColor(color?: string | null) {
  if (!color) {
    return { color: "", material: "" };
  }

  const [colorValue, material] = color.split(" · ").map((part) => part.trim());
  return {
    color: material ? colorValue : color,
    material: material ?? "",
  };
}

export function serializeVariantColor(color: string, material?: string) {
  const trimmedColor = color.trim();
  const trimmedMaterial = material?.trim();

  if (!trimmedColor) return trimmedMaterial || null;
  if (!trimmedMaterial) return trimmedColor;
  return `${trimmedColor} · ${trimmedMaterial}`;
}

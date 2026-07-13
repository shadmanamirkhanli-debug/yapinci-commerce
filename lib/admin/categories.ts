import {
  parseContentMeta,
  serializeContentMeta,
  type CategoryMeta,
} from "@/lib/admin/content-meta";
import type { CategoryInput } from "@/lib/validations/category";
import type { Category } from "@prisma/client";

export function formatAdminCategory(category: Category & { parent?: Category | null; _count?: { products: number; children: number } }) {
  const { meta, body } = parseContentMeta<CategoryMeta>(category.description);

  return {
    id: category.id,
    name: category.name,
    nameEn: category.nameEn ?? "",
    nameRu: category.nameRu ?? "",
    slug: category.slug,
    description: body,
    descriptionEn: category.descriptionEn ?? "",
    descriptionRu: category.descriptionRu ?? "",
    parentId: category.parentId,
    parent: category.parent,
    imageUrl: meta.imageUrl ?? "",
    seoTitle: meta.seoTitle ?? category.name,
    seoDescription: meta.seoDescription ?? "",
    productCount: category._count?.products ?? 0,
    childCount: category._count?.children ?? 0,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

export function buildCategoryWriteData(input: CategoryInput) {
  const meta: CategoryMeta = {
    imageUrl: input.imageUrl,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
  };

  return {
    name: input.name,
    nameEn: input.nameEn || null,
    nameRu: input.nameRu || null,
    slug: input.slug,
    description: serializeContentMeta(meta, input.description ?? ""),
    descriptionEn: input.descriptionEn || null,
    descriptionRu: input.descriptionRu || null,
    parentId: input.parentId ?? null,
  };
}

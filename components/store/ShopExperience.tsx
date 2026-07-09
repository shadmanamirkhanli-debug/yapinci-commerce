"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ui/ProductCard";
import ProductGrid from "@/components/ui/ProductGrid";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Pagination from "@/components/ui/Pagination";
import { cn } from "@/lib/utils/cn";
import type { FilterOptions, StoreProduct } from "@/lib/store/types";

type ShopExperienceProps = {
  initialProducts: StoreProduct[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
  filterOptions: FilterOptions;
  basePath?: string;
  title?: string;
  description?: string;
};

export default function ShopExperience({
  initialProducts,
  pagination,
  filterOptions,
  basePath = "/shop",
  title = "Bütün Kolleksiya",
  description = "Premium keyfiyyət, minimalist dizayn və Azərbaycan mədəniyyətindən ilham.",
}: ShopExperienceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [view, setView] = useState<"grid" | "list">("grid");

  const currentFilters = useMemo(() => {
    const get = (key: string) => searchParams.get(key) ?? "";
    return {
      q: get("q"),
      category: get("category"),
      collection: get("collection"),
      minPrice: get("minPrice"),
      maxPrice: get("maxPrice"),
      color: searchParams.getAll("color"),
      size: searchParams.getAll("size"),
      material: searchParams.getAll("material"),
      inStock: get("inStock") === "true",
      sort: get("sort") || "newest",
    };
  }, [searchParams]);

  const updateParams = (updates: Record<string, string | string[] | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      params.delete(key);
      if (value === null || value === "") continue;
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, item));
      } else {
        params.set(key, value);
      }
    }

    if (!updates.page) params.delete("page");

    startTransition(() => {
      router.push(`${basePath}?${params.toString()}`);
    });
  };

  const toggleArrayFilter = (key: string, value: string) => {
    const current = searchParams.getAll(key);
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    updateParams({ [key]: next });
  };

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-8">
        <div>
          <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-muted">
            Axtarış
          </h2>
          <form
            className="mt-3"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              updateParams({ q: String(formData.get("q") ?? "") });
            }}
          >
            <Input
              name="q"
              defaultValue={currentFilters.q}
              placeholder="Məhsul axtar..."
            />
          </form>
        </div>

        <FilterGroup title="Kateqoriya">
          <button
            type="button"
            onClick={() => updateParams({ category: null })}
            className={cn(
              "block w-full rounded-full px-4 py-2 text-left text-xs uppercase tracking-[0.15em]",
              !currentFilters.category
                ? "bg-primary text-white"
                : "text-muted hover:bg-secondary"
            )}
          >
            Hamısı
          </button>
          {filterOptions.categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => updateParams({ category: category.slug })}
              className={cn(
                "block w-full rounded-full px-4 py-2 text-left text-xs uppercase tracking-[0.15em]",
                currentFilters.category === category.slug
                  ? "bg-primary text-white"
                  : "text-muted hover:bg-secondary"
              )}
            >
              {category.name}
            </button>
          ))}
        </FilterGroup>

        <FilterGroup title="Qiymət">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              defaultValue={currentFilters.minPrice}
              onBlur={(event) =>
                updateParams({ minPrice: event.target.value || null })
              }
            />
            <Input
              type="number"
              placeholder="Max"
              defaultValue={currentFilters.maxPrice}
              onBlur={(event) =>
                updateParams({ maxPrice: event.target.value || null })
              }
            />
          </div>
        </FilterGroup>

        {filterOptions.colors.length > 0 && (
          <FilterGroup title="Rəng">
            {filterOptions.colors.map((color) => (
              <label key={color} className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={currentFilters.color.includes(color)}
                  onChange={() => toggleArrayFilter("color", color)}
                />
                {color}
              </label>
            ))}
          </FilterGroup>
        )}

        {filterOptions.sizes.length > 0 && (
          <FilterGroup title="Ölçü">
            <div className="flex flex-wrap gap-2">
              {filterOptions.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleArrayFilter("size", size)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs",
                    currentFilters.size.includes(size)
                      ? "border-primary bg-primary text-white"
                      : "border-border text-muted hover:border-primary"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </FilterGroup>
        )}

        {filterOptions.materials.length > 0 && (
          <FilterGroup title="Material">
            {filterOptions.materials.map((material) => (
              <label key={material} className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={currentFilters.material.includes(material)}
                  onChange={() => toggleArrayFilter("material", material)}
                />
                {material}
              </label>
            ))}
          </FilterGroup>
        )}

        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={currentFilters.inStock}
            onChange={(event) =>
              updateParams({ inStock: event.target.checked ? "true" : null })
            }
          />
          Yalnız stokda olanlar
        </label>
      </aside>

      <div>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.3em] uppercase text-accent">
              Mağaza
            </p>
            <h1 className="mt-2 text-3xl font-light tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted">{description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select
              options={[
                { value: "newest", label: "Ən yeni" },
                { value: "price-asc", label: "Qiymət: Aşağıdan yuxarı" },
                { value: "price-desc", label: "Qiymət: Yuxarıdan aşağı" },
                { value: "name", label: "Ad" },
              ]}
              value={currentFilters.sort}
              onChange={(event) => updateParams({ sort: event.target.value })}
              className="min-w-[180px]"
            />
            <div className="flex rounded-full border border-border p-1">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.1em]",
                  view === "grid" ? "bg-primary text-white" : "text-muted"
                )}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.1em]",
                  view === "list" ? "bg-primary text-white" : "text-muted"
                )}
              >
                List
              </button>
            </div>
          </div>
        </div>

        <p className="mb-6 text-sm text-muted">
          {pagination.total} məhsul
          {isPending && " · Yenilənir..."}
        </p>

        {initialProducts.length === 0 ? (
          <div className="rounded-3xl border border-border bg-secondary px-8 py-16 text-center">
            <p className="text-sm text-muted">Uyğun məhsul tapılmadı.</p>
            <Button
              className="mt-6"
              variant="secondary"
              onClick={() => router.push(basePath)}
            >
              Filtrləri təmizlə
            </Button>
          </div>
        ) : view === "grid" ? (
          <ProductGrid>
            {initialProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                className={index === 1 ? "animation-delay-100" : index === 2 ? "animation-delay-200" : undefined}
              />
            ))}
          </ProductGrid>
        ) : (
          <div className="space-y-4">
            {initialProducts.map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-4 rounded-2xl border border-border p-4 sm:flex-row sm:items-center"
              >
                <div className="h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary">
                  {product.primaryImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.primaryImage}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium uppercase tracking-wide">
                    {product.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">
                    {product.shortDescription}
                  </p>
                </div>
                <Button href={`/product/${product.slug}`} size="sm">
                  Bax
                </Button>
              </div>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="mt-10">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => updateParams({ page: String(page) })}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-muted">
        {title}
      </h2>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}

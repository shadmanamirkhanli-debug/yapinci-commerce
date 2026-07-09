"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { adminFieldClass } from "@/lib/admin/styles";
import { useRemoteList } from "@/lib/hooks/use-remote-list";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  status: string;
  stockQuantity: number;
  category?: { name: string } | null;
};

type ProductsTableProps = {
  categories: { id: string; name: string }[];
};

export default function ProductsTable({ categories }: ProductsTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const extraParams = useMemo(
    () => ({
      status,
      categoryId,
      sort: sortKey,
      order: sortOrder,
    }),
    [status, categoryId, sortKey, sortOrder]
  );

  const { items, loading, totalPages, markLoading, refetch } =
    useRemoteList<ProductRow>({
      endpoint: "/api/admin/products",
      page,
      search,
      extraParams,
    });

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    await fetch("/api/admin/products/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", ids: selectedIds }),
    });
    setSelectedIds([]);
    refetch();
  };

  const handleBulkPublish = async (published: boolean) => {
    if (!selectedIds.length) return;
    await fetch("/api/admin/products/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update",
        ids: selectedIds,
        data: { published },
      }),
    });
    setSelectedIds([]);
    refetch();
  };

  const columns: DataTableColumn<ProductRow>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (row) => (
        <Link href={`/admin/products/${row.id}`} className="hover:text-white">
          {row.name}
        </Link>
      ),
    },
    { key: "slug", label: "Slug", sortable: true },
    {
      key: "category",
      label: "Category",
      render: (row) => row.category?.name ?? "—",
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (row) => `${row.price} AZN`,
    },
    {
      key: "stockQuantity",
      label: "Stock",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className="rounded bg-neutral-800 px-2 py-1 text-xs uppercase">
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description="Manage your product catalog"
        actions={
          <Button href="/admin/products/new" size="sm">
            Add Product
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-neutral-500">Loading products...</p>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          searchPlaceholder="Search products..."
          onSearch={(value) => {
            markLoading();
            setPage(1);
            setSearch(value);
          }}
          onSort={(key) => {
            markLoading();
            if (sortKey === key) {
              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            } else {
              setSortKey(key);
              setSortOrder("asc");
            }
          }}
          sortKey={sortKey}
          sortOrder={sortOrder}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          pagination={{
            page,
            totalPages,
            onPageChange: (nextPage) => {
              markLoading();
              setPage(nextPage);
            },
          }}
          filters={
            <div className="flex flex-wrap gap-3">
              <Select
                options={[
                  { value: "", label: "All statuses" },
                  { value: "published", label: "Published" },
                  { value: "draft", label: "Draft" },
                ]}
                value={status}
                onChange={(event) => {
                  markLoading();
                  setPage(1);
                  setStatus(event.target.value);
                }}
                className={`${adminFieldClass} min-w-[140px]`}
              />
              <Select
                options={[
                  { value: "", label: "All categories" },
                  ...categories.map((category) => ({
                    value: category.id,
                    label: category.name,
                  })),
                ]}
                value={categoryId}
                onChange={(event) => {
                  markLoading();
                  setPage(1);
                  setCategoryId(event.target.value);
                }}
                className={`${adminFieldClass} min-w-[160px]`}
              />
            </div>
          }
          bulkActions={
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleBulkPublish(true)}
                className="border-neutral-700 text-neutral-200"
              >
                Publish
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleBulkPublish(false)}
                className="border-neutral-700 text-neutral-200"
              >
                Draft
              </Button>
              <Button
                type="button"
                size="sm"
                variant="danger"
                onClick={handleBulkDelete}
              >
                Delete
              </Button>
            </>
          }
        />
      )}
    </div>
  );
}

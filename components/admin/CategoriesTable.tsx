"use client";

import { useState } from "react";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import Button from "@/components/ui/Button";
import { useRemoteList } from "@/lib/hooks/use-remote-list";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  parent?: { name: string } | null;
  productCount: number;
  childCount: number;
};

export default function CategoriesTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { items, loading, totalPages, markLoading, refetch } =
    useRemoteList<CategoryRow>({
      endpoint: "/api/admin/categories",
      page,
      search,
    });

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    await fetch("/api/admin/categories/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", ids: selectedIds }),
    });
    setSelectedIds([]);
    refetch();
  };

  const columns: DataTableColumn<CategoryRow>[] = [
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <Link href={`/admin/categories/${row.id}`} className="hover:text-white">
          {row.name}
        </Link>
      ),
    },
    { key: "slug", label: "Slug" },
    {
      key: "parent",
      label: "Parent",
      render: (row) => row.parent?.name ?? "—",
    },
    { key: "productCount", label: "Products" },
    { key: "childCount", label: "Children" },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="Organize your product catalog"
        actions={
          <Button href="/admin/categories/new" size="sm">
            Add Category
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-neutral-500">Loading categories...</p>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          searchPlaceholder="Search categories..."
          onSearch={(value) => {
            markLoading();
            setPage(1);
            setSearch(value);
          }}
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
          bulkActions={
            <Button
              type="button"
              size="sm"
              variant="danger"
              onClick={handleBulkDelete}
            >
              Delete
            </Button>
          }
        />
      )}
    </div>
  );
}

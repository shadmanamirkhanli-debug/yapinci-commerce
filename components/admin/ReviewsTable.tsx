"use client";

import { useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import Button from "@/components/ui/Button";
import { useRemoteList } from "@/lib/hooks/use-remote-list";

type ReviewRow = {
  id: string;
  rating: number;
  title?: string | null;
  customer: string;
  product: string;
  published: boolean;
};

export default function ReviewsTable() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { items, loading, totalPages, markLoading, refetch } =
    useRemoteList<ReviewRow>({
      endpoint: "/api/admin/reviews",
      page,
      search,
    });

  const handleBulkPublish = async (published: boolean) => {
    await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds, published }),
    });
    setSelectedIds([]);
    refetch();
  };

  const handleBulkDelete = async () => {
    await fetch("/api/admin/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds }),
    });
    setSelectedIds([]);
    refetch();
  };

  const columns: DataTableColumn<ReviewRow>[] = [
    { key: "product", label: "Product" },
    { key: "customer", label: "Customer" },
    { key: "rating", label: "Rating" },
    {
      key: "title",
      label: "Title",
      render: (row) => row.title ?? "—",
    },
    {
      key: "published",
      label: "Status",
      render: (row) => (
        <span className="rounded bg-neutral-800 px-2 py-1 text-xs">
          {row.published ? "Published" : "Hidden"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Reviews"
        description="Moderate customer product reviews"
      />

      {loading ? (
        <p className="text-sm text-neutral-500">Loading reviews...</p>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          searchPlaceholder="Search reviews..."
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
                Hide
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

"use client";

import { useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import Button from "@/components/ui/Button";
import { useRemoteList } from "@/lib/hooks/use-remote-list";

type SurveyDesignRow = {
  id: string;
  title: string;
  imageUrl: string;
  responseCount: number;
  createdAt: string;
};

export default function SurveyDesignsTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { items, loading, totalPages, markLoading, refetch } =
    useRemoteList<SurveyDesignRow>({
      endpoint: "/api/admin/survey-designs",
      page,
      search,
    });

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    await fetch("/api/admin/survey-designs/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", ids: selectedIds }),
    });
    setSelectedIds([]);
    refetch();
  };

  const columns: DataTableColumn<SurveyDesignRow>[] = [
    {
      key: "imageUrl",
      label: "Image",
      render: (row) => (
        <div className="h-14 w-14 overflow-hidden rounded-lg bg-neutral-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={row.imageUrl} alt={row.title} className="h-full w-full object-cover" />
        </div>
      ),
    },
    { key: "title", label: "Title" },
    { key: "responseCount", label: "Votes" },
    {
      key: "createdAt",
      label: "Uploaded",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Design Survey"
        description="Upload candidate designs for visitor feedback"
        actions={
          <>
            <Button href="/admin/survey/results" size="sm" variant="outline" className="border-neutral-700 text-neutral-200">
              View Results
            </Button>
            <Button href="/admin/survey/new" size="sm">
              Upload Design
            </Button>
          </>
        }
      />

      {loading ? (
        <p className="text-sm text-neutral-500">Loading designs...</p>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          searchPlaceholder="Search designs..."
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

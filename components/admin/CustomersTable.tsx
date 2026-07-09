"use client";

import { useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import { useRemoteList } from "@/lib/hooks/use-remote-list";

type CustomerRow = {
  id: string;
  name?: string | null;
  email: string;
  orders: number;
};

export default function CustomersTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { items, loading, totalPages, markLoading } = useRemoteList<CustomerRow>({
    endpoint: "/api/admin/customers",
    page,
    search,
  });

  const columns: DataTableColumn<CustomerRow>[] = [
    {
      key: "name",
      label: "Name",
      render: (row) => row.name ?? "—",
    },
    { key: "email", label: "Email" },
    { key: "orders", label: "Orders" },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Customers"
        description="View and manage customer accounts"
      />

      {loading ? (
        <p className="text-sm text-neutral-500">Loading customers...</p>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          searchPlaceholder="Search customers..."
          onSearch={(value) => {
            markLoading();
            setPage(1);
            setSearch(value);
          }}
          pagination={{
            page,
            totalPages,
            onPageChange: (nextPage) => {
              markLoading();
              setPage(nextPage);
            },
          }}
        />
      )}
    </div>
  );
}

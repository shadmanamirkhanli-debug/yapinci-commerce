"use client";

import { useState } from "react";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import { useRemoteList } from "@/lib/hooks/use-remote-list";

type OrderRow = {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: string;
  createdAt: string;
};

export default function OrdersTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { items, loading, totalPages, markLoading } = useRemoteList<OrderRow>({
    endpoint: "/api/admin/orders",
    page,
    search,
  });

  const columns: DataTableColumn<OrderRow>[] = [
    {
      key: "orderNumber",
      label: "Order",
      render: (row) => (
        <Link href={`/admin/orders/${row.id}`} className="hover:text-white">
          {row.orderNumber}
        </Link>
      ),
    },
    { key: "customer", label: "Customer" },
    {
      key: "total",
      label: "Total",
      render: (row) => `${row.total} AZN`,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className="rounded bg-neutral-800 px-2 py-1 text-xs">
          {row.status}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (row) => new Date(row.createdAt).toLocaleDateString("az-AZ"),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        description="Track and manage customer orders"
      />

      {loading ? (
        <p className="text-sm text-neutral-500">Loading orders...</p>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          searchPlaceholder="Search orders..."
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

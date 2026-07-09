"use client";

import { useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import { useRemoteList } from "@/lib/hooks/use-remote-list";

type CouponRow = {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  active: boolean;
  usedCount: number;
};

export default function CouponsTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { items, loading, totalPages, markLoading } = useRemoteList<CouponRow>({
    endpoint: "/api/admin/coupons",
    page,
    search,
  });

  const columns: DataTableColumn<CouponRow>[] = [
    { key: "code", label: "Code" },
    { key: "discountType", label: "Type" },
    {
      key: "discountValue",
      label: "Value",
      render: (row) => {
        if (row.discountType === "PERCENTAGE") return `${row.discountValue}%`;
        if (row.discountType === "FREE_SHIPPING") return "Free shipping";
        return `${row.discountValue} AZN`;
      },
    },
    { key: "usedCount", label: "Used" },
    {
      key: "active",
      label: "Status",
      render: (row) => (
        <span className="rounded bg-neutral-800 px-2 py-1 text-xs">
          {row.active ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Coupons"
        description="Manage discount codes"
      />

      {loading ? (
        <p className="text-sm text-neutral-500">Loading coupons...</p>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          searchPlaceholder="Search coupon codes..."
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

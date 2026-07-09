"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { adminFieldClass } from "@/lib/admin/styles";
import { useRemoteList } from "@/lib/hooks/use-remote-list";

type InventoryRow = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  reserved: number;
  available: number;
  lowStockAt: number;
};

export default function InventoryTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const extraParams = useMemo(
    () => ({ lowStock: lowStockOnly ? "true" : "" }),
    [lowStockOnly]
  );

  const { items, loading, totalPages, markLoading, refetch } =
    useRemoteList<InventoryRow>({
      endpoint: "/api/admin/inventory",
      page,
      search,
      limit: 20,
      extraParams,
    });

  const updateQuantity = async (id: string, quantity: number) => {
    await fetch("/api/admin/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, quantity }),
    });
    refetch();
  };

  const columns: DataTableColumn<InventoryRow>[] = [
    {
      key: "productName",
      label: "Product",
      render: (row) => (
        <Link
          href={`/admin/products/${row.productId}`}
          className="hover:text-white"
        >
          {row.productName}
        </Link>
      ),
    },
    { key: "sku", label: "SKU" },
    { key: "quantity", label: "Quantity" },
    { key: "reserved", label: "Reserved" },
    { key: "available", label: "Available" },
    {
      key: "lowStockAt",
      label: "Low Stock At",
      render: (row) => (
        <span
          className={
            row.quantity <= row.lowStockAt ? "text-amber-400" : "text-neutral-300"
          }
        >
          {row.lowStockAt}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Adjust",
      render: (row) => (
        <Input
          type="number"
          defaultValue={row.quantity}
          className={`${adminFieldClass} !h-9 !w-24`}
          onBlur={(event) =>
            updateQuantity(row.id, Number(event.target.value))
          }
        />
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Inventory"
        description="Track stock levels across variants"
        actions={
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              markLoading();
              setLowStockOnly((value) => !value);
            }}
            className="border-neutral-700 text-neutral-200"
          >
            {lowStockOnly ? "Show All" : "Low Stock Only"}
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-neutral-500">Loading inventory...</p>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          searchPlaceholder="Search SKU or product..."
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

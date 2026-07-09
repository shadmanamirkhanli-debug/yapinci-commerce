"use client";

import { useMemo, useState } from "react";
import Pagination from "@/components/ui/Pagination";
import { adminCardClass, adminTableClass, adminTableHeadClass } from "@/lib/admin/styles";

export type DataTableColumn<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
};

type DataTableProps<T extends { id: string }> = {
  columns: DataTableColumn<T>[];
  data: T[];
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  onSearch?: (value: string) => void;
  onSort?: (key: string) => void;
  sortKey?: string;
  sortOrder?: "asc" | "desc";
  selectedIds?: string[];
  onSelectChange?: (ids: string[]) => void;
  bulkActions?: React.ReactNode;
  emptyMessage?: string;
};

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  searchPlaceholder = "Search...",
  filters,
  pagination,
  onSearch,
  onSort,
  sortKey,
  sortOrder,
  selectedIds = [],
  onSelectChange,
  bulkActions,
  emptyMessage = "No records found",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const allSelected = data.length > 0 && selectedIds.length === data.length;

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const handleSearch = (value: string) => {
    setSearch(value);
    onSearch?.(value);
  };

  const toggleAll = () => {
    if (!onSelectChange) return;
    onSelectChange(allSelected ? [] : data.map((row) => row.id));
  };

  const toggleRow = (id: string) => {
    if (!onSelectChange) return;
    if (selectedSet.has(id)) {
      onSelectChange(selectedIds.filter((item) => item !== id));
    } else {
      onSelectChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-4">
      <div className={`${adminCardClass} p-4`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="search"
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 text-sm text-white placeholder:text-neutral-500 lg:max-w-sm"
          />
          {filters}
        </div>
        {selectedIds.length > 0 && bulkActions && (
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-neutral-800 pt-4">
            <span className="text-xs text-neutral-500">
              {selectedIds.length} selected
            </span>
            {bulkActions}
          </div>
        )}
      </div>

      <div className={`${adminCardClass} overflow-x-auto`}>
        <table className={adminTableClass}>
          <thead className={adminTableHeadClass}>
            <tr>
              {onSelectChange && (
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-neutral-600 bg-neutral-900"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-medium">
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => onSort?.(column.key)}
                      className="inline-flex items-center gap-1 hover:text-white"
                    >
                      {column.label}
                      {sortKey === column.key && (
                        <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onSelectChange ? 1 : 0)}
                  className="px-4 py-10 text-center text-neutral-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-neutral-800/80 hover:bg-neutral-900/50"
                >
                  {onSelectChange && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedSet.has(row.id)}
                        onChange={() => toggleRow(row.id)}
                        className="h-4 w-4 rounded border-neutral-600 bg-neutral-900"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3">
                      {column.render
                        ? column.render(row)
                        : String((row as Record<string, unknown>)[column.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
}

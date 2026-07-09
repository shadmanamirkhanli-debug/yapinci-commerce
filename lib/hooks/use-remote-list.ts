"use client";

import { useCallback, useEffect, useState } from "react";

type PaginatedResponse<T> = {
  items: T[];
  pagination: { totalPages: number };
};

type UseRemoteListOptions = {
  endpoint: string;
  page: number;
  search: string;
  limit?: number;
  extraParams?: Record<string, string>;
};

export function useRemoteList<T>({
  endpoint,
  page,
  search,
  limit = 10,
  extraParams = {},
}: UseRemoteListOptions) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const markLoading = useCallback(() => setLoading(true), []);

  const refetch = useCallback(() => {
    setLoading(true);
    setRefreshKey((current) => current + 1);
  }, []);

  const extraParamsKey = JSON.stringify(extraParams);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search,
    });

    for (const [key, value] of Object.entries(extraParams)) {
      if (value) params.set(key, value);
    }

    void (async () => {
      const response = await fetch(`${endpoint}?${params}`);
      if (cancelled) return;

      const result = await response.json();
      if (cancelled) return;

      if (result.success) {
        const data = result.data as PaginatedResponse<T>;
        setItems(data.items);
        setTotalPages(data.pagination.totalPages);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [endpoint, page, search, limit, extraParamsKey, refreshKey, extraParams]);

  return { items, loading, totalPages, markLoading, refetch };
}

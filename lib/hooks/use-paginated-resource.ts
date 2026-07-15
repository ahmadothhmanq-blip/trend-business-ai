"use client";

import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";

type PaginatedResult<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type UsePaginatedResourceOptions = {
  endpoint: string;
  dataKey: string;
  initialData?: unknown[];
  initialTotal?: number;
  limit?: number;
  /** Extra query params always appended (e.g. productId). */
  queryParams?: Record<string, string>;
};

export function usePaginatedResource<T>({
  endpoint,
  dataKey,
  initialData = [],
  initialTotal = 0,
  limit = 10,
  queryParams,
}: UsePaginatedResourceOptions) {
  const [items, setItems] = useState<T[]>(initialData as T[]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialTotal / limit) || 1);
  const [search, setSearch] = useState("");
  const [favoriteFilter, setFavoriteFilter] = useState<"" | "true" | "false">("");
  const [extraFilter, setExtraFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fetchItems = useCallback(
    async (nextPage = page, nextSearch = search, nextFavorite = favoriteFilter, nextExtra = extraFilter) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(nextPage),
          limit: String(limit),
        });
        if (nextSearch) params.set("search", nextSearch);
        if (nextFavorite) params.set("favorite", nextFavorite);
        if (nextExtra) {
          if (endpoint.includes("market-analysis")) params.set("industry", nextExtra);
          if (endpoint.includes("reports")) params.set("reportType", nextExtra);
        }
        if (queryParams) {
          for (const [key, value] of Object.entries(queryParams)) {
            if (value) params.set(key, value);
          }
        }

        const res = await fetch(`${endpoint}?${params.toString()}`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Failed to load data");
        }

        const result = json as Record<string, unknown> & PaginatedResult<T>;
        setItems((result[dataKey] as T[]) ?? []);
        setPage(result.page);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    },
    [endpoint, dataKey, page, search, favoriteFilter, extraFilter, limit, queryParams],
  );

  const refresh = useCallback(() => {
    startTransition(() => {
      void fetchItems(page, search, favoriteFilter, extraFilter);
    });
  }, [fetchItems, page, search, favoriteFilter, extraFilter]);

  const applyFilters = useCallback(
    (nextSearch: string, nextFavorite: "" | "true" | "false", nextExtra = extraFilter) => {
      setSearch(nextSearch);
      setFavoriteFilter(nextFavorite);
      setExtraFilter(nextExtra);
      setPage(1);
      void fetchItems(1, nextSearch, nextFavorite, nextExtra);
    },
    [extraFilter, fetchItems],
  );

  const goToPage = useCallback(
    (nextPage: number) => {
      setPage(nextPage);
      void fetchItems(nextPage, search, favoriteFilter, extraFilter);
    },
    [fetchItems, search, favoriteFilter, extraFilter],
  );

  return {
    items,
    page,
    total,
    totalPages,
    search,
    favoriteFilter,
    extraFilter,
    loading: loading || isPending,
    fetchItems,
    refresh,
    applyFilters,
    goToPage,
    setExtraFilter,
  };
}

export async function apiMutation(
  url: string,
  options: RequestInit,
  successMessage?: string,
) {
  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok) {
    toast.error(data.error || "Request failed");
    throw new Error(data.error || "Request failed");
  }

  if (successMessage || data.message) {
    toast.success(data.message || successMessage);
  }

  return data;
}

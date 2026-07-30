import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import { extractApiError, getUserErrorMessage } from "@/util/errorHandler";

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

export function usePaginatedSearch<T>(
  queryKey: string,
  queryFn: (params: Record<string, unknown>) => Promise<PaginatedResponse<T>>,
  filters: Record<string, unknown> = {},
  options: { pageSize?: number; debounceMs?: number } = {},
) {
  const { pageSize: defaultPageSize = 5, debounceMs = 500 } = options;

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, debounceMs);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPageIndex(0);
  };

  const query = useQuery({
    queryKey: [queryKey, { ...filters, search: debouncedSearch, pageIndex, pageSize }],
    queryFn: () =>
      queryFn({ ...filters, search: debouncedSearch, page: pageIndex, size: pageSize }),
    placeholderData: keepPreviousData,
  });

  const totalElements = query.data?.totalElements ?? 0;
  const pageCount = Math.ceil(totalElements / pageSize);

  return {
    data: query.data?.content ?? [],
    totalCount: totalElements,
    pageCount,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ? getUserErrorMessage(extractApiError(query.error)) : null,
    searchQuery,
    handleSearchChange,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    refresh: query.refetch,
  };
}

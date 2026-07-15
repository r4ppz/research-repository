import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getAdminDepartments } from "@/api/admin/departments";
import { extractApiError, getUserErrorMessage } from "@/util/errorHandler";

export function useAdminDepartments() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const query = useQuery({
    queryKey: ["adminDepartments", { pageIndex, pageSize }],
    queryFn: () => getAdminDepartments({ page: pageIndex, size: pageSize }),
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
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    refresh: query.refetch,
  };
}

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { type AdminUsersQueryParams, getAdminUsers } from "@/api/admin/users";
import { extractApiError, getUserErrorMessage } from "@/util/errorHandler";

export function useAdminUsers(params: AdminUsersQueryParams = {}) {
  const [pageIndex, setPageIndex] = useState(params.page ?? 0);
  const [pageSize, setPageSize] = useState(params.size ?? 20);

  const { search } = params;

  const query = useQuery({
    queryKey: ["adminUsers", { pageIndex, pageSize, search }],
    queryFn: () =>
      getAdminUsers({
        ...params,
        page: pageIndex,
        size: pageSize,
      }),
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

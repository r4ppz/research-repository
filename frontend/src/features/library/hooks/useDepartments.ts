import { useQuery } from "@tanstack/react-query";
import { getDepartments } from "@/api/filter";
import type { Department } from "@/types";
import { extractApiError, getUserErrorMessage } from "@/util/errorHandler";

interface UseDepartmentsReturn {
  departments: Department[];
  loading: boolean;
  error: string | null;
}

export const useDepartments = (): UseDepartmentsReturn => {
  const query = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
    staleTime: 1000 * 60 * 30,
  });

  return {
    departments: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? getUserErrorMessage(extractApiError(query.error)) : null,
  };
};

import { useQuery } from "@tanstack/react-query";
import { getYears } from "@/api/filter";
import { extractApiError, getUserErrorMessage } from "@/util/errorHandler";

interface UseYearsReturn {
  years: string[];
  loading: boolean;
  error: string | null;
}

export const useYears = (): UseYearsReturn => {
  const query = useQuery({
    queryKey: ["years"],
    queryFn: async () => {
      const result = await getYears();
      return result.map(String);
    },
    staleTime: 1000 * 60 * 30,
  });

  return {
    years: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? getUserErrorMessage(extractApiError(query.error)) : null,
  };
};

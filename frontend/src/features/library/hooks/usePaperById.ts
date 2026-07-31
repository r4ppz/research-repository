import { useQuery } from "@tanstack/react-query";
import { getPaperById } from "@/api/paper";
import type { ResearchPaper } from "@/types";
import { extractApiError, getUserErrorMessage } from "@/util/errorHandler";

interface UsePaperByIdReturn {
  paper: ResearchPaper | null;
  loading: boolean;
  error: string | null;
}

export const usePaperById = (id: number | null): UsePaperByIdReturn => {
  const query = useQuery({
    queryKey: ["paper", id],
    queryFn: () => {
      if (id === null) throw new Error("ID is required");
      return getPaperById(id);
    },
    enabled: id !== null,
  });

  return {
    paper: query.data ?? null,
    loading: query.isLoading,
    error: query.error ? getUserErrorMessage(extractApiError(query.error)) : null,
  };
};

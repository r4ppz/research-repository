import { useMemo } from "react";
import { type DocumentRequest } from "@/types";

export function useRequestFilter(
  searchQuery: string,
  selectedDepartment: string | null,
  selectedYear: string | null,
  requests: DocumentRequest[],
): DocumentRequest[] {
  return useMemo(() => {
    return requests.filter((request) => {
      const matchesTitle = request.paper.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment =
        !selectedDepartment || request.paper.department.departmentName === selectedDepartment;
      const matchesYear = !selectedYear || request.requestDate.startsWith(selectedYear);
      return matchesTitle && matchesDepartment && matchesYear;
    });
  }, [requests, searchQuery, selectedDepartment, selectedYear]);
}

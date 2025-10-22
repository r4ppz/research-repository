import { useMemo } from "react";
import { type DocumentRequest } from "@/types";

export function useRequestFilter(
  searchQuery: string,
  selectedDepartment: string | null,
  selectedDate: string | null, // Changed from selectedYear to selectedDate
  requests: DocumentRequest[],
): DocumentRequest[] {
  return useMemo(() => {
    return requests.filter((request) => {
      const matchesTitle = request.paper.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment =
        !selectedDepartment || request.paper.department.departmentName === selectedDepartment;
      const matchesDate = !selectedDate || request.requestDate.startsWith(selectedDate);
      return matchesTitle && matchesDepartment && matchesDate;
    });
  }, [requests, searchQuery, selectedDepartment, selectedDate]);
}

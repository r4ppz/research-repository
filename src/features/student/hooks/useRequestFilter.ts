import { useMemo } from "react";
import { type DocumentRequest } from "@/types";

/**
 * Custom hook for filtering document requests based on search query, department, and date
 * @param searchQuery The search query to filter requests by paper title
 * @param selectedDepartment The department to filter requests by
 * @param selectedDate The date to filter requests by
 * @param requests The array of requests to filter
 * @returns Filtered array of document requests
 */
export function useRequestFilter(
  searchQuery: string,
  selectedDepartment: string | null,
  selectedDate: string | null,
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

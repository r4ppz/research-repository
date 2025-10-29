import { useMemo } from "react";
import { DocumentRequest } from "@/types";

interface UseMultiFilterRequestOptions {
  searchQuery: string;
  selectedDepartment?: string | null;
  selectedDate?: string | null;
  selectedYear?: string | null;
}

/**
 * Custom hook for filtering document requests based on multiple criteria
 * @param requests The array of requests to filter
 * @param options Filter options including search query, department, date, year
 * @returns Filtered array of document requests
 */
export const useMultiFilterRequest = (
  requests: DocumentRequest[],
  options: UseMultiFilterRequestOptions,
): DocumentRequest[] => {
  const { searchQuery, selectedDepartment, selectedDate, selectedYear } = options;

  return useMemo(() => {
    return requests.filter((request) => {
      // Search filter: check title or author
      const matchesSearch =
        !searchQuery ||
        request.paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.paper.authorName.toLowerCase().includes(searchQuery.toLowerCase());

      // Department filter
      const matchesDepartment =
        !selectedDepartment || request.paper.department.departmentName === selectedDepartment;

      // Date filter
      const matchesDate =
        !selectedDate || request.requestDate.startsWith(selectedDate.substring(0, 10)); // Compare date part only

      // Year filter
      const matchesYear = !selectedYear || request.paper.submissionDate.startsWith(selectedYear);

      // All conditions must match
      return matchesSearch && matchesDepartment && matchesDate && matchesYear;
    });
  }, [requests, searchQuery, selectedDepartment, selectedDate, selectedYear]);
};

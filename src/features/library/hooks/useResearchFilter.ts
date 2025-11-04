import { useMemo } from "react";
import { type ResearchPaper } from "@/types";

/**
 * Custom hook for filtering research papers based on search query, department, and year
 * @param searchQuery The search query to filter papers by title
 * @param selectedDepartment The department to filter papers by
 * @param selectedYear The year to filter papers by
 * @param mockPapers The array of papers to filter
 * @returns Filtered array of research papers
 */
export function useResearchFilter(
  searchQuery: string,
  selectedDepartment: string | null,
  selectedYear: string | null,
  mockPapers: ResearchPaper[],
): ResearchPaper[] {
  return useMemo(() => {
    return mockPapers.filter((paper) => {
      const matchesTitle = paper.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment =
        !selectedDepartment || paper.department.departmentName === selectedDepartment;
      const matchesYear = !selectedYear || paper.submissionDate.startsWith(selectedYear);
      return matchesTitle && matchesDepartment && matchesYear;
    });
  }, [mockPapers, searchQuery, selectedDepartment, selectedYear]);
}

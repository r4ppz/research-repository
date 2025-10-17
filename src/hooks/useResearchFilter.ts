import { useMemo } from "react";
import { type ResearchPaper } from "@/types";

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

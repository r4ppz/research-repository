import { useMemo } from "react";
import { MOCK_PAPERS } from "@/mocks/mockData";
import { type ResearchPaper } from "@/types";

export function useSearchAndFilter(
  searchQuery: string,
  selectedDepartment: string | null,
  selectedYear: string | null,
): ResearchPaper[] {
  return useMemo(() => {
    return MOCK_PAPERS.filter((paper) => {
      const matchesTitle = paper.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment =
        !selectedDepartment || paper.department.departmentName === selectedDepartment;
      const matchesYear = !selectedYear || paper.submissionDate.startsWith(selectedYear);
      return matchesTitle && matchesDepartment && matchesYear;
    });
  }, [searchQuery, selectedDepartment, selectedYear]);
}

import { useMemo } from "react";
import { ResearchPaper } from "@/types";

/**
 * Custom hook for filtering research papers based on various criteria
 * @param papers The array of papers to filter
 * @param options Filter options including search query, department, year
 * @returns Filtered array of research papers
 */
export const usePaperFilter = (
  papers: ResearchPaper[],
  options: {
    searchQuery: string;
    selectedDepartment?: string | null;
    selectedYear?: string | null;
  },
): ResearchPaper[] => {
  const { searchQuery, selectedDepartment, selectedYear } = options;

  return useMemo(() => {
    return papers.filter((paper) => {
      // Search filter: check title or author
      const matchesSearch =
        !searchQuery ||
        paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.authorName.toLowerCase().includes(searchQuery.toLowerCase());

      // Department filter
      const matchesDepartment =
        !selectedDepartment || paper.department.departmentName === selectedDepartment;

      // Year filter
      const matchesYear = !selectedYear || paper.submissionDate.startsWith(selectedYear);

      // All conditions must match
      return matchesSearch && matchesDepartment && matchesYear;
    });
  }, [papers, searchQuery, selectedDepartment, selectedYear]);
};

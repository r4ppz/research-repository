import { useEffect, useState } from "react";
import { type ResearchPaper } from "@/types";
import { type Page } from "@/types/api";

/**
 * Custom hook for pagination logic
 * Takes data, current page, and items per page and returns a page object with content and metadata
 * @param data The array of data to paginate
 * @param currentPage The current page number (0-indexed)
 * @param itemsPerPage The number of items to display per page
 * @returns Page object with content and pagination metadata, or null if no data
 */
export function usePagination(
  data: ResearchPaper[],
  currentPage: number,
  itemsPerPage: number,
): Page<ResearchPaper> | null {
  const [pageData, setPageData] = useState<Page<ResearchPaper> | null>(null);

  useEffect(() => {
    const totalElements = data.length;
    const totalPages = Math.ceil(totalElements / itemsPerPage);
    const startIndex = currentPage * itemsPerPage;
    const content = data.slice(startIndex, startIndex + itemsPerPage);

    const simulatedPage: Page<ResearchPaper> = {
      content,
      totalElements,
      totalPages,
      number: currentPage,
      size: itemsPerPage,
    };

    setPageData(simulatedPage);
  }, [data, currentPage, itemsPerPage]);

  return pageData;
}

import { useEffect, useState } from "react";
import { type ResearchPaper } from "@/types";
import { type Page } from "@/types/api";

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

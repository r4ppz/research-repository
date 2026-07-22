import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getMySubmissions } from "@/api/paper";
import { DataTable } from "@/components/common/DataTable/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { ResearchModal } from "@/components/layout/ResearchModal/ResearchModal";
import type { ResearchPaper } from "@/types";
import { extractApiError, getUserErrorMessage } from "@/util/errorHandler";

export function StudentSubmissionTable() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);

  const query = useQuery({
    queryKey: ["mySubmissions", { pageIndex, pageSize }],
    queryFn: () => getMySubmissions({ page: pageIndex, size: pageSize }),
    placeholderData: keepPreviousData,
  });

  const totalElements = query.data?.totalElements ?? 0;
  const pageCount = query.data?.totalPages ?? Math.ceil(totalElements / pageSize);

  if (query.isLoading) {
    return <LoadingSpinner message="Loading your submissions..." />;
  }

  if (query.error) {
    return <p>Failed to load: {getUserErrorMessage(extractApiError(query.error))}</p>;
  }

  const statusBadge = (status?: string) => {
    switch (status) {
      case "PENDING_REVIEW":
        return "Pending Review";
      case "REJECTED":
        return "Rejected";
      case "ACTIVE":
        return "Approved";
      default:
        return status ?? "Unknown";
    }
  };

  const data = (query.data?.content ?? []).map((paper) => ({
    ...paper,
    statusLabel: statusBadge(paper.status),
  }));

  const columns = [
    { header: "Title", accessorKey: "title" },
    { header: "Author", accessorKey: "authorName" },
    { header: "Department", accessorKey: "department.departmentName" },
    { header: "Status", accessorKey: "statusLabel" },
    {
      header: "",
      id: "actions",
      cell: ({ row }: { row: { original: ResearchPaper } }) => (
        <button
          onClick={() => {
            setSelectedPaper(row.original);
          }}
        >
          View
        </button>
      ),
    },
  ];

  return (
    <>
      <DataTable
        caption="My Submissions"
        columns={columns}
        data={data}
        pageCount={pageCount}
        pagination={{ pageIndex, pageSize }}
        onPaginationChange={(updater) => {
          const nextState =
            typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater;
          setPageIndex(nextState.pageIndex);
          setPageSize(nextState.pageSize);
        }}
      />

      <ResearchModal
        isOpen={!!selectedPaper}
        paper={selectedPaper}
        onClose={() => {
          setSelectedPaper(null);
        }}
      />
    </>
  );
}

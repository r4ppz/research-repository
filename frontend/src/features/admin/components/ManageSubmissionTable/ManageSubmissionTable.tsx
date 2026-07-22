import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { approveSubmission, getAdminPapers, rejectSubmission } from "@/api/admin/papers";
import { DataTable } from "@/components/common/DataTable/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { toastQueue } from "@/components/common/Toast/Toast";
import { ResearchModal } from "@/components/layout/ResearchModal/ResearchModal";
import type { ResearchPaper } from "@/types";
import { extractApiError, getUserErrorMessage } from "@/util/errorHandler";

interface ManageSubmissionTableProps {
  showDepartment?: boolean;
}

export function ManageSubmissionTable({ showDepartment = true }: ManageSubmissionTableProps) {
  const queryClient = useQueryClient();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);

  const query = useQuery({
    queryKey: ["adminPapers", { status: "PENDING_REVIEW", pageIndex, pageSize }],
    queryFn: () => getAdminPapers({ status: "PENDING_REVIEW", page: pageIndex, size: pageSize }),
  });

  const approveMutation = useMutation({
    mutationFn: (paperId: number) => approveSubmission(paperId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminPapers"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (paperId: number) => rejectSubmission(paperId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminPapers"] });
    },
  });

  const totalElements = query.data?.totalElements ?? 0;
  const pageCount = query.data?.totalPages ?? Math.ceil(totalElements / pageSize);

  if (query.isLoading) {
    return <LoadingSpinner message="Loading submissions..." />;
  }

  if (query.error) {
    return <p>Failed to load: {getUserErrorMessage(extractApiError(query.error))}</p>;
  }

  const data = (query.data?.content ?? []).map((paper) => ({
    ...paper,
    submittedBy: paper.uploadedBy?.fullName ?? "Unknown",
  }));

  const baseColumns = [
    { header: "Paper Title", accessorKey: "title" },
    { header: "Author", accessorKey: "authorName" },
    { header: "Submitted By", accessorKey: "submittedBy" },
    ...(showDepartment ? [{ header: "Department", accessorKey: "department.departmentName" }] : []),
    { header: "Date Submitted", accessorKey: "submissionDate" },
    {
      header: "",
      id: "actions",
      cell: ({ row }: { row: { original: ResearchPaper } }) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => {
              setSelectedPaper(row.original);
            }}
          >
            View
          </button>
          <button
            onClick={() => {
              rejectMutation.mutate(row.original.paperId, {
                onSuccess: () => {
                  toastQueue.add({
                    variant: "success",
                    title: "Submission Rejected",
                    description: "Submission rejected.",
                  });
                },
                onError: (error) => {
                  toastQueue.add({
                    variant: "error",
                    title: "Reject Failed",
                    description: getUserErrorMessage(extractApiError(error)),
                  });
                },
              });
            }}
          >
            Reject
          </button>
          <button
            onClick={() => {
              approveMutation.mutate(row.original.paperId, {
                onSuccess: () => {
                  toastQueue.add({
                    variant: "success",
                    title: "Submission Approved",
                    description: "Paper is now live.",
                  });
                },
                onError: (error) => {
                  toastQueue.add({
                    variant: "error",
                    title: "Approve Failed",
                    description: getUserErrorMessage(extractApiError(error)),
                  });
                },
              });
            }}
          >
            Approve
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        caption="Paper Submissions"
        columns={baseColumns}
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

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { deleteSubmission, getMySubmissions } from "@/api/paper";
import { DataTable } from "@/components/common/DataTable/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { ActionButton, ActionConfirm, TableActions } from "@/components/common/TableActions";
import { toastQueue } from "@/components/common/Toast/Toast";
import { ResearchModal } from "@/components/layout/ResearchModal/ResearchModal";
import { PaperUploadModal } from "@/features/student/components/PaperUploadModal/PaperUploadModal";
import type { ResearchPaper } from "@/types";
import { extractApiError, getUserErrorMessage } from "@/util/errorHandler";

export const StudentSubmissionTable = () => {
  const queryClient = useQueryClient();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [editPaper, setEditPaper] = useState<ResearchPaper | null>(null);
  const [viewPaper, setViewPaper] = useState<ResearchPaper | null>(null);

  const query = useQuery({
    queryKey: ["mySubmissions", { pageIndex, pageSize }],
    queryFn: () => getMySubmissions({ page: pageIndex, size: pageSize }),
  });

  const deleteMutation = useMutation({
    mutationFn: (paperId: number) => deleteSubmission(paperId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["mySubmissions"] });
      toastQueue.add({
        variant: "success",
        title: "Submission Deleted",
        description: "Your submission has been deleted.",
      });
    },
    onError: (error: unknown) => {
      toastQueue.add({
        variant: "error",
        title: "Delete Failed",
        description: getUserErrorMessage(extractApiError(error)),
      });
    },
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

  const columns = [
    { header: "Paper Title", accessorKey: "title" },
    { header: "Author", accessorKey: "authorName" },
    { header: "Department", accessorKey: "department.departmentName" },
    { header: "Request Date", accessorKey: "submissionDate" },
    {
      header: "Status",
      id: "statusDisplay",
      cell: ({ row }: { row: { original: ResearchPaper } }) => statusBadge(row.original.status),
    },
    {
      header: "",
      id: "actions",
      cell: ({ row }: { row: { original: ResearchPaper } }) => (
        <TableActions>
          <ActionButton label="View" onPress={() => setViewPaper(row.original)} />
          {row.original.status === "PENDING_REVIEW" && (
            <>
              <ActionButton label="Edit" onPress={() => setEditPaper(row.original)} />
              <ActionConfirm
                label="Delete"
                confirmTitle="Delete Submission"
                confirmDescription="Are you sure you want to delete this submission? This action cannot be undone."
                confirmText="Delete"
                onConfirm={() => deleteMutation.mutate(row.original.paperId)}
              />
            </>
          )}
        </TableActions>
      ),
    },
  ];

  return (
    <>
      <DataTable
        caption="My Submissions"
        columns={columns}
        data={query.data?.content ?? []}
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
        isOpen={!!viewPaper}
        paper={viewPaper}
        onClose={() => {
          setViewPaper(null);
        }}
      />

      <PaperUploadModal
        isOpen={!!editPaper}
        paper={editPaper}
        onClose={() => {
          setEditPaper(null);
        }}
        onSuccess={() => {
          void queryClient.invalidateQueries({ queryKey: ["mySubmissions"] });
        }}
      />
    </>
  );
};

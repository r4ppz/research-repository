import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { approveSubmission, getAdminPapers, rejectSubmission } from "@/api/admin/papers";
import { DataTable } from "@/components/common/DataTable/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { ActionButton, ActionConfirm, TableActions } from "@/components/common/TableActions";
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
  const [pendingId, setPendingId] = useState<number | null>(null);

  const query = useQuery({
    queryKey: ["adminPapers", { status: "PENDING_REVIEW", pageIndex, pageSize }],
    queryFn: () => getAdminPapers({ status: "PENDING_REVIEW", page: pageIndex, size: pageSize }),
  });

  const approveMutation = useMutation({
    mutationFn: (paperId: number) => approveSubmission(paperId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminPapers"] });
      toastQueue.add({
        variant: "success",
        title: "Submission Approved",
        description: "Paper is now live.",
      });
    },
    onError: (error: unknown) => {
      toastQueue.add({
        variant: "error",
        title: "Approve Failed",
        description: getUserErrorMessage(extractApiError(error)),
      });
    },
    onSettled: () => setPendingId(null),
  });

  const rejectMutation = useMutation({
    mutationFn: (paperId: number) => rejectSubmission(paperId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminPapers"] });
      toastQueue.add({
        variant: "success",
        title: "Submission Rejected",
        description: "Submission rejected.",
      });
    },
    onError: (error: unknown) => {
      toastQueue.add({
        variant: "error",
        title: "Reject Failed",
        description: getUserErrorMessage(extractApiError(error)),
      });
    },
    onSettled: () => setPendingId(null),
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
      cell: ({ row }: { row: { original: ResearchPaper } }) => {
        const id = row.original.paperId;
        const isLoading = pendingId === id;

        return (
          <TableActions>
            <ActionButton label="View" onPress={() => setSelectedPaper(row.original)} />
            <ActionConfirm
              label="Reject"
              isPending={isLoading}
              confirmTitle="Reject submission?"
              confirmDescription="Are you sure you want to reject this paper submission?"
              confirmText="Reject"
              onConfirm={() => {
                setPendingId(id);
                rejectMutation.mutate(id);
              }}
            />
            <ActionConfirm
              label="Approve"
              isPending={isLoading}
              confirmTitle="Approve submission?"
              confirmDescription="Are you sure you want to approve this paper? It will be made public."
              confirmText="Approve"
              onConfirm={() => {
                setPendingId(id);
                approveMutation.mutate(id);
              }}
            />
          </TableActions>
        );
      },
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

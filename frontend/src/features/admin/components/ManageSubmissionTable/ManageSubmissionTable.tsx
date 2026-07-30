import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getColumns, type TableMeta } from "./columns";
import { approveSubmission, getAdminPapers, rejectSubmission } from "@/api/admin/papers";
import { ConfirmDialog } from "@/components/common/ConfirmDialog/ConfirmDialog";
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
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "approve" | "reject";
    paperId: number;
  } | null>(null);

  const query = useQuery({
    queryKey: ["adminPapers", { status: "PENDING_REVIEW", pageIndex, pageSize }],
    queryFn: () => getAdminPapers({ status: "PENDING_REVIEW", page: pageIndex, size: pageSize }),
  });

  const approveMutation = useMutation({
    mutationFn: (paperId: number) => approveSubmission(paperId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminPapers"] });
      void queryClient.invalidateQueries({ queryKey: ["papers"] });
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
    onSettled: () => {
      setPendingId(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (paperId: number) => rejectSubmission(paperId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminPapers"] });
      void queryClient.invalidateQueries({ queryKey: ["papers"] });
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
    onSettled: () => {
      setPendingId(null);
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

  const handleConfirm = () => {
    if (!confirmAction) return;
    setPendingId(confirmAction.paperId);
    if (confirmAction.type === "approve") {
      approveMutation.mutate(confirmAction.paperId);
    } else {
      rejectMutation.mutate(confirmAction.paperId);
    }
    setConfirmAction(null);
  };

  const tableMeta: TableMeta = {
    onView: (paper) => {
      setSelectedPaper(paper);
    },
    onApprove: (paperId) => {
      setConfirmAction({ type: "approve", paperId });
    },
    onReject: (paperId) => {
      setConfirmAction({ type: "reject", paperId });
    },
    pendingId,
  };

  return (
    <>
      <DataTable
        caption="Paper Submissions"
        columns={getColumns(showDepartment)}
        data={query.data?.content ?? []}
        pageCount={pageCount}
        pagination={{ pageIndex, pageSize }}
        onPaginationChange={(updater) => {
          const nextState =
            typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater;
          setPageIndex(nextState.pageIndex);
          setPageSize(nextState.pageSize);
        }}
        meta={tableMeta}
      />

      <ResearchModal
        isOpen={!!selectedPaper}
        paper={selectedPaper}
        onClose={() => {
          setSelectedPaper(null);
        }}
      />

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
        title={confirmAction?.type === "approve" ? "Approve submission?" : "Reject submission?"}
        description={
          confirmAction?.type === "approve"
            ? "Are you sure you want to approve this paper? It will be made public."
            : "Are you sure you want to reject this paper submission?"
        }
        confirmText={confirmAction?.type === "approve" ? "Approve" : "Reject"}
        onConfirm={handleConfirm}
      />
    </>
  );
}

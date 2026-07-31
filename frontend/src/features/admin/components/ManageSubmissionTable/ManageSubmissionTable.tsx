import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { getColumns, type TableMeta } from "./columns";
import styles from "./ManageSubmissionTable.module.css";
import { approveSubmission, getAdminPapers, rejectSubmission } from "@/api/admin/papers";
import { ConfirmDialog } from "@/components/common/ConfirmDialog/ConfirmDialog";
import { DataTable } from "@/components/common/DataTable/DataTable";
import { Input } from "@/components/common/Input/Input";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { toastQueue } from "@/components/common/Toast/Toast";
import { ResearchModal } from "@/components/layout/ResearchModal/ResearchModal";
import { usePaginatedSearch } from "@/hooks/usePaginatedSearch";
import type { ResearchPaper } from "@/types";
import { extractApiError, getUserErrorMessage } from "@/util/errorHandler";

interface ManageSubmissionTableProps {
  showDepartment?: boolean;
}

export function ManageSubmissionTable({ showDepartment = true }: ManageSubmissionTableProps) {
  const queryClient = useQueryClient();
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "approve" | "reject";
    paperId: number;
  } | null>(null);

  const {
    data,
    pageIndex,
    pageSize,
    pageCount,
    isLoading,
    error,
    searchQuery,
    handleSearchChange,
    setPageIndex,
    setPageSize,
  } = usePaginatedSearch("adminPapers", getAdminPapers, { status: "PENDING_REVIEW" });

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

  if (isLoading && data.length === 0) {
    return <LoadingSpinner message="Loading submissions..." />;
  }

  if (error) {
    return <p>Failed to load: {error}</p>;
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
      <div className={styles.searchWrapper}>
        <Input
          icon={Search}
          type="search"
          placeholder="Search by title, author, or abstract..."
          value={searchQuery}
          onChange={(e) => {
            handleSearchChange(e.target.value);
          }}
        />
      </div>
      <DataTable
        caption="Paper Submissions"
        columns={getColumns(showDepartment)}
        data={data}
        pageCount={pageCount}
        pagination={{ pageIndex, pageSize }}
        onPaginationChange={(updater) => {
          const nextState =
            typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater;
          setPageIndex(nextState.pageIndex);
          setPageSize(nextState.pageSize);
        }}
        meta={tableMeta}
        emptyMessage={searchQuery ? "No submissions match your search." : undefined}
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

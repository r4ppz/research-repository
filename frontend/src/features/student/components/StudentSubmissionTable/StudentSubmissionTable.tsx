import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { columns, type TableMeta } from "./columns";
import styles from "./StudentSubmissionTable.module.css";
import { deleteSubmission, getMySubmissions } from "@/api/paper";
import { ConfirmDialog } from "@/components/common/ConfirmDialog/ConfirmDialog";
import { DataTable } from "@/components/common/DataTable/DataTable";
import { Input } from "@/components/common/Input/Input";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { toastQueue } from "@/components/common/Toast/Toast";
import { ResearchModal } from "@/components/layout/ResearchModal/ResearchModal";
import { PaperUploadModal } from "@/features/student/components/PaperUploadModal/PaperUploadModal";
import { usePaginatedSearch } from "@/hooks/usePaginatedSearch";
import type { ResearchPaper } from "@/types";
import { extractApiError, getUserErrorMessage } from "@/util/errorHandler";

export const StudentSubmissionTable = () => {
  const queryClient = useQueryClient();
  const [editPaper, setEditPaper] = useState<ResearchPaper | null>(null);
  const [viewPaper, setViewPaper] = useState<ResearchPaper | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete";
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
  } = usePaginatedSearch("mySubmissions", getMySubmissions);

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

  if (isLoading && data.length === 0) {
    return <LoadingSpinner message="Loading your submissions..." />;
  }

  if (error) {
    return <p>Failed to load: {error}</p>;
  }

  const handleConfirm = () => {
    if (!confirmAction) return;
    deleteMutation.mutate(confirmAction.paperId);
    setConfirmAction(null);
  };

  const tableMeta: TableMeta = {
    onView: (paper) => {
      setViewPaper(paper);
    },
    onEdit: (paper) => {
      setEditPaper(paper);
    },
    onDelete: (paperId) => {
      setConfirmAction({ type: "delete", paperId });
    },
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
        meta={tableMeta}
        emptyMessage={searchQuery ? "No submissions match your search." : undefined}
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

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
        title="Delete Submission"
        description="Are you sure you want to delete this submission? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleConfirm}
      />
    </>
  );
};

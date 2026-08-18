import { Search } from "lucide-react";
import { useState } from "react";
import { useAcceptRequest, useRejectRequest } from "../../hooks/useAdminRequestMutations";
import { columns, columnsWithoutDepartment, type TableMeta } from "./columns";
import requestTableStyle from "./RequestTable.module.css";
import { getAdminRequests } from "@/api/admin/requests";
import { ConfirmDialog } from "@/components/common/ConfirmDialog/ConfirmDialog";
import { DataTable } from "@/components/common/DataTable/DataTable";
import { Input } from "@/components/common/Input/Input";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { toastQueue } from "@/components/common/Toast/Toast";
import { ResearchModal } from "@/components/layout/ResearchModal/ResearchModal";
import { usePaginatedSearch } from "@/hooks/usePaginatedSearch";
import type { ResearchPaper } from "@/types";
import { extractApiError, getUserErrorMessage } from "@/util/errorHandler";

interface RequestsTableProps {
  showDepartment?: boolean;
}

export function RequestsTable({ showDepartment = true }: RequestsTableProps) {
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "accept" | "reject";
    requestId: number;
  } | null>(null);

  const {
    data,
    pageCount,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    isLoading,
    error,
    searchQuery,
    handleSearchChange,
  } = usePaginatedSearch("adminRequests", getAdminRequests, { status: "PENDING" });

  const acceptMutation = useAcceptRequest();
  const rejectMutation = useRejectRequest();

  const handleConfirm = () => {
    if (!confirmAction) return;
    const { type, requestId } = confirmAction;
    if (type === "accept") {
      acceptMutation.mutate(requestId, {
        onSuccess: () =>
          toastQueue.add({
            variant: "success",
            title: "Request Accepted",
            description: "Request accepted.",
          }),
        onError: (error) =>
          toastQueue.add({
            variant: "error",
            title: "Accept Failed",
            description: getUserErrorMessage(extractApiError(error)),
          }),
      });
    } else {
      rejectMutation.mutate(requestId, {
        onSuccess: () =>
          toastQueue.add({
            variant: "success",
            title: "Request Rejected",
            description: "Request rejected.",
          }),
        onError: (error) =>
          toastQueue.add({
            variant: "error",
            title: "Reject Failed",
            description: getUserErrorMessage(extractApiError(error)),
          }),
      });
    }
    setConfirmAction(null);
  };

  const tableMeta: TableMeta = {
    onView: (paper) => {
      setSelectedPaper(paper);
    },
    onReject: (requestId) => {
      setConfirmAction({ type: "reject", requestId });
    },
    onAccept: (requestId) => {
      setConfirmAction({ type: "accept", requestId });
    },
    pendingAcceptId: acceptMutation.isPending ? acceptMutation.variables : null,
    pendingRejectId: rejectMutation.isPending ? rejectMutation.variables : null,
  };

  const tableColumns = showDepartment ? columns : columnsWithoutDepartment;

  if (isLoading) {
    return <LoadingSpinner message="Loading requests..." />;
  }

  if (error) {
    return <p>Failed to load: {error}</p>;
  }

  return (
    <>
      <div className={requestTableStyle.searchWrapper}>
        <Input
          icon={Search}
          type="search"
          placeholder="Search by title, author, or requester..."
          value={searchQuery}
          onChange={(e) => {
            handleSearchChange(e.target.value);
          }}
        />
      </div>
      <DataTable
        caption="Document Requests"
        columns={tableColumns}
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
        emptyMessage={searchQuery ? "No requests match your search." : undefined}
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
        title={
          confirmAction?.type === "accept" ? "Accept document request?" : "Reject document request?"
        }
        description={
          confirmAction?.type === "accept"
            ? "Are you sure you want to accept this document request? The requester will be granted access."
            : "Are you sure you want to reject this document request? This action cannot be undone."
        }
        confirmText={confirmAction?.type === "accept" ? "Accept" : "Reject"}
        onConfirm={handleConfirm}
      />
    </>
  );
}

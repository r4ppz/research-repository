import { useState } from "react";
import { useAdminRequests } from "../../hooks/useAdminDocumentRequest";
import { useAcceptRequest, useRejectRequest } from "../../hooks/useAdminRequestMutations";
import { columns, columnsWithoutDepartment, type TableMeta } from "./columns";
import { DataTable } from "@/components/common/DataTable/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { NotificationDialog } from "@/components/common/NotificationDialog/NotificationDialog";
import { ResearchModal } from "@/components/layout/ResearchModal/ResearchModal";
import type { ResearchPaper } from "@/types";
import { extractApiError, getUserErrorMessage } from "@/util/errorHandler";

interface RequestsTableProps {
  showDepartment?: boolean;
}

export function RequestsTable({ showDepartment = true }: RequestsTableProps) {
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const { data, pageIndex, pageSize, pageCount, setPageIndex, setPageSize, isLoading, error } =
    useAdminRequests({ status: "PENDING" });

  const acceptMutation = useAcceptRequest();
  const rejectMutation = useRejectRequest();

  const tableMeta: TableMeta = {
    onView: (paper) => {
      setSelectedPaper(paper);
    },
    onReject: (requestId) => {
      rejectMutation.mutate(requestId, {
        onError: (error) => {
          setNotification({
            type: "error",
            title: "Error",
            message: getUserErrorMessage(extractApiError(error)),
          });
        },
      });
    },
    onAccept: (requestId) => {
      acceptMutation.mutate(requestId, {
        onError: (error) => {
          setNotification({
            type: "error",
            title: "Error",
            message: getUserErrorMessage(extractApiError(error)),
          });
        },
      });
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
      />

      <ResearchModal
        isOpen={!!selectedPaper}
        paper={selectedPaper}
        onClose={() => {
          setSelectedPaper(null);
        }}
      />

      <NotificationDialog
        open={!!notification}
        onClose={() => {
          setNotification(null);
        }}
        type={notification?.type ?? "error"}
        title={notification?.title ?? ""}
        description={notification?.message ?? ""}
      />
    </>
  );
}

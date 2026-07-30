import { useState } from "react";
import { Search } from "lucide-react";
import {
  useArchivePaper,
  useDeletePaper,
  useUnarchivePaper,
} from "../../hooks/useAdminPaperActions";
import { usePaginatedSearch } from "@/hooks/usePaginatedSearch";
import { EditPaperModal } from "../EditPaperModal/EditPaperModal";
import {
  columnsActive,
  columnsActiveWithoutDepartment,
  columnsArchived,
  columnsArchivedWithoutDepartment,
  type TableMeta,
} from "./columns";
import papersTableStyle from "./PapersTable.module.css";
import { getAdminPapers } from "@/api/admin/papers";
import { ConfirmDialog } from "@/components/common/ConfirmDialog/ConfirmDialog";
import { DataTable } from "@/components/common/DataTable/DataTable";
import { Input } from "@/components/common/Input/Input";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { toastQueue } from "@/components/common/Toast/Toast";
import { ResearchModal } from "@/components/layout/ResearchModal/ResearchModal";
import type { ResearchPaper } from "@/types";

interface PapersTableProps {
  archived: boolean;
  showDepartment?: boolean;
}

export function PapersTable({ archived, showDepartment = true }: PapersTableProps) {
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [editingPaper, setEditingPaper] = useState<ResearchPaper | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "archive" | "restore" | "delete";
    paperId: number;
  } | null>(null);

  const { data, pageCount, pageIndex, pageSize, setPageIndex, setPageSize, isLoading, error, searchQuery, handleSearchChange } =
    usePaginatedSearch("adminPapers", getAdminPapers, { archived });

  const archiveMutation = useArchivePaper();
  const unarchiveMutation = useUnarchivePaper();
  const deleteMutation = useDeletePaper();

  const handleConfirm = () => {
    if (!confirmAction) return;
    const { type, paperId } = confirmAction;

    const toastSuccess = (title: string, description: string) => {
      toastQueue.add({ variant: "success", title, description });
    };
    const toastError = (title: string, description: string) => {
      toastQueue.add({ variant: "error", title, description });
    };

    if (type === "archive") {
      archiveMutation.mutate(paperId, {
        onSuccess: () => {
          toastSuccess("Paper Archived", "Paper archived.");
        },
        onError: () => {
          toastError("Archive Failed", "Failed to archive paper.");
        },
      });
    } else if (type === "restore") {
      unarchiveMutation.mutate(paperId, {
        onSuccess: () => {
          toastSuccess("Paper Restored", "Paper restored.");
        },
        onError: () => {
          toastError("Restore Failed", "Failed to restore paper.");
        },
      });
    } else {
      deleteMutation.mutate(paperId, {
        onSuccess: () => {
          toastSuccess("Paper Deleted", "Paper deleted.");
        },
        onError: () => {
          toastError("Delete Failed", "Failed to delete paper.");
        },
      });
    }

    setConfirmAction(null);
  };

  const tableMeta: TableMeta = {
    onView: (paper) => {
      setSelectedPaper(paper);
    },
    onEdit: (paper) => {
      setEditingPaper(paper);
    },
    onArchive: (paperId) => {
      setConfirmAction({ type: "archive", paperId });
    },
    onRestore: (paperId) => {
      setConfirmAction({ type: "restore", paperId });
    },
    onDelete: (paperId) => {
      setConfirmAction({ type: "delete", paperId });
    },
  };

  const getColumns = () => {
    if (archived) {
      return showDepartment ? columnsArchived : columnsArchivedWithoutDepartment;
    }
    return showDepartment ? columnsActive : columnsActiveWithoutDepartment;
  };

  if (isLoading) {
    return (
      <LoadingSpinner message={archived ? "Loading archived papers..." : "Loading papers..."} />
    );
  }

  if (error) {
    return <p>Failed to load: {error}</p>;
  }

  return (
    <>
      <div className={papersTableStyle.searchWrapper}>
        <Input
          icon={Search}
          type="search"
          placeholder="Search by title, author, or abstract..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>
      <DataTable
        caption={archived ? "Archived Papers" : "Active Papers"}
        columns={getColumns()}
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
        emptyMessage={searchQuery ? "No papers match your search." : undefined}
      />

      <ResearchModal
        isOpen={!!selectedPaper}
        paper={selectedPaper}
        onClose={() => {
          setSelectedPaper(null);
        }}
      />

      <EditPaperModal
        isOpen={!!editingPaper}
        paper={editingPaper}
        onClose={() => {
          setEditingPaper(null);
        }}
      />

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
        title={
          confirmAction?.type === "delete"
            ? "Delete paper?"
            : confirmAction?.type === "archive"
              ? "Archive paper?"
              : "Restore paper?"
        }
        description={
          confirmAction?.type === "delete"
            ? "Are you sure you want to permanently delete this paper? This action cannot be undone."
            : confirmAction?.type === "archive"
              ? "Are you sure you want to archive this paper? It will be moved to archived papers."
              : "Are you sure you want to restore this paper to active papers?"
        }
        confirmText={
          confirmAction?.type === "delete"
            ? "Delete"
            : confirmAction?.type === "archive"
              ? "Archive"
              : "Restore"
        }
        onConfirm={handleConfirm}
      />
    </>
  );
}

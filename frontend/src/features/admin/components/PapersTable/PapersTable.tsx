import { useEffect, useState } from "react";
import {
  useArchivePaper,
  useDeletePaper,
  useUnarchivePaper,
} from "../../hooks/useAdminPaperActions";
import { useAdminPapers } from "../../hooks/useAdminPapers";
import { EditPaperModal } from "../EditPaperModal/EditPaperModal";
import {
  columnsActive,
  columnsActiveWithoutDepartment,
  columnsArchived,
  columnsArchivedWithoutDepartment,
  type TableMeta,
} from "./columns";
import { DataTable } from "@/components/common/DataTable/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { ResearchModal } from "@/components/layout/ResearchModal/ResearchModal";
import type { ResearchPaper } from "@/types";

interface PapersTableProps {
  archived: boolean;
  showDepartment?: boolean;
  search?: string;
}

export function PapersTable({ archived, showDepartment = true, search }: PapersTableProps) {
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [editingPaper, setEditingPaper] = useState<ResearchPaper | null>(null);

  const { data, pageIndex, pageSize, pageCount, setPageIndex, setPageSize, isLoading, error } =
    useAdminPapers({
      archived,
      search,
    });

  useEffect(() => {
    setPageIndex(0);
  }, [search, setPageIndex]);

  const archiveMutation = useArchivePaper();
  const unarchiveMutation = useUnarchivePaper();
  const deleteMutation = useDeletePaper();

  const tableMeta: TableMeta = {
    onView: (paper) => {
      setSelectedPaper(paper);
    },
    onEdit: (paper) => {
      setEditingPaper(paper);
    },
    onArchive: (paperId) => {
      archiveMutation.mutate(paperId);
    },
    onRestore: (paperId) => {
      unarchiveMutation.mutate(paperId);
    },
    onDelete: (paperId) => {
      deleteMutation.mutate(paperId);
    },
  };

  // Select the appropriate columns based on archived and showDepartment
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
        emptyMessage={search ? "No papers match your search." : undefined}
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
    </>
  );
}

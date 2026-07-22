import { createColumnHelper } from "@tanstack/react-table";
import { Archive, Edit, Eye, RotateCcw, Trash2 } from "lucide-react";
import { ActionButton, ActionConfirm, TableActions } from "@/components/common/TableActions";
import type { ResearchPaper } from "@/types";
import { formatDateShort } from "@/util/formatDate";

export interface TableMeta {
  onView: (paper: ResearchPaper) => void;
  onEdit: (paper: ResearchPaper) => void;
  onArchive: (paperId: number) => void;
  onRestore: (paperId: number) => void;
  onDelete: (paperId: number) => void;
}

const columnHelper = createColumnHelper<ResearchPaper>();

const titleColumn = columnHelper.accessor("title", {
  header: "Title",
  cell: (info) => info.getValue(),
});

const authorColumn = columnHelper.accessor("authorName", {
  header: "Author",
  cell: (info) => info.getValue(),
});

const departmentColumn = columnHelper.accessor((row) => row.department.departmentName, {
  id: "department",
  header: "Department",
});

const submissionDateColumn = columnHelper.accessor("submissionDate", {
  header: "Submission Date",
  cell: (info) => formatDateShort(info.getValue()),
});

const actionsActiveColumn = columnHelper.display({
  id: "actions",
  header: "Action",
  cell: ({ row, table }) => {
    const meta = table.options.meta as TableMeta;
    const paper = row.original;

    return (
      <TableActions>
        <ActionButton icon={<Eye />} onPress={() => meta.onView(paper)} />
        <ActionButton icon={<Edit />} onPress={() => meta.onEdit(paper)} />
        <ActionConfirm
          icon={<Archive />}
          confirmTitle="Archive paper?"
          confirmDescription="Are you sure you want to archive this paper? It will be moved to archived papers."
          confirmText="Archive"
          onConfirm={() => meta.onArchive(paper.paperId)}
        />
        <ActionConfirm
          icon={<Trash2 />}
          confirmTitle="Delete paper?"
          confirmDescription="Are you sure you want to permanently delete this paper? This action cannot be undone."
          confirmText="Delete"
          onConfirm={() => meta.onDelete(paper.paperId)}
        />
      </TableActions>
    );
  },
});

const actionsArchivedColumn = columnHelper.display({
  id: "actions",
  header: "Action",
  cell: ({ row, table }) => {
    const meta = table.options.meta as TableMeta;
    const paper = row.original;

    return (
      <TableActions>
        <ActionButton icon={<Eye />} onPress={() => meta.onView(paper)} />
        <ActionButton icon={<Edit />} onPress={() => meta.onEdit(paper)} />
        <ActionConfirm
          icon={<RotateCcw />}
          confirmTitle="Restore paper?"
          confirmDescription="Are you sure you want to restore this paper to active papers?"
          confirmText="Restore"
          onConfirm={() => meta.onRestore(paper.paperId)}
        />
        <ActionConfirm
          icon={<Trash2 />}
          confirmTitle="Delete paper?"
          confirmDescription="Are you sure you want to permanently delete this paper? This action cannot be undone."
          confirmText="Delete"
          onConfirm={() => meta.onDelete(paper.paperId)}
        />
      </TableActions>
    );
  },
});

// Columns for Active Papers with department (for Super Admin)
export const columnsActive = [
  titleColumn,
  authorColumn,
  departmentColumn,
  submissionDateColumn,
  actionsActiveColumn,
];

// Columns for Active Papers without department (for Department Admin)
export const columnsActiveWithoutDepartment = [
  titleColumn,
  authorColumn,
  submissionDateColumn,
  actionsActiveColumn,
];

// Columns for Archived Papers with department (for Super Admin)
export const columnsArchived = [
  titleColumn,
  authorColumn,
  departmentColumn,
  submissionDateColumn,
  actionsArchivedColumn,
];

// Columns for Archived Papers without department (for Department Admin)
export const columnsArchivedWithoutDepartment = [
  titleColumn,
  authorColumn,
  submissionDateColumn,
  actionsArchivedColumn,
];

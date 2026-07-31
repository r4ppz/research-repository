import { createColumnHelper } from "@tanstack/react-table";
import { Edit, Eye, Trash2 } from "lucide-react";
import style from "./column.module.css";
import { TableActions, TableButton } from "@/components/common/TableActions";
import type { ResearchPaper } from "@/types";

export interface TableMeta {
  onView: (paper: ResearchPaper) => void;
  onEdit: (paper: ResearchPaper) => void;
  onDelete: (paperId: number) => void;
}

const columnHelper = createColumnHelper<ResearchPaper>();

const titleColumn = columnHelper.accessor("title", {
  header: "Paper Title",
});

const authorColumn = columnHelper.accessor("authorName", {
  header: "Author",
});

const departmentColumn = columnHelper.accessor((row) => row.department.departmentName, {
  id: "department",
  header: "Department",
});

const submissionDateColumn = columnHelper.accessor("submissionDate", {
  header: "Request Date",
});

const statusCell = (status?: string) => {
  const statusStyles: Record<string, string> = {
    ACTIVE: style.statusActive,
    REJECTED: style.statusRejected,
    PENDING_REVIEW: style.statusPendingReview,
  };

  const labels: Record<string, string> = {
    ACTIVE: "Approved",
    REJECTED: "Rejected",
    PENDING_REVIEW: "Pending Review",
  };

  const s = status ?? "Unknown";

  return <span className={`${style.status} ${statusStyles[s] ?? ""}`}>{labels[s] ?? s}</span>;
};

const statusColumn = columnHelper.display({
  id: "statusDisplay",
  header: "Status",
  cell: ({ row }) => statusCell(row.original.status),
});

const actionsColumn = columnHelper.display({
  id: "actions",
  header: "Actions",
  cell: ({ row, table }) => {
    const meta = table.options.meta as TableMeta;
    const paper = row.original;

    return (
      <TableActions>
        <TableButton
          icon={<Eye />}
          onPress={() => {
            meta.onView(paper);
          }}
        />
        {paper.status === "PENDING_REVIEW" && (
          <>
            <TableButton
              icon={<Edit />}
              onPress={() => {
                meta.onEdit(paper);
              }}
            />
            <TableButton
              icon={<Trash2 />}
              onPress={() => {
                meta.onDelete(paper.paperId);
              }}
            />
          </>
        )}
      </TableActions>
    );
  },
});

export const columns = [
  titleColumn,
  authorColumn,
  departmentColumn,
  submissionDateColumn,
  statusColumn,
  actionsColumn,
];

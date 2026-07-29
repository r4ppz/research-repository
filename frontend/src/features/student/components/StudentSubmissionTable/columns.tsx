import { createColumnHelper } from "@tanstack/react-table";
import { Edit, Eye, Trash2 } from "lucide-react";
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

const statusBadge = (status?: string) => {
  switch (status) {
    case "PENDING_REVIEW":
      return "Pending Review";
    case "REJECTED":
      return "Rejected";
    case "ACTIVE":
      return "Approved";
    default:
      return status ?? "Unknown";
  }
};

const statusColumn = columnHelper.display({
  id: "statusDisplay",
  header: "Status",
  cell: ({ row }) => statusBadge(row.original.status),
});

const actionsColumn = columnHelper.display({
  id: "actions",
  header: "",
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

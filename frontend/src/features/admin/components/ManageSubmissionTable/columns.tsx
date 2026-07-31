import { createColumnHelper } from "@tanstack/react-table";
import { Check, Eye, X } from "lucide-react";
import { TableActions, TableButton } from "@/components/common/TableActions";
import type { ResearchPaper } from "@/types";
import { formatDateShort } from "@/util/formatDate";

export interface TableMeta {
  onView: (paper: ResearchPaper) => void;
  onReject: (paperId: number) => void;
  onApprove: (paperId: number) => void;
  pendingId: number | null;
}

const columnHelper = createColumnHelper<ResearchPaper>();

const titleColumn = columnHelper.accessor("title", {
  header: "Paper Title",
});

const authorColumn = columnHelper.accessor("authorName", {
  header: "Author",
});

const submittedByColumn = columnHelper.accessor((row) => row.uploadedBy?.fullName ?? "Unknown", {
  id: "submittedBy",
  header: "Submitted By",
});

const departmentColumn = columnHelper.accessor((row) => row.department.departmentName, {
  id: "department",
  header: "Department",
});

const submissionDateColumn = columnHelper.accessor("submissionDate", {
  header: "Date Submitted",
  cell: (info) => formatDateShort(info.getValue()),
});

const actionsColumn = columnHelper.display({
  id: "actions",
  header: "Action",
  cell: ({ row, table }) => {
    const meta = table.options.meta as TableMeta;
    const paper = row.original;
    const isLoading = meta.pendingId === paper.paperId;

    return (
      <TableActions>
        <TableButton
          icon={<Eye />}
          onPress={() => {
            meta.onView(paper);
          }}
        />
        <TableButton
          icon={<X />}
          isPending={isLoading}
          onPress={() => {
            meta.onReject(paper.paperId);
          }}
        />
        <TableButton
          icon={<Check />}
          isPending={isLoading}
          onPress={() => {
            meta.onApprove(paper.paperId);
          }}
        />
      </TableActions>
    );
  },
});

const actionsWithDepartment = [
  titleColumn,
  authorColumn,
  submittedByColumn,
  departmentColumn,
  submissionDateColumn,
  actionsColumn,
];

const actionsWithoutDepartment = [
  titleColumn,
  authorColumn,
  submittedByColumn,
  submissionDateColumn,
  actionsColumn,
];

export function getColumns(showDepartment: boolean) {
  return showDepartment ? actionsWithDepartment : actionsWithoutDepartment;
}

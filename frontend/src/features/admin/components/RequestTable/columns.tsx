import { createColumnHelper } from "@tanstack/react-table";
import { Check, Eye, X } from "lucide-react";
import { TableActions, TableButton } from "@/components/common/TableActions";
import type { DocumentRequest, ResearchPaper } from "@/types";
import { formatDateShort } from "@/util/formatDate";

export interface TableMeta {
  onView: (paper: ResearchPaper) => void;
  onReject: (requestId: number) => void;
  onAccept: (requestId: number) => void;
  pendingAcceptId: number | null;
  pendingRejectId: number | null;
}

const columnHelper = createColumnHelper<DocumentRequest>();

const studentNameColumn = columnHelper.accessor((row) => row.user?.fullName, {
  id: "studentName",
  header: "Student Name",
  cell: (info) => info.getValue(),
});

const paperTitleColumn = columnHelper.accessor((row) => row.paper.title, {
  id: "paperTitle",
  header: "Requested Paper",
  cell: (info) => info.getValue(),
});

const departmentColumn = columnHelper.accessor((row) => row.paper.department.departmentName, {
  id: "department",
  header: "Department",
});

const dateRequestedColumn = columnHelper.accessor("createdAt", {
  header: "Date Requested",
  cell: (info) => formatDateShort(info.getValue<string>()),
});

const actionsColumn = columnHelper.display({
  id: "actions",
  header: "Action",
  cell: ({ row, table }) => {
    const meta = table.options.meta as TableMeta;
    const requestId = row.original.requestId;
    const isLoading = meta.pendingAcceptId === requestId || meta.pendingRejectId === requestId;

    return (
      <TableActions>
        <TableButton
          icon={<Eye />}
          onPress={() => {
            meta.onView(row.original.paper);
          }}
        />
        <TableButton
          icon={<X />}
          isPending={isLoading}
          onPress={() => {
            meta.onReject(requestId);
          }}
        />
        <TableButton
          icon={<Check />}
          isPending={isLoading}
          onPress={() => {
            meta.onAccept(requestId);
          }}
        />
      </TableActions>
    );
  },
});

export const columns = [
  studentNameColumn,
  paperTitleColumn,
  departmentColumn,
  dateRequestedColumn,
  actionsColumn,
];

export const columnsWithoutDepartment = [
  studentNameColumn,
  paperTitleColumn,
  dateRequestedColumn,
  actionsColumn,
];

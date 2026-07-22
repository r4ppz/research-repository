import { createColumnHelper } from "@tanstack/react-table";
import { Check, Eye, X } from "lucide-react";
import { ActionButton, ActionConfirm, TableActions } from "@/components/common/TableActions";
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
        <ActionButton icon={<Eye />} onPress={() => meta.onView(row.original.paper)} />
        <ActionConfirm
          icon={<X />}
          isPending={isLoading}
          confirmTitle="Reject document request?"
          confirmDescription="Are you sure you want to reject this document request? This action cannot be undone."
          confirmText="Reject"
          onConfirm={() => meta.onReject(requestId)}
        />
        <ActionConfirm
          icon={<Check />}
          isPending={isLoading}
          confirmTitle="Accept document request?"
          confirmDescription="Are you sure you want to accept this document request? The requester will be granted access."
          confirmText="Accept"
          onConfirm={() => meta.onAccept(requestId)}
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

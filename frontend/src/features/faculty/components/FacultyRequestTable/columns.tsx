import { createColumnHelper } from "@tanstack/react-table";
import { Download, Trash2 } from "lucide-react";
import style from "./column.module.css";
import { TableActions, TableButton } from "@/components/common/TableActions";
import type { DocumentRequest } from "@/types";
import { formatDateShort } from "@/util/formatDate";

export interface TableMeta {
  onDownload: (paperId: number) => void;
  onRemove: (requestId: number) => void;
  removingIds?: Set<number>;
  downloadingIds?: Set<number>;
}

const columnHelper = createColumnHelper<DocumentRequest>();

export const columns = [
  columnHelper.accessor((row) => row.paper.title, {
    id: "paperTitle",
    header: "Paper Title",
    cell: (info) => info.getValue(),
  }),

  columnHelper.accessor((row) => row.paper.authorName, {
    id: "author",
    header: "Author",
    cell: (info) => info.getValue(),
  }),

  columnHelper.accessor((row) => row.paper.department.departmentName, {
    id: "department",
    header: "Department",
  }),

  columnHelper.accessor("createdAt", {
    header: "Request Date",
    cell: (info) => formatDateShort(info.getValue<string>()),
  }),

  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => {
      const status = info.getValue();

      const statusStyles: Record<typeof status, string> = {
        ACCEPTED: style.statusAccepted,
        REJECTED: style.statusRejected,
        PENDING: style.statusPending,
      };

      return <span className={`${style.status} ${statusStyles[status]}`}>{status}</span>;
    },
  }),

  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const request = row.original;
      const meta = table.options.meta as TableMeta;

      const isAccepted = request.status === "ACCEPTED";
      const isRejected = request.status === "REJECTED";
      const isPending = request.status === "PENDING";

      return (
        <TableActions>
          {(isPending || isAccepted) && (
            <TableButton
              icon={<Download size={16} />}
              isDisabled={isPending}
              isPending={(meta.downloadingIds ?? new Set()).has(request.paper.paperId)}
              onPress={() => {
                meta.onDownload(request.paper.paperId);
              }}
            />
          )}

          {isRejected && (
            <TableButton
              icon={<Trash2 size={16} />}
              isPending={(meta.removingIds ?? new Set()).has(request.requestId)}
              onPress={() => {
                meta.onRemove(request.requestId);
              }}
            />
          )}
        </TableActions>
      );
    },
  }),
];

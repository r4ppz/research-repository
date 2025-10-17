import { Download } from "lucide-react";
import { useMemo } from "react";
import Button from "@/components/common/Button/Button";
import Table, { Column } from "@/components/common/Table/Table";
import { DocumentRequest } from "@/types";
import { formatDateShort } from "@/util/formatDate";
import style from "./RequestTable.module.css";

interface RequestTableProps {
  requests: DocumentRequest[];
  className?: string;
  onDownload?: (request: DocumentRequest) => void;
}

function RequestTable({ requests, className, onDownload }: RequestTableProps) {
  const columns = useMemo<Column<DocumentRequest>[]>(
    () => [
      {
        key: "title",
        header: "Title",
        align: "left",
        render: (request) => <span className={style.paperTitle}>{request.paper.title}</span>,
      },
      {
        key: "author",
        header: "Author",
        align: "center",
        render: (request) => request.paper.authorName,
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        render: (request) => (
          <div className={style.statusWrapper}>
            <span className={style.statusCell} data-status={request.status}>
              {request.status}
            </span>
            {request.paper.archived && <span className={style.archivedBadge}>ARCHIVE</span>}
          </div>
        ),
      },
      {
        key: "requestDate",
        header: "Request Date",
        align: "center",
        render: (request) => formatDateShort(request.requestDate),
      },
      {
        key: "action",
        header: "Action",
        align: "center",
        render: (request) => (
          <Button
            variant="primary"
            className={style.downloadButton}
            disabled={request.status !== "ACCEPTED"}
            onClick={() => onDownload?.(request)}
          >
            <Download size={18} />
            Download
          </Button>
        ),
      },
    ],
    [onDownload],
  );

  return (
    <Table
      columns={columns}
      data={requests}
      keyExtractor={(request: DocumentRequest) => request.requestId}
      className={className}
      emptyMessage="No requests found matching your filters."
    />
  );
}

export default RequestTable;

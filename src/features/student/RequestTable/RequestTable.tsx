import clsx from "clsx";
import { useState } from "react";
import Button from "@/components/common/Button/Button";
import Table from "@/components/common/Table/Table";
import { DocumentRequest, RequestStatus } from "@/types";
import style from "./RequestTable.module.css";

interface RequestTableProps {
  requests: DocumentRequest[];
  className?: string;
  onDownload: (request: DocumentRequest) => void;
}

const statusColors: Record<RequestStatus, string> = {
  PENDING: "var(--color-warning)",
  ACCEPTED: "var(--color-success)",
  REJECTED: "var(--color-error)",
};

function RequestTable({ requests, className, onDownload }: RequestTableProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 5; // Configurable number of rows

  const columns = [
    {
      key: "paper.title",
      title: "Paper Title",
      render: (request: DocumentRequest) => request.paper.title,
    },
    {
      key: "paper.authorName",
      title: "Author",
      render: (request: DocumentRequest) => request.paper.authorName,
    },
    {
      key: "paper.department.departmentName",
      title: "Department",
      render: (request: DocumentRequest) => request.paper.department.departmentName,
    },
    {
      key: "requestDate",
      title: "Request Date",
      render: (request: DocumentRequest) => new Date(request.requestDate).toLocaleDateString(),
    },
    {
      key: "status",
      title: "Status",
      render: (request: DocumentRequest) => (
        <span
          className={style.statusBadge}
          style={{ backgroundColor: statusColors[request.status] }}
        >
          {request.status}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (request: DocumentRequest) => (
        <Button
          className={style.downloadButton}
          onClick={() => {
            onDownload(request);
          }}
          disabled={request.status !== "ACCEPTED"}
          variant={request.status === "ACCEPTED" ? "primary" : "secondary"}
        >
          Download
        </Button>
      ),
    },
  ];

  return (
    <Table<DocumentRequest>
      data={requests}
      columns={columns}
      rowKey={(request) => request.requestId.toString()}
      className={clsx(style.requestTable, className)}
      pagination={{
        pageSize,
        currentPage,
        onPageChange: setCurrentPage,
        totalElements: requests.length,
      }}
      rowClassName={(request) => {
        if (request.status === "ACCEPTED") return style.acceptedRow;
        if (request.status === "REJECTED") return style.rejectedRow;
        return style.pendingRow;
      }}
      emptyText="No requests found"
    />
  );
}

export default RequestTable;

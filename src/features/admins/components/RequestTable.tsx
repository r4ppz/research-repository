import clsx from "clsx";
import { useState } from "react";
import Button from "@/components/common/Button/Button";
import Table from "@/components/common/Table/Table";
import { DocumentRequest, RequestStatus } from "@/types";
import styles from "./RequestTable.module.css";

interface AdminRequestTableProps {
  requests: DocumentRequest[];
  className?: string;
  onAction: (requestId: number, action: "accept" | "reject") => void;
  showDepartmentColumn?: boolean;
}

const statusColors: Record<RequestStatus, string> = {
  PENDING: "var(--color-warning)",
  ACCEPTED: "var(--color-success)",
  REJECTED: "var(--color-error)",
};

function AdminRequestTable({
  requests,
  className,
  onAction,
  showDepartmentColumn = true,
}: AdminRequestTableProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 5; // Configurable number of rows

  // Define columns inside the function, conditionally including the department column
  const baseColumns = [
    {
      key: "requester.fullName",
      title: "Requester",
      render: (request: DocumentRequest) => request.requester.fullName,
    },
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
      key: "requestDate",
      title: "Request Date",
      render: (request: DocumentRequest) => new Date(request.requestDate).toLocaleDateString(),
    },
    {
      key: "status",
      title: "Status",
      render: (request: DocumentRequest) => (
        <span
          className={styles.statusBadge}
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
        <div className={styles.actionButtons}>
          <Button
            className={styles.actionButton}
            onClick={() => {
              onAction(request.requestId, "reject");
            }}
            disabled={request.status !== "PENDING"}
            variant={request.status === "PENDING" ? "secondary" : "secondary"}
          >
            Reject
          </Button>

          <Button
            className={styles.actionButton}
            onClick={() => {
              onAction(request.requestId, "accept");
            }}
            disabled={request.status !== "PENDING"}
            variant={request.status === "PENDING" ? "primary" : "secondary"}
          >
            Accept
          </Button>
        </div>
      ),
    },
  ];

  // NOTE: Could be improve, but okay for now :)
  const columns = showDepartmentColumn
    ? [
        ...baseColumns.slice(0, 3),
        {
          key: "paper.department.departmentName",
          title: "Department",
          render: (request: DocumentRequest) => request.paper.department.departmentName,
        },
        ...baseColumns.slice(3),
      ]
    : baseColumns;

  return (
    <Table<DocumentRequest>
      data={requests}
      columns={columns}
      rowKey={(request) => request.requestId.toString()}
      className={clsx(styles.adminRequestTable, className)}
      pagination={{
        pageSize,
        currentPage,
        onPageChange: setCurrentPage,
        totalElements: requests.length,
      }}
      emptyText="No requests found"
    />
  );
}

export default AdminRequestTable;

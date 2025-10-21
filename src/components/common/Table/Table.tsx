import clsx from "clsx";
import { useState, useMemo } from "react";
import { safeToString } from "@/util/safeToString";
import styles from "./Table.module.css";

export interface TableColumn<T> {
  key: string;
  title: string;
  render?: (item: T) => React.ReactNode;
  width?: string | number;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  rowKey: (item: T) => string | number;
  pagination?: {
    pageSize: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    totalElements: number;
  };
  className?: string;
  emptyText?: string;
  rowClassName?: (item: T, index: number) => string;
  onRowClick?: (item: T, index: number) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Table<T extends Record<string, any>>({
  data = [],
  columns,
  rowKey,
  pagination,
  className,
  emptyText = "No data",
  rowClassName,
  onRowClick,
}: TableProps<T>) {
  const [internalPageSize, setInternalPageSize] = useState(10);
  const currentPageSize = pagination ? pagination.pageSize : internalPageSize;

  // Calculate pagination details if pagination is enabled
  const { paginatedData, totalPages, currentPage } = useMemo(() => {
    if (!pagination) {
      return {
        paginatedData: data,
        totalPages: 1,
        currentPage: 0,
      };
    }

    const totalPages = Math.ceil(pagination.totalElements / currentPageSize);
    const start = pagination.currentPage * currentPageSize;
    const end = start + currentPageSize;
    const paginatedData = data.slice(start, end);

    return {
      paginatedData,
      totalPages,
      currentPage: pagination.currentPage,
    };
  }, [data, pagination, currentPageSize]);

  const handlePageChange = (newPage: number) => {
    if (pagination) {
      pagination.onPageChange(newPage);
    } else {
      // For internal pagination management
      setInternalPageSize(newPage);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      handlePageChange(currentPage + 1);
    }
  };

  if (data.length === 0) {
    return (
      <div className={clsx(styles.tableContainer, className)}>
        <div className={styles.emptyState}>{emptyText}</div>
      </div>
    );
  }

  return (
    <div className={clsx(styles.tableContainer, className)}>
      {/* Mobile Card View */}
      <div className={styles.mobileView}>
        {paginatedData.map((item, index) => {
          const key = rowKey(item);
          const itemRowClassName = rowClassName ? rowClassName(item, index) : "";

          return (
            <div
              key={key}
              className={clsx(styles.mobileCard, itemRowClassName)}
              onClick={() => onRowClick?.(item, index)}
            >
              {columns.map((column) => (
                <div key={column.key} className={styles.mobileRow}>
                  <span className={styles.mobileLabel}>{column.title}:</span>
                  <span className={styles.mobileValue}>
                    {column.render ? column.render(item) : safeToString(item[column.key])}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className={styles.desktopView}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={styles.headerCell} style={{ width: column.width }}>
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => {
              const key = rowKey(item);
              const itemRowClassName = rowClassName ? rowClassName(item, index) : "";

              return (
                <tr
                  key={key}
                  className={clsx(styles.row, itemRowClassName)}
                  onClick={() => onRowClick?.(item, index)}
                >
                  {columns.map((column) => (
                    <td key={`${String(key)}-${column.key}`} className={styles.cell}>
                      {column.render ? column.render(item) : safeToString(item[column.key])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationButton}
            onClick={handlePrevPage}
            disabled={currentPage === 0}
          >
            Previous
          </button>

          <span className={styles.pageInfo}>
            Page {currentPage + 1} of {totalPages}
          </span>

          <button
            className={styles.paginationButton}
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Table;

import clsx from "clsx";
import { useState, useMemo } from "react";
import { safeToString } from "@/util/safeToString";
import style from "./Table.module.css";
import Button from "../Button/Button";

export interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  render?: (item: T) => React.ReactNode;
  width?: string | number;
}

interface TableProps<T extends object> {
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

function Table<T extends object>({
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
      <div className={clsx(style.tableContainer, className)}>
        <div className={style.emptyState}>{emptyText}</div>
      </div>
    );
  }

  return (
    <div className={clsx(style.tableContainer, className)}>
      {/* Mobile Card View */}
      <div className={style.mobileView}>
        {paginatedData.map((item, index) => {
          const key = rowKey(item);
          const itemRowClassName = rowClassName ? rowClassName(item, index) : "";

          return (
            <div
              key={String(key)}
              className={clsx(style.mobileCard, itemRowClassName)}
              onClick={() => onRowClick?.(item, index)}
            >
              {columns.map((column) => (
                <div key={String(column.key)} className={style.mobileRow}>
                  <span className={style.mobileLabel}>{column.title}:</span>
                  <span className={style.mobileValue}>
                    {column.render
                      ? column.render(item)
                      : safeToString(item[column.key as keyof T])}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className={style.desktopView}>
        <table className={style.table}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={style.headerCell}
                  style={{ width: column.width }}
                >
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
                  key={String(key)}
                  className={clsx(style.row, itemRowClassName)}
                  onClick={() => onRowClick?.(item, index)}
                >
                  {columns.map((column) => (
                    <td key={`${String(key)}-${String(column.key)}`} className={style.cell}>
                      {column.render
                        ? column.render(item)
                        : safeToString(item[column.key as keyof T])}
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
        <div className={style.pagination}>
          <Button
            variant="secondary"
            className={style.paginationButton}
            onClick={handlePrevPage}
            disabled={currentPage === 0}
          >
            Previous
          </Button>

          <span className={style.pageInfo}>
            Page {currentPage + 1} of {totalPages}
          </span>

          <Button
            variant="secondary"
            className={style.paginationButton}
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default Table;

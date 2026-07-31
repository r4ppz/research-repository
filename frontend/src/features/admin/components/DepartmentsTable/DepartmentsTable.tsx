import { columns, type TableMeta } from "./columns";
import type { AdminDepartment } from "@/api/admin/departments";
import { getAdminDepartments } from "@/api/admin/departments";
import { DataTable } from "@/components/common/DataTable/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { usePaginatedSearch } from "@/hooks/usePaginatedSearch";

interface DepartmentsTableProps {
  onEdit: (department: AdminDepartment) => void;
  onDelete: (department: AdminDepartment) => void;
}

export function DepartmentsTable({ onEdit, onDelete }: DepartmentsTableProps) {
  const {
    data: departments,
    pageCount,
    isLoading,
    error,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
  } = usePaginatedSearch("adminDepartments", getAdminDepartments);

  const tableMeta: TableMeta = {
    onEdit,
    onDelete,
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading departments..." />;
  }

  if (error) {
    return <p>Failed to load: {error}</p>;
  }

  return (
    <DataTable
      caption="Departments"
      columns={columns}
      data={departments}
      pageCount={pageCount}
      pagination={{ pageIndex, pageSize }}
      onPaginationChange={(updater) => {
        const nextState =
          typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater;
        setPageIndex(nextState.pageIndex);
        setPageSize(nextState.pageSize);
      }}
      meta={tableMeta}
    />
  );
}

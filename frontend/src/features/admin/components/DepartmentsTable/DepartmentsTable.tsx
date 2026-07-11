import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAdminDepartments } from "../../hooks/useAdminDepartments";
import { columns, type TableMeta } from "./columns";
import { EditDepartmentModal } from "./EditDepartmentModal";
import { type AdminDepartment, deleteDepartment, updateDepartment } from "@/api/admin/departments";
import { NotificationDialog } from "@/components/common/AlertDialog/NotificationDialog";
import { DataTable } from "@/components/common/DataTable/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";

export function DepartmentsTable() {
  const queryClient = useQueryClient();
  const [editingDepartment, setEditingDepartment] = useState<AdminDepartment | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const {
    data: departments,
    pageCount,
    isLoading,
    error,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
  } = useAdminDepartments();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteDepartment(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminDepartments"] });
      setNotification({
        type: "success",
        title: "Success",
        message: "Department deleted successfully.",
      });
    },
    onError: (err) => {
      setNotification({
        type: "error",
        title: "Error",
        message: err instanceof Error ? err.message : "Failed to delete department",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      updateDepartment(id, { departmentName: name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminDepartments"] });
      setEditingDepartment(null);
      setNotification({
        type: "success",
        title: "Success",
        message: "Department updated successfully.",
      });
    },
    onError: (err) => {
      setNotification({
        type: "error",
        title: "Error",
        message: err instanceof Error ? err.message : "Failed to update department",
      });
    },
  });

  const tableMeta: TableMeta = {
    onEdit: (department) => {
      setEditingDepartment(department);
    },
    onDelete: (department) => {
      deleteMutation.mutate(department.departmentId);
    },
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading departments..." />;
  }

  if (error) {
    return <p>Failed to load: {error}</p>;
  }

  return (
    <>
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

      <EditDepartmentModal
        isOpen={!!editingDepartment}
        department={editingDepartment}
        onClose={() => {
          setEditingDepartment(null);
        }}
        onSave={(id, name) => {
          updateMutation.mutate({ id, name });
        }}
        isSaving={updateMutation.isPending}
      />

      <NotificationDialog
        open={!!notification}
        onClose={() => {
          setNotification(null);
        }}
        type={notification?.type ?? "success"}
        title={notification?.title ?? ""}
        description={notification?.message ?? ""}
      />
    </>
  );
}

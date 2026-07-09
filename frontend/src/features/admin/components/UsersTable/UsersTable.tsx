import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAdminUsers } from "../../hooks/useAdminUsers";
import { columns, type RowDraft, type TableMeta } from "./columns";
import { changeUserRole } from "@/api/admin/users";
import { getDepartments } from "@/api/filter";
import { NotificationDialog } from "@/components/common/AlertDialog/NotificationDialog";
import { DataTable } from "@/components/common/DataTable/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import type { User } from "@/types";

interface UsersTableProps {
  currentUserId: number | undefined;
}

export function UsersTable({ currentUserId }: UsersTableProps) {
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<number, RowDraft>>({});
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const {
    data: users,
    pageCount,
    isLoading,
    error,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
  } = useAdminUsers();

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  const updateDraft = (userId: number, nextDraft: Partial<RowDraft>) => {
    setNotification(null);
    setDrafts((current) => {
      const prev = current[userId] as RowDraft | undefined;
      return {
        ...current,
        [userId]: {
          role: nextDraft.role ?? prev?.role ?? "STUDENT",
          departmentId: nextDraft.departmentId ?? prev?.departmentId ?? "",
        },
      };
    });
  };

  const saveUser = async (entry: User) => {
    const draft = drafts[entry.userId] ?? {
      role: entry.role,
      departmentId: entry.department ? String(entry.department.departmentId) : "",
    };

    setNotification(null);

    try {
      const departmentId =
        draft.role === "DEPARTMENT_ADMIN" && draft.departmentId
          ? Number(draft.departmentId)
          : undefined;

      await changeUserRole(entry.userId, draft.role, departmentId);
      await queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setNotification({
        type: "success",
        title: "Success",
        message: `Role updated to ${draft.role} for ${entry.fullName}`,
      });
    } catch (err) {
      setNotification({
        type: "error",
        title: "Error",
        message: err instanceof Error ? err.message : "Failed to update role",
      });
    }
  };

  if (isLoading || departmentsQuery.isLoading) {
    return <LoadingSpinner message="Loading users..." />;
  }

  if (error || departmentsQuery.isError) {
    return <p>Failed to load: {error ?? departmentsQuery.error?.message}</p>;
  }

  const tableMeta: TableMeta = {
    drafts,
    departments: departmentsQuery.data ?? [],
    currentUserId,
    updateDraft,
    saveUser,
  };

  return (
    <>
      <DataTable
        caption="Users"
        columns={columns}
        data={users}
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

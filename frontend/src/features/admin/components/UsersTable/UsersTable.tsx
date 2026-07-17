import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAdminUsers } from "../../hooks/useAdminUsers";
import { columns, type RowDraft, type TableMeta } from "./columns";
import { changeUserRole } from "@/api/admin/users";
import { getDepartments } from "@/api/filter";
import { DataTable } from "@/components/common/DataTable/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { toastQueue } from "@/components/common/Toast/Toast";
import type { User } from "@/types";

interface UsersTableProps {
  currentUserId: number | undefined;
  search?: string;
}

export function UsersTable({ currentUserId, search }: UsersTableProps) {
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<number, RowDraft>>({});

  const {
    data: users,
    pageCount,
    isLoading,
    error,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
  } = useAdminUsers({ search });

  useEffect(() => {
    setPageIndex(0);
  }, [search, setPageIndex]);

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  const updateDraft = (userId: number, nextDraft: Partial<RowDraft>) => {
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

    try {
      const departmentId =
        draft.role === "DEPARTMENT_ADMIN" && draft.departmentId
          ? Number(draft.departmentId)
          : undefined;

      await changeUserRole(entry.userId, draft.role, departmentId);
      await queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toastQueue.add({
        variant: "success",
        title: "Role Updated",
        description: `Role updated to ${draft.role} for ${entry.fullName}`,
      });
    } catch (err) {
      toastQueue.add({
        variant: "error",
        title: "Update Failed",
        description: err instanceof Error ? err.message : "Failed to update role",
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
        emptyMessage={search ? "No users match your search." : undefined}
      />
    </>
  );
}

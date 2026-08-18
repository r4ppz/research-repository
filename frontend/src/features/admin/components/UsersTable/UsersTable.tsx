import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { columns, type RowDraft, type TableMeta } from "./columns";
import usersTableStyle from "./UsersTable.module.css";
import { changeUserRole, getAdminUsers } from "@/api/admin/users";
import { getDepartments } from "@/api/filter";
import { DataTable } from "@/components/common/DataTable/DataTable";
import { Input } from "@/components/common/Input/Input";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { toastQueue } from "@/components/common/Toast/Toast";
import { usePaginatedSearch } from "@/hooks/usePaginatedSearch";
import type { User } from "@/types";

interface UsersTableProps {
  currentUserId: number | undefined;
}

export function UsersTable({ currentUserId }: UsersTableProps) {
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
    searchQuery,
    handleSearchChange,
  } = usePaginatedSearch("adminUsers", getAdminUsers);

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
      <div className={usersTableStyle.searchWrapper}>
        <Input
          icon={Search}
          type="search"
          placeholder="Search by email or name..."
          value={searchQuery}
          onChange={(e) => {
            handleSearchChange(e.target.value);
          }}
        />
      </div>
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
        emptyMessage={searchQuery ? "No users match your search." : undefined}
      />
    </>
  );
}

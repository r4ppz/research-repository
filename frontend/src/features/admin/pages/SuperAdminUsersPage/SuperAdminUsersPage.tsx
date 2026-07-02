import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import style from "./SuperAdminUsersPage.module.css";
import { changeUserRole, getAdminUsers } from "@/api/admin/users";
import { getDepartments } from "@/api/filter";
import { Button } from "@/components/common/Button/Button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { Footer } from "@/components/layout/Footer/Footer";
import { Header } from "@/components/layout/Header/Header";
import { useAuth } from "@/features/auth/context/useAuth";
import type { User } from "@/types";

const PAGE_SIZE = 20;

interface RowDraft {
  role: User["role"];
  departmentId: string;
}

export const SuperAdminUsersPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [drafts, setDrafts] = useState<Record<number, RowDraft>>({});
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const usersQuery = useQuery({
    queryKey: ["admin-users", page],
    queryFn: () => getAdminUsers({ page, size: PAGE_SIZE }),
  });

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  const updateDraft = (userId: number, nextDraft: Partial<RowDraft>) => {
    setMutationError(null);
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

    setMutationError(null);

    try {
      const departmentId =
        draft.role === "DEPARTMENT_ADMIN" && draft.departmentId
          ? Number(draft.departmentId)
          : undefined;

      await changeUserRole(entry.userId, draft.role, departmentId);
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSuccessMessage(`Role updated to ${draft.role} for ${entry.fullName}`);
      window.setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : "Failed to update role");
    }
  };

  if (usersQuery.isLoading || departmentsQuery.isLoading) {
    return (
      <div className={style.page}>
        <Header />
        <main className={style.main}>
          <LoadingSpinner message="Loading users..." />
        </main>
        <Footer />
      </div>
    );
  }

  const users = usersQuery.data?.content ?? [];
  const totalPages = usersQuery.data?.totalPages ?? 1;
  const currentPage = usersQuery.data?.number ?? 0;
  const currentUserId = user?.userId;

  return (
    <div className={style.page}>
      <Header />
      <main className={style.main}>
        <div className={style.mainContainer}>
          <section className={style.headerSection}>
            <div>
              <h1 className={style.titleHeader}>Manage Users</h1>
              <p className={style.subtitle}>Change roles from the database and revoke sessions.</p>
            </div>
          </section>

          {mutationError && <div className={style.errorText}>{mutationError}</div>}
          {successMessage && <div className={style.successText}>{successMessage}</div>}

          <div className={style.tableShell}>
            <table className={style.table}>
              <thead>
                <tr>
                  <th className={style.tableHeadCell}>Full Name</th>
                  <th className={style.tableHeadCell}>Email</th>
                  <th className={style.tableHeadCell}>Current Role</th>
                  <th className={style.tableHeadCell}>Department</th>
                  <th className={style.tableHeadCell}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((entry) => {
                  const draft = drafts[entry.userId] ?? {
                    role: entry.role,
                    departmentId: entry.department ? String(entry.department.departmentId) : "",
                  };
                  const isSelf = entry.userId === currentUserId;
                  const showDepartmentSelect = draft.role === "DEPARTMENT_ADMIN";
                  const departmentName = entry.department?.departmentName ?? "—";

                  return (
                    <tr key={entry.userId}>
                      <td className={style.tableCell}>
                        <div className={style.userName}>{entry.fullName}</div>
                        {isSelf && <div className={style.mutedText}>Your account</div>}
                      </td>
                      <td className={style.tableCell}>{entry.email}</td>
                      <td className={style.tableCell}>
                        <select
                          className={style.select}
                          value={draft.role}
                          disabled={isSelf}
                          onChange={(event) => {
                            updateDraft(entry.userId, {
                              role: event.target.value as User["role"],
                              departmentId:
                                event.target.value === "DEPARTMENT_ADMIN" ? draft.departmentId : "",
                            });
                          }}
                        >
                          <option value="STUDENT">Student</option>
                          <option value="FACULTY">Faculty</option>
                          <option value="DEPARTMENT_ADMIN">Department Admin</option>
                          <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                      </td>
                      <td className={style.tableCell}>
                        {showDepartmentSelect ? (
                          <select
                            className={style.departmentSelect}
                            value={draft.departmentId}
                            onChange={(event) => {
                              updateDraft(entry.userId, { departmentId: event.target.value });
                            }}
                          >
                            <option value="">Select department</option>
                            {(departmentsQuery.data ?? []).map((department) => (
                              <option key={department.departmentId} value={department.departmentId}>
                                {department.departmentName}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span>{departmentName}</span>
                        )}
                      </td>
                      <td className={style.tableCell + " " + style.actionsCell}>
                        <Button
                          type="button"
                          onClick={() => {
                            void saveUser(entry);
                          }}
                          isDisabled={isSelf}
                        >
                          Save
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className={style.pagination}>
            <Button
              type="button"
              variant="secondary"
              isDisabled={currentPage <= 0}
              onClick={() => {
                setPage((value) => Math.max(0, value - 1));
              }}
            >
              Previous
            </Button>

            <span className={style.paginationInfo}>
              Page {currentPage + 1} of {totalPages || 1}
            </span>

            <Button
              type="button"
              variant="secondary"
              isDisabled={currentPage + 1 >= totalPages}
              onClick={() => {
                setPage((value) => value + 1);
              }}
            >
              Next
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

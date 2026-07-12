import { createColumnHelper } from "@tanstack/react-table";
import styles from "./columns.module.css";
import { Button } from "@/components/common/Button/Button";
import { Select, SelectItem } from "@/components/common/Select/Select";
import type { Department, User } from "@/types";

export interface TableMeta {
  drafts: Record<number, RowDraft>;
  departments: Department[];
  currentUserId: number | undefined;
  updateDraft: (userId: number, nextDraft: Partial<RowDraft>) => void;
  saveUser: (entry: User) => Promise<void>;
}

export interface RowDraft {
  role: User["role"];
  departmentId: string;
}

const ROLES: { value: User["role"]; label: string }[] = [
  { value: "STUDENT", label: "Student" },
  { value: "FACULTY", label: "Faculty" },
  { value: "DEPARTMENT_ADMIN", label: "Department Admin" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
];

const columnHelper = createColumnHelper<User>();

const fullNameColumn = columnHelper.accessor("fullName", {
  id: "fullName",
  header: "Full Name",
  cell: ({ row, table }) => {
    const meta = table.options.meta as TableMeta;
    const isSelf = row.original.userId === meta.currentUserId;
    return (
      <div>
        <div className={styles.userName}>{row.original.fullName}</div>
        {isSelf && <div className={styles.mutedText}>Your account</div>}
      </div>
    );
  },
});

const emailColumn = columnHelper.accessor("email", {
  id: "email",
  header: "Email",
});

const roleColumn = columnHelper.display({
  id: "role",
  header: "Current Role",
  cell: ({ row, table }) => {
    const meta = table.options.meta as TableMeta;
    const entry = row.original;
    const isSelf = entry.userId === meta.currentUserId;
    const draft = meta.drafts[entry.userId] ?? {
      role: entry.role,
      departmentId: entry.department ? String(entry.department.departmentId) : "",
    };

    return (
      <Select
        value={draft.role}
        isDisabled={isSelf}
        onChange={(value) => {
          meta.updateDraft(entry.userId, {
            role: value as User["role"],
            departmentId: value === "DEPARTMENT_ADMIN" ? draft.departmentId : "",
          });
        }}
      >
        {ROLES.map((role) => (
          <SelectItem key={role.value} id={role.value}>
            {role.label}
          </SelectItem>
        ))}
      </Select>
    );
  },
});

const departmentColumn = columnHelper.display({
  id: "department",
  header: "Department",
  cell: ({ row, table }) => {
    const meta = table.options.meta as TableMeta;
    const entry = row.original;
    const draft = meta.drafts[entry.userId] ?? {
      role: entry.role,
      departmentId: entry.department ? String(entry.department.departmentId) : "",
    };

    if (draft.role !== "DEPARTMENT_ADMIN") {
      return <span>{entry.department?.departmentName ?? "—"}</span>;
    }

    return (
      <Select
        value={draft.departmentId || null}
        onChange={(value) => {
          meta.updateDraft(entry.userId, { departmentId: value as string });
        }}
        placeholder="Select department"
      >
        {meta.departments.map((dept) => (
          <SelectItem key={dept.departmentId} id={String(dept.departmentId)}>
            {dept.departmentName}
          </SelectItem>
        ))}
      </Select>
    );
  },
});

const actionsColumn = columnHelper.display({
  id: "actions",
  header: "Action",
  cell: ({ row, table }) => {
    const meta = table.options.meta as TableMeta;
    const isSelf = row.original.userId === meta.currentUserId;
    return (
      <Button
        type="button"
        isDisabled={isSelf}
        onClick={() => {
          void meta.saveUser(row.original);
        }}
      >
        Save
      </Button>
    );
  },
});

export const columns = [fullNameColumn, emailColumn, roleColumn, departmentColumn, actionsColumn];

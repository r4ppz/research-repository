import * as RadixSelect from "@radix-ui/react-select";
import { createColumnHelper } from "@tanstack/react-table";
import { Check, ChevronDown } from "lucide-react";
import styles from "./columns.module.css";
import { Button } from "@/components/common/Button/Button";
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
      <RadixSelect.Root
        value={draft.role}
        disabled={isSelf}
        onValueChange={(value) => {
          meta.updateDraft(entry.userId, {
            role: value as User["role"],
            departmentId: value === "DEPARTMENT_ADMIN" ? draft.departmentId : "",
          });
        }}
      >
        <RadixSelect.Trigger className={styles.selectTrigger} aria-label="Role">
          <RadixSelect.Value />
          <RadixSelect.Icon className={styles.selectIcon}>
            <ChevronDown size={16} />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content className={styles.selectContent} position="popper" sideOffset={4}>
            <RadixSelect.Viewport className={styles.selectViewport}>
              {ROLES.map((role) => (
                <RadixSelect.Item key={role.value} value={role.value} className={styles.selectItem}>
                  <RadixSelect.ItemText>{role.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator className={styles.selectIndicator}>
                    <Check size={14} />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
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
      <RadixSelect.Root
        value={draft.departmentId}
        onValueChange={(value) => {
          meta.updateDraft(entry.userId, { departmentId: value });
        }}
      >
        <RadixSelect.Trigger className={styles.selectTrigger} aria-label="Department">
          <RadixSelect.Value placeholder="Select department" />
          <RadixSelect.Icon className={styles.selectIcon}>
            <ChevronDown size={16} />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content className={styles.selectContent} position="popper" sideOffset={4}>
            <RadixSelect.Viewport className={styles.selectViewport}>
              <RadixSelect.Item value="" className={styles.selectItem}>
                <RadixSelect.ItemText>Select department</RadixSelect.ItemText>
              </RadixSelect.Item>
              {meta.departments.map((dept) => (
                <RadixSelect.Item
                  key={dept.departmentId}
                  value={String(dept.departmentId)}
                  className={styles.selectItem}
                >
                  <RadixSelect.ItemText>{dept.departmentName}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator className={styles.selectIndicator}>
                    <Check size={14} />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
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

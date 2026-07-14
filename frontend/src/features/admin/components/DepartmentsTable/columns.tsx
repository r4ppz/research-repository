import { createColumnHelper } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import style from "../RequestTable/columns.module.css";
import type { AdminDepartment } from "@/api/admin/departments";
import { Button } from "@/components/common/Button/Button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog/ConfirmDialog";

export interface TableMeta {
  onEdit: (department: AdminDepartment) => void;
  onDelete: (department: AdminDepartment) => void;
}

const columnHelper = createColumnHelper<AdminDepartment>();

const departmentNameColumn = columnHelper.accessor("departmentName", {
  header: "Department Name",
  cell: (info) => info.getValue(),
});

const narrowFitMeta = { className: "narrowFit" } satisfies Record<string, unknown>;

const paperCountColumn = columnHelper.accessor("paperCount", {
  header: "Papers",
  cell: (info) => info.getValue(),
  meta: narrowFitMeta,
});

const userCountColumn = columnHelper.accessor("userCount", {
  header: "Users",
  cell: (info) => info.getValue(),
  meta: narrowFitMeta,
});

const actionsColumn = columnHelper.display({
  id: "actions",
  header: "Action",
  meta: narrowFitMeta,
  cell: ({ row, table }) => {
    const meta = table.options.meta as TableMeta;
    const department = row.original;

    return (
      <div className={style.actionButtonContainer}>
        <Button
          className={style.actionButton}
          onClick={() => {
            meta.onEdit(department);
          }}
        >
          <Edit className={style.actionIcon} />
        </Button>
        <ConfirmDialog
          title="Delete department?"
          description={`Are you sure you want to delete "${department.departmentName}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() => {
            meta.onDelete(department);
          }}
          trigger={
            <Button className={style.actionButton}>
              <Trash2 className={style.actionIcon} />
            </Button>
          }
        />
      </div>
    );
  },
});

export const columns = [departmentNameColumn, paperCountColumn, userCountColumn, actionsColumn];

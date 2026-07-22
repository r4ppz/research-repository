import { createColumnHelper } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import type { AdminDepartment } from "@/api/admin/departments";
import { ActionButton, ActionConfirm, TableActions } from "@/components/common/TableActions";

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
      <TableActions>
        <ActionButton icon={<Edit />} onPress={() => meta.onEdit(department)} />
        <ActionConfirm
          icon={<Trash2 />}
          confirmTitle="Delete department?"
          confirmDescription={`Are you sure you want to delete "${department.departmentName}"? This action cannot be undone.`}
          confirmText="Delete"
          onConfirm={() => meta.onDelete(department)}
        />
      </TableActions>
    );
  },
});

export const columns = [departmentNameColumn, paperCountColumn, userCountColumn, actionsColumn];

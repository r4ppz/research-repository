import { createColumnHelper } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import type { AdminDepartment } from "@/api/admin/departments";
import { TableActions, TableButton } from "@/components/common/TableActions";

export interface TableMeta {
  onEdit: (department: AdminDepartment) => void;
  onDelete: (department: AdminDepartment) => void;
}

const columnHelper = createColumnHelper<AdminDepartment>();

const departmentNameColumn = columnHelper.accessor("departmentName", {
  header: "Department Name",
  cell: (info) => info.getValue(),
});

const narrowFitMeta = { className: "narrowFit" };

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
        <TableButton
          icon={<Edit />}
          onPress={() => {
            meta.onEdit(department);
          }}
        />
        <TableButton
          icon={<Trash2 />}
          onPress={() => {
            meta.onDelete(department);
          }}
        />
      </TableActions>
    );
  },
});

export const columns = [departmentNameColumn, paperCountColumn, userCountColumn, actionsColumn];

import { FilePlus2 } from "lucide-react";
import { useState } from "react";
import { AddDepartmentModal } from "../../components/AddDepartmentModal/AddDepartmentModal";
import { DepartmentsTable } from "../../components/DepartmentsTable/DepartmentsTable";
import { EditDepartmentModal } from "../../components/EditDepartmentModal/EditDepartmentModal";
import { useDeleteDepartment } from "../../hooks/useAdminDepartmentActions";
import style from "./SuperAdminDepartmentsPage.module.css";
import type { AdminDepartment } from "@/api/admin/departments";
import { Button } from "@/components/common/Button/Button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog/ConfirmDialog";
import { toastQueue } from "@/components/common/Toast/Toast";
import { Footer } from "@/components/layout/Footer/Footer";
import { Header } from "@/components/layout/Header/Header";

export const SuperAdminDepartmentsPage = () => {
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<AdminDepartment | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete";
    departmentId: number;
    departmentName: string;
  } | null>(null);

  const deleteMutation = useDeleteDepartment();

  const handleConfirm = () => {
    if (!confirmAction) return;
    deleteMutation.mutate(confirmAction.departmentId, {
      onSuccess: () => {
        toastQueue.add({
          variant: "success",
          title: "Department Deleted",
          description: "Department deleted successfully.",
        });
      },
      onError: (err) => {
        toastQueue.add({
          variant: "error",
          title: "Delete Failed",
          description: err instanceof Error ? err.message : "Failed to delete department",
        });
      },
    });
    setConfirmAction(null);
  };

  return (
    <div className={style.page}>
      <Header />
      <main className={style.main}>
        <div className={style.mainContainer}>
          <section className={style.headerSection}>
            <div>
              <h1 className={style.titleHeader}>Manage Departments</h1>
              <p className={style.subtitle}>Create and manage school departments.</p>
            </div>
            <Button
              onClick={() => {
                setAddModalOpen(true);
              }}
              className={style.createButton}
            >
              <FilePlus2 className={style.iconTab} />
              Add Department
            </Button>
          </section>

          <DepartmentsTable
            onEdit={(department) => {
              setEditingDepartment(department);
            }}
            onDelete={(department) => {
              setConfirmAction({
                type: "delete",
                departmentId: department.departmentId,
                departmentName: department.departmentName,
              });
            }}
          />
        </div>
      </main>

      <AddDepartmentModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setAddModalOpen(false);
        }}
        onSuccess={() => {
          toastQueue.add({
            variant: "success",
            title: "Department Added",
            description: "Department added successfully.",
          });
        }}
        onError={(message) => {
          toastQueue.add({ variant: "error", title: "Add Failed", description: message });
        }}
      />

      <EditDepartmentModal
        isOpen={!!editingDepartment}
        department={editingDepartment}
        onClose={() => {
          setEditingDepartment(null);
        }}
        onSuccess={() => {
          toastQueue.add({
            variant: "success",
            title: "Department Updated",
            description: "Department updated successfully.",
          });
        }}
        onError={(message) => {
          toastQueue.add({ variant: "error", title: "Update Failed", description: message });
        }}
      />

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
        title="Delete department?"
        description={`Are you sure you want to delete "${confirmAction?.departmentName ?? ""}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleConfirm}
      />

      <Footer />
    </div>
  );
};

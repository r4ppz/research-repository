import { FilePlus2 } from "lucide-react";
import { useState } from "react";
import { AddDepartmentModal } from "../../components/AddDepartmentModal/AddDepartmentModal";
import { DepartmentsTable } from "../../components/DepartmentsTable/DepartmentsTable";
import { EditDepartmentModal } from "../../components/EditDepartmentModal/EditDepartmentModal";
import { useDeleteDepartment } from "../../hooks/useAdminDepartmentActions";
import style from "./SuperAdminDepartmentsPage.module.css";
import type { AdminDepartment } from "@/api/admin/departments";
import { Button } from "@/components/common/Button/Button";
import { toastQueue } from "@/components/common/Toast/Toast";
import { Footer } from "@/components/layout/Footer/Footer";
import { Header } from "@/components/layout/Header/Header";

export const SuperAdminDepartmentsPage = () => {
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<AdminDepartment | null>(null);

  const deleteMutation = useDeleteDepartment();

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
              deleteMutation.mutate(department.departmentId, {
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

      <Footer />
    </div>
  );
};

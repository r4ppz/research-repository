import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FilePlus2 } from "lucide-react";
import { useState } from "react";
import { AddDepartmentModal } from "../../components/DepartmentsTable/AddDepartmentModal";
import { DepartmentsTable } from "../../components/DepartmentsTable/DepartmentsTable";
import style from "./SuperAdminDepartmentsPage.module.css";
import { createDepartment } from "@/api/admin/departments";
import { NotificationDialog } from "@/components/common/AlertDialog/NotificationDialog";
import { Button } from "@/components/common/Button/Button";
import { Footer } from "@/components/layout/Footer/Footer";
import { Header } from "@/components/layout/Header/Header";

export const SuperAdminDepartmentsPage = () => {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const addMutation = useMutation({
    mutationFn: (name: string) => createDepartment({ departmentName: name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminDepartments"] });
      setAddModalOpen(false);
      setNotification({
        type: "success",
        title: "Success",
        message: "Department added successfully.",
      });
    },
    onError: (err) => {
      setNotification({
        type: "error",
        title: "Error",
        message: err instanceof Error ? err.message : "Failed to add department",
      });
    },
  });

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

          <DepartmentsTable />
        </div>
      </main>

      <AddDepartmentModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setAddModalOpen(false);
        }}
        onSave={(name) => {
          addMutation.mutate(name);
        }}
        isSaving={addMutation.isPending}
      />

      <NotificationDialog
        open={!!notification}
        onClose={() => {
          setNotification(null);
        }}
        type={notification?.type ?? "success"}
        title={notification?.title ?? ""}
        description={notification?.message ?? ""}
      />

      <Footer />
    </div>
  );
};

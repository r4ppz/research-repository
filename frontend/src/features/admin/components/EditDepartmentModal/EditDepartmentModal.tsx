import { useEffect, useState } from "react";
import { useUpdateDepartment } from "../../hooks/useAdminDepartmentActions";
import styles from "./EditDepartmentModal.module.css";
import type { AdminDepartment } from "@/api/admin/departments";
import { Button } from "@/components/common/Button/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/common/Dialog/Dialog";
import { Input } from "@/components/common/Input/Input";

interface EditDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: AdminDepartment | null;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export function EditDepartmentModal({
  isOpen,
  onClose,
  department,
  onSuccess,
  onError,
}: EditDepartmentModalProps) {
  const [name, setName] = useState("");
  const updateMutation = useUpdateDepartment();

  useEffect(() => {
    if (department && isOpen) {
      const id = window.setTimeout(() => {
        setName(department.departmentName);
      }, 0);

      return () => {
        window.clearTimeout(id);
      };
    }
    return undefined;
  }, [isOpen, department]);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!department || !name.trim()) return;

    updateMutation.mutate(
      { id: department.departmentId, name: name.trim() },
      {
        onSuccess: () => {
          onClose();
          onSuccess?.();
        },
        onError: (err) => {
          onError?.(err instanceof Error ? err.message : "Failed to update department");
        },
      },
    );
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogClose onClose={onClose} />
        <DialogTitle>Edit Department</DialogTitle>
        <DialogDescription style={{ display: "none" }}>Edit the department name.</DialogDescription>
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              required
              maxLength={64}
            />
          </div>
          <div className={styles.actions}>
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" isPending={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

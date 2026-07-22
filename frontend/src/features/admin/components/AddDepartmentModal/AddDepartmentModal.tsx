import { useState } from "react";
import { useCreateDepartment } from "../../hooks/useAdminDepartmentActions";
import styles from "./AddDepartmentModal.module.css";
import { Button } from "@/components/common/Button/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/common/Dialog/Dialog";
import { Input } from "@/components/common/Input/Input";

interface AddDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export function AddDepartmentModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: AddDepartmentModalProps) {
  const [name, setName] = useState("");
  const createMutation = useCreateDepartment();

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createMutation.mutate(name.trim(), {
      onSuccess: () => {
        setName("");
        onClose();
        onSuccess?.();
      },
      onError: (err) => {
        onError?.(err instanceof Error ? err.message : "Failed to add department");
      },
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Add Department"
    >
      <DialogContent>
        <DialogClose onClose={onClose} />
        <DialogTitle>Add Department</DialogTitle>
        <DialogDescription className={styles.hiddenDescription}>
          Create a new department.
        </DialogDescription>
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              placeholder="Department name"
              required
              maxLength={64}
            />
          </div>
          <div className={styles.actions}>
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" isPending={createMutation.isPending}>
              {createMutation.isPending ? "Adding..." : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

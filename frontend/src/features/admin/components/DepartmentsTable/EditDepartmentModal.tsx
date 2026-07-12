import { useEffect, useState } from "react";
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
  onSave: (id: number, name: string) => void;
  isSaving: boolean;
}

export function EditDepartmentModal({
  isOpen,
  onClose,
  department,
  onSave,
  isSaving,
}: EditDepartmentModalProps) {
  const [name, setName] = useState("");

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
    onSave(department.departmentId, name.trim());
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
          <div style={{ marginBottom: "var(--space-md)" }}>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              required
              maxLength={64}
            />
          </div>
          <div
            style={{
              display: "flex",
              gap: "var(--space-sm)",
              justifyContent: "flex-end",
            }}
          >
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" isPending={isSaving}>
              {isSaving ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

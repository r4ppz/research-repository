import { useState } from "react";
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
  onSave: (name: string) => void;
  isSaving: boolean;
}

export function AddDepartmentModal({ isOpen, onClose, onSave, isSaving }: AddDepartmentModalProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim());
    setName("");
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
        <DialogTitle>Add Department</DialogTitle>
        <DialogDescription style={{ display: "none" }}>Create a new department.</DialogDescription>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "var(--space-md)" }}>
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
              {isSaving ? "Adding..." : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

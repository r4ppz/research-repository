import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import style from "./AddUserModal.module.css";
import { createUser } from "@/api/admin/users";
import { getDepartments } from "@/api/filter";
import { Button } from "@/components/common/Button/Button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/common/Dialog/Dialog";
import { Select, SelectItem } from "@/components/common/Select/Select";
import { TextField } from "@/components/common/TextField/TextField";
import type { User } from "@/types";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

const ROLES: { value: User["role"]; label: string }[] = [
  { value: "STUDENT", label: "Student" },
  { value: "FACULTY", label: "Faculty" },
  { value: "DEPARTMENT_ADMIN", label: "Department Admin" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
];

export const AddUserModal = ({ isOpen, onClose, onUserAdded }: AddUserModalProps) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<User["role"]>("STUDENT");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      resetForm();
      onClose();
      onUserAdded();
    },
    onError: (error: unknown) => {
      setSubmitError(error instanceof Error ? error.message : "Failed to create user");
    },
  });

  const resetForm = () => {
    setEmail("");
    setRole("STUDENT");
    setDepartmentId("");
    setSubmitError(null);
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!email.trim()) {
      setSubmitError("Email is required");
      return;
    }

    createMutation.mutate({
      email: email.trim(),
      role,
      departmentId: role === "DEPARTMENT_ADMIN" && departmentId ? Number(departmentId) : undefined,
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className={style.modal}>
        <DialogClose onClose={onClose} />
        <DialogTitle className={style.modalTitle}>Add New User</DialogTitle>
        <form onSubmit={handleSubmit} className={style.form}>
          <div className={style.field}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="user@gmail.com"
              isRequired
            />
          </div>

          <Select
            label="Role"
            selectedKey={role}
            onSelectionChange={(v) => {
              const r = v as User["role"];
              setRole(r);
              if (r !== "DEPARTMENT_ADMIN") {
                setDepartmentId("");
              }
            }}
          >
            {ROLES.map((r) => (
              <SelectItem key={r.value} id={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </Select>

          {role === "DEPARTMENT_ADMIN" && (
            <Select
              label="Department"
              selectedKey={departmentId || null}
              onSelectionChange={(v) => {
                setDepartmentId(v as string);
              }}
              placeholder="Select Department"
            >
              {departments?.map((dept) => (
                <SelectItem key={dept.departmentId} id={String(dept.departmentId)}>
                  {dept.departmentName}
                </SelectItem>
              )) ?? []}
            </Select>
          )}

          {submitError && <p className={style.error}>{submitError}</p>}

          <div className={style.actionsContainer}>
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" isPending={createMutation.isPending}>
              {createMutation.isPending ? "Adding..." : "Add User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

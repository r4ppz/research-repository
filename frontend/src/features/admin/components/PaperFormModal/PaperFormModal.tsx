import { useQuery } from "@tanstack/react-query";
import { SyntheticEvent, useEffect, useState } from "react";
import { useCreatePaper } from "../../hooks/useAdminPaperActions";
import { FileUpload } from "../FileUpload/FileUpload";
import style from "./PaperFormModal.module.css";
import { getDepartments } from "@/api/filter";
import { Button } from "@/components/common/Button/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/common/Dialog/Dialog";
import { Input } from "@/components/common/Input/Input";
import { Select, SelectItem } from "@/components/common/Select/Select";
import { Textarea } from "@/components/common/Textarea/Textarea";
import { toastQueue } from "@/components/common/Toast/Toast";
import { useAuth } from "@/features/auth/context/useAuth";
import { extractApiError, getUserErrorMessage } from "@/util/errorHandler";
import { isUserDepartmentAdmin, isUserSuperAdmin } from "@/util/roleBasedAccess";

interface PaperFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaperFormModal = ({ isOpen, onClose }: PaperFormModalProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [abstractText, setAbstractText] = useState("");
  const [departmentId, setDepartmentId] = useState<number | "">("");
  const [submissionDate, setSubmissionDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto-set department for Department Admin
  useEffect(() => {
    if (isOpen && isUserDepartmentAdmin(user) && user.department) {
      setDepartmentId(user.department.departmentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  const createMutation = useCreatePaper();

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!file) {
      setSubmitError("Please select a file to upload.");
      return;
    }

    if (departmentId === "") {
      setSubmitError("Please select a department.");
      return;
    }

    createMutation.mutate(
      {
        metadata: {
          title,
          authorName,
          abstractText,
          departmentId,
          submissionDate,
        },
        file,
      },
      {
        onSuccess: () => {
          onClose();
          resetForm();
          toastQueue.add({
            variant: "success",
            title: "Paper Created",
            description: "Paper created successfully.",
          });
        },
        onError: (error: unknown) => {
          setSubmitError(getUserErrorMessage(extractApiError(error)));
        },
      },
    );
  };

  const resetForm = () => {
    setTitle("");
    setAuthorName("");
    setAbstractText("");
    // Only reset department if user is Super Admin
    if (isUserSuperAdmin(user)) {
      setDepartmentId("");
    }
    setSubmissionDate("");
    setFile(null);
  };

  const isDepartmentDisabled = isUserDepartmentAdmin(user);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetForm();
          onClose();
        }
      }}
      title="Add New Research Paper"
    >
      <DialogContent className={style.modal}>
        <DialogClose onClose={onClose} />
        <DialogTitle className={style.modalTitle}>Add New Research Paper</DialogTitle>
        <DialogDescription style={{ display: "none" }}>
          Fill in the paper metadata and upload a file.
        </DialogDescription>
        <form onSubmit={handleSubmit} className={style.form}>
          <div className={style.leftColumn}>
            <div className={style.field}>
              <label htmlFor="title">Title</label>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
                required
              />
            </div>

            <div className={style.field}>
              <label htmlFor="author">Author Name</label>
              <Input
                id="author"
                value={authorName}
                onChange={(e) => {
                  setAuthorName(e.target.value);
                }}
                required
              />
            </div>

            <div className={style.field}>
              <Select
                label="Department"
                value={departmentId ? departmentId.toString() : undefined}
                onChange={(v) => {
                  setDepartmentId(Number(v));
                }}
                isDisabled={isDepartmentDisabled}
                placeholder="Select Department"
              >
                {departments?.map((dept) => (
                  <SelectItem key={dept.departmentId} id={dept.departmentId.toString()}>
                    {dept.departmentName}
                  </SelectItem>
                )) ?? []}
              </Select>
            </div>

            <div className={style.field}>
              <label htmlFor="date">Submission Date</label>
              <Input
                id="date"
                type="date"
                value={submissionDate}
                onChange={(e) => {
                  setSubmissionDate(e.target.value);
                }}
                required
              />
            </div>
          </div>

          <div className={style.rightColumn}>
            <div className={style.field}>
              <label htmlFor="abstract">Abstract</label>
              <Textarea
                id="abstract"
                value={abstractText}
                onChange={(e) => {
                  setAbstractText(e.target.value);
                }}
                required
              />
            </div>

            <div className={style.field}>
              <label htmlFor="paper-file">Paper File (PDF/DOCX)</label>
              <FileUpload
                id="paper-file"
                value={file}
                onChange={(f) => {
                  setFile(f);
                }}
                required
              />
            </div>
          </div>

          {submitError && <p className={style.error}>{submitError}</p>}

          <div className={style.actionsContainer}>
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" isPending={createMutation.isPending}>
              {createMutation.isPending ? "Adding..." : "Add Paper"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

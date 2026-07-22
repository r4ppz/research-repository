import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { SyntheticEvent, useState } from "react";
import style from "./PaperUploadModal.module.css";
import { getDepartments } from "@/api/filter";
import { submitPaper, updateSubmission } from "@/api/paper";
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
import { FileUpload } from "@/features/admin/components/FileUpload/FileUpload";
import type { CreatePaperMetadata } from "@/api/admin/papers";
import type { ResearchPaper } from "@/types";
import { extractApiError, getUserErrorMessage } from "@/util/errorHandler";

interface PaperUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  paper?: ResearchPaper | null;
}

const emptyState = {
  title: "",
  authorName: "",
  abstractText: "",
  departmentId: "" as number | "",
  submissionDate: "",
  file: null as File | null,
};

const paperToState = (paper?: ResearchPaper | null) => {
  if (!paper) {
    return emptyState;
  }
  return {
    title: paper.title,
    authorName: paper.authorName,
    abstractText: paper.abstractText,
    departmentId: paper.department.departmentId,
    submissionDate: paper.submissionDate,
    file: null as File | null,
  };
};

export const PaperUploadModal = ({ isOpen, onClose, onSuccess, paper }: PaperUploadModalProps) => {
  const isEditing = !!paper;
  const [form, setForm] = useState(() => paperToState(paper));
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFormChange = (field: string) => (value: string | number | File | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  const createMutation = useMutation({
    mutationFn: ({ metadata, file }: { metadata: CreatePaperMetadata; file: File }) =>
      submitPaper(metadata, file),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      metadata,
      file,
    }: {
      id: number;
      metadata: CreatePaperMetadata;
      file?: File | null;
    }) => updateSubmission(id, metadata, file),
  });

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (form.departmentId === "") {
      setSubmitError("Please select a department.");
      return;
    }

    const metadata: CreatePaperMetadata = {
      title: form.title,
      authorName: form.authorName,
      abstractText: form.abstractText,
      departmentId: form.departmentId,
      submissionDate: form.submissionDate,
    };

    const selectedFile = form.file;
    if (!isEditing && !selectedFile) {
      setSubmitError("Please select a file to upload.");
      return;
    }

    const onMutationSuccess = () => {
      onClose();
      onSuccess?.();
      toastQueue.add({
        variant: "success",
        title: isEditing ? "Paper Updated" : "Paper Submitted",
        description: isEditing
          ? "Your submission has been updated."
          : "Your paper has been submitted for review.",
      });
    };

    const onMutationError = (error: unknown) => {
      setSubmitError(getUserErrorMessage(extractApiError(error)));
    };

    if (isEditing && paper.paperId) {
      updateMutation.mutate(
        { id: paper.paperId, metadata, file: form.file },
        { onSuccess: onMutationSuccess, onError: onMutationError },
      );
    } else if (selectedFile) {
      createMutation.mutate(
        { metadata, file: selectedFile },
        { onSuccess: onMutationSuccess, onError: onMutationError },
      );
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      title={isEditing ? "Edit Submission" : "Submit a Research Paper"}
      key={paper?.paperId ?? "new"}
    >
      <DialogContent className={style.modal}>
        <DialogClose onClose={onClose} />
        <DialogTitle className={style.modalTitle}>
          {isEditing ? "Edit Submission" : "Submit a Research Paper"}
        </DialogTitle>
        <DialogDescription style={{ display: "none" }}>
          Fill in the paper metadata and upload a file for review.
        </DialogDescription>
        <form onSubmit={handleSubmit} className={style.form}>
          <div className={style.leftColumn}>
            <div className={style.field}>
              <label htmlFor="title">Title</label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => {
                  handleFormChange("title")(e.target.value);
                }}
                required
              />
            </div>

            <div className={style.field}>
              <label htmlFor="author">Author Name</label>
              <Input
                id="author"
                value={form.authorName}
                onChange={(e) => {
                  handleFormChange("authorName")(e.target.value);
                }}
                required
              />
            </div>

            <div className={style.field}>
              <Select
                label="Department"
                value={form.departmentId ? String(form.departmentId) : undefined}
                onChange={(v) => {
                  handleFormChange("departmentId")(Number(v));
                }}
                placeholder="Select Department"
              >
                {departments?.map((dept) => (
                  <SelectItem key={dept.departmentId} id={String(dept.departmentId)}>
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
                value={form.submissionDate}
                onChange={(e) => {
                  handleFormChange("submissionDate")(e.target.value);
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
                value={form.abstractText}
                onChange={(e) => {
                  handleFormChange("abstractText")(e.target.value);
                }}
                required
              />
            </div>

            <div className={style.field}>
              <label htmlFor="paper-file">
                Paper File (PDF/DOCX)
                {isEditing ? " (leave empty to keep current)" : ""}
              </label>
              <FileUpload
                id="paper-file"
                value={form.file}
                onChange={(f) => {
                  handleFormChange("file")(f);
                }}
                required={!isEditing}
              />
            </div>
          </div>

          {submitError && <p className={style.error}>{submitError}</p>}

          <div className={style.actionsContainer}>
            <Button variant="secondary" onPress={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" isPending={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Submit for Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

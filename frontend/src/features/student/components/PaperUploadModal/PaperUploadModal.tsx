import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { SyntheticEvent, useState } from "react";
import style from "./PaperUploadModal.module.css";
import { getDepartments } from "@/api/filter";
import { submitPaper } from "@/api/paper";
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
import { extractApiError, getUserErrorMessage } from "@/util/errorHandler";

interface PaperUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaperUploadModal = ({ isOpen, onClose }: PaperUploadModalProps) => {
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [abstractText, setAbstractText] = useState("");
  const [departmentId, setDepartmentId] = useState<number | "">("");
  const [submissionDate, setSubmissionDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  const submitMutation = useMutation({
    mutationFn: ({ metadata, file }: { metadata: Parameters<typeof submitPaper>[0]; file: File }) =>
      submitPaper(metadata, file),
  });

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

    submitMutation.mutate(
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
          setTitle("");
          setAuthorName("");
          setAbstractText("");
          setDepartmentId("");
          setSubmissionDate("");
          setFile(null);
          toastQueue.add({
            variant: "success",
            title: "Paper Submitted",
            description: "Your paper has been submitted for review.",
          });
        },
        onError: (error: unknown) => {
          setSubmitError(getUserErrorMessage(extractApiError(error)));
        },
      },
    );
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      title="Submit a Research Paper"
    >
      <DialogContent className={style.modal}>
        <DialogClose onClose={onClose} />
        <DialogTitle className={style.modalTitle}>Submit a Research Paper</DialogTitle>
        <DialogDescription style={{ display: "none" }}>
          Fill in the paper metadata and upload a file for review.
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
            <Button type="submit" isPending={submitMutation.isPending}>
              {submitMutation.isPending ? "Submitting..." : "Submit for Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

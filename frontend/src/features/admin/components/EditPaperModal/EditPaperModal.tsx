import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { SyntheticEvent, useEffect, useState } from "react";
import { useUpdatePaper } from "../../hooks/useAdminPaperActions";
import style from "./EditPaperModal.module.css";
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
import { useAuth } from "@/features/auth/context/useAuth";
import type { ResearchPaper } from "@/types";

interface EditPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  paper: ResearchPaper | null;
}

export const EditPaperModal = ({ isOpen, onClose, paper }: EditPaperModalProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [abstractText, setAbstractText] = useState("");
  const [departmentId, setDepartmentId] = useState<number | "">("");
  const [submissionDate, setSubmissionDate] = useState("");

  const isDepartmentDisabled = user?.role === "DEPARTMENT_ADMIN";

  // Sync state when paper changes or modal opens
  // Defer state updates to the next tick to avoid synchronous setState calls
  // inside the effect which can trigger cascading renders.
  useEffect(() => {
    if (paper && isOpen) {
      const id = window.setTimeout(() => {
        setTitle(paper.title);
        setAuthorName(paper.authorName);
        setAbstractText(paper.abstractText);
        setDepartmentId(paper.department.departmentId);
        setSubmissionDate(paper.submissionDate.split("T")[0]);
      }, 0);

      return () => {
        window.clearTimeout(id);
      };
    }
    return undefined;
  }, [isOpen, paper]);

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  const updateMutation = useUpdatePaper();

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    if (!paper || departmentId === "") return;

    updateMutation.mutate(
      {
        id: paper.paperId,
        metadata: {
          title,
          authorName,
          abstractText,
          departmentId,
          submissionDate,
        },
      },
      {
        onSuccess: () => {
          onClose();
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
      title="Edit Research Paper"
    >
      <DialogContent className={style.modal}>
        <DialogClose onClose={onClose} />
        <DialogTitle className={style.modalTitle}>Edit Research Paper</DialogTitle>
        <DialogDescription style={{ display: "none" }}>Edit the paper metadata.</DialogDescription>
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
                  <SelectItem id={dept.departmentId.toString()}>{dept.departmentName}</SelectItem>
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
                className={style.abstractTextarea}
                onChange={(e) => {
                  setAbstractText(e.target.value);
                }}
                required
              />
            </div>
          </div>

          <div className={clsx(style.actions, style.fullWidth)}>
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" isPending={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update Paper"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

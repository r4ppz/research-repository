import clsx from "clsx";
import { usePaperRequest } from "./hook/usePaperRequest";
import style from "./ResearchModal.module.css";
import { downloadFile } from "@/api/files";
import { Button } from "@/components/common/Button/Button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/common/Dialog/Dialog";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { useAuth } from "@/features/auth/context/useAuth";
import { usePaperById } from "@/features/library/hooks/usePaperById";
import type { ResearchPaper } from "@/types";
import { triggerBrowserDownload } from "@/util/download";
import { formatDateLong } from "@/util/formatDate";
import { isUserAdmin, isUserFaculty, isUserStudent } from "@/util/roleBasedAccess";

interface ResearchModalProps {
  isOpen: boolean;
  paperId?: number | null;
  paper?: ResearchPaper | null;
  onClose: () => void;
}

export const ResearchModal = ({
  isOpen,
  paper: paperProp,
  paperId,
  onClose,
}: ResearchModalProps) => {
  const effectiveId = paperProp ? null : (paperId ?? null);
  const { paper: fetchedPaper, loading, error } = usePaperById(effectiveId);
  const paper = paperProp ?? fetchedPaper;
  const { user } = useAuth();
  const { requestExists, isRequestLoading, requestDocument } = usePaperRequest(effectiveId, user);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          className={clsx(style.modalLoadingOrError, style.moda)}
          aria-describedby={undefined}
        >
          <DialogClose onClose={onClose} />
          <LoadingSpinner message="Fetching details" />
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !paper) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange} title="Error">
        <DialogContent
          className={clsx(style.modalLoadingOrError, style.modal)}
          aria-describedby={undefined}
        >
          <DialogClose onClose={onClose} />
          <DialogTitle className={style.title}>Error</DialogTitle>
          <p>{error ?? "Paper not found"}</p>
          <Button onClick={onClose}>Close</Button>
        </DialogContent>
      </Dialog>
    );
  }

  const formattedDate = formatDateLong(paper.submissionDate);
  const department = paper.department.departmentName;

  const handleDownload = () => {
    if (!paper?.paperId) return;
    downloadFile(paper.paperId).then(({ blob, filename }) => {
      triggerBrowserDownload(blob, filename);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange} title={paper.title}>
      <DialogContent className={style.modal} aria-describedby={undefined}>
        <DialogClose onClose={onClose} />
        <div className={style.infoWrapper}>
          <DialogTitle className={style.title}>{paper.title}</DialogTitle>
          <div className={style.authordateWrapper}>
            <p className={style.author}>{paper.authorName}</p>
            <p className={style.date}>{formattedDate}</p>
          </div>
        </div>

        <div className={style.departmentArchivedContainer}>
          <div className={style.departmentContainer}>
            <p className={style.department}>{department}</p>
          </div>
          {paper.archived && (
            <div className={style.archivedContainer}>
              <p className={style.archived}>Archived</p>
            </div>
          )}
        </div>

        <div className={style.abstractWrapper}>
          <h3 className={style.abtractHeader}>Abstract</h3>
          <p className={style.abstractText}>{paper.abstractText}</p>
        </div>

        {(isUserStudent(user) || isUserFaculty(user)) &&
          !paper.archived &&
          !!paper.uploadedBy && paper.uploadedBy.userId !== user?.userId && (
            <Button
              onPress={requestDocument}
              isDisabled={requestExists}
              isPending={isRequestLoading}
              variant="primary"
            >
              {requestExists ? "Request Submitted" : "Request Document"}
            </Button>
          )}
        {isUserAdmin(user) && (
          <Button onPress={handleDownload} variant="primary">
            Download
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

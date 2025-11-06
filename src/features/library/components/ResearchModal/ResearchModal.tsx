import Button from "@/components/common/Button/Button";
import Modal from "@/components/common/Modal/Modal";
import { useAuth } from "@/features/auth/context/useAuth";
import { createDocumentRequest, getUserRequests } from "@/temp/requestService";
import { type DocumentRequest, type ResearchPaper } from "@/types";
import { formatDateLong } from "@/util/formatDate";
import style from "./ResearchModal.module.css";

interface ResearchModalProps {
  isOpen: boolean;
  researchPaper: ResearchPaper;
  onClose: () => void;
}

function ResearchModal({ isOpen, researchPaper, onClose }: ResearchModalProps) {
  const { user } = useAuth();
  const formattedDate = formatDateLong(researchPaper.submissionDate);
  const department = researchPaper.department.departmentName;

  const handleRequestDocument = () => {
    if (!user) {
      console.error("No user is currently logged in");
      return;
    }

    // Check if the user has already requested this paper
    const userRequests = getUserRequests(user.userId);
    const existingRequest = userRequests.find(
      (request: DocumentRequest) => request.paper.paperId === researchPaper.paperId,
    );

    if (existingRequest) {
      alert(`You have already requested this paper "${researchPaper.title}".`);
      return;
    }

    // Create the new request using the service
    createDocumentRequest(researchPaper, user);
    onClose();
    alert(`Document request for "${researchPaper.title}" has been submitted successfully!`);
  };

  return (
    <Modal className={style.modal} isOpen={isOpen} onClose={onClose}>
      <div className={style.infoWrapper}>
        <h1 className={style.title}>{researchPaper.title}</h1>
        <div className={style.authordateWrapper}>
          <p className={style.author}>{researchPaper.authorName}</p>
          <p className={style.date}>{formattedDate}</p>
        </div>
      </div>
      <div className={style.departmentContainer}>
        <p className={style.department}>{department}</p>
      </div>
      <div className={style.abstractWrapper}>
        <h3 className={style.abtractHeader}>Abstract</h3>
        <p className={style.abstractText}>{researchPaper.abstractText}</p>
      </div>
      <Button onClick={handleRequestDocument}>Request Document</Button>
    </Modal>
  );
}

export default ResearchModal;

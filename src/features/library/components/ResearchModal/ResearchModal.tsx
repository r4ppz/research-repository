import { ResearchPaper } from "@/types";
import Button from "@/components/common/Button/Button";
import style from "./ResearchModal.module.css";

interface ResearchModalProps {
  researchPaper: ResearchPaper;
  onClose: () => void;
}

function ResearchModal({ researchPaper: researchPaper, onClose }: ResearchModalProps) {
  const formattedDate = new Date(researchPaper.submissionDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const department = researchPaper.department.departmentName;

  return (
    <div className={style.overlay} onClick={onClose}>
      <div
        className={style.modal}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className={style.headerWrapper}>
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
        <Button onClick={onClose}>Request Document</Button>
      </div>
    </div>
  );
}

export default ResearchModal;

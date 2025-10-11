import { Eye } from "lucide-react";
import style from "./ResearchCard.module.css";
import Button from "@/components/common/Button/Button";
import { type ResearchPaper } from "@/types";

interface ResearchCardProps {
  researchPaper: ResearchPaper;
  onView: () => void;
}

function ResearchCard({ researchPaper, onView }: ResearchCardProps) {
  const formattedDate = new Date(researchPaper.submissionDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const department = researchPaper.department.departmentName;

  return (
    <div className={style.card}>
      <div className={style.titleContainer}>
        <h1 className={style.title}>{researchPaper.title}</h1>
        <div className={style.authordateWrapper}>
          <p className={style.author}>{researchPaper.authorName}</p>
          <p className={style.date}>{formattedDate}</p>
        </div>
      </div>
      <div className={style.departmentContainer}>
        <p className={style.department}>{department}</p>
      </div>
      <p className={style.abstract}>{researchPaper.abstractText}</p>
      <Button onClick={onView}>
        <Eye size={18} />
        Read Abstract
      </Button>
    </div>
  );
}

export default ResearchCard;

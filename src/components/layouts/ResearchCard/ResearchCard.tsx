import { Eye } from "lucide-react";
import Button from "../../common/Button/Button";
import style from "./ResearchCard.module.css";
import Pdf from "../../../types/Pdf";

function ResearchCard({ pdf, onView }: { pdf: Pdf; onView: () => void }) {
  const formattedDate = new Date(pdf.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={style.card}>
      <div className={style.titleContainer}>
        <h1 className={style.title}>{pdf.title}</h1>
        <div className={style.authordateWrapper}>
          <p className={style.author}>{pdf.author}</p>
          <p className={style.date}>{formattedDate}</p>
        </div>
      </div>
      <div className={style.departmentContainer}>
        <p className={style.department}>{pdf.department}</p>
      </div>
      <p className={style.abstract}>{pdf.abstract}</p>
      <Button onClick={onView}>
        <Eye size={18} />
        Read Abstract
      </Button>
    </div>
  );
}

export default ResearchCard;

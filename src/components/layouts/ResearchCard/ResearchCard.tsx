import { Eye } from "lucide-react";
import Button from "../../common/Button/Button";
import style from "./ResearchCard.module.css";
import Pdf from "../../../types/Pdf";

function ResearchCard({ title, author, date, department, abstract }: Pdf) {
  return (
    <div className={style.card}>
      <div className={style.titleContainer}>
        <h1 className={style.title}>{title}</h1>
        <div className={style.authordateWrapper}>
          <p className={style.author}>{author}</p>
          <p className={style.date}>{date}</p>
        </div>
      </div>
      <div className={style.departmentContainer}>
        <p className={style.department}>{department}</p>
      </div>
      <p className={style.abstract}>{abstract}</p>
      <Button>
        <Eye size={18} />
        Read Abstract
      </Button>
    </div>
  );
}

export default ResearchCard;

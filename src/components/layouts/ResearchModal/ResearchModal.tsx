import Pdf from "../../../types/Pdf";
import Button from "../../common/Button/Button";
import style from "./ResearchModal.module.css";

function ResearchModal({ pdf, onClose }: { pdf: Pdf; onClose: () => void }) {
  return (
    <div className={style.overlay} onClick={onClose}>
      <div
        className={style.modal}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className={style.headerWrapper}>
          <h1 className={style.title}>{pdf.title}</h1>
          <div className={style.authordateWrapper}>
            <p className={style.author}>{pdf.author}</p>
            <p className={style.date}>{pdf.date}</p>
          </div>
        </div>
        <div className={style.departmentContainer}>
          <p className={style.department}>{pdf.department}</p>
        </div>
        <div className={style.abstractWrapper}>
          <h3 className={style.abtractHeader}>Abstract</h3>
          <p className={style.abstractText}>{pdf.abstract}</p>
        </div>
        <Button onClick={onClose}>Request Document</Button>
      </div>
    </div>
  );
}

export default ResearchModal;

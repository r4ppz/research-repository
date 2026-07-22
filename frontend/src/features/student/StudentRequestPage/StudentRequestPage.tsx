import { FileText, Upload } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import style from "./StudentRequestPage.module.css";
import { PaperUploadModal } from "@/features/student/components/PaperUploadModal/PaperUploadModal";
import { StudentSubmissionTable } from "@/features/student/components/StudentSubmissionTable/StudentSubmissionTable";
import { Button } from "@/components/common/Button/Button";
import { Footer } from "@/components/layout/Footer/Footer";
import { Header } from "@/components/layout/Header/Header";
import { MyRequestTable } from "@/features/my-requests/MyRequestTable/MyRequestTable";

export const StudentRequestPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "submissions" ? "submissions" : "requests";
  const [tab, setTab] = useState<"requests" | "submissions">(initialTab);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className={style.page}>
      <Header />
      <main className={style.main}>
        <div className={style.mainContainer}>
          <h1 className={style.titleHeader}>My Activity</h1>

          <Button
            onClick={() => {
              setIsUploadOpen(true);
            }}
            className={style.uploadButton}
          >
            <Upload className={style.iconUpload} />
            Upload Paper
          </Button>

          <div className={style.tabsContainer}>
            <Button
              variant={tab === "requests" ? "primary" : "secondary"}
              className={style.tabButton}
              onClick={() => {
                setTab("requests");
              }}
            >
              <FileText className={style.iconTab} />
              My Requests
            </Button>

            <Button
              variant={tab === "submissions" ? "primary" : "secondary"}
              className={style.tabButton}
              onClick={() => {
                setTab("submissions");
              }}
            >
              <Upload className={style.iconTab} />
              My Submissions
            </Button>
          </div>

          <section className={style.tableSection}>
            {tab === "requests" ? <MyRequestTable /> : <StudentSubmissionTable />}
          </section>
        </div>
      </main>

      <PaperUploadModal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
        }}
      />

      <Footer />
    </div>
  );
};

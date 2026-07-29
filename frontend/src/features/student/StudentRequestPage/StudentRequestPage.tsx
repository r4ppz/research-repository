import { FileText, Upload } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import style from "./StudentRequestPage.module.css";
import { Button } from "@/components/common/Button/Button";
import { Footer } from "@/components/layout/Footer/Footer";
import { Header } from "@/components/layout/Header/Header";
import { MyRequestTable } from "@/features/my-requests/MyRequestTable/MyRequestTable";
import { PaperUploadModal } from "@/features/student/components/PaperUploadModal/PaperUploadModal";
import { StudentSubmissionTable } from "@/features/student/components/StudentSubmissionTable/StudentSubmissionTable";

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
          <div className={style.headerSection}>
            <div>
              <h1 className={style.titleHeader}>My Activity</h1>
              <p className={style.subtitle}>
                View your document requests and manage your paper submissions.
              </p>
            </div>

            <Button
              onPress={() => {
                setIsUploadOpen(true);
              }}
              className={style.uploadButton}
            >
              <Upload className={style.iconUpload} />
              Submit Paper
            </Button>
          </div>

          <div className={style.tabsContainer}>
            <Button
              variant={tab === "requests" ? "primary" : "secondary"}
              className={style.tabButton}
              onPress={() => {
                setTab("requests");
              }}
            >
              <FileText className={style.iconTab} />
              My Requests
            </Button>

            <Button
              variant={tab === "submissions" ? "primary" : "secondary"}
              className={style.tabButton}
              onPress={() => {
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

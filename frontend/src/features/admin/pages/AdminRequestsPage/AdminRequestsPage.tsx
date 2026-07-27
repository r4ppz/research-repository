import { FileText, Upload } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ManageSubmissionTable } from "../../components/ManageSubmissionTable/ManageSubmissionTable";
import { RequestsTable } from "../../components/RequestTable/RequestTable";
import style from "./AdminRequestsPage.module.css";
import { Button } from "@/components/common/Button/Button";
import { Footer } from "@/components/layout/Footer/Footer";
import { Header } from "@/components/layout/Header/Header";
import { useAuth } from "@/features/auth/context/useAuth";
import { isUserSuperAdmin } from "@/util/roleBasedAccess";

export const AdminRequestsPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const showDepartment = isUserSuperAdmin(user);
  const initialTab =
    searchParams.get("tab") === "submissions" ? "submissions" : "download-requests";
  const [tab, setTab] = useState<"download-requests" | "submissions">(initialTab);

  return (
    <div className={style.page}>
      <Header />
      <main className={style.main}>
        <div className={style.mainContainer}>
          <div className={style.tabsContainer}>
            <Button
              variant={tab === "download-requests" ? "primary" : "secondary"}
              className={style.tabButton}
              onClick={() => {
                setTab("download-requests");
              }}
            >
              <FileText className={style.iconTab} />
              Download Requests
            </Button>

            <Button
              variant={tab === "submissions" ? "primary" : "secondary"}
              className={style.tabButton}
              onClick={() => {
                setTab("submissions");
              }}
            >
              <Upload className={style.iconTab} />
              Paper Submissions
            </Button>
          </div>

          <section className={style.tableSection}>
            {tab === "download-requests" ? (
              <RequestsTable showDepartment={showDepartment} />
            ) : (
              <ManageSubmissionTable showDepartment={showDepartment} />
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

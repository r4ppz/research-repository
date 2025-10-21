import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import AdminRequestTable from "@/features/admins/components/RequestTable";
import { MOCK_REQUESTS } from "@/mocks/mockData";
import style from "./RequestPage.module.css";

function RequestPage() {
  const handleAction = (requestId: number, action: "accept" | "reject") => {
    // TODO: Implement accept/reject logic
    console.log(`${action} request with ID: ${String(requestId)}`);
  };

  return (
    <div className={style.page}>
      <Header />
      <main className={style.main}>
        <h1 className={style.titleHeader}>Manage Document Requests (Super Admin)</h1>
        <div className={style.tableSection}>
          <AdminRequestTable requests={MOCK_REQUESTS} onAction={handleAction} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default RequestPage;

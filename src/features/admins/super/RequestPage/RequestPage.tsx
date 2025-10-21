import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import AdminRequestTable from "@/features/admins/components/RequestTable";
import { useDepartmentRequestFilter } from "@/hooks/useDepartmentRequestFilter";
import { MOCK_REQUESTS } from "@/mocks/mockData";
import style from "./RequestPage.module.css";

function RequestPage() {
  const filteredRequests = useDepartmentRequestFilter(MOCK_REQUESTS);

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
          <AdminRequestTable
            requests={filteredRequests}
            onAction={handleAction}
            showDepartmentColumn={true} // Super admin can see department column
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default RequestPage;

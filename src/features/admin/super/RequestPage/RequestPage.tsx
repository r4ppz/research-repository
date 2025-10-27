import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner/LoadingSpinner";
import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import AdminRequestTable from "@/features/admin/components/RequestTable";
import { useDepartmentRequestFilter } from "@/features/admin/hooks/useDepartmentRequestFilter";
import { MOCK_REQUESTS } from "@/mocks/mockData";
import style from "./RequestPage.module.css";

function RequestPage() {
  const [loading, setLoading] = useState(true);
  const filteredRequests = useDepartmentRequestFilter(MOCK_REQUESTS);

  const handleAction = (requestId: number, action: "accept" | "reject") => {
    // TODO: Implement accept/reject logic
    console.log(`${action} request with ID: ${String(requestId)}`);
  };

  // Simulate loading delay for demo purposes
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (loading) {
    return (
      <div className={style.loadingContainer}>
        <LoadingSpinner size="lg" message="Loading document requests..." />
      </div>
    );
  }

  return (
    <div className={style.page}>
      <Header />
      <main className={style.main}>
        <h1 className={style.titleHeader}>Manage Document Requests (Super Admin)</h1>
        <div className={style.tableSection}>
          <AdminRequestTable
            requests={filteredRequests}
            onAction={handleAction}
            showDepartmentColumn={true}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default RequestPage;

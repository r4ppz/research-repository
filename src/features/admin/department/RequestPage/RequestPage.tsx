import { useEffect, useState } from "react";
import ErrorBoundary from "@/components/common/ErrorBoundary/ErrorBoundary";
import ErrorFallback from "@/components/common/ErrorBoundary/ErrorFallback";
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
      <div className={style.page}>
        <Header />
        <main className={style.main}>
          <LoadingSpinner size="lg" message="Loading document requests..." />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <div className={style.page}>
        <Header />
        <main className={style.main}>
          <h1 className={style.titleHeader}>Manage Document Requests (Department Admin) </h1>
          <div className={style.tableSection}>
            <ErrorBoundary fallback={ErrorFallback}>
              <AdminRequestTable
                requests={filteredRequests}
                onAction={handleAction}
                showDepartmentColumn={false} // WARN: use auth? idk
              />
            </ErrorBoundary>
          </div>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default RequestPage;

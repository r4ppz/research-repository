import { useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner/LoadingSpinner";
import { FilterConfig } from "@/components/layout/FilterButtons/FilterTypes";
import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import SearchAndFilter from "@/components/layout/SearchAndFilter/SearchAndFilter";
import AdminRequestTable from "@/features/admin/components/AdminRequestTable/AdminRequestTable";
import { useDepartmentRequestFilter } from "@/features/admin/hooks/useDepartmentRequestFilter";
import { useLoadingDelay } from "@/hooks/useLoadingDelay";
import { useMultiFilterRequest } from "@/hooks/useMultiFilterRequest";
import { MOCK_REQUEST_DATES } from "@/mocks/filterMocks";
import { MOCK_REQUESTS } from "@/mocks/requestMocks";
import { formatDateShort } from "@/util/formatDate";
import style from "./RequestPage.module.css";

function RequestPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const loading = useLoadingDelay();

  const allRequests = useDepartmentRequestFilter(MOCK_REQUESTS);
  const filteredRequests = useMultiFilterRequest(allRequests, {
    searchQuery,
    selectedDate,
  });

  const handleAction = (requestId: number, action: "accept" | "reject") => {
    // TODO: Implement accept/reject logic
    console.log(`${action} request with ID: ${String(requestId)}`);
  };

  // Define filters for the search and filter component
  const filters: FilterConfig[] = [
    {
      type: "date",
      label: "Date",
      options: MOCK_REQUEST_DATES.map((date) => ({
        value: date,
        label: formatDateShort(date),
      })),
      value: selectedDate,
      onChange: setSelectedDate,
    },
  ];

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
        <div className={style.mainContainer}>
          <h1 className={style.titleHeader}>Manage Document Requests (Department Admin) </h1>

          <SearchAndFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            searchPlaceholder="Search paper title or author"
          />

          <div className={style.tableSection}>
            <AdminRequestTable
              requests={filteredRequests}
              onAction={handleAction}
              showDepartmentColumn={false} // WARN: use auth? idk
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default RequestPage;

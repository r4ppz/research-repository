import clsx from "clsx";
import { useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner/LoadingSpinner";
import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import SearchAndFilter from "@/components/layout/SearchAndFilter/SearchAndFilter";
import { useRequestFilter } from "@/features/student/hooks/useRequestFilter";
import RequestTable from "@/features/student/RequestTable/RequestTable";
import { MOCK_REQUESTS } from "@/mocks/requestMocks";
import { DocumentRequest } from "@/types/";
import { useLoadingDelay } from "@/util/useLoadingDelay";
import style from "./RequestPage.module.css";

function RequestPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const loading = useLoadingDelay();

  const filteredRequests = useRequestFilter(
    searchQuery,
    selectedDepartment,
    selectedDate,
    MOCK_REQUESTS,
  );

  const handleDownload = (request: DocumentRequest) => {
    // TODO: Implement download logic
    console.log("Downloading:", request.paper.title);
  };

  if (loading) {
    return (
      <div className={style.loadingContainer}>
        <LoadingSpinner size="lg" message="Loading your requests..." />
      </div>
    );
  }

  return (
    <div className={clsx(style.page)}>
      <Header />
      <main className={style.main}>
        <div className={style.mainContainer}>
          <h1 className={style.titleHeader}>Manage Research Paper Requests</h1>

          <SearchAndFilter
            className={style.searchAndFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onDepartmentChange={setSelectedDepartment}
            onDateChange={setSelectedDate}
            filterType="date"
            searchPlaceholder="Search paper title"
          />

          <div className={style.tableSection}>
            <RequestTable requests={filteredRequests} onDownload={handleDownload} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default RequestPage;

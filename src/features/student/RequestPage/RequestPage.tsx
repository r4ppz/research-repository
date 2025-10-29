import clsx from "clsx";
import { useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner/LoadingSpinner";
import { FilterConfig } from "@/components/layout/FilterButtons/FilterTypes";
import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import SearchAndFilter from "@/components/layout/SearchAndFilter/SearchAndFilter";
import RequestTable from "@/features/student/RequestTable/RequestTable";
import { useLoadingDelay } from "@/hooks/useLoadingDelay";
import { useMultiFilterRequest } from "@/hooks/useMultiFilterRequest";
import { MOCK_DEPARTMENTS, MOCK_REQUEST_DATES } from "@/mocks/filterMocks";
import { MOCK_REQUESTS } from "@/mocks/requestMocks";
import { DocumentRequest } from "@/types/";
import style from "./RequestPage.module.css";

function RequestPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const loading = useLoadingDelay();

  const filteredRequests = useMultiFilterRequest(MOCK_REQUESTS, {
    searchQuery,
    selectedDepartment,
    selectedDate,
  });

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

  // Define filters for the search and filter component
  const filters: FilterConfig[] = [
    {
      type: "department",
      label: "Department",
      options: MOCK_DEPARTMENTS.map((dept) => ({
        value: dept.departmentName,
        label: dept.departmentName,
      })),
      value: selectedDepartment,
      onChange: setSelectedDepartment,
    },
    {
      type: "date",
      label: "Date",
      options: MOCK_REQUEST_DATES.map((date) => ({
        value: date,
        label: date,
      })),
      value: selectedDate,
      onChange: setSelectedDate,
    },
  ];

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
            filters={filters}
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

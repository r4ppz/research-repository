import clsx from "clsx";
import { useState } from "react";
import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import SearchAndFilter from "@/components/layout/SearchAndFilter/SearchAndFilter";
import RequestTable from "@/features/student/RequestTable/RequestTable";
import { useRequestFilter } from "@/hooks/useRequestFilter";
import { MOCK_REQUESTS } from "@/mocks/mockData";
import { DocumentRequest } from "@/types/";
import style from "./RequestPage.module.css";

function RequestPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // Changed from selectedYear to selectedDate

  const filteredRequests = useRequestFilter(
    searchQuery,
    selectedDepartment,
    selectedDate, // Changed from selectedYear to selectedDate
    MOCK_REQUESTS,
  );

  const handleDownload = (request: DocumentRequest) => {
    // TODO: Implement download logic
    console.log("Downloading:", request.paper.title);
  };

  return (
    <div className={clsx(style.page)}>
      <Header />
      <main className={style.main}>
        <h1 className={style.titleHeader}>Manage Research Paper Requests</h1>

        <SearchAndFilter
          className={style.searchAndFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onDepartmentChange={setSelectedDepartment}
          onDateChange={setSelectedDate} // Changed from onYearChange to onDateChange
          filterType="date"
          searchPlaceholder="Search paper title"
        />

        <div className={style.tableSection}>
          <RequestTable requests={filteredRequests} onDownload={handleDownload} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default RequestPage;

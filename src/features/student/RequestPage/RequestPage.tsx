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
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const filteredRequests = useRequestFilter(
    searchQuery,
    selectedDepartment,
    selectedYear,
    MOCK_REQUESTS,
  );

  const handleDownload = (request: DocumentRequest) => {
    // TODO: Implement download logic
    console.log("Downloading:", request.paper.title);
  };

  return (
    <div className={clsx(style.page)}>
      <Header className={style.header} />
      <main className={style.main}>
        <h1 className={style.titleHeader}>Manage Research Paper Requests</h1>

        <SearchAndFilter
          className={style.searchAndFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onDepartmentChange={setSelectedDepartment}
          onYearChange={setSelectedYear}
          searchPlaceholder="Search paper title"
        />

        <RequestTable requests={filteredRequests} onDownload={handleDownload} />
      </main>

      <Footer className={style.footer} />
    </div>
  );
}

export default RequestPage;

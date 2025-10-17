import clsx from "clsx";
import { useState } from "react";
import Button from "@/components/common/Button/Button";
import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import SearchAndFilter from "@/components/layout/SearchAndFilter/SearchAndFilter";
import { useRequestFilter } from "@/hooks/useRequestFilter";
import { MOCK_REQUESTS } from "@/mocks/mockData";
import { formatDateShort } from "@/util/formatDate";
import style from "./RequestPage.module.css";

function RequestPage() {
  const [tableActive, setTableActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const filteredRequests = useRequestFilter(
    searchQuery,
    selectedDepartment,
    selectedYear,
    MOCK_REQUESTS,
  );

  return (
    <div className={clsx(style.page, tableActive && style.tableActive)}>
      <Header />
      <main className={style.main}>
        <h1 className={style.titleHeader}>Manage Research Paper Requests</h1>

        <SearchAndFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onDepartmentChange={setSelectedDepartment}
          onYearChange={setSelectedYear}
          searchPlaceholder="Search paper title"
        />

        <section
          className={style.tableSection}
          onMouseEnter={() => {
            setTableActive(true);
          }}
          onMouseLeave={() => {
            setTableActive(false);
          }}
          onFocus={() => {
            setTableActive(true);
          }}
          onBlur={() => {
            setTableActive(false);
          }}
        >
          <table className={style.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Request Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className={style.emptyState}>
                    No requests found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.requestId}>
                    <td>
                      <h3 className={style.paperTitle}>{request.paper.title}</h3>
                    </td>
                    <td>{request.paper.authorName}</td>
                    <td>
                      <div className={style.statusWrapper}>
                        <span className={style.statusCell} data-status={request.status}>
                          {request.status}
                        </span>
                        {request.paper.archived && (
                          <span className={style.archivedBadge}>Archived</span>
                        )}
                      </div>
                    </td>
                    <td>{formatDateShort(request.requestDate)}</td>
                    <td className={style.actionCell}>
                      <Button
                        variant="primary"
                        className={style.downloadButton}
                        disabled={request.status !== "ACCEPTED"}
                      >
                        Download
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default RequestPage;

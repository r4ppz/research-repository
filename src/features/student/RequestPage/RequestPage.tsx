import clsx from "clsx";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner/LoadingSpinner";
import { FilterConfig } from "@/components/layout/DynamicFilter/FilterTypes";
import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import SearchAndFilter from "@/components/layout/SearchAndFilter/SearchAndFilter";
import { useAuth } from "@/features/auth/context/useAuth";
import RequestTable from "@/features/student/components/RequestTable/RequestTable";
import { useLoadingDelay } from "@/hooks/useLoadingDelay";
import { useMultiFilterRequest } from "@/hooks/useMultiFilterRequest";
import { MOCK_DEPARTMENTS, MOCK_REQUEST_DATES } from "@/mocks/filterMocks";
import { MOCK_REQUESTS } from "@/mocks/requestMocks";
import { getUserRequests, subscribeToRequests } from "@/temp/requestService";
import { initializeTempRequests } from "@/temp/tempRequestStorage";
import { DocumentRequest } from "@/types/";
import { formatDateShort } from "@/util/formatDate";
import style from "./RequestPage.module.css";

function RequestPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [requests, setRequests] = useState<DocumentRequest[]>([]);

  const { user } = useAuth();
  const loading = useLoadingDelay();

  useEffect(() => {
    // Initialize the temporary storage with mock data if it's empty
    initializeTempRequests(MOCK_REQUESTS);
  }, []);

  useEffect(() => {
    const updateRequests = () => {
      // Get user's requests from the service
      const userRequests = user ? getUserRequests(user.userId) : [];
      console.log("Subscription triggered - updating requests");
      console.log("Current user ID:", user?.userId);
      console.log("User requests count:", userRequests.length);
      setRequests(userRequests);
    };

    // Update requests initially
    updateRequests();

    // Subscribe to changes in requests
    const unsubscribe = subscribeToRequests(updateRequests);

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [user]); // Include user as dependency to recreate subscription when user changes

  const filteredRequests = useMultiFilterRequest(requests, {
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
        label: formatDateShort(date),
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

import { Archive, FilePlus2, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import Button from "@/components/common/Button/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner/LoadingSpinner";
import { FilterConfig } from "@/components/layout/DynamicFilter/FilterTypes";
import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import SearchAndFilter from "@/components/layout/SearchAndFilter/SearchAndFilter";
import AddPaperModal from "@/features/admin/components/AddPaperModal/AddPaperModal";
import ResearchPaperTable from "@/features/admin/components/ResearchPaperTable/ResearchPaperTable";
import { useActivePaperFilter } from "@/features/admin/hooks/useActivePaperFilter";
import { useArchivedPaperFilter } from "@/features/admin/hooks/useArchivedPaperFilter";
import { useAuth } from "@/features/auth/context/useAuth";
import { useLoadingDelay } from "@/hooks/useLoadingDelay";
import { MOCK_YEARS } from "@/mocks/filterMocks";
import { MOCK_PAPERS } from "@/mocks/paperMocks";
import style from "./ResearchPage.module.css";

function ResearchPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    const html = document.documentElement;
    if (isModalOpen) {
      document.body.classList.add("modal-open");
      html.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
      html.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
      html.classList.remove("modal-open");
    };
  }, [isModalOpen]);

  const allPapers = MOCK_PAPERS.filter((paper) =>
    user?.role === "DEPARTMENT_ADMIN"
      ? paper.department.departmentName === user.department?.departmentName
      : true,
  );

  const activePapers = useActivePaperFilter(searchQuery, null, selectedYear, allPapers);
  const archivedPapers = useArchivedPaperFilter(searchQuery, null, selectedYear, allPapers);

  const loading = useLoadingDelay();

  if (loading) {
    return (
      <div className={style.loadingContainer}>
        <LoadingSpinner size="lg" message="Loading research papers..." />
      </div>
    );
  }

  const filters: FilterConfig[] = [
    {
      type: "year",
      label: "Year",
      options: MOCK_YEARS.map((year) => ({
        value: year,
        label: year,
      })),
      value: selectedYear,
      onChange: setSelectedYear,
    },
  ];

  return (
    <div className={style.page}>
      <Header />
      <main className={style.main}>
        <div className={style.mainContainer}>
          <div className={style.headerSection}>
            <h1 className={style.titleHeader}>Manage Research Papers (Department Admin)</h1>
            <Button
              onClick={() => {
                setIsModalOpen(true);
              }}
              className={style.createButton}
            >
              <FilePlus2 size={18} />
              Add Paper
            </Button>
          </div>

          <AddPaperModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
            }}
            userRole={user?.role}
            userDepartment={user?.department}
          />

          <div className={style.tabsContainer}>
            <Button
              variant={activeTab === "active" ? "primary" : "secondary"}
              className={style.tabButton}
              onClick={() => {
                setActiveTab("active");
              }}
            >
              <Archive size={16} />
              Active Papers
            </Button>
            <Button
              variant={activeTab === "archived" ? "primary" : "secondary"}
              className={style.tabButton}
              onClick={() => {
                setActiveTab("archived");
              }}
            >
              <RotateCcw size={16} />
              Archived Papers
            </Button>
          </div>

          <SearchAndFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            searchPlaceholder="Search paper title"
          />

          <div className={style.tableSection}>
            <ResearchPaperTable
              papers={activeTab === "active" ? activePapers : archivedPapers}
              onEdit={() => {}}
              onArchive={() => {}}
              onDelete={() => {}}
              onPreview={() => {}}
              showDepartmentColumn={false}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ResearchPage;

import { Archive, FilePlus2, RotateCcw } from "lucide-react";
import { useState } from "react";
import Button from "@/components/common/Button/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner/LoadingSpinner";
import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import SearchAndFilter from "@/components/layout/SearchAndFilter/SearchAndFilter";
import ResearchPaperTable from "@/features/admin/components/ResearchPaperTable/ResearchPaperTable";
import { useArchivedPaperFilter } from "@/features/admin/hooks/useArchivedPaperFilter";
import { useDepartmentPaperFilter } from "@/features/admin/hooks/useDepartmentPaperFilter";
import { useAuth } from "@/features/auth/context/useAuth";
import { MOCK_PAPERS } from "@/mocks/paperMocks";
import { type ResearchPaper } from "@/types";
import { useLoadingDelay } from "@/util/useLoadingDelay";
import style from "./ResearchPage.module.css";

function ResearchPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");

  const allPapers = MOCK_PAPERS.filter((paper) =>
    user?.role === "DEPARTMENT_ADMIN"
      ? paper.department.departmentName === user.department?.departmentName
      : true,
  );

  const activePapers = useDepartmentPaperFilter(
    searchQuery,
    selectedDepartment,
    selectedYear,
    allPapers,
  );

  const archivedPapers = useArchivedPaperFilter(
    searchQuery,
    selectedDepartment,
    selectedYear,
    allPapers,
  );

  const handleCreate = () => {
    // TODO: Implement create paper logic
    console.log("Creating new paper");
  };

  const handleEdit = (paperId: number) => {
    // TODO: Implement edit paper logic
    console.log(`Editing paper with ID: ${String(paperId)}`);
  };

  const handleArchive = (paperId: number) => {
    // TODO: Implement archive paper logic
    console.log(`Toggling archive status for paper with ID: ${String(paperId)}`);
  };

  const handleDelete = (paperId: number) => {
    // TODO: Implement delete paper logic
    console.log(`Deleting paper with ID: ${String(paperId)}`);
  };

  const handlePreview = (paper: ResearchPaper) => {
    // TODO: Implement preview paper logic
    console.log(`Previewing paper: ${paper.title}`);
  };

  const loading = useLoadingDelay();

  if (loading) {
    return (
      <div className={style.loadingContainer}>
        <LoadingSpinner size="lg" message="Loading research papers..." />
      </div>
    );
  }

  return (
    <div className={style.page}>
      <Header />
      <main className={style.main}>
        <div className={style.mainContainer}>
          <div className={style.headerSection}>
            <h1 className={style.titleHeader}>Manage Research Papers</h1>
            <Button onClick={handleCreate} className={style.createButton}>
              <FilePlus2 size={18} />
              Add Paper
            </Button>
          </div>

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
            className={style.searchAndFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onDepartmentChange={setSelectedDepartment}
            onYearChange={setSelectedYear}
            filterType="year"
            searchPlaceholder="Search paper title"
          />

          <div className={style.tableSection}>
            <ResearchPaperTable
              papers={activeTab === "active" ? activePapers : archivedPapers}
              onEdit={handleEdit}
              onArchive={handleArchive}
              onDelete={handleDelete}
              onPreview={handlePreview}
              showDepartmentColumn={user?.role === "SUPER_ADMIN"} // Only show department column for super admins
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ResearchPage;

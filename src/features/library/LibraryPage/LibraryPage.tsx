import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "@/components/common/Button/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner/LoadingSpinner";
import { FilterConfig } from "@/components/layout/DynamicFilter/FilterTypes";
import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import SearchAndFilter from "@/components/layout/SearchAndFilter/SearchAndFilter";
import ResearchCard from "@/features/library/components/ResearchCard/ResearchCard";
import ResearchModal from "@/features/library/components/ResearchModal/ResearchModal";
import { usePagination } from "@/features/library/hooks/usePagination";
import { usePaperFilter } from "@/features/library/hooks/usePaperFilter";
import { useLoadingDelay } from "@/hooks/useLoadingDelay";
import { MOCK_DEPARTMENTS, MOCK_YEARS } from "@/mocks/filterMocks";
import { MOCK_PAPERS } from "@/mocks/paperMocks";
import { type ResearchPaper } from "@/types";
import style from "./LibraryPage.module.css";

function LibraryPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(12); // Fixed items per page

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const [selectedResearch, setSelectedResearch] = useState<ResearchPaper | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loading = useLoadingDelay();

  const filteredPapers = usePaperFilter(MOCK_PAPERS, {
    searchQuery,
    selectedDepartment,
    selectedYear,
  });
  const pageData = usePagination(filteredPapers, currentPage, itemsPerPage);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const handleCloseModal = () => {
    setSelectedResearch(null);
    setIsModalOpen(false);
  };

  const handleNextPage = () => {
    if (pageData && currentPage < pageData.totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className={style.loadingContainer}>
        <LoadingSpinner size="lg" message="Loading research papers..." />
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className={style.page}>
        <Header />
        <main className={style.main}>
          <p>Error loading research papers</p>
        </main>
        <Footer />
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
        <div className={style.container}>
          <section>
            <h1 className={style.heroHeader}>Discover Academic Research</h1>

            <p className={style.mobileHeroText}>
              Explore a growing collection of academic research papers and publications. Our library
              highlights the innovative work of students and faculty across departments.
            </p>

            <p className={style.desktopHeroText}>
              Explore a growing collection of academic research papers and publications. Our library
              highlights the innovative work of students and faculty across departments — advancing
              knowledge and inspiring new ideas
            </p>
          </section>

          <SearchAndFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            searchPlaceholder="Search paper title"
          />

          <section className={style.researchSection}>
            {pageData.content.length === 0 ? (
              <div>
                <p>No research paper found :(</p>
                <p>CHATGIPITY center this text...</p>
              </div>
            ) : (
              pageData.content.map((research) => (
                <ResearchCard
                  key={research.paperId}
                  researchPaper={research}
                  onView={() => {
                    setSelectedResearch(research);
                    setIsModalOpen(true);
                  }}
                />
              ))
            )}

            {selectedResearch && (
              <ResearchModal
                researchPaper={selectedResearch}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
              />
            )}
          </section>

          {pageData.totalPages > 1 && (
            <section className={style.paginationSection}>
              <Button
                className={style.pagingButton}
                onClick={handlePrevPage}
                disabled={currentPage === 0}
              >
                <ChevronLeft size={16} />
                Previous
              </Button>

              <p className={style.pagingIndicator}>
                Page {currentPage + 1} of {pageData.totalPages}
              </p>

              <Button
                className={style.pagingButton}
                onClick={handleNextPage}
                disabled={currentPage >= pageData.totalPages - 1}
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default LibraryPage;

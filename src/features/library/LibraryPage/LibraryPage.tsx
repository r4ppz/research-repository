import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "@/components/common/Button/Button";
import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import SearchAndFilter from "@/components/layout/SearchAndFilter/SearchAndFilter";
import ResearchCard from "@/features/library/components/ResearchCard/ResearchCard";
import ResearchModal from "@/features/library/components/ResearchModal/ResearchModal";
import { usePagination } from "@/features/library/hooks/usePagination";
import { useResearchFilter } from "@/features/library/hooks/useResearchFilter";
import { MOCK_PAPERS } from "@/mocks/mockData";
import { type ResearchPaper } from "@/types";
import style from "./LibraryPage.module.css";
import { useModalScrollLock } from "../hooks/useModalBodyClass";

function LibraryPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const [selectedResearch, setSelectedResearch] = useState<ResearchPaper | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredPapers = useResearchFilter(
    searchQuery,
    selectedDepartment,
    selectedYear,
    MOCK_PAPERS,
  );
  const pageData = usePagination(filteredPapers, currentPage, itemsPerPage);

  useModalScrollLock(isModalOpen);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth > 1536) {
        setItemsPerPage(16);
      } else {
        setItemsPerPage(12);
      }
    };
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => {
      window.removeEventListener("resize", updateItemsPerPage);
    };
  }, []);

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

  if (!pageData) {
    // WARN: this shit sucks
    // TODO: improve this shi
    return <div>Loading...</div>;
  }

  return (
    <div className={style.page}>
      <Header />
      <main className={style.main}>
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

        <section className={style.searchSection}>
          <SearchAndFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onDepartmentChange={setSelectedDepartment}
            onYearChange={setSelectedYear}
            filterType="year"
            searchPlaceholder="Search paper title"
          />
        </section>

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
      </main>

      <Footer />
    </div>
  );
}

export default LibraryPage;

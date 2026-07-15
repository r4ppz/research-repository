import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { LibraryResults } from "../components/LibraryResults/LibraryResults";
import { useLibrary } from "../hooks/useLibrary";
import style from "./LibraryPage.module.css";
import { Button } from "@/components/common/Button/Button";
import { Footer } from "@/components/layout/Footer/Footer";
import { Header } from "@/components/layout/Header/Header";
import { ResearchModal } from "@/components/layout/ResearchModal/ResearchModal";
import { SearchNFilter } from "@/features/library/components/SearchNFilter/SearchNFilter";
import { useScrollToTop } from "@/hooks/useScrollToTop";

export const LibraryPage = () => {
  const {
    searchQuery,
    selectedDepartment,
    selectedYear,
    currentPage,
    handleSearchChange,
    handleYearChange,
    handleDepartmentChange,
    goToNextPage,
    goToPrevPage,
    papers,
    loading,
    error,
    pagination,
  } = useLibrary();
  const [selectedPaperId, setSelectedPaperId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useScrollToTop([currentPage]);

  const handleOpenModal = (id: number) => {
    setSelectedPaperId(id);
    setIsModalOpen(true);
  };

  return (
    <div className={style.page}>
      <Header />
      <main className={style.main}>
        <div className={style.mainContainer}>
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

          <SearchNFilter
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            selectedYear={selectedYear}
            onYearChange={handleYearChange}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={handleDepartmentChange}
          />

          <section className={style.researchSection}>
            <LibraryResults
              loading={loading}
              error={error}
              papers={papers}
              searchQuery={searchQuery}
              selectedDepartment={selectedDepartment}
              selectedYear={selectedYear}
              onViewPaper={handleOpenModal}
            />
          </section>

          {!loading && !error && pagination && pagination.totalPages > 1 && (
            <section className={style.paginationSection}>
              <Button
                className={style.pagingButton}
                onClick={goToPrevPage}
                isDisabled={currentPage === 0}
              >
                <ChevronLeft className={style.iconChevron} />
                Previous
              </Button>

              <p className={style.pagingIndicator}>
                Page {currentPage + 1} of {pagination.totalPages}
              </p>

              <Button
                className={style.pagingButton}
                onClick={goToNextPage}
                isDisabled={currentPage >= pagination.totalPages - 1}
              >
                Next
                <ChevronRight className={style.iconChevron} />
              </Button>
            </section>
          )}
        </div>
      </main>

      <ResearchModal
        paperId={selectedPaperId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
      />
      <Footer />
    </div>
  );
};

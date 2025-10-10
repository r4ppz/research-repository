import { ChevronLeft, ChevronRight, ListFilter, Search } from "lucide-react";
import { useEffect, useState } from "react";

import Button from "@/components/common/Button/Button";
import Input from "@/components/common/Input/Input";
import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import ResearchCard from "@/features/library/components/ResearchCard/ResearchCard";
import ResearchModal from "@/features/library/components/ResearchModal/ResearchModal";
import { MOCK_PAPERS, MOCK_STUDENT } from "@/mocks/mockData";
import { type ResearchPaper } from "@/types";

import style from "./HomePage.module.css";

function HomePage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);
  const [selectedResearch, setSelectedResearch] = useState<ResearchPaper | null>(null);

  useEffect(() => {
    if (selectedResearch) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedResearch]);

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

  const totalPages = Math.ceil(MOCK_PAPERS.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentResearch = MOCK_PAPERS.slice(startIndex, startIndex + itemsPerPage);

  const handleCloseModal = () => {
    setSelectedResearch(null);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className={style.page}>
      <Header user={MOCK_STUDENT} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <main className={`${style.main} ${isMenuOpen ? style.mainShift : ""}`}>
        <section className={style.heroSection}>
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
          <Input type="search" icon={Search} placeholder="Search paper title" />

          <div className={style.filterButtonsContainer}>
            <Button className={style.filterButton}>
              Department
              <ListFilter size={16} />
            </Button>

            <Button className={style.filterButton}>
              Year
              <ListFilter size={16} />
            </Button>
          </div>
        </section>

        <section className={style.researchSection}>
          {currentResearch.map((research) => (
            <ResearchCard
              key={research.paperId}
              researchPaper={research}
              onView={() => {
                setSelectedResearch(research);
              }}
            />
          ))}
          {selectedResearch && (
            <ResearchModal researchPaper={selectedResearch} onClose={handleCloseModal} />
          )}
        </section>

        <section className={style.paginationSection}>
          <Button
            className={style.pagingButton}
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
            Previous
          </Button>

          <p className={style.pagingIndicator}>
            Page {currentPage} of {totalPages}
          </p>

          <Button
            className={style.pagingButton}
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default HomePage;

import { ChevronLeft, ChevronRight, ListFilter, Search } from "lucide-react";
import Input from "../../../components/common/Input/Input";
import Header from "../../../components/layouts/Header/Header";
import style from "./HomePage.module.css";
import Button from "../../../components/common/Button/Button";
import ResearchCard from "../../../components/layouts/ResearchCard/ResearchCard";
import { userOne } from "../../../dummy/user";
import { researches } from "../../../dummy/pdf";
import { useEffect, useState } from "react";
import Footer from "../../../components/layouts/Footer/Footer";
import Pdf from "../../../types/Pdf";
import ResearchModal from "../../../components/layouts/ResearchModal/ResearchModal";

function HomePage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [itemsPerPage, setItemsPerPage] = useState<number>(9);
  const [selectedResearch, setSelectedResearch] = useState<Pdf | null>(null);

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
        setItemsPerPage(12);
      } else {
        setItemsPerPage(9);
      }
    };
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => {
      window.removeEventListener("resize", updateItemsPerPage);
    };
  }, []);

  const totalPages = Math.ceil(researches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentResearch = researches.slice(startIndex, startIndex + itemsPerPage);

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
      <Header user={userOne} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
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
          <Input className={style.searchBar} type="search" icon={Search} />

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
              pdf={research}
              onView={() => {
                setSelectedResearch(research);
              }}
            />
          ))}
          {selectedResearch && <ResearchModal pdf={selectedResearch} onClose={handleCloseModal} />}
        </section>

        <section className={style.paginationSection}>
          <Button onClick={handlePrevPage} disabled={currentPage === 1}>
            <ChevronLeft size={18} />
            Previous
          </Button>

          <p className={style.pagingIndicator}>
            Page {currentPage} of {totalPages}
          </p>

          <Button onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next
            <ChevronRight size={18} />
          </Button>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default HomePage;

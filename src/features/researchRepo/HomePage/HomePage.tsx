import { ListFilter, Search } from "lucide-react";
import Input from "../../../components/common/Input/Input";
import Header from "../../../components/layouts/Header/Header";
import style from "./HomePage.module.css";
import Button from "../../../components/common/Button/Button";
import ResearchCard from "../../../components/layouts/ResearchCard/ResearchCard";
import {
  researchEight,
  researchFive,
  researchFour,
  researchNine,
  researchOne,
  researchSeven,
  researchSix,
  researchTen,
  researchThree,
  researchTwo,
} from "../../../dummy/pdf";
import { userOne } from "../../../dummy/user";

function HomePage() {
  return (
    <div className={style.page}>
      <Header user={userOne} />
      <main className={style.main}>
        <section className={style.heroSection}>
          <h1 className={style.heroHeader}>Discover Academic Research</h1>
          <p className={style.heroText}>
            Explore a growing collection of academic research papers and publications. Our library
            highlights the innovative work of students and faculty across departments.
          </p>
        </section>
        <section className={style.searchSection}>
          <Input className={style.searchBar} type="search" icon={Search} />
          <Button className={style.filterButton}>
            Department
            <ListFilter size={18} />
          </Button>
          <Button className={style.filterButton}>
            Year
            <ListFilter size={18} />
          </Button>
        </section>
        <section className={style.researchSection}>
          <ResearchCard {...researchOne}></ResearchCard>
          <ResearchCard {...researchTwo}></ResearchCard>
          <ResearchCard {...researchThree}></ResearchCard>
          <ResearchCard {...researchFour}></ResearchCard>
          <ResearchCard {...researchFive}></ResearchCard>
          <ResearchCard {...researchSix}></ResearchCard>
          <ResearchCard {...researchSeven}></ResearchCard>
          <ResearchCard {...researchEight}></ResearchCard>
          <ResearchCard {...researchNine}></ResearchCard>
          <ResearchCard {...researchTen}></ResearchCard>
        </section>
        <section className={style.paginationSection}></section>
      </main>
    </div>
  );
}

export default HomePage;

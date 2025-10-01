import Header from "../../../components/layouts/Header/Header";
import type { User } from "../../../types/User";
import style from "./HomePage.module.css";

function HomePage() {
  const user: User = {
    id: "123",
    name: "John Rey",
    email: "johnrey123@gmail.com",
    role: "Student",
  };

  return (
    <div className={style.page}>
      <Header user={user} />
      <main className={style.main}>
        <section className={style.heroSection}>
          <h1 className={style.heroHeader}>Discover Academic Research</h1>
          <p className={style.heroText}>
            Explore a growing collection of academic research papers and publications. Our library
            highlights the innovative work of students and faculty across departments — advancing
            knowledge and inspiring new ideas
          </p>
        </section>
        <section className={style.searchSection}></section>
        <section className={style.researchSection}></section>
        <section className={style.paginationSection}></section>
      </main>
    </div>
  );
}

export default HomePage;

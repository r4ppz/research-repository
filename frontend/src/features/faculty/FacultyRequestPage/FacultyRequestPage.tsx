import style from "./FacultyRequestPage.module.css";
import { Footer } from "@/components/layout/Footer/Footer";
import { Header } from "@/components/layout/Header/Header";
import { FacultyRequestTable } from "@/features/faculty/components/FacultyRequestTable/FacultyRequestTable";

export const FacultyRequestPage = () => {
  return (
    <div className={style.page}>
      <Header />
      <main className={style.main}>
        <div className={style.mainContainer}>
          <section className={style.tableSection}>
            <FacultyRequestTable />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

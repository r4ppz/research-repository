import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import style from "./ResearchPage.module.css";

function ResearchPage() {
  return (
    <div className={style.page}>
      <Header></Header>
      <main className={style.tempSection}>This is a research page for SUPERADMIN</main>
      <Footer></Footer>
    </div>
  );
}

export default ResearchPage;

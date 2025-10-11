import style from "./ResearchPage.module.css";
import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";

function RequestPage() {
  return (
    <div className={style.page}>
      <Header></Header>
      <main className={style.tempSection}>This is a research page for SUPERADMIN</main>
      <Footer></Footer>
    </div>
  );
}

export default RequestPage;

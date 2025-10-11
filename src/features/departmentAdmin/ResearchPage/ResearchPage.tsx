import Header from "../../../components/layout/Header/Header";
import style from "./ResearchPage.module.css";
import Footer from "@/components/layout/Footer/Footer";

function RequestPage() {
  return (
    <div className={style.page}>
      <Header></Header>
      <main className={style.tempSection}>This is a reseach page for DEPARTMENTADMIN</main>
      <Footer></Footer>
    </div>
  );
}

export default RequestPage;

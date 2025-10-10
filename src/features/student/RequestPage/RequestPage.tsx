import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import style from "./RequestPage.module.css";

function RequestPage() {
  return (
    <div className={style.page}>
      <Header></Header>
      <main className={style.tempSection}>
        <section>This is a request page for STUDENT</section>
      </main>
      <Footer></Footer>
    </div>
  );
}

export default RequestPage;

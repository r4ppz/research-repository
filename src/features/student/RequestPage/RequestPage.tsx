import { SetStateAction } from "react";
import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import style from "./RequestPage.module.css";

function RequestPage() {
  return (
    <div className={style.page}>
      <Header
        user={undefined}
        isMenuOpen={false}
        setIsMenuOpen={function (value: SetStateAction<boolean>): void {
          throw new Error("Function not implemented.");
        }}
      ></Header>
      <Footer></Footer>
    </div>
  );
}

export default RequestPage;

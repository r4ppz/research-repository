import style from "./Header.module.css";
import { Menu } from "lucide-react";

type User = "student" | "admin" | "superAdmin";

interface HeaderProps {
  user: User;
}

function Header({ user }: HeaderProps) {
  return (
    <header className={style.header}>
      <div className={style.leftContainer}>
        <div className={style.logoContainer}>
          <img className={style.schoolLogo} src="/school-logo.svg" alt="school-logo" />
        </div>
        <div className={style.titleContainer}>
          <h1>ACD Research Repository</h1>
          <p>{user} portal</p>
        </div>
      </div>
      <div className={style.rightContainer}>
        <button type="button" className={style.menuButton}>
          <Menu />
        </button>
      </div>
    </header>
  );
}

export default Header;

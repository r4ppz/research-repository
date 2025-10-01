import style from "./Header.module.css";
import { Menu, LogOut, User as UserIcon } from "lucide-react";
import { type User } from "../../../types/User";
import { useState } from "react";

interface HeaderProps {
  user: User;
}

function Header({ user }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={style.header}>
      <div className={style.leftContainer}>
        <div className={style.logoContainer}>
          <img className={style.schoolLogo} src="/assets/school-logo.svg" alt="school-logo" />
        </div>
        <div className={style.titleContainer}>
          <h1 className={style.title}>ACD Research Repository</h1>
          <p className={style.roleIndicator}>{user.role} portal</p>
        </div>
      </div>

      <div className={style.rightContainer}>
        <nav className={style.desktopNavigation}>
          <a href="#">Request</a>
          <a href="#">Library</a>
        </nav>

        <div className={style.desktopButtonsWrapper}>
          <button className={style.desktopProfileButton} type="button">
            <UserIcon size={18} />
            <div className={style.desktopProfileContainer}>
              <h3 className={style.userName}>{user.name}</h3>
              <p className={style.userRole}>{user.role}</p>
            </div>
          </button>

          <button type="button" className={style.dekstoplogoutButton}>
            <LogOut size={18} />
          </button>
        </div>

        <button
          className={style.menuButton}
          type="button"
          onClick={() => {
            setIsMenuOpen((open) => !open);
          }}
        >
          <Menu size={18} />
        </button>

        {isMenuOpen && (
          <div className={style.dropDownMenu}>
            <nav className={style.mobileNavigation}>
              <a href="#">Request</a>
              <a href="#">Library</a>
              <a href="#">Logout</a>
            </nav>
            <button className={style.mobileProfileButton} type="button">
              <UserIcon size={18} />
              <h3 className={style.userName}>{user.name}</h3>
              <p className={style.userRole}>{user.role}</p>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;

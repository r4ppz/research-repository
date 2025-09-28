import style from "./Header.module.css";
import { Menu } from "lucide-react";
import { User as UserIcon } from "lucide-react";
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
          <p className={style.userRoleIndicator}>{user.role} portal</p>
        </div>
      </div>
      <div className={style.rightContainer}>
        {/* Desktop navigation */}
        <nav className={style.desktopNavigation}>
          <a href="#">Request</a>
          <a href="#">Library</a>
        </nav>

        <button className={style.profileButton} type="button">
          <UserIcon />
          <h3 className={style.userName}>{user.name}</h3>
          <p className={style.userRole}>{user.role}</p>
        </button>

        <button type="button" className={style.logoutButton}>
          <Menu className={style.menuIcon} />
        </button>

        {/* Mobile menu */}
        <button
          className={style.menuButton}
          type="button"
          onClick={() => {
            setIsMenuOpen((open) => !open);
          }}
        >
          <Menu className={style.menuIcon} />
        </button>

        {/* Mobile dropdown */}
        {isMenuOpen && (
          <div className={style.dropdownMenu}>
            <nav className={style.mobileNavigation}>
              <a href="#">Request</a>
              <a href="#">Library</a>
              <a href="#">Logout</a>
            </nav>
            <button className={style.profileButton} type="button">
              <UserIcon />
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

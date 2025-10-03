import style from "./Header.module.css";
import { Menu, LogOut, User as UserIcon } from "lucide-react";
import User from "../../../types/User";
import { NavLink } from "react-router-dom";

interface HeaderProps {
  user: User;
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function Header({ user, isMenuOpen, setIsMenuOpen }: HeaderProps) {
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
          <NavLink
            className={({ isActive }) => `${style.navlink} ${isActive ? style.selected : ""}`}
            to="#"
          >
            Request
          </NavLink>
          <NavLink
            className={({ isActive }) => `${style.navlink} ${isActive ? style.selected : ""}`}
            to="#"
          >
            Library
          </NavLink>
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
            setIsMenuOpen((open: boolean) => !open);
          }}
        >
          <Menu size={18} />
        </button>

        {isMenuOpen && (
          <div className={style.dropDownMenu}>
            <nav className={style.mobileNavigation}>
              <NavLink
                className={({ isActive }) => `${style.navlink} ${isActive ? style.selected : ""}`}
                to="#"
              >
                Request
              </NavLink>
              <NavLink
                className={({ isActive }) => `${style.navlink} ${isActive ? style.selected : ""}`}
                to="#"
              >
                Library
              </NavLink>
              <NavLink
                className={({ isActive }) => `${style.navlink} ${isActive ? style.selected : ""}`}
                to="#"
              >
                Logout
              </NavLink>
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

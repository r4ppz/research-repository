import style from "./Header.module.css";
import { Menu, LogOut, User as UserIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import type { Dispatch } from "react";
import Button from "@/components/common/Button/Button";
import type { User } from "@/types";

interface HeaderProps {
  user: User;
  isMenuOpen: boolean;
  setIsMenuOpen: Dispatch<React.SetStateAction<boolean>>;
}

function formatRole(role: string): string {
  switch (role) {
    case "STUDENT":
      return "Student";
    case "DEPARTMENT_ADMIN":
      return "Admin";
    case "SUPERADMIN":
      return "Admin";
    default:
      return "Unknown specimen";
  }
}

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `${style.navlink} ${isActive ? style.selected : ""}`;
}

function Header({ user, isMenuOpen, setIsMenuOpen }: HeaderProps) {
  const role = formatRole(user.role);
  const isAdmin = ["SUPER_ADMIN", "DEPARTMENT_ADMIN"].includes(user.role);
  const firstName = user.fullName.split(" ")[0];

  return (
    <header className={style.header}>
      <div className={style.headerWrapper}>
        <div className={style.leftWrapper}>
          <div className={style.logoContainer}>
            <img className={style.schoolLogo} src="/assets/school-logo.svg" alt="school-logo" />
          </div>
          <div className={style.titleContainer}>
            <h1 className={style.title}>ACD Research Repository</h1>
            <p className={style.roleIndicator}>{role} portal</p>
          </div>
        </div>

        <div className={style.rightWrapper}>
          <nav className={style.desktopNavigation}>
            <NavLink className={navLinkClass} to="#">
              Request
            </NavLink>
            <NavLink className={navLinkClass} to="#">
              Library
            </NavLink>

            {isAdmin && (
              <NavLink className={navLinkClass} to={"#"}>
                Research
              </NavLink>
            )}
          </nav>

          <div className={style.desktopButtonsWrapper}>
            <Button variant="secondary" className={style.desktopProfileButton} type="button">
              <UserIcon size={16} />
              <div className={style.desktopProfileContainer}>
                <h3 className={style.userName}>{firstName}</h3>
                <p className={style.userRole}>{role}</p>
              </div>
            </Button>

            <Button type="button" variant="secondary" className={style.dekstoplogoutButton}>
              <LogOut size={16} />
            </Button>
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
        </div>
      </div>

      {isMenuOpen && (
        <div className={style.dropDownMenu}>
          <nav className={style.mobileNavigation}>
            {isAdmin && (
              <NavLink className={navLinkClass} to={"#"}>
                Research
              </NavLink>
            )}
            <NavLink className={navLinkClass} to="#">
              Request
            </NavLink>
            <NavLink className={navLinkClass} to="#">
              Library
            </NavLink>
            <NavLink className={navLinkClass} to="#">
              Logout
            </NavLink>
          </nav>
          <button className={style.mobileProfileButton} type="button">
            <UserIcon size={18} />
            <h3 className={style.userName}>{firstName}</h3>
            <p className={style.userRole}>{role}</p>
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;

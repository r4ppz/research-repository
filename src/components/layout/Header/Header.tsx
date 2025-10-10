import clsx from "clsx";
import { Menu, LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Button from "@/components/common/Button/Button";
import { useAuth } from "@/features/auth/context/useAuth";
import { type Role } from "@/types";
import style from "./Header.module.css";
import CustomNavLink from "../CustomNavLink/CustomNavLink";

const ROLE_LABEL: Record<Role, string> = {
  STUDENT: "Student",
  DEPARTMENT_ADMIN: "Admin",
  SUPER_ADMIN: "Admin",
};

const REQUEST_PATH: Record<Role, string> = {
  STUDENT: "/student/requests",
  DEPARTMENT_ADMIN: "/department-admin/requests",
  SUPER_ADMIN: "/super-admin/requests",
};

const RESEARCH_PATH: Partial<Record<Role, string>> = {
  DEPARTMENT_ADMIN: "/department-admin/research",
  SUPER_ADMIN: "/super-admin/research",
};

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(style.navlink, isActive && style.selected);

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const role = user.role;
  const roleLabel = ROLE_LABEL[role];
  const firstName = user.fullName.split(" ")[0];
  const requestPath = REQUEST_PATH[role];
  const researchPath = RESEARCH_PATH[role];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className={style.header}>
      <div className={style.headerWrapper}>
        <div className={style.leftWrapper}>
          <div className={style.logoContainer}>
            <img className={style.schoolLogo} src="/assets/school-logo.svg" alt="school-logo" />
          </div>
          <div className={style.titleContainer}>
            <h1 className={style.title}>ACD Research Repository</h1>
            <p className={style.roleIndicator}>{roleLabel} portal</p>
          </div>
        </div>

        <div className={style.rightWrapper}>
          <nav className={style.desktopNavigation}>
            <CustomNavLink to="/">Library</CustomNavLink>
            <CustomNavLink to={requestPath}>Request</CustomNavLink>
            {researchPath && <CustomNavLink to={researchPath}>Research</CustomNavLink>}
          </nav>

          <div className={style.desktopButtonsWrapper}>
            <Button variant="secondary" className={style.desktopProfileButton} type="button">
              <UserIcon size={16} />
              <div className={style.desktopProfileContainer}>
                <h3 className={style.userName}>{firstName}</h3>
                <p className={style.userRole}>{roleLabel}</p>
              </div>
            </Button>

            <Button
              type="button"
              variant="secondary"
              className={style.dekstoplogoutButton}
              onClick={handleLogout}
            >
              <LogOut size={16} />
            </Button>
          </div>

          <button
            className={style.menuButton}
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className={style.dropDownMenu}>
          <nav className={style.mobileNavigation}>
            <NavLink className={navLinkClass} to="/">
              Library
            </NavLink>
            <NavLink className={navLinkClass} to={requestPath}>
              Request
            </NavLink>
            {researchPath && (
              <NavLink className={navLinkClass} to={researchPath}>
                Research
              </NavLink>
            )}
            <button className={style.mobileLogoutButton} type="button" onClick={handleLogout}>
              Logout
            </button>
          </nav>

          <button className={style.mobileProfileButton} type="button">
            <UserIcon size={18} />
            <h3 className={style.userName}>{firstName}</h3>
            <p className={style.userRole}>{roleLabel}</p>
          </button>
        </div>
      )}
    </header>
  );
}

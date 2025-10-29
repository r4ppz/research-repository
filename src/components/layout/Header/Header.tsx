import clsx from "clsx";
import { LogOut, Menu, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import schoolLogo from "@/assets/school-logo.svg";
import Button from "@/components/common/Button/Button";
import { useAuth } from "@/features/auth/context/useAuth";
import { type Role } from "@/types";
import style from "./Header.module.css";
import CustomNavLink from "../CustomNavLink/CustomNavLink";

const ROLE_LABEL: Record<Role, string> = {
  STUDENT: "Student",
  DEPARTMENT_ADMIN: "D Admin",
  SUPER_ADMIN: "S Admin",
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

interface ComponentProps {
  className?: string;
}

function Header({ className, ...props }: ComponentProps) {
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
    void navigate("/login");
  };

  return (
    <header className={clsx(style.header, className)} {...props}>
      <div className={style.headerWrapper}>
        <div className={style.headerContainer}>
          <div className={style.leftWrapper}>
            <Button
              variant="secondary"
              className={style.logoContainerButton}
              onClick={() => void navigate("/")}
            >
              <img className={style.schoolLogo} src={schoolLogo} alt="school-logo" />
            </Button>
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

            <Button
              className={style.menuButton}
              variant="secondary"
              type="button"
              onClick={() => {
                setIsMenuOpen((prev) => !prev);
              }}
            >
              <Menu size={18} />
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className={style.dropDownMenu}>
          <nav className={style.mobileNavigation}>
            <CustomNavLink to="/">Library</CustomNavLink>
            <CustomNavLink to={requestPath}>Request</CustomNavLink>
            {researchPath && <CustomNavLink to={researchPath}>Research</CustomNavLink>}
            <CustomNavLink to="/login">Logout</CustomNavLink>
          </nav>

          <Button className={style.mobileProfileButton} variant="secondary">
            <UserIcon size={18} />
            <h3 className={style.userName}>{firstName}</h3>
            <p className={style.userRole}>{roleLabel}</p>
          </Button>
        </div>
      )}
    </header>
  );
}

export default Header;

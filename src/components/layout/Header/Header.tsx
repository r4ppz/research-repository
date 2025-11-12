import clsx from "clsx";
import { Menu } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import schoolLogo from "@/assets/school-logo.svg";
import Button from "@/components/common/Button/Button";
import CustomNavLink from "@/components/common/CustomNavLink/CustomNavLink";
import ProfileButton from "@/components/layout/ProfileButton/ProfileButton";
import { useAuth } from "@/features/auth/context/useAuth";
import { type Role } from "@/types";
import style from "./Header.module.css";

const GENERAL_ROLE_LABEL: Record<Role, string> = {
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

interface ComponentProps {
  className?: string;
}

const Header = ({ className, ...props }: ComponentProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const role = user.role;
  const generalRoleLabel = GENERAL_ROLE_LABEL[role];
  const requestPath = REQUEST_PATH[role];
  const researchPath = RESEARCH_PATH[role];

  const handleLogout = () => {
    logout();
    void navigate("/login");
  };

  return (
    <header className={clsx(style.header, className)} {...props}>
      <div className={style.headerWrapper}>
        <div className={style.headerMainContainer}>
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
              <p className={style.roleIndicator}>{generalRoleLabel} portal</p>
            </div>
          </div>

          <div className={style.rightWrapper}>
            <nav className={style.desktopNavigation}>
              <CustomNavLink to="/">Library</CustomNavLink>
              <CustomNavLink to={requestPath}>Request</CustomNavLink>
              {researchPath && <CustomNavLink to={researchPath}>Research</CustomNavLink>}
            </nav>

            <ProfileButton
              user={user}
              onLogout={handleLogout}
              className={style.desktopProfileButton}
            />

            <Button
              className={style.menuButton}
              variant="secondary"
              type="button"
              onClick={() => {
                setIsMenuOpen((prev) => !prev);
              }}
            >
              <Menu className={style.iconMenu} />
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

          <ProfileButton
            user={user}
            onLogout={handleLogout}
            isMobile={true}
            className={style.mobileProfileButton}
          />
        </div>
      )}
    </header>
  );
};

export default Header;

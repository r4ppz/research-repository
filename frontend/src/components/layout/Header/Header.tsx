import clsx from "clsx";
import { LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "./Header.module.css";
import schoolLogo from "@/assets/school-logo.svg";
import { Button } from "@/components/common/Button/Button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog/ConfirmDialog";
import { NavLink } from "@/components/common/NavLink/NavLink";
import { ProfileButton } from "@/components/common/ProfileButton/ProfileButton";
import { ProfileModal } from "@/components/common/ProfileModal/ProfileModal";
import { useAuth } from "@/features/auth/context/useAuth";
import { NotificationBell } from "@/features/notifications/components/NotificationBell/NotificationBell";
import type { Role } from "@/types";

const GENERAL_ROLE_LABEL: Record<Role, string> = {
  STUDENT: "Student",
  FACULTY: "Faculty",
  DEPARTMENT_ADMIN: "Admin",
  SUPER_ADMIN: "Admin",
};

const REQUEST_PATH: Record<Role, string> = {
  STUDENT: "/student/requests",
  FACULTY: "/faculty/requests",
  DEPARTMENT_ADMIN: "/department-admin/requests",
  SUPER_ADMIN: "/super-admin/requests",
};

const RESEARCH_PATH: Partial<Record<Role, string>> = {
  DEPARTMENT_ADMIN: "/department-admin/research",
  SUPER_ADMIN: "/super-admin/research",
};

const USERS_PATH: Partial<Record<Role, string>> = {
  SUPER_ADMIN: "/super-admin/users",
};

const DEPARTMENTS_PATH: Partial<Record<Role, string>> = {
  SUPER_ADMIN: "/super-admin/departments",
};

interface ComponentProps {
  className?: string;
}

export const Header = ({ className, ...props }: ComponentProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  if (!user) {
    return null;
  }

  const role = user.role;
  const generalRoleLabel = GENERAL_ROLE_LABEL[role];
  const requestPath = REQUEST_PATH[role];
  const researchPath = RESEARCH_PATH[role];
  const usersPath = USERS_PATH[role];
  const departmentsPath = DEPARTMENTS_PATH[role];

  const handleLogout = () => {
    void logout();
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
              <NavLink to="/">Library</NavLink>
              {usersPath && <NavLink to={usersPath}>Users</NavLink>}
              {departmentsPath && <NavLink to={departmentsPath}>Departments</NavLink>}
              <NavLink to={requestPath}>Request</NavLink>
              {researchPath && <NavLink to={researchPath}>Research</NavLink>}
            </nav>

            <div className={style.headerActions}>
              <NotificationBell />
              <ProfileButton user={user} />
              <ConfirmDialog
                title="Log out of your account?"
                description="You will need to sign in with your Google account to access the portal again."
                confirmText="Log out"
                cancelText="Stay logged in"
                onConfirm={handleLogout}
                trigger={
                  <Button type="button" variant="secondary" className={style.logoutButton}>
                    <LogOut className={style.iconLogout} />
                  </Button>
                }
              />
            </div>

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
            <NavLink to="/">Library</NavLink>
            {usersPath && <NavLink to={usersPath}>Users</NavLink>}
            {departmentsPath && <NavLink to={departmentsPath}>Departments</NavLink>}
            <NavLink to={requestPath}>Request</NavLink>
            {researchPath && <NavLink to={researchPath}>Research</NavLink>}
            <button
              type="button"
              className={style.navlink}
              onClick={() => {
                setIsProfileOpen(true);
              }}
            >
              Profile
            </button>
            <ConfirmDialog
              title="Log out of your account?"
              description="You will need to sign in with your Google account to access the portal again."
              confirmText="Log out"
              cancelText="Stay logged in"
              onConfirm={handleLogout}
              trigger={
                <button type="button" className={style.navlink}>
                  Logout
                </button>
              }
            />
          </nav>
          <ProfileModal
            isOpen={isProfileOpen}
            onClose={() => {
              setIsProfileOpen(false);
            }}
            user={user}
          />
        </div>
      )}
    </header>
  );
};

import clsx from "clsx";
import { LogOut, User as UserIcon } from "lucide-react";
import { type Role } from "@/types";
import style from "./ProfileButton.module.css";
import Button from "../Button/Button";

interface ProfileButtonProps {
  user: {
    fullName: string;
    role: Role;
  };
  onLogout: () => void;
  className?: string;
  isMobile?: boolean;
}

const ROLE_LABEL: Record<Role, string> = {
  STUDENT: "Student",
  DEPARTMENT_ADMIN: "D Admin",
  SUPER_ADMIN: "S Admin",
};

function ProfileButton({ user, onLogout, className, isMobile = false }: ProfileButtonProps) {
  const roleLabel = ROLE_LABEL[user.role];
  const firstName = user.fullName.split(" ")[0];

  if (isMobile) {
    return (
      <Button className={clsx(style.mobileProfileButton, className)} variant="secondary">
        <UserIcon className={style.iconUser} />
        <div className={style.mobileProfileContainer}>
          <h3 className={style.userName}>{firstName}</h3>
          <p className={style.userRole}>{roleLabel}</p>
        </div>
      </Button>
    );
  }

  return (
    <div className={style.desktopButtonsWrapper}>
      <Button
        variant="secondary"
        className={clsx(style.desktopProfileButton, className)}
        type="button"
      >
        <UserIcon className={style.iconUser} />
        <div className={style.desktopProfileContainer}>
          <h3 className={style.userName}>{firstName}</h3>
          <p className={style.userRole}>{roleLabel}</p>
        </div>
      </Button>

      <Button
        type="button"
        variant="secondary"
        className={style.desktopLogoutButton}
        onClick={onLogout}
      >
        <LogOut className={style.iconLogout} />
      </Button>
    </div>
  );
}

export default ProfileButton;

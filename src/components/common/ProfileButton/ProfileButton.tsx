import clsx from "clsx";
import { LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { type Role, type User } from "@/types";
import style from "./ProfileButton.module.css";
import Button from "../Button/Button";
import ProfileModal from "../ProfileModal/ProfileModal";

interface ProfileButtonProps {
  user: User;
  onLogout: () => void;
  className?: string;
  isMobile?: boolean;
}

const ROLE_LABEL: Record<Role, string> = {
  STUDENT: "Student",
  DEPARTMENT_ADMIN: "D Admin",
  SUPER_ADMIN: "S Admin",
};

const ProfileButton = ({ user, onLogout, className, isMobile = false }: ProfileButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const roleLabel = ROLE_LABEL[user.role];
  const firstName = user.fullName.split(" ")[0];

  const openModal = () => {
    setIsModalOpen(true);
  };

  if (isMobile) {
    return (
      <>
        <Button
          className={clsx(style.mobileProfileButton, className)}
          variant="secondary"
          onClick={openModal}
        >
          <UserIcon className={style.iconUser} />
          <div className={style.mobileProfileContainer}>
            <h3 className={style.userName}>{firstName}</h3>
            <p className={style.userRole}>{roleLabel}</p>
          </div>
        </Button>
        <ProfileModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
          }}
          user={user}
        />
      </>
    );
  }

  return (
    <>
      <div className={style.desktopButtonsWrapper}>
        <Button
          variant="secondary"
          className={clsx(style.desktopProfileButton, className)}
          type="button"
          onClick={openModal}
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
      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        user={user}
      />
    </>
  );
};

export default ProfileButton;

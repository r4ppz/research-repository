import { Calendar, Mail, Shield } from "lucide-react";
import style from "./ProfileModal.module.css";
import { Avatar } from "@/components/common/Avatar/Avatar";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/common/Dialog/Dialog";
import type { Role, User } from "@/types";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  className?: string;
}

const FULL_ROLE_LABEL: Record<Role, string> = {
  STUDENT: "Student",
  FACULTY: "Faculty",
  DEPARTMENT_ADMIN: "Department Admin",
  SUPER_ADMIN: "Super Admin",
};

export const ProfileModal = ({ isOpen, onClose, user, className }: ProfileModalProps) => {
  const roleLabel = FULL_ROLE_LABEL[user.role];

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={`${style.modal} ${className ?? ""}`} aria-describedby={undefined}>
        <DialogClose onClose={onClose} />

        <div className={style.header}>
          <Avatar
            src={user.profilePictureUrl}
            alt={`${user.fullName}'s profile picture`}
            fallbackName={user.fullName}
            size="lg"
            className={style.avatar}
          />
          <DialogTitle className={style.name}>{user.fullName}</DialogTitle>
          <p className={style.headerEmail}>{user.email}</p>
        </div>

        <div className={style.body}>
          <div className={style.row}>
            <Shield className={style.icon} size={16} />
            <div className={style.rowContent}>
              <span className={style.rowLabel}>Role</span>
              <span className={style.rowValue}>{roleLabel}</span>
            </div>
            <span className={style.activeBadge}>Active</span>
          </div>

          <div className={style.row}>
            <Mail className={style.icon} size={16} />
            <div className={style.rowContent}>
              <span className={style.rowLabel}>Email</span>
              <span className={style.rowValue}>{user.email}</span>
            </div>
          </div>

          <div className={style.row}>
            <Calendar className={style.icon} size={16} />
            <div className={style.rowContent}>
              <span className={style.rowLabel}>Member since</span>
              <span className={style.rowValue}>{memberSince}</span>
            </div>
          </div>

          {user.department && (
            <div className={style.row}>
              <Shield className={style.icon} size={16} />
              <div className={style.rowContent}>
                <span className={style.rowLabel}>Department</span>
                <span className={style.rowValue}>{user.department.departmentName}</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

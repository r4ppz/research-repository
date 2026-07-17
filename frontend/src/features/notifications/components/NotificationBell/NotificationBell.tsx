import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import style from "./NotificationBell.module.css";
import { Button } from "@/components/common/Button/Button";
import { useNotificationContext } from "@/features/notifications/context/NotificationContext";

export const NotificationBell = () => {
  const { unreadCount } = useNotificationContext();
  const navigate = useNavigate();

  return (
    <Button
      variant="secondary"
      type="button"
      className={style.bellButton}
      onClick={() => void navigate("/notifications")}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
    >
      <Bell className={style.bellIcon} />
      {unreadCount > 0 && (
        <span className={style.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
      )}
    </Button>
  );
};

import { Button } from "../Button/Button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogTitle,
} from "./AlertDialog";
import styles from "./AlertDialog.module.css";

type NotificationType = "success" | "error";

interface NotificationDialogProps {
  open: boolean;
  onClose: () => void;
  type: NotificationType;
  title: string;
  description: string;
}

export const NotificationDialog = ({
  open,
  onClose,
  type,
  title,
  description,
}: NotificationDialogProps) => {
  if (!open) return null;

  const iconColor = type === "success" ? "var(--color-success)" : "var(--color-error)";
  const titleColor = type === "success" ? "var(--color-success)" : "var(--color-error)";

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogOverlay className={styles.overlay} />
      <AlertDialogContent className={styles.content}>
        <div className={styles.header} style={{ borderTopColor: iconColor }}>
          <AlertDialogTitle className={styles.title} style={{ color: titleColor }}>
            {title}
          </AlertDialogTitle>
        </div>
        <AlertDialogDescription className={styles.message}>{description}</AlertDialogDescription>
        <div className={styles.actionContainer}>
          <AlertDialogAction asChild onClick={onClose}>
            <Button variant="primary">OK</Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

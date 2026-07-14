import styles from "./NotificationDialog.module.css";
import { Button } from "@/components/common/Button/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/common/Dialog/Dialog";

type NotificationType = "success" | "error";

interface NotificationDialogProps {
  open: boolean;
  onClose: () => void;
  type: NotificationType;
  title: string;
  description: string;
}

export function NotificationDialog({
  open,
  onClose,
  type,
  title,
  description,
}: NotificationDialogProps) {
  if (!open) return null;

  const iconColor = type === "success" ? "var(--color-success)" : "var(--color-error)";
  const titleColor = type === "success" ? "var(--color-success)" : "var(--color-error)";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={styles.content}>
        <div className={styles.header} style={{ borderTopColor: iconColor }}>
          <DialogTitle className={styles.title} style={{ color: titleColor }}>
            {title}
          </DialogTitle>
        </div>
        <DialogDescription className={styles.description}>{description}</DialogDescription>
        <div className={styles.actions}>
          <Button variant="primary" onPress={onClose}>
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

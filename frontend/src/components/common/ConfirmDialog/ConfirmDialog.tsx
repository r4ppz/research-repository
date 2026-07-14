import { cloneElement, isValidElement, type ReactElement, type ReactNode, useState } from "react";
import styles from "./ConfirmDialog.module.css";
import { Button } from "@/components/common/Button/Button";
import { Dialog, DialogContent, DialogTitle } from "@/components/common/Dialog/Dialog";

interface ConfirmDialogProps {
  trigger: ReactNode;
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    void onConfirm();
    setOpen(false);
  };

  return (
    <>
      {isValidElement(trigger)
        ? cloneElement(trigger as ReactElement<{ onClick?: () => void }>, {
            onClick: () => {
              setOpen(true);
            },
          })
        : trigger}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={styles.content}>
          <DialogTitle className={styles.title}>{title}</DialogTitle>
          <p className={styles.description}>{description}</p>
          <div className={styles.actions}>
            <Button
              variant="secondary"
              onPress={() => {
                setOpen(false);
              }}
            >
              {cancelText}
            </Button>
            <Button variant="primary" onPress={handleConfirm}>
              {confirmText}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

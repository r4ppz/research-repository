import { cloneElement, isValidElement, type ReactElement, type ReactNode, useState } from "react";
import styles from "./ConfirmDialog.module.css";
import { Button } from "@/components/common/Button/Button";
import { Dialog, DialogContent, DialogTitle } from "@/components/common/Dialog/Dialog";

interface ConfirmDialogProps {
  trigger?: ReactNode;
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  open,
  onOpenChange,
}: ConfirmDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (next: boolean) => {
    if (isControlled) {
      onOpenChange?.(next);
    } else {
      setInternalOpen(next);
    }
  };

  const handleConfirm = () => {
    void onConfirm();
    handleOpenChange(false);
  };

  const triggerElement =
    trigger && isValidElement(trigger)
      ? cloneElement(trigger as ReactElement<{ onClick?: () => void }>, {
          onClick: () => {
            handleOpenChange(true);
          },
        })
      : trigger;

  return (
    <>
      {!isControlled && triggerElement}
      <Dialog open={isOpen} onOpenChange={handleOpenChange} title={title}>
        <DialogContent className={styles.content}>
          <DialogTitle className={styles.title}>{title}</DialogTitle>
          <p className={styles.description}>{description}</p>
          <div className={styles.actions}>
            <Button
              variant="secondary"
              onPress={() => {
                handleOpenChange(false);
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

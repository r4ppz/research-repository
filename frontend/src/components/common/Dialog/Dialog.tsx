import { X } from "lucide-react";
import { Dialog as AriaDialog, Modal, ModalOverlay } from "react-aria-components";
import styles from "./Dialog.module.css";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <ModalOverlay
      isOpen={open}
      onOpenChange={onOpenChange}
      className={styles.overlay}
      isDismissable
    >
      <Modal className={styles.contentWrapper}>
        <AriaDialog className={styles.dialog}>{children}</AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}

interface DialogContentProps {
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

function DialogContent({ className, children, style }: DialogContentProps) {
  return (
    <div className={[styles.dialogContent, className].filter(Boolean).join(" ")} style={style}>
      {children}
    </div>
  );
}

interface DialogTitleProps {
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

function DialogTitle({ className, children, style }: DialogTitleProps) {
  return (
    <h2 slot="title" className={[styles.title, className].filter(Boolean).join(" ")} style={style}>
      {children}
    </h2>
  );
}

interface DialogDescriptionProps {
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

function DialogDescription({ className, children, style }: DialogDescriptionProps) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

function DialogClose({ onClose }: { onClose: () => void }) {
  return (
    <button className={styles.closeButton} onClick={onClose} aria-label="Close dialog">
      <X className={styles.iconClose} />
    </button>
  );
}

export { Dialog, DialogContent, DialogTitle, DialogClose, DialogDescription };
export type { DialogProps };

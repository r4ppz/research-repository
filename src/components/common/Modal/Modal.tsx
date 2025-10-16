import { clsx } from "clsx";
import { X } from "lucide-react";
import React from "react";
import ReactDOM from "react-dom";
import style from "./Modal.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

function Modal({ isOpen, onClose, children, className }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return ReactDOM.createPortal(
    <div className={style.overlay} onClick={onClose}>
      <div
        className={clsx(style.modal, className)}
        onClick={(e) => {
          e.stopPropagation();
        }}
        role="dialog"
        aria-modal="true"
      >
        <button className={style.closeButton} onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {children}
      </div>
    </div>,
    document.body,
  );
}

export default Modal;

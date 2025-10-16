import { useEffect } from "react";

// NOTE: Custom hook to manage body class for modal states

export function useModalScrollLock(isOpen: boolean): void {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);
}

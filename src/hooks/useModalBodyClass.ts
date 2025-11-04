import { useEffect } from "react";

/**
 * Custom hook to add/remove a CSS class on the body element when a modal is open/closed
 * This is useful for preventing background scrolling when a modal is open
 * @param isOpen Boolean indicating if the modal is currently open
 */
export function useModalBodyClass(isOpen: boolean): void {
  useEffect(() => {
    const html = document.documentElement;
    if (isOpen) {
      document.body.classList.add("modal-open");
      html.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
      html.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
      html.classList.remove("modal-open");
    };
  }, [isOpen]);
}

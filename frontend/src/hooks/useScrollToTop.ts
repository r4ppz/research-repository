import { useEffect } from "react";

export function useScrollToTop(deps: readonly unknown[]): void {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

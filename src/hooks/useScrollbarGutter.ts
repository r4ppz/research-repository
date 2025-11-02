import { useEffect } from "react";

const useScrollbarGutter = () => {
  useEffect(() => {
    const update = () => {
      const isScrollable = document.body.scrollHeight > window.innerHeight;
      document.documentElement.classList.toggle("scrollable", isScrollable);
    };
    update();
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
    };
  }, []);
};

export default useScrollbarGutter;

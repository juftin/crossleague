import { useEffect, useRef } from "react";

/**
 * Enables smooth vertical sticky positioning for table headers while preserving
 * full horizontal scrolling capability inside overflow-x: auto containers.
 */
export function useStickyTableHeader<T extends HTMLTableElement = HTMLTableElement>() {
  const tableRef = useRef<T>(null);

  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;

    const thead = table.querySelector("thead");
    if (!thead) return;

    const updateStickyPosition = () => {
      const headerEl = document.querySelector(".app-header");
      const headerBottom = headerEl ? headerEl.getBoundingClientRect().bottom : 0;
      const rect = table.getBoundingClientRect();
      const theadHeight = thead.offsetHeight;
      const maxTranslate = Math.max(0, rect.height - theadHeight);

      if (rect.top < headerBottom) {
        const diff = headerBottom - rect.top;
        const translateY = Math.min(diff, maxTranslate);
        thead.style.transform = `translate3d(0, ${translateY}px, 0)`;
        thead.style.position = "relative";
        thead.style.zIndex = "20";
      } else {
        thead.style.transform = "translate3d(0, 0px, 0)";
      }
    };

    updateStickyPosition();
    window.addEventListener("scroll", updateStickyPosition, { passive: true });
    window.addEventListener("resize", updateStickyPosition, { passive: true });

    const ro = new ResizeObserver(updateStickyPosition);
    ro.observe(table);

    return () => {
      window.removeEventListener("scroll", updateStickyPosition);
      window.removeEventListener("resize", updateStickyPosition);
      ro.disconnect();
      thead.style.transform = "";
    };
  }, []);

  return tableRef;
}

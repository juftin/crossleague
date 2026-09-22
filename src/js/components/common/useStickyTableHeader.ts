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

    let animationFrameId: number | null = null;
    let previousTransform = "";

    const updateStickyPosition = () => {
      const rect = table.getBoundingClientRect();
      const headerHeight = Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--app-header-height")
      );
      const headerBottom = Number.isFinite(headerHeight) ? headerHeight : 0;
      const maxTranslate = Math.max(0, rect.height - thead.offsetHeight);
      const translateY = Math.max(0, Math.min(headerBottom - rect.top, maxTranslate));
      const transform = `translate3d(0, ${translateY}px, 0)`;

      if (transform !== previousTransform) {
        thead.style.transform = transform;
        previousTransform = transform;
      }
    };

    const scheduleStickyPositionUpdate = () => {
      if (animationFrameId !== null) return;

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = null;
        updateStickyPosition();
      });
    };

    updateStickyPosition();
    window.addEventListener("scroll", updateStickyPosition, { passive: true });
    window.addEventListener("resize", scheduleStickyPositionUpdate, { passive: true });

    const ro = new ResizeObserver(scheduleStickyPositionUpdate);
    ro.observe(table);

    return () => {
      window.removeEventListener("scroll", updateStickyPosition);
      window.removeEventListener("resize", scheduleStickyPositionUpdate);
      ro.disconnect();
      if (animationFrameId !== null) window.cancelAnimationFrame(animationFrameId);
      thead.style.transform = "";
    };
  }, []);

  return tableRef;
}

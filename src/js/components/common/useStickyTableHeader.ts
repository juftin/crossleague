import { useEffect, useRef } from "react";

/** Keep a fixed copy visible while its table scrolls behind the app header. */
export function useStickyTableHeader<T extends HTMLTableElement = HTMLTableElement>() {
  const tableRef = useRef<T>(null);

  useEffect(() => {
    const table = tableRef.current;
    const thead = table?.tHead;
    const scrollContainer = table?.parentElement;
    if (!table || !thead || !scrollContainer) return;

    const overlay = document.createElement("div");
    overlay.className = "sticky-table-overlay";
    overlay.style.display = "none";
    document.body.append(overlay);

    let overlayTable: HTMLTableElement;
    let isVisible = false;

    const syncLayout = () => {
      const containerRect = scrollContainer.getBoundingClientRect();
      overlay.style.left = `${containerRect.left + scrollContainer.clientLeft}px`;
      overlay.style.width = `${scrollContainer.clientWidth}px`;
      overlayTable.style.width = `${table.getBoundingClientRect().width}px`;
      overlayTable.style.marginLeft = `${-scrollContainer.scrollLeft}px`;

      const overlayCells = overlayTable.querySelectorAll("th");
      thead.querySelectorAll("th").forEach((cell, index) => {
        overlayCells[index].style.width = `${cell.getBoundingClientRect().width}px`;
      });
    };

    const copyHeader = () => {
      const focusedIndex = overlay.contains(document.activeElement)
        ? Array.from(overlay.querySelectorAll("th")).indexOf(
            document.activeElement as HTMLTableCellElement
          )
        : -1;
      const copy = table.cloneNode(false) as HTMLTableElement;
      const copiedHead = thead.cloneNode(true) as HTMLTableSectionElement;
      copy.removeAttribute("id");
      copy.setAttribute("role", "presentation");
      copiedHead.querySelectorAll("[id]").forEach(element => element.removeAttribute("id"));
      copiedHead.querySelectorAll("th.cursor-pointer").forEach(cell => {
        cell.setAttribute("role", "button");
        cell.setAttribute("tabindex", "0");
      });
      copy.style.tableLayout = "fixed";
      copy.append(copiedHead);
      overlay.replaceChildren(copy);
      overlayTable = copy;
      syncLayout();
      if (focusedIndex >= 0) overlay.querySelectorAll("th")[focusedIndex]?.focus();
    };

    const updateVisibility = () => {
      const headerHeight = Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--app-header-height")
      );
      const top = Number.isFinite(headerHeight) ? headerHeight : 0;
      const rect = table.getBoundingClientRect();
      const shouldShow = rect.top <= top && rect.bottom > top + thead.offsetHeight;
      if (shouldShow === isVisible) return;

      isVisible = shouldShow;
      if (isVisible) syncLayout();
      overlay.style.display = isVisible ? "block" : "none";
    };

    const refresh = () => {
      syncLayout();
      updateVisibility();
    };

    const forwardSort = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return;
      const cell = target.closest("th");
      if (!cell || !overlay.contains(cell)) return;
      const index = Array.from(overlay.querySelectorAll("th")).indexOf(cell);
      thead.querySelectorAll("th")[index]?.click();
    };

    const onClick = (event: MouseEvent) => forwardSort(event.target);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      forwardSort(event.target);
    };
    const onHorizontalScroll = () => {
      overlayTable.style.marginLeft = `${-scrollContainer.scrollLeft}px`;
    };

    copyHeader();
    updateVisibility();
    const resizeObserver = new ResizeObserver(refresh);
    resizeObserver.observe(table);
    resizeObserver.observe(scrollContainer);
    thead.querySelectorAll("th").forEach(cell => resizeObserver.observe(cell));
    const mutationObserver = new MutationObserver(copyHeader);
    mutationObserver.observe(thead, {
      attributes: true,
      attributeFilter: ["class", "title"],
      childList: true,
      characterData: true,
      subtree: true
    });
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", refresh, { passive: true });
    scrollContainer.addEventListener("scroll", onHorizontalScroll, { passive: true });
    overlay.addEventListener("click", onClick);
    overlay.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", refresh);
      scrollContainer.removeEventListener("scroll", onHorizontalScroll);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      overlay.remove();
    };
  }, []);

  return tableRef;
}

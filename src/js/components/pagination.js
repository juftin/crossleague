/**
 * CrossLeague • Reusable Pagination Component
 *
 * Renders numbered pagination buttons with ellipses and active page highlighting.
 */

/**
 * Renders pagination number buttons into a target container.
 *
 * @param {string} containerId DOM ID of target button container
 * @param {number} totalPages Total number of pages
 * @param {number} curPage Current active page number
 * @param {string} onPageClickFnName Name of global callback function (e.g., "goToMainPage")
 */
export function renderPaginationButtons(containerId, totalPages, curPage, onPageClickFnName) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  if (totalPages <= 1) return;

  const createBtn = pageNum => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = String(pageNum);
    btn.onclick = () => {
      if (typeof window[onPageClickFnName] === "function") {
        window[onPageClickFnName](pageNum);
      }
    };
    if (pageNum === curPage) {
      btn.className =
        "w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black text-xs cursor-pointer shadow-sm transition flex items-center justify-center";
      btn.setAttribute("aria-current", "page");
    } else {
      btn.className =
        "w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 font-bold text-xs cursor-pointer transition flex items-center justify-center";
    }
    return btn;
  };

  const createEllipsis = () => {
    const span = document.createElement("span");
    span.className = "px-1 text-slate-500 font-bold text-xs select-none";
    span.textContent = "…";
    return span;
  };

  let pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (curPage <= 4) {
      pages = [1, 2, 3, 4, 5, "...", totalPages];
    } else if (curPage >= totalPages - 3) {
      pages = [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      ];
    } else {
      pages = [1, "...", curPage - 1, curPage, curPage + 1, "...", totalPages];
    }
  }

  pages.forEach(p => {
    if (p === "...") {
      container.appendChild(createEllipsis());
    } else {
      container.appendChild(createBtn(p));
    }
  });
}

/**
 * CrossLeague • Main Leaderboard Table Component
 */

import { state, getActiveRecords } from "../state/store.js";
import { getAvatarUrl } from "../api/sleeper.js";
import { escapeHtml } from "./dom.js";
import { renderPaginationButtons } from "./pagination.js";

/**
 * Renders the main power rankings table rows, sort headers, and paginator.
 *
 * @param {Array<object>} [activeRecords] Active team records array
 */
export function renderTable(activeRecords = getActiveRecords()) {
  const rowCount = document.getElementById("rowCount");
  const tableBody = document.getElementById("tableBody");
  const noResultsFound = document.getElementById("noResultsFound");

  if (!tableBody) return;
  const isSeason = state.currentMode === "SEASON_ROLLUP";

  if (!activeRecords || activeRecords.length === 0) {
    if (rowCount) rowCount.textContent = "Showing 0 squads";
    tableBody.innerHTML = "";
    if (noResultsFound) {
      noResultsFound.classList.remove("hidden");
      const msgTitle = noResultsFound.querySelector(".font-bold");
      const msgSub = noResultsFound.querySelector(".text-xs");
      if (state.selectedLeagueIds.size === 0) {
        if (msgTitle) msgTitle.textContent = "No leagues selected.";
        if (msgSub)
          msgSub.textContent =
            "Select one or more leagues in the filter bar above to display rankings.";
      } else {
        if (msgTitle) msgTitle.textContent = "Nothing on the board matching that search.";
        if (msgSub) msgSub.textContent = "Try clearing the keyword search or resetting filters.";
      }
    }
    const pageInfo = document.getElementById("mainPageInfoText");
    if (pageInfo) pageInfo.textContent = "Showing 0 of 0";
    const btnPrev = document.getElementById("btnPrevMainPage");
    const btnNext = document.getElementById("btnNextMainPage");
    if (btnPrev) btnPrev.disabled = true;
    if (btnNext) btnNext.disabled = true;
    const pageBtnContainer = document.getElementById("mainPageNumberButtons");
    if (pageBtnContainer) pageBtnContainer.innerHTML = "";
    return;
  }

  const sortedMaster = [...activeRecords].sort((a, b) => (b.points || 0) - (a.points || 0));
  const maxScore = sortedMaster[0] ? sortedMaster[0].points || 0 : 100;

  const masterWithRank = sortedMaster.map((item, idx) => ({
    ...item,
    rank: idx + 1,
    percentOfMax: maxScore > 0 ? Math.round(((item.points || 0) / maxScore) * 100) : 0
  }));

  let filtered = masterWithRank.filter(item => {
    const pts = item.points || 0;
    if (isSeason) {
      if (state.currentTierFilter === "BOOM" && pts < 130) return false;
      if (state.currentTierFilter === "SOLID" && (pts < 105 || pts >= 130)) return false;
      if (state.currentTierFilter === "COLD" && pts >= 105) return false;
    } else {
      if (state.currentTierFilter === "BOOM" && pts < 140) return false;
      if (state.currentTierFilter === "SOLID" && (pts < 100 || pts >= 140)) return false;
      if (state.currentTierFilter === "COLD" && pts >= 100) return false;
    }
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      return (
        (item.manager || "").toLowerCase().includes(q) ||
        (item.teamName || "").toLowerCase().includes(q) ||
        (item.league || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  filtered.sort((a, b) => {
    let valA, valB;
    if (state.currentSortColumn === "Rank") {
      valA = a.rank;
      valB = b.rank;
    } else if (state.currentSortColumn === "Points") {
      valA = a.points || 0;
      valB = b.points || 0;
    } else if (state.currentSortColumn === "Manager") {
      valA = (a.manager || "").toLowerCase();
      valB = (b.manager || "").toLowerCase();
    } else if (state.currentSortColumn === "Team") {
      valA = (a.teamName || "").toLowerCase();
      valB = (b.teamName || "").toLowerCase();
    } else if (state.currentSortColumn === "League") {
      valA = (a.league || "").toLowerCase();
      valB = (b.league || "").toLowerCase();
    } else if (state.currentSortColumn === "Record") {
      if (isSeason) {
        valA = typeof a.winPct === "number" ? a.winPct : 0;
        valB = typeof b.winPct === "number" ? b.winPct : 0;
      } else {
        valA =
          a.outcome === "win"
            ? 1000 + (a.margin || 0)
            : a.outcome === "tie"
              ? 500
              : a.margin || -1000;
        valB =
          b.outcome === "win"
            ? 1000 + (b.margin || 0)
            : b.outcome === "tie"
              ? 500
              : b.margin || -1000;
      }
    } else if (state.currentSortColumn === "Efficiency") {
      valA = typeof a.efficiency === "number" ? a.efficiency : 0;
      valB = typeof b.efficiency === "number" ? b.efficiency : 0;
    } else {
      valA = a.points || 0;
      valB = b.points || 0;
    }

    if (valA < valB) return state.currentSortAsc ? -1 : 1;
    if (valA > valB) return state.currentSortAsc ? 1 : -1;
    return 0;
  });

  // Update Header Sort Icons
  ["Rank", "Points", "Manager", "Team", "League", "Record", "Efficiency"].forEach(col => {
    const icon =
      document.getElementById(`sortIcon${col}`) || document.getElementById(`sortIcon-${col}`);
    if (icon) {
      if (state.currentSortColumn === col) {
        icon.textContent = state.currentSortAsc ? "▲" : "▼";
        icon.className = "text-xs text-emerald-400";
      } else {
        icon.textContent = "";
        icon.className = "text-xs text-slate-500";
      }
    }
  });

  if (rowCount) {
    rowCount.textContent = `Showing ${filtered.length} of ${activeRecords.length} squads across ${state.selectedLeagueIds.size} leagues`;
  }
  tableBody.innerHTML = "";

  if (filtered.length === 0) {
    if (noResultsFound) noResultsFound.classList.remove("hidden");
    const pageInfo = document.getElementById("mainPageInfoText");
    if (pageInfo) pageInfo.textContent = "Showing 0 of 0";
    const btnPrev = document.getElementById("btnPrevMainPage");
    const btnNext = document.getElementById("btnNextMainPage");
    if (btnPrev) btnPrev.disabled = true;
    if (btnNext) btnNext.disabled = true;
    const pageBtnContainer = document.getElementById("mainPageNumberButtons");
    if (pageBtnContainer) pageBtnContainer.innerHTML = "";
    return;
  }
  if (noResultsFound) noResultsFound.classList.add("hidden");

  const totalCount = filtered.length;
  const pageSize = state.currentMainPageSize === Infinity ? totalCount : state.currentMainPageSize;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (state.currentMainPage > totalPages) state.currentMainPage = totalPages;
  if (state.currentMainPage < 1) state.currentMainPage = 1;
  const startIdx = (state.currentMainPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalCount);
  const pageSlice = filtered.slice(startIdx, endIdx);

  const pageInfo = document.getElementById("mainPageInfoText");
  if (pageInfo)
    pageInfo.textContent =
      totalCount === 0 ? "Showing 0 of 0" : `Showing ${startIdx + 1}–${endIdx} of ${totalCount}`;
  const btnPrev = document.getElementById("btnPrevMainPage");
  const btnNext = document.getElementById("btnNextMainPage");
  if (btnPrev) btnPrev.disabled = state.currentMainPage <= 1 || totalCount === 0;
  if (btnNext) btnNext.disabled = state.currentMainPage >= totalPages || totalCount === 0;
  renderPaginationButtons(
    "mainPageNumberButtons",
    totalPages,
    state.currentMainPage,
    "goToMainPage"
  );

  pageSlice.forEach(r => {
    const tr = document.createElement("tr");
    const isExpanded = state.expandedRowIds.has(r.id);
    const avatarUrl = getAvatarUrl(r.avatar);

    tr.className = "transition-colors hover:bg-slate-800/60";

    let rankBadge = `<span class="font-black text-slate-400 font-mono text-xs sm:text-base">#${r.rank}</span>`;
    if (r.rank === 1)
      rankBadge = `<span class="inline-flex items-center gap-1 font-black text-amber-300 text-xs sm:text-base">🥇 #1</span>`;
    else if (r.rank === 2)
      rankBadge = `<span class="inline-flex items-center gap-1 font-black text-slate-200 text-xs sm:text-base">🥈 #2</span>`;
    else if (r.rank === 3)
      rankBadge = `<span class="inline-flex items-center gap-1 font-black text-amber-500 text-xs sm:text-base">🥉 #3</span>`;

    // Matchup Result Pill
    let matchupPill = "";
    if (isSeason) {
      matchupPill = `
        <div class="text-center">
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-black ${r.winPct >= 60 ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" : r.winPct >= 40 ? "bg-slate-800 text-slate-300 border border-slate-700" : "bg-rose-500/15 text-rose-300 border border-rose-500/30"}">
            ${r.wins || 0}W - ${r.losses || 0}L${(r.ties || 0) > 0 ? ` - ${r.ties}T` : ""}
          </span>
          <div class="text-[10px] sm:text-xs text-slate-400 font-mono mt-0.5">${r.winPct || 0}% Win</div>
        </div>
      `;
    } else {
      if (r.outcome === "win") {
        matchupPill = `
          <div class="text-center">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              🟢 W (+${Math.abs(r.margin || 0).toFixed(1)})
            </span>
            <div class="text-[10px] sm:text-xs text-slate-400 truncate max-w-[110px] sm:max-w-[130px] mt-0.5 font-medium" title="vs ${escapeHtml(r.opponentName || "Opponent")}">
              vs ${escapeHtml(r.opponentName || "Opp")}
            </div>
          </div>
        `;
      } else if (r.outcome === "loss") {
        matchupPill = `
          <div class="text-center">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
              🔴 L (-${Math.abs(r.margin || 0).toFixed(1)})
            </span>
            <div class="text-[10px] sm:text-xs text-slate-400 truncate max-w-[110px] sm:max-w-[130px] mt-0.5 font-medium" title="vs ${escapeHtml(r.opponentName || "Opponent")}">
              vs ${escapeHtml(r.opponentName || "Opp")}
            </div>
          </div>
        `;
      } else if (r.outcome === "tie") {
        matchupPill = `
          <div class="text-center">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black bg-slate-800 text-slate-300 border border-slate-700">
              ⚪ TIE
            </span>
          </div>
        `;
      } else if (r.outcome === "unplayed") {
        matchupPill = `
          <div class="text-center">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60 truncate max-w-[110px] sm:max-w-[130px]" title="vs ${escapeHtml(r.opponentName || "Opponent")}">
              vs ${escapeHtml(r.opponentName || "Opp")}
            </span>
            <div class="text-[10px] sm:text-xs text-slate-500 font-mono mt-0.5">Upcoming</div>
          </div>
        `;
      } else {
        matchupPill = `<span class="text-slate-600 text-[10px] sm:text-xs">-</span>`;
      }
    }

    // Efficiency Pill
    const effVal = typeof r.efficiency === "number" && !isNaN(r.efficiency) ? r.efficiency : 100;
    const benchPtsVal =
      typeof r.benchPoints === "number" && !isNaN(r.benchPoints) ? r.benchPoints : 0;
    const efficiencyBadge = `
      <div class="text-center">
        <span class="text-xs sm:text-sm font-mono font-black ${effVal >= 90 ? "text-emerald-400" : effVal >= 75 ? "text-slate-300" : "text-amber-400"}">
          ${effVal}%
        </span>
        <div class="text-[10px] sm:text-xs text-slate-400 font-medium">${benchPtsVal.toFixed(1)} benched</div>
      </div>
    `;

    const avatarHtml = avatarUrl
      ? `<img src="${avatarUrl}" class="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-700 flex-shrink-0" alt="" onerror="this.remove()">`
      : "";

    tr.innerHTML = `
      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap">${rankBadge}</td>

      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap">
        <div class="space-y-0.5 sm:space-y-1">
          <div class="font-mono text-sm sm:text-lg font-black ${r.rank <= 3 ? "text-emerald-400" : "text-white"}">
            ${(r.points || 0).toFixed(2)} <span class="text-[10px] sm:text-xs font-semibold text-slate-400">${isSeason ? "ppg" : "pts"}</span>
          </div>
          <div class="w-24 sm:w-36 bg-slate-800/90 rounded-full h-1 sm:h-1.5 overflow-hidden">
            <div class="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full" style="width: ${r.percentOfMax}%"></div>
          </div>
        </div>
      </td>

      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap">
        <div class="flex items-center gap-2 sm:gap-3">
          ${avatarHtml}
          <div class="min-w-0">
            <span class="font-black text-xs sm:text-base text-slate-100 truncate block">
              ${escapeHtml(r.manager)}
            </span>
          </div>
        </div>
      </td>

      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap text-[11px] sm:text-sm text-slate-300 font-medium truncate max-w-[140px] sm:max-w-[180px]">
        ${escapeHtml(r.teamName)}
      </td>

      <td class="py-2.5 sm:py-4 px-2 sm:px-4 text-slate-300 font-medium">
        <div class="text-[11px] sm:text-sm font-bold text-slate-200 break-words leading-snug max-w-[200px] sm:max-w-[260px] flex items-center flex-wrap gap-1">
          <span>${escapeHtml(r.league)}</span>
          ${
            String(r.leagueId).startsWith("espn:") || r.platform === "espn"
              ? `<span class="badge-espn text-[9px] font-bold px-1.5 py-0.5 rounded">ESPN</span>`
              : `<span class="badge-sleeper text-[9px] font-bold px-1.5 py-0.5 rounded">Sleeper</span>`
          }
        </div>
      </td>

      <td class="py-2.5 sm:py-4 px-2 sm:px-4 text-center whitespace-nowrap">
        ${matchupPill}
      </td>

      <td class="py-2.5 sm:py-4 px-2 sm:px-4 text-center whitespace-nowrap">
        ${efficiencyBadge}
      </td>

      <td class="py-2.5 sm:py-4 px-1.5 sm:px-3 text-center whitespace-nowrap">
        <button
          onclick="toggleRowExpand('${r.id}')"
          class="p-1.5 sm:p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition text-[10px] sm:text-xs font-mono font-bold border border-slate-800 cursor-pointer"
          title="Toggle Details"
        >
          ${isExpanded ? "▲" : "▼"}
        </button>
      </td>
    `;
    tableBody.appendChild(tr);

    if (isExpanded) {
      const detailTr = document.createElement("tr");
      detailTr.className = "bg-slate-950/90 border-b border-slate-800";

      if (isSeason) {
        detailTr.innerHTML = `
          <td colspan="8" class="p-5">
            <div class="glass-card rounded-xl p-5 border border-slate-800/80 space-y-3.5">
              <div class="flex items-center justify-between border-b border-slate-800 pb-2.5 flex-wrap gap-2">
                <div class="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <span>📈 Season Consistency & Breakdown</span>
                </div>
                <div class="text-xs sm:text-sm text-slate-400 font-semibold">
                  Season High: <span class="font-black text-emerald-400 font-mono">${(r.highScore || 0).toFixed(2)} pts</span> •
                  Season Low: <span class="font-black text-rose-400 font-mono">${(r.lowScore || 0).toFixed(2)} pts</span> •
                  Consistency (Std Dev): <span class="font-black text-cyan-300 font-mono">±${r.stdDev || 0}</span>
                </div>
              </div>

              <div class="text-xs sm:text-sm text-slate-300">
                <span class="font-bold text-slate-200">Weekly Score Progression:</span>
                <div class="flex flex-wrap gap-2 mt-2">
                  ${(r.weeklyScores || [])
                    .map(
                      (pt, idx) => `
                    <span class="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs sm:text-sm text-slate-200">
                      W${idx + 1}: <span class="text-emerald-400 font-black">${parseFloat(pt || 0).toFixed(1)}</span>
                    </span>
                  `
                    )
                    .join("")}
                </div>
              </div>
            </div>
          </td>
        `;
      } else {
        detailTr.innerHTML = `
          <td colspan="8" class="p-5">
            <div class="glass-card rounded-xl p-5 border border-slate-800/80 space-y-3.5">
              <div class="flex items-center justify-between border-b border-slate-800 pb-2.5 flex-wrap gap-2">
                <div class="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <span>⚡ Starting Lineup vs Bench</span>
                  <span class="text-slate-400 font-normal">| Matchup #${r.matchupId || "N/A"}</span>
                </div>
                <div class="text-xs sm:text-sm text-slate-400 font-semibold">
                  Starters: <span class="font-black text-emerald-400 font-mono">${(r.startersTotal || 0).toFixed(2)} pts</span> •
                  Bench: <span class="font-black text-slate-300 font-mono">${(r.benchPoints || 0).toFixed(2)} pts</span> •
                  Optimal Potential: <span class="font-black text-amber-300 font-mono">${(r.optimalPoints || 0).toFixed(2)} pts</span> (${r.efficiency || 100}% efficiency)
                </div>
              </div>

              <div class="text-xs sm:text-sm text-slate-300">
                <span class="font-bold text-slate-200">Starter Point Breakdown:</span>
                <div class="flex flex-wrap gap-2 mt-2">
                  ${
                    r.startersPoints && r.startersPoints.length > 0
                      ? r.startersPoints
                          .map(
                            (pt, idx) => `
                      <span class="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs sm:text-sm text-slate-200">
                        S${idx + 1}: <span class="text-emerald-400 font-black">${parseFloat(pt || 0).toFixed(1)}</span>
                      </span>
                    `
                          )
                          .join("")
                      : '<span class="text-slate-500 italic">No individual starter data available.</span>'
                  }
                </div>
              </div>
            </div>
          </td>
        `;
      }

      tableBody.appendChild(detailTr);
    }
  });
}

/**
 * Toggles expanded details row accordion for a specific team.
 *
 * @param {string} rowId Team row identifier
 */
export function toggleRowExpand(rowId) {
  if (state.expandedRowIds.has(rowId)) {
    state.expandedRowIds.delete(rowId);
  } else {
    state.expandedRowIds.add(rowId);
  }
  renderTable();
}

/**
 * Sets page size for main table pagination.
 *
 * @param {string|number} size Page size or "all"
 */
export function setMainPageSize(size) {
  state.currentMainPageSize = size === "all" ? Infinity : parseInt(size, 10);
  state.currentMainPage = 1;
  renderTable();
}

/**
 * Advances or reverses main table page offset.
 *
 * @param {number} delta Page delta (+1 or -1)
 */
export function changeMainPage(delta) {
  state.currentMainPage += delta;
  renderTable();
}

/**
 * Navigates to a specific page index in main table.
 *
 * @param {number} page Target page number
 */
export function goToMainPage(page) {
  state.currentMainPage = page;
  renderTable();
}

/**
 * Sorts main leaderboard table by a specific column key.
 *
 * @param {string} column Target column name
 */
export function sortTable(column) {
  const colMap = {
    rank: "Rank",
    points: "Points",
    manager: "Manager",
    team: "Team",
    teamname: "Team",
    league: "League",
    matchup: "Record",
    record: "Record",
    efficiency: "Efficiency"
  };
  const targetCol = colMap[String(column).toLowerCase()] || column;

  if (state.currentSortColumn === targetCol) {
    state.currentSortAsc = !state.currentSortAsc;
  } else {
    state.currentSortColumn = targetCol;
    state.currentSortAsc =
      targetCol === "Rank" ||
      targetCol === "Manager" ||
      targetCol === "Team" ||
      targetCol === "League";
  }
  state.currentMainPage = 1;
  renderTable();
}

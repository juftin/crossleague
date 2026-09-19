/**
 * CrossLeague • Luck Analytics Component
 *
 * Renders superlatives, schedule luck cards, and interactive luck table.
 */

import { state, getActiveRecords, getActiveLeaguesMap } from "../state/store.js";
import { getAvatarUrl, escapeHtml } from "./dom.js";
import { renderPaginationButtons } from "./pagination.js";

/**
 * Renders luck superlatives cards and luck table.
 *
 * @param {Array<object>} [records] Records to render
 * @param {Record<string, object>} [_leagues] Leagues map
 */
export function renderLuckAnalytics(
  records = getActiveRecords(),
  _leagues = getActiveLeaguesMap()
) {
  if (!records || records.length === 0) return;

  // 1. Superlatives Cards
  const sortedByLuckDesc = [...records].sort((a, b) => (b.luckIndex || 0) - (a.luckIndex || 0));
  const sortedByLuckAsc = [...records].sort((a, b) => (a.luckIndex || 0) - (b.luckIndex || 0));
  const sortedByAllPlay = [...records].sort((a, b) => {
    const pctDiff = (b.allPlayWinPct || 0) - (a.allPlayWinPct || 0);
    if (pctDiff !== 0) return pctDiff;
    const ptsA = typeof a.totalPoints === "number" ? a.totalPoints : a.points || 0;
    const ptsB = typeof b.totalPoints === "number" ? b.totalPoints : b.points || 0;
    return ptsB - ptsA;
  });
  const sortedByPA = [...records].sort((a, b) => (b.pointsAgainst || 0) - (a.pointsAgainst || 0));

  const luckiest = sortedByLuckDesc[0];
  const unluckiest = sortedByLuckAsc[0];
  const allPlayLeader = sortedByAllPlay[0];
  const toughest = sortedByPA[0];

  const isSeason = state.currentMode === "SEASON_ROLLUP";

  const cardLuckiest = document.getElementById("luckLuckiestCard");
  const cardUnluckiest = document.getElementById("luckUnluckiestCard");
  const cardAllPlay = document.getElementById("luckAllPlayLeaderCard");
  const cardToughest = document.getElementById("luckToughestCard");

  if (luckiest) {
    const valEl = document.getElementById("statLuckiestVal");
    const teamEl = document.getElementById("statLuckiestTeam");
    const leagueEl = document.getElementById("statLuckiestLeague");
    const subEl = document.getElementById("statLuckiestSub");
    const luckVal = luckiest.luckIndex || 0;
    const luckStr = `${luckVal >= 0 ? "+" : ""}${luckVal.toFixed(2)}`;
    const expStr = (luckiest.expectedWins || 0).toFixed(2);
    const actStr = isSeason
      ? `${luckiest.wins} wins`
      : luckiest.outcome === "win"
        ? "1.0 win"
        : luckiest.outcome === "tie"
          ? "0.5 win"
          : "0.0 wins";

    if (valEl) {
      valEl.textContent = luckStr;
      valEl.title = `Luck Index: ${luckStr} (${actStr} actual vs ${expStr} expected wins)`;
    }
    if (teamEl) {
      teamEl.textContent = `${luckiest.manager} - ${luckiest.teamName}`;
      teamEl.title = `${luckiest.manager} (${luckiest.teamName})`;
    }
    if (leagueEl) {
      leagueEl.innerHTML = `<span class="truncate">${escapeHtml(luckiest.league)}</span>`;
      leagueEl.title = `League: ${luckiest.league}`;
    }
    if (subEl) {
      subEl.textContent = isSeason
        ? `${luckiest.wins}W-${luckiest.losses}L (${luckiest.winPct}%) • ${luckiest.allPlayWins}W-${luckiest.allPlayLosses}L All-Play`
        : `${luckiest.outcome === "win" ? "Won Matchup" : "Lost Matchup"} • Exp: ${expStr} Wins`;
      subEl.title = isSeason
        ? `Season Record: ${luckiest.wins}W-${luckiest.losses}L vs All-Play: ${luckiest.allPlayWins}W-${luckiest.allPlayLosses}L (${luckiest.allPlayWinPct}% win rate)`
        : `Matchup: ${luckiest.outcome === "win" ? "Won" : "Lost"} vs Exp Wins: ${expStr}`;
    }
    if (cardLuckiest) {
      cardLuckiest.setAttribute(
        "title",
        `Luckiest Squad: Awarded to ${luckiest.manager} in ${luckiest.league}. Gained ${luckStr} bonus wins above All-Play expectation (${actStr} vs ${expStr} expected).`
      );
    }
  }

  if (unluckiest) {
    const valEl = document.getElementById("statUnluckiestVal");
    const teamEl = document.getElementById("statUnluckiestTeam");
    const leagueEl = document.getElementById("statUnluckiestLeague");
    const subEl = document.getElementById("statUnluckiestSub");
    const luckVal = unluckiest.luckIndex || 0;
    const luckStr = `${luckVal >= 0 ? "+" : ""}${luckVal.toFixed(2)}`;
    const expStr = (unluckiest.expectedWins || 0).toFixed(2);
    const actStr = isSeason
      ? `${unluckiest.wins} wins`
      : unluckiest.outcome === "win"
        ? "1.0 win"
        : unluckiest.outcome === "tie"
          ? "0.5 win"
          : "0.0 wins";

    if (valEl) {
      valEl.textContent = luckStr;
      valEl.title = `Luck Index: ${luckStr} (${actStr} actual vs ${expStr} expected wins)`;
    }
    if (teamEl) {
      teamEl.textContent = `${unluckiest.manager} - ${unluckiest.teamName}`;
      teamEl.title = `${unluckiest.manager} (${unluckiest.teamName})`;
    }
    if (leagueEl) {
      leagueEl.innerHTML = `<span class="truncate">${escapeHtml(unluckiest.league)}</span>`;
      leagueEl.title = `League: ${unluckiest.league}`;
    }
    if (subEl) {
      subEl.textContent = isSeason
        ? `${unluckiest.wins}W-${unluckiest.losses}L (${unluckiest.winPct}%) • ${unluckiest.allPlayWins}W-${unluckiest.allPlayLosses}L All-Play`
        : `${unluckiest.outcome === "win" ? "Won Matchup" : "Lost Matchup"} • Exp: ${expStr} Wins`;
      subEl.title = isSeason
        ? `Season Record: ${unluckiest.wins}W-${unluckiest.losses}L vs All-Play: ${unluckiest.allPlayWins}W-${unluckiest.allPlayLosses}L (${unluckiest.allPlayWinPct}% win rate)`
        : `Matchup: ${unluckiest.outcome === "win" ? "Won" : "Lost"} vs Exp Wins: ${expStr}`;
    }
    if (cardUnluckiest) {
      cardUnluckiest.setAttribute(
        "title",
        `Unluckiest Squad (Tough Schedule): Awarded to ${unluckiest.manager} in ${unluckiest.league}. Underperformed All-Play expectation by ${Math.abs(luckVal).toFixed(2)} wins due to brutal opponent scores (${actStr} vs ${expStr} expected).`
      );
    }
  }

  if (allPlayLeader) {
    const valEl = document.getElementById("statAllPlayLeaderVal");
    const teamEl = document.getElementById("statAllPlayLeaderTeam");
    const leagueEl = document.getElementById("statAllPlayLeaderLeague");
    const subEl = document.getElementById("statAllPlayLeaderSub");

    if (valEl) {
      valEl.textContent = `${allPlayLeader.allPlayWinPct || 0}%`;
      valEl.title = `All-Play Win Rate: ${allPlayLeader.allPlayWinPct || 0}% (${allPlayLeader.allPlayWins}W - ${allPlayLeader.allPlayLosses}L${allPlayLeader.allPlayTies > 0 ? ` - ${allPlayLeader.allPlayTies}T` : ""})`;
    }
    if (teamEl) {
      teamEl.textContent = `${allPlayLeader.manager} - ${allPlayLeader.teamName}`;
      teamEl.title = `${allPlayLeader.manager} (${allPlayLeader.teamName})`;
    }
    if (leagueEl) {
      leagueEl.innerHTML = `<span class="truncate">${escapeHtml(allPlayLeader.league)}</span>`;
      leagueEl.title = `League: ${allPlayLeader.league}`;
    }
    if (subEl) {
      subEl.textContent = isSeason
        ? `${allPlayLeader.allPlayWins}W-${allPlayLeader.allPlayLosses}L All-Play • ${(allPlayLeader.totalPoints || 0).toFixed(1)} PF`
        : `${allPlayLeader.allPlayWins}W-${allPlayLeader.allPlayLosses}L All-Play • ${(allPlayLeader.points || 0).toFixed(1)} pts`;
      subEl.title = `Simulated across all league rivals: ${allPlayLeader.allPlayWins} wins, ${allPlayLeader.allPlayLosses} losses`;
    }
    if (cardAllPlay) {
      cardAllPlay.setAttribute(
        "title",
        `All-Play Powerhouse (True Dominance): Awarded to ${allPlayLeader.manager} in ${allPlayLeader.league} for achieving the highest All-Play win rate (${allPlayLeader.allPlayWinPct}%).`
      );
    }
  }

  if (toughest) {
    const valEl = document.getElementById("statToughestVal");
    const teamEl = document.getElementById("statToughestTeam");
    const leagueEl = document.getElementById("statToughestLeague");
    const subEl = document.getElementById("statToughestSub");
    const paStr = `${(toughest.pointsAgainst || 0).toFixed(1)} pts`;

    if (valEl) {
      valEl.textContent = paStr;
      valEl.title = `Points Against: ${(toughest.pointsAgainst || 0).toFixed(2)} pts ${isSeason ? "per game avg" : "allowed in matchup"}`;
    }
    if (teamEl) {
      teamEl.textContent = `${toughest.manager} - ${toughest.teamName}`;
      teamEl.title = `${toughest.manager} (${toughest.teamName})`;
    }
    if (leagueEl) {
      leagueEl.innerHTML = `<span class="truncate">${escapeHtml(toughest.league)}</span>`;
      leagueEl.title = `League: ${toughest.league}`;
    }
    if (subEl) {
      subEl.textContent = isSeason
        ? `Avg Opponent Score (PA)`
        : `Opponent: ${toughest.opponentName || "Opp"}`;
      subEl.title = isSeason
        ? `Highest average opponent score across all weeks: ${(toughest.pointsAgainst || 0).toFixed(2)} PPG`
        : `Opponent score: ${(toughest.pointsAgainst || 0).toFixed(2)} pts`;
    }
    if (cardToughest) {
      cardToughest.setAttribute(
        "title",
        `Toughest Opponents (Highest PA): Awarded to ${toughest.manager} in ${toughest.league} for enduring the most difficult opponent scoring schedule (${(toughest.pointsAgainst || 0).toFixed(2)} pts avg).`
      );
    }
  }

  // 2. Filter & Render Luck Table
  renderLuckTable(records);
}

/**
 * Sets luck table page size.
 *
 * @param {string|number} size Page size
 */
export function setLuckPageSize(size) {
  state.currentLuckPageSize = size === "all" ? Infinity : parseInt(size, 10);
  state.currentLuckPage = 1;
  renderLuckTable();
}

/**
 * Changes luck table page by delta.
 *
 * @param {number} delta Delta
 */
export function changeLuckPage(delta) {
  state.currentLuckPage += delta;
  renderLuckTable();
}

/**
 * Navigates directly to a luck page.
 *
 * @param {number} page Page number
 */
export function goToLuckPage(page) {
  state.currentLuckPage = page;
  renderLuckTable();
}

/**
 * Sorts luck table by column.
 *
 * @param {string} col Column name
 */
export function sortLuckTable(col) {
  if (state.currentLuckSortColumn === col) {
    state.currentLuckSortAsc = !state.currentLuckSortAsc;
  } else {
    state.currentLuckSortColumn = col;
    state.currentLuckSortAsc = col === "Rank" || col === "Manager" || col === "League";
  }
  state.currentLuckPage = 1;
  renderLuckTable();
}

/**
 * Renders luck table rows based on current filters and pagination.
 *
 * @param {Array<object>} [records] Records to render
 */
export function renderLuckTable(records = getActiveRecords()) {
  const tableBody = document.getElementById("luckTableBody");
  const rowCount = document.getElementById("luckRowCount");
  const noLuckFound = document.getElementById("noLuckFound");
  if (!tableBody) return;

  const isSeason = state.currentMode === "SEASON_ROLLUP";

  let filtered = (records || []).filter(r => {
    const luckVal = r.luckIndex || 0;
    if (state.currentLuckCategory === "LUCKY" && luckVal <= 0.5) return false;
    if (state.currentLuckCategory === "FAIR" && (luckVal < -0.5 || luckVal > 0.5)) return false;
    if (state.currentLuckCategory === "UNLUCKY" && luckVal >= -0.5) return false;

    if (state.currentLuckSearch) {
      const q = state.currentLuckSearch.toLowerCase();
      return (
        (r.manager || "").toLowerCase().includes(q) ||
        (r.teamName || "").toLowerCase().includes(q) ||
        (r.league || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Update Header Sort Icons
  ["Rank", "Manager", "League", "Actual", "AllPlay", "Expected", "Luck", "PF", "PA"].forEach(
    col => {
      const icon = document.getElementById(`sortIconLuck${col}`);
      if (icon) {
        if (state.currentLuckSortColumn === col) {
          icon.textContent = state.currentLuckSortAsc ? "▲" : "▼";
          icon.className = "text-xs text-emerald-400";
        } else {
          icon.textContent = "";
          icon.className = "text-xs text-slate-500";
        }
      }
    }
  );

  filtered.sort((a, b) => {
    let valA, valB;
    if (state.currentLuckSortColumn === "Rank") {
      valA = a.rank || 0;
      valB = b.rank || 0;
    } else if (state.currentLuckSortColumn === "Manager") {
      valA = (a.manager || "").toLowerCase();
      valB = (b.manager || "").toLowerCase();
    } else if (state.currentLuckSortColumn === "League") {
      valA = (a.league || "").toLowerCase();
      valB = (b.league || "").toLowerCase();
    } else if (state.currentLuckSortColumn === "Actual") {
      valA = typeof a.winPct === "number" ? a.winPct : a.actualWins || 0;
      valB = typeof b.winPct === "number" ? b.winPct : b.actualWins || 0;
    } else if (state.currentLuckSortColumn === "AllPlay") {
      valA = a.allPlayWinPct || 0;
      valB = b.allPlayWinPct || 0;
    } else if (state.currentLuckSortColumn === "Expected") {
      valA = a.expectedWins || 0;
      valB = b.expectedWins || 0;
    } else if (state.currentLuckSortColumn === "Luck") {
      valA = a.luckIndex || 0;
      valB = b.luckIndex || 0;
    } else if (state.currentLuckSortColumn === "PF") {
      valA = a.points || 0;
      valB = b.points || 0;
    } else if (state.currentLuckSortColumn === "PA") {
      valA = a.pointsAgainst || 0;
      valB = b.pointsAgainst || 0;
    } else {
      valA = a.luckIndex || 0;
      valB = b.luckIndex || 0;
    }

    if (valA < valB) return state.currentLuckSortAsc ? -1 : 1;
    if (valA > valB) return state.currentLuckSortAsc ? 1 : -1;

    // Tie-breaker: rank highest scoring squad first (or lowest if ascending)
    const ptsA = typeof a.totalPoints === "number" ? a.totalPoints : a.points || 0;
    const ptsB = typeof b.totalPoints === "number" ? b.totalPoints : b.points || 0;
    return state.currentLuckSortAsc ? ptsA - ptsB : ptsB - ptsA;
  });

  if (rowCount) {
    rowCount.textContent = `Showing ${filtered.length} of ${(records || []).length} squads across ${state.selectedLeagueIds.size} leagues`;
  }

  if (filtered.length === 0) {
    tableBody.innerHTML = "";
    if (noLuckFound) noLuckFound.classList.remove("hidden");
    const pageInfo = document.getElementById("luckPageInfoText");
    if (pageInfo) pageInfo.textContent = "Showing 0 of 0";
    const btnPrev = document.getElementById("btnPrevLuckPage");
    const btnNext = document.getElementById("btnNextLuckPage");
    if (btnPrev) btnPrev.disabled = true;
    if (btnNext) btnNext.disabled = true;
    const pageBtnContainer = document.getElementById("luckPageNumberButtons");
    if (pageBtnContainer) pageBtnContainer.innerHTML = "";
    return;
  }
  if (noLuckFound) noLuckFound.classList.add("hidden");

  tableBody.innerHTML = "";

  const totalCount = filtered.length;
  const pageSize = state.currentLuckPageSize === Infinity ? totalCount : state.currentLuckPageSize;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (state.currentLuckPage > totalPages) state.currentLuckPage = totalPages;
  if (state.currentLuckPage < 1) state.currentLuckPage = 1;
  const startIdx = (state.currentLuckPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalCount);
  const pageSlice = filtered.slice(startIdx, endIdx);

  const pageInfo = document.getElementById("luckPageInfoText");
  if (pageInfo)
    pageInfo.textContent =
      totalCount === 0 ? "Showing 0 of 0" : `Showing ${startIdx + 1}–${endIdx} of ${totalCount}`;
  const btnPrev = document.getElementById("btnPrevLuckPage");
  const btnNext = document.getElementById("btnNextLuckPage");
  if (btnPrev) btnPrev.disabled = state.currentLuckPage <= 1 || totalCount === 0;
  if (btnNext) btnNext.disabled = state.currentLuckPage >= totalPages || totalCount === 0;
  renderPaginationButtons(
    "luckPageNumberButtons",
    totalPages,
    state.currentLuckPage,
    "goToLuckPage"
  );

  pageSlice.forEach((r, idx) => {
    const rankNum = startIdx + idx + 1;
    const tr = document.createElement("tr");
    tr.className = "transition-colors hover:bg-slate-800/60";

    const avatarUrl = getAvatarUrl(r.avatar);
    const avatarHtml = avatarUrl
      ? `<img src="${avatarUrl}" class="w-8 h-8 rounded-full object-cover border border-slate-700 flex-shrink-0" alt="" onerror="this.remove()">`
      : "";

    // Actual Record Pill with detailed tooltip
    let actualRecordHtml = "";
    if (isSeason) {
      const actWins = r.wins || 0;
      const actLosses = r.losses || 0;
      const actTies = r.ties || 0;
      actualRecordHtml = `
        <div class="text-center" title="Actual Head-to-Head Record: ${actWins}W - ${actLosses}L${actTies > 0 ? ` - ${actTies}T` : ""} (${r.winPct}% win rate)">
          <span class="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-black ${r.winPct >= 60 ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" : r.winPct >= 40 ? "bg-slate-800 text-slate-300 border border-slate-700" : "bg-rose-500/15 text-rose-300 border border-rose-500/30"}">
            ${actWins}W - ${actLosses}L${actTies > 0 ? ` - ${actTies}T` : ""}
          </span>
          <div class="text-[10px] sm:text-xs text-slate-400 font-mono mt-0.5 font-medium">${r.winPct}%</div>
        </div>
      `;
    } else {
      const outcomeDesc =
        r.outcome === "win"
          ? `Won Matchup (+${Math.abs(r.margin || 0).toFixed(1)} pts vs ${r.opponentName || "Opponent"})`
          : r.outcome === "loss"
            ? `Lost Matchup (-${Math.abs(r.margin || 0).toFixed(1)} pts vs ${r.opponentName || "Opponent"})`
            : r.outcome === "tie"
              ? `Tied Matchup vs ${r.opponentName || "Opponent"}`
              : `Upcoming Matchup vs ${r.opponentName || "Opponent"}`;
      actualRecordHtml = `
        <div class="text-center" title="${escapeHtml(outcomeDesc)}">
          <span class="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-[10px] sm:text-xs font-black ${r.outcome === "win" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : r.outcome === "loss" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-slate-800 text-slate-400 border border-slate-700"}">
            ${r.outcome === "win" ? "1-0" : r.outcome === "loss" ? "0-1" : r.outcome === "tie" ? "0-0-1" : "Upcoming"}
          </span>
          <div class="text-[10px] sm:text-xs text-slate-400 mt-0.5 font-medium truncate max-w-[100px] sm:max-w-[120px]" title="vs ${escapeHtml(r.opponentName || "Opp")}">vs ${escapeHtml(r.opponentName || "Opp")}</div>
        </div>
      `;
    }

    // All-Play Pill with detailed tooltip
    const allPlayHtml = `
      <div class="text-center" title="All-Play Record: ${r.allPlayWins || 0}W - ${r.allPlayLosses || 0}L${(r.allPlayTies || 0) > 0 ? ` - ${r.allPlayTies}T` : ""} (${r.allPlayWinPct || 0}% win rate against all league rivals)">
        <span class="font-mono text-[10px] sm:text-sm font-bold text-slate-200">
          ${r.allPlayWins || 0}W - ${r.allPlayLosses || 0}L${(r.allPlayTies || 0) > 0 ? ` - ${r.allPlayTies}T` : ""}
        </span>
        <div class="text-[10px] sm:text-xs font-mono text-cyan-400 font-semibold">${r.allPlayWinPct || 0}% Win</div>
      </div>
    `;

    // Luck Badge with detailed informative tooltip
    const luckVal = r.luckIndex || 0;
    let luckBadge = "";
    const expWinsStr = (r.expectedWins || 0).toFixed(2);
    const actWinsStr = isSeason
      ? `${r.wins}W`
      : r.outcome === "win"
        ? "1.0"
        : r.outcome === "tie"
          ? "0.5"
          : "0.0";
    if (luckVal >= 0.5) {
      luckBadge = `
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-sm font-mono font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm cursor-help" title="Lucky Schedule Draw: Gained +${luckVal.toFixed(2)} bonus wins above expected (${actWinsStr} actual vs ${expWinsStr} expected based on scoring)">
          +${luckVal.toFixed(2)}
        </span>
      `;
    } else if (luckVal <= -0.5) {
      luckBadge = `
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-sm font-mono font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm cursor-help" title="Unlucky Schedule Draw: Lost ${Math.abs(luckVal).toFixed(2)} wins below expected (${actWinsStr} actual vs ${expWinsStr} expected due to tough opponent scores)">
          ${luckVal.toFixed(2)}
        </span>
      `;
    } else {
      luckBadge = `
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-sm font-mono font-black bg-slate-800 text-slate-300 border border-slate-700 cursor-help" title="Fair Schedule: Actual outcome closely matches scoring performance (${luckVal >= 0 ? "+" : ""}${luckVal.toFixed(2)} vs ${expWinsStr} expected)">
          ${luckVal >= 0 ? "+" : ""}${luckVal.toFixed(2)}
        </span>
      `;
    }

    tr.innerHTML = `
      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap font-mono font-black text-xs sm:text-sm text-slate-400">#${rankNum}</td>
      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap">
        <div class="flex items-center gap-2 sm:gap-3">
          ${avatarHtml}
          <div class="min-w-0">
            <span class="font-bold text-xs sm:text-sm text-white truncate block" title="${escapeHtml(r.manager)}">${escapeHtml(r.manager)}</span>
            <span class="text-[10px] sm:text-xs text-slate-400 truncate block" title="${escapeHtml(r.teamName)}">${escapeHtml(r.teamName)}</span>
          </div>
        </div>
      </td>
      <td class="py-2.5 sm:py-4 px-2 sm:px-4 text-[11px] sm:text-sm text-slate-300 font-medium max-w-[150px] sm:max-w-[200px] truncate" title="League: ${escapeHtml(r.league)}">
        <div class="flex items-center gap-1.5 truncate">
          <span class="truncate">${escapeHtml(r.league)}</span>
          ${
            String(r.leagueId).startsWith("espn:") || r.platform === "espn"
              ? `<span class="badge-espn text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0">ESPN</span>`
              : `<span class="badge-sleeper text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0">Sleeper</span>`
          }
        </div>
      </td>
      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap text-center">${actualRecordHtml}</td>
      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap text-center">${allPlayHtml}</td>
      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap text-center font-mono font-black text-xs sm:text-sm text-slate-200" title="Expected Wins: ${(r.expectedWins || 0).toFixed(2)} based on ${r.allPlayWinPct || 0}% All-Play win rate">
        ${(r.expectedWins || 0).toFixed(2)}
      </td>
      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap text-center">${luckBadge}</td>
      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap text-right font-mono font-bold text-xs sm:text-sm text-emerald-400" title="${isSeason ? `Total PF: ${(r.totalPoints || 0).toFixed(1)} pts across ${r.weeksCount || 1} weeks (${r.points.toFixed(2)} PPG)` : `Points Scored: ${r.points.toFixed(2)} pts`}">
        ${r.points.toFixed(2)} <span class="text-[10px] sm:text-xs font-normal text-slate-400">${isSeason ? "ppg" : "pts"}</span>
      </td>
      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap text-right font-mono font-bold text-xs sm:text-sm text-slate-300" title="${isSeason ? `Total Opponent PA: ${(r.totalPointsAgainst || 0).toFixed(1)} pts allowed (${(r.pointsAgainst || 0).toFixed(2)} PPG)` : `Opponent Score Allowed: ${(r.pointsAgainst || 0).toFixed(2)} pts`}">
        ${(r.pointsAgainst || 0).toFixed(2)} <span class="text-[10px] sm:text-xs font-normal text-slate-400">${isSeason ? "ppg" : "pts"}</span>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

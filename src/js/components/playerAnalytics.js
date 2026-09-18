/**
 * CrossLeague • Player Analytics & Positional MVP Component
 */

import { state, getActiveRecords, getActiveLeaguesMap } from "../state/store.js";
import { escapeHtml, createCardTitleWithInfo } from "./dom.js";
import { getPlayerPositionBadge, getPlayerInfo } from "../api/players.js";
import { aggregatePlayers } from "../analytics/aggregation.js";
import { renderPaginationButtons } from "./pagination.js";

export { aggregatePlayers };

/**
 * Renders the full Player Analytics view (Positional MVPs deck + full rostered player leaderboard).
 *
 * @param {Array<object>} [records] Team records array
 * @param {Record<string, object>} [_leagues] Leagues map
 */
export function renderPlayerAnalytics(
  records = getActiveRecords(),
  _leagues = getActiveLeaguesMap()
) {
  const positionalMvpDeck = document.getElementById("positionalMvpDeck");
  const playerTableBody = document.getElementById("playerTableBody");
  const playerSeasonBadge = document.getElementById("playerSeasonBadge");
  const seasonInput = document.getElementById("seasonInput");
  const playerWeekBadge = document.getElementById("playerWeekBadge");
  const weekInput = document.getElementById("weekInput");

  if (!positionalMvpDeck || !playerTableBody) return;

  const isSeason = state.currentMode === "SEASON_ROLLUP";
  if (playerSeasonBadge && seasonInput) {
    playerSeasonBadge.textContent = seasonInput.value;
  }
  if (playerWeekBadge && weekInput) {
    playerWeekBadge.textContent = isSeason
      ? `Weeks 1 - ${weekInput.value} Rollup`
      : `Week ${weekInput.value}`;
  }

  const labelPoints = document.getElementById("labelPlayerPoints");
  if (labelPoints) {
    labelPoints.textContent = isSeason ? "Avg PPG" : "Points";
  }

  const targetWeek = weekInput ? parseInt(weekInput.value, 10) || 1 : 1;
  const allAggregated = aggregatePlayers(records, isSeason, targetWeek, getPlayerInfo);
  state.lastAggregatedPlayers = allAggregated;
  renderPositionalMvpDeck(allAggregated);
  renderPlayerLeaderboard(allAggregated);
}

/**
 * Renders top fantasy MVP player cards for each position (QB, RB, WR, TE, K, DEF).
 *
 * @param {Array<object>} allPlayers Aggregated player list
 */
export function renderPositionalMvpDeck(allPlayers) {
  const positionalMvpDeck = document.getElementById("positionalMvpDeck");
  if (!positionalMvpDeck) return;
  positionalMvpDeck.innerHTML = "";

  const isSeason = state.currentMode === "SEASON_ROLLUP";
  const mvpSlots = [
    {
      pos: "QB",
      label: "Top QB",
      icon: "🎯",
      color: "text-rose-400",
      bg: "from-rose-500/20 via-slate-900/90 to-transparent",
      border: "border-rose-500/30"
    },
    {
      pos: "RB",
      label: "Top RB",
      icon: "⚡",
      color: "text-cyan-400",
      bg: "from-cyan-500/20 via-slate-900/90 to-transparent",
      border: "border-cyan-500/30"
    },
    {
      pos: "WR",
      label: "Top WR",
      icon: "🔥",
      color: "text-emerald-400",
      bg: "from-emerald-500/20 via-slate-900/90 to-transparent",
      border: "border-emerald-500/30"
    },
    {
      pos: "TE",
      label: "Top TE",
      icon: "🛡️",
      color: "text-amber-400",
      bg: "from-amber-500/20 via-slate-900/90 to-transparent",
      border: "border-amber-500/30"
    },
    {
      pos: "K",
      label: "Top K",
      icon: "👟",
      color: "text-purple-400",
      bg: "from-purple-500/20 via-slate-900/90 to-transparent",
      border: "border-purple-500/30"
    },
    {
      pos: "DEF",
      label: "Top DEF",
      icon: "🏰",
      color: "text-slate-300",
      bg: "from-slate-700/30 via-slate-900/90 to-transparent",
      border: "border-slate-600/40"
    }
  ];

  mvpSlots.forEach(slot => {
    const candidates = (allPlayers || [])
      .filter(p => p.pos === slot.pos)
      .sort((a, b) => (b.points || 0) - (a.points || 0));
    const topPlayer = candidates[0];

    const card = document.createElement("div");
    card.className = `glass-card rounded-2xl p-4 flex flex-col justify-between border ${slot.border} bg-gradient-to-b ${slot.bg} transition hover:scale-[1.02] duration-200`;

    if (topPlayer && topPlayer.points > 0) {
      const bestOwner = topPlayer.owners && topPlayer.owners[0];
      const avatarImg = topPlayer.headshotUrl
        ? `<img src="${topPlayer.headshotUrl}" class="w-10 h-10 rounded-full object-cover border border-slate-700 bg-slate-800 flex-shrink-0" alt="" onerror="this.remove()">`
        : "";

      const titleComponent = createCardTitleWithInfo(
        `${slot.icon} ${slot.label}`,
        `Highest scoring ${slot.pos} across all participating leagues for this matchup period.`,
        `text-xs font-black uppercase tracking-wider ${slot.color} hover:underline`
      );

      card.innerHTML = `
        <div class="flex items-center justify-between border-b border-white/10 pb-2">
          ${titleComponent}
          <span class="text-xs font-mono font-bold text-slate-400">${escapeHtml(topPlayer.team || "FA")}</span>
        </div>

        <div class="my-2.5 flex items-center gap-2.5">
          ${avatarImg}
          <div class="min-w-0 flex-1">
            <div class="font-black text-sm text-white truncate" title="${escapeHtml(topPlayer.name)}">${escapeHtml(topPlayer.name)}</div>
            <div class="text-[11px] text-slate-400 font-semibold truncate">${escapeHtml(topPlayer.pos)} • ${topPlayer.startRate}% Started</div>
          </div>
        </div>

        <div class="pt-2 border-t border-white/10 flex items-end justify-between">
          <div>
            <div class="text-[10px] uppercase font-bold text-slate-400">${isSeason ? "Avg PPG" : "Points"}</div>
            <div class="text-xl font-mono font-black ${slot.color}">${(topPlayer.points || 0).toFixed(2)}</div>
          </div>
          ${
            bestOwner
              ? `
            <div class="text-[10px] text-slate-400 text-right truncate max-w-[120px]" title="Rostered by ${escapeHtml(bestOwner.manager)} in ${escapeHtml(bestOwner.league)}">
              <span class="text-slate-500 block">Top Owner</span>
              <span class="font-bold text-slate-300 truncate block">${escapeHtml(bestOwner.manager)}</span>
              <span class="text-slate-400 truncate block text-[10px]">🏆 ${escapeHtml(bestOwner.league)}</span>
            </div>
          `
              : ""
          }
        </div>
      `;
    } else {
      const titleComponent = createCardTitleWithInfo(
        `${slot.icon} ${slot.label}`,
        `Highest scoring ${slot.pos} across all participating leagues for this matchup period.`,
        `text-xs font-black uppercase tracking-wider ${slot.color} hover:underline`
      );

      card.innerHTML = `
        <div class="flex items-center justify-between border-b border-white/10 pb-2">
          ${titleComponent}
        </div>
        <div class="py-6 text-center text-xs text-slate-500 italic">No ${slot.pos} data recorded yet.</div>
      `;
    }

    positionalMvpDeck.appendChild(card);
  });
}

/**
 * Renders the player analytics leaderboard table.
 *
 * @param {Array<object>} [allPlayers] Player performance objects
 */
export function renderPlayerLeaderboard(allPlayers = null) {
  const playerTableBody = document.getElementById("playerTableBody");
  const playerRowCount = document.getElementById("playerRowCount");
  const noPlayersFound = document.getElementById("noPlayersFound");
  const weekInput = document.getElementById("weekInput");

  if (!playerTableBody) return;
  playerTableBody.innerHTML = "";

  const isSeason = state.currentMode === "SEASON_ROLLUP";
  const targetWeek = weekInput ? parseInt(weekInput.value, 10) || 1 : 1;
  const playerList =
    allPlayers ||
    (state.lastAggregatedPlayers.length > 0
      ? state.lastAggregatedPlayers
      : aggregatePlayers(getActiveRecords(), isSeason, targetWeek, getPlayerInfo));
  const q = state.currentPlayerSearch.toLowerCase().trim();

  let filtered = (playerList || []).filter(p => {
    // 1. Position Filter
    if (state.currentPlayerPositionFilter === "FLEX") {
      if (!["RB", "WR", "TE"].includes(p.pos)) return false;
    } else if (state.currentPlayerPositionFilter !== "ALL") {
      if (p.pos !== state.currentPlayerPositionFilter) return false;
    }

    // 2. Status Filter
    if (state.currentPlayerStatusFilter === "STARTERS" && p.startedCount === 0) return false;
    if (state.currentPlayerStatusFilter === "BENCH" && p.benchedCount === 0) return false;

    // 3. Search Query
    if (q) {
      const matchName = (p.name || "").toLowerCase().includes(q);
      const matchTeam = (p.team || "").toLowerCase().includes(q);
      const matchOwner = (p.owners || []).some(
        o =>
          (o.manager || "").toLowerCase().includes(q) || (o.league || "").toLowerCase().includes(q)
      );
      if (!matchName && !matchTeam && !matchOwner) return false;
    }

    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    let vA = a[state.currentPlayerSortColumn];
    let vB = b[state.currentPlayerSortColumn];

    if (typeof vA === "number" || typeof vB === "number") {
      vA = typeof vA === "number" ? vA : 0;
      vB = typeof vB === "number" ? vB : 0;
    } else if (typeof vA === "string" || typeof vB === "string") {
      vA = (vA || "").toLowerCase();
      vB = (vB || "").toLowerCase();
    }

    if (vA < vB) return state.currentPlayerSortAsc ? -1 : 1;
    if (vA > vB) return state.currentPlayerSortAsc ? 1 : -1;
    return 0;
  });

  if (playerRowCount) {
    playerRowCount.textContent = `Showing ${filtered.length} of ${playerList.length} players across selected leagues`;
  }

  if (filtered.length === 0) {
    if (noPlayersFound) {
      noPlayersFound.classList.remove("hidden");
      if (playerList.length === 0) {
        noPlayersFound.innerHTML = `
          <div class="text-3xl">🏈</div>
          <div class="font-bold text-slate-200">No player data available.</div>
          <div class="text-xs text-slate-400">Click "Fetch Cross-League Stats" above to load roster and player scores.</div>
        `;
      } else {
        noPlayersFound.innerHTML = `
          <div class="text-3xl">🏈</div>
          <div class="font-bold text-slate-200">No players match the current filters.</div>
          <div class="text-xs text-slate-500">Try changing the position filter or search terms.</div>
        `;
      }
    }
    const pageInfo = document.getElementById("playerPageInfoText");
    if (pageInfo) pageInfo.textContent = "Showing 0 of 0";
    const btnPrev = document.getElementById("btnPrevPlayerPage");
    const btnNext = document.getElementById("btnNextPlayerPage");
    if (btnPrev) btnPrev.disabled = true;
    if (btnNext) btnNext.disabled = true;
    const pageBtnContainer = document.getElementById("playerPageNumberButtons");
    if (pageBtnContainer) pageBtnContainer.innerHTML = "";
    return;
  }
  if (noPlayersFound) noPlayersFound.classList.add("hidden");

  const totalCount = filtered.length;
  const pageSize =
    state.currentPlayerPageSize === Infinity ? totalCount : state.currentPlayerPageSize;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (state.currentPlayerPage > totalPages) state.currentPlayerPage = totalPages;
  if (state.currentPlayerPage < 1) state.currentPlayerPage = 1;
  const startIdx = (state.currentPlayerPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalCount);
  const pageSlice = filtered.slice(startIdx, endIdx);

  const pageInfo = document.getElementById("playerPageInfoText");
  if (pageInfo)
    pageInfo.textContent =
      totalCount === 0 ? "Showing 0 of 0" : `Showing ${startIdx + 1}–${endIdx} of ${totalCount}`;
  const btnPrev = document.getElementById("btnPrevPlayerPage");
  const btnNext = document.getElementById("btnNextPlayerPage");
  if (btnPrev) btnPrev.disabled = state.currentPlayerPage <= 1 || totalCount === 0;
  if (btnNext) btnNext.disabled = state.currentPlayerPage >= totalPages || totalCount === 0;
  renderPaginationButtons(
    "playerPageNumberButtons",
    totalPages,
    state.currentPlayerPage,
    "goToPlayerPage"
  );

  pageSlice.forEach((p, idx) => {
    const rank = startIdx + idx + 1;
    const tr = document.createElement("tr");
    tr.className = "transition-colors hover:bg-slate-800/60";
    const isExpanded = state.expandedPlayerIds.has(p.id);

    const avatarHtml = p.headshotUrl
      ? `<img src="${p.headshotUrl}" class="w-9 h-9 rounded-full object-cover border border-slate-700 bg-slate-800 flex-shrink-0" alt="" onerror="this.remove()">`
      : "";

    // Managers Badge List (first 3 + overflow)
    const visibleOwners = (p.owners || []).slice(0, 3);
    const remainingCount = (p.owners || []).length - visibleOwners.length;

    const ownersHtml =
      p.owners && p.owners.length > 0
        ? `
        <div class="flex flex-wrap items-center gap-1.5 max-w-md">
          ${visibleOwners
            .map(
              o => `
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${o.isStarter || o.starts > 0 ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30" : "bg-slate-900 text-slate-300 border border-slate-800"}">
              <span>${o.isStarter || o.starts > 0 ? "🟢" : "🪑"}</span>
              <span class="truncate max-w-[110px]" title="${escapeHtml(o.manager)} • ${escapeHtml(o.league)}">${escapeHtml(o.manager)}</span>
            </span>
          `
            )
            .join("")}
          ${
            remainingCount > 0
              ? `
            <span class="text-xs font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">+${remainingCount} more</span>
          `
              : ""
          }
        </div>
      `
        : `<span class="text-xs text-slate-500 italic">Free Agent / Unrostered</span>`;

    tr.innerHTML = `
      <td class="py-2.5 sm:py-4 px-2 sm:px-4 text-center whitespace-nowrap font-mono font-black text-xs sm:text-sm ${rank <= 3 ? "text-amber-400" : "text-slate-400"}">
        #${rank}
      </td>

      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap">
        <div class="flex items-center gap-2 sm:gap-3">
          ${avatarHtml}
          <div class="min-w-0">
            <span class="font-black text-xs sm:text-base text-slate-100 truncate block">
              ${escapeHtml(p.name)}
            </span>
            <span class="text-[10px] sm:text-xs text-slate-400 font-semibold block">
              ${escapeHtml(p.team || "FA")} • ${escapeHtml(p.pos)}
            </span>
          </div>
        </div>
      </td>

      <td class="py-2.5 sm:py-4 px-1.5 sm:px-3 text-center whitespace-nowrap">
        ${getPlayerPositionBadge(p.pos)}
      </td>

      <td class="py-2.5 sm:py-4 px-1.5 sm:px-3 text-center whitespace-nowrap text-[11px] sm:text-xs font-bold text-slate-300 font-mono">
        ${escapeHtml(p.team || "FA")}
      </td>

      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap">
        <div class="font-mono text-sm sm:text-lg font-black text-emerald-400">
          ${(p.points || 0).toFixed(2)} <span class="text-[10px] sm:text-xs font-semibold text-slate-400">${isSeason ? "ppg" : "pts"}</span>
        </div>
        ${
          isSeason && p.totalPoints !== undefined
            ? `
          <div class="text-[10px] sm:text-xs text-slate-400 font-mono">${p.totalPoints.toFixed(1)} total • ${p.gamesCount} wks</div>
        `
            : ""
        }
      </td>

      <td class="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap text-center">
        <div class="space-y-0.5 sm:space-y-1 inline-block text-left">
          <div class="text-[10px] sm:text-xs font-mono font-bold text-slate-200">
            ${p.startRate}% <span class="text-slate-500 font-normal">(${p.startedCount}/${p.startedCount + p.benchedCount})</span>
          </div>
          <div class="w-16 sm:w-20 bg-slate-800 rounded-full h-1 sm:h-1.5 overflow-hidden">
            <div class="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full" style="width: ${p.startRate}%"></div>
          </div>
        </div>
      </td>

      <td class="py-2.5 sm:py-4 px-2 sm:px-4">
        ${ownersHtml}
      </td>

      <td class="py-2.5 sm:py-4 px-1.5 sm:px-3 text-center whitespace-nowrap">
        <button
          onclick="togglePlayerRowExpand('${p.id}')"
          class="p-1.5 sm:p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition text-[10px] sm:text-xs font-mono font-bold border border-slate-800 cursor-pointer"
          title="Toggle Roster Exposure Breakdown"
        >
          ${isExpanded ? "▲" : "▼"}
        </button>
      </td>
    `;

    playerTableBody.appendChild(tr);

    if (isExpanded) {
      const detailTr = document.createElement("tr");
      detailTr.className = "bg-slate-950/90 border-b border-slate-800";
      detailTr.innerHTML = `
        <td colspan="8" class="p-5">
          <div class="glass-card rounded-xl p-5 border border-slate-800/80 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2.5 flex-wrap gap-2">
              <div class="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <span>🏈 ${escapeHtml(p.name)} (${escapeHtml(p.pos)} - ${escapeHtml(p.team || "FA")})</span>
                <span class="text-slate-400 font-normal">| Cross-League Roster Exposure</span>
              </div>
              <div class="text-xs sm:text-sm text-slate-400 font-semibold font-mono">
                Started: <span class="text-emerald-400 font-black">${p.startedCount}</span> •
                Benched: <span class="text-amber-400 font-black">${p.benchedCount}</span> •
                Start Rate: <span class="text-cyan-300 font-black">${p.startRate}%</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              ${(p.owners || [])
                .map(
                  o => `
                <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
                  <div class="min-w-0 flex-1">
                    <div class="font-black text-sm text-white truncate">${escapeHtml(o.manager)}</div>
                    <div class="text-xs text-slate-400 truncate">${escapeHtml(o.teamName)}</div>
                    <div class="text-[11px] text-slate-400 font-bold mt-1 flex items-center gap-1 truncate">
                      <span>🏆</span>
                      <span class="truncate">${escapeHtml(o.league)}</span>
                    </div>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <span class="px-2 py-0.5 rounded-full text-xs font-black ${o.isStarter || o.starts > 0 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-slate-800 text-slate-400 border border-slate-700"}">
                      ${o.isStarter || o.starts > 0 ? "🟢 Starter" : "🪑 Bench"}
                    </span>
                    ${
                      o.starts !== undefined && o.benches !== undefined
                        ? `
                      <div class="text-[10px] text-slate-500 font-mono mt-1">${o.starts} starts / ${o.benches} bench</div>
                    `
                        : ""
                    }
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        </td>
      `;
      playerTableBody.appendChild(detailTr);
    }
  });
}

/**
 * Filters the player leaderboard by position.
 *
 * @param {string} pos Position string ("ALL", "QB", "RB", "WR", "TE", "FLEX", "K", "DEF")
 */
export function setPlayerPositionFilter(pos) {
  state.currentPlayerPositionFilter = pos;
  const posKeys = ["ALL", "QB", "RB", "WR", "TE", "FLEX", "K", "DEF"];
  posKeys.forEach(k => {
    const btn = document.getElementById(`posFilter${k}`);
    if (btn) {
      if (k === pos) {
        btn.className =
          "px-3 py-1.5 rounded-lg text-xs font-black transition bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-pointer";
      } else {
        btn.className =
          "px-3 py-1.5 rounded-lg text-xs font-black text-slate-400 hover:text-white transition cursor-pointer";
      }
    }
  });
  state.currentPlayerPage = 1;
  renderPlayerLeaderboard();
}

/**
 * Sets page size for player table.
 *
 * @param {string|number} size Page size
 */
export function setPlayerPageSize(size) {
  state.currentPlayerPageSize = size === "all" ? Infinity : parseInt(size, 10);
  state.currentPlayerPage = 1;
  renderPlayerLeaderboard();
}

/**
 * Changes page offset for player table.
 *
 * @param {number} delta Page delta
 */
export function changePlayerPage(delta) {
  state.currentPlayerPage += delta;
  renderPlayerLeaderboard();
}

/**
 * Navigates directly to player page index.
 *
 * @param {number} page Page number
 */
export function goToPlayerPage(page) {
  state.currentPlayerPage = page;
  renderPlayerLeaderboard();
}

/**
 * Toggles expanded roster exposure breakdown for a player.
 *
 * @param {string} pid Player identifier
 */
export function togglePlayerRowExpand(pid) {
  if (state.expandedPlayerIds.has(pid)) {
    state.expandedPlayerIds.delete(pid);
  } else {
    state.expandedPlayerIds.add(pid);
  }
  renderPlayerLeaderboard();
}

/**
 * Sorts player table by specific column.
 *
 * @param {string} col Column name
 */
export function sortPlayers(col) {
  if (state.currentPlayerSortColumn === col) {
    state.currentPlayerSortAsc = !state.currentPlayerSortAsc;
  } else {
    state.currentPlayerSortColumn = col;
    state.currentPlayerSortAsc = false;
  }

  const iconPts = document.getElementById("sortIconPlayerPoints");
  const iconRate = document.getElementById("sortIconPlayerStartRate");
  if (iconPts) {
    iconPts.textContent =
      state.currentPlayerSortColumn === "points" ? (state.currentPlayerSortAsc ? "▲" : "▼") : "";
    iconPts.className =
      state.currentPlayerSortColumn === "points"
        ? "text-xs text-emerald-400"
        : "text-xs text-slate-500";
  }
  if (iconRate) {
    iconRate.textContent =
      state.currentPlayerSortColumn === "startRate" ? (state.currentPlayerSortAsc ? "▲" : "▼") : "";
    iconRate.className =
      state.currentPlayerSortColumn === "startRate"
        ? "text-xs text-emerald-400"
        : "text-xs text-slate-500";
  }

  state.currentPlayerPage = 1;
  renderPlayerLeaderboard();
}

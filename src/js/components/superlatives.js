/**
 * CrossLeague • Superlatives Component (Bad Beat, Lucky Escape, Bench Heavyweight)
 */

import { state, getActiveRecords } from "../state/store.js";
import { escapeHtml, createCardTitleWithInfo } from "./dom.js";
import { computeSuperlatives } from "../analytics/superlatives.js";

/**
 * Renders the superlatives showcase deck cards.
 *
 * @param {Array<object>} [records] Team records array
 */
export function renderSuperlatives(records = getActiveRecords()) {
  const badBeatCard = document.getElementById("badBeatCard");
  const luckyEscapeCard = document.getElementById("luckyEscapeCard");
  const benchMvpCard = document.getElementById("benchMvpCard");

  if (!badBeatCard || !luckyEscapeCard || !benchMvpCard) return;
  if (!records || records.length === 0) return;

  const isSeason = state.currentMode === "SEASON_ROLLUP";
  if (badBeatCard.parentElement) {
    badBeatCard.parentElement.classList.remove("hidden");
  }

  const { badBeat, luckyEscape, benchKing } = computeSuperlatives(records, isSeason);

  // 1. The Bad Beat
  if (badBeatCard) {
    badBeatCard.removeAttribute("title");
    if (!isSeason) {
      if (badBeat) {
        const titleComponent = createCardTitleWithInfo(
          "The Bad Beat",
          "Highest-scoring squad across all leagues that lost their matchup this week.",
          "text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-full border border-rose-500/30 hover:border-rose-400/70"
        );
        badBeatCard.innerHTML = `
          <div class="flex flex-col justify-between h-full space-y-3">
            <div>
              <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-rose-500/20">
                ${titleComponent}
                <div class="text-right flex-shrink-0">
                  <span class="text-lg sm:text-xl font-mono font-black text-rose-400">${badBeat.points.toFixed(2)} <span class="text-xs font-semibold text-rose-300/80">pts</span></span>
                </div>
              </div>
              <div class="mt-3 space-y-1">
                <div class="text-base sm:text-lg font-black text-white truncate" title="${escapeHtml(badBeat.manager)}">${escapeHtml(badBeat.manager)}</div>
                <div class="text-xs sm:text-sm text-slate-400 truncate" title="${escapeHtml(badBeat.teamName)}">${escapeHtml(badBeat.teamName)}</div>
                <div class="text-xs font-semibold text-emerald-400/90 truncate flex items-center gap-1.5 pt-0.5" title="League: ${escapeHtml(badBeat.league)}">
                  <span class="truncate">${escapeHtml(badBeat.league)}</span>
                </div>
              </div>
            </div>
            <div class="pt-2.5 border-t border-slate-800/80 text-xs text-slate-400 font-semibold truncate">
              Lost by ${Math.abs(badBeat.margin || 0).toFixed(2)} to ${escapeHtml(badBeat.opponentName || "Rival")}
            </div>
          </div>
        `;
      } else {
        const titleComponent = createCardTitleWithInfo(
          "The Bad Beat",
          "Highest-scoring squad across all leagues that lost their matchup this week.",
          "text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 hover:border-slate-700"
        );
        badBeatCard.innerHTML = `
          <div class="flex items-center justify-between">
            ${titleComponent}
          </div>
          <div class="text-xs sm:text-sm text-slate-500 italic mt-3">No completed matchup losses recorded.</div>
        `;
      }
    } else {
      if (badBeat) {
        const titleComponent = createCardTitleWithInfo(
          "Season Heartbreak",
          "Highest scoring team across all leagues with a losing head-to-head record.",
          "text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-full border border-rose-500/30 hover:border-rose-400/70"
        );
        badBeatCard.innerHTML = `
          <div class="flex flex-col justify-between h-full space-y-3">
            <div>
              <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-rose-500/20">
                ${titleComponent}
                <div class="text-right flex-shrink-0">
                  <span class="text-lg sm:text-xl font-mono font-black text-rose-400">${(badBeat.points || 0).toFixed(1)} <span class="text-xs font-semibold text-rose-300/80">PPG</span></span>
                </div>
              </div>
              <div class="mt-3 space-y-1">
                <div class="text-base sm:text-lg font-black text-white truncate" title="${escapeHtml(badBeat.manager)}">${escapeHtml(badBeat.manager)}</div>
                <div class="text-xs sm:text-sm text-slate-400 truncate" title="${escapeHtml(badBeat.teamName)}">${escapeHtml(badBeat.teamName)}</div>
                <div class="text-xs font-semibold text-emerald-400/90 truncate flex items-center gap-1.5 pt-0.5" title="League: ${escapeHtml(badBeat.league)}">
                  <span class="truncate">${escapeHtml(badBeat.league)}</span>
                </div>
              </div>
            </div>
            <div class="pt-2.5 border-t border-slate-800/80 text-xs text-slate-400 font-semibold truncate">
              ${badBeat.wins || 0}W-${badBeat.losses || 0}L (${badBeat.winPct || 0}%) • ${(badBeat.totalPoints || 0).toFixed(1)} Total PF
            </div>
          </div>
        `;
      }
    }
  }

  // 2. The Lucky Escape
  if (luckyEscapeCard) {
    luckyEscapeCard.removeAttribute("title");
    if (!isSeason) {
      if (luckyEscape) {
        const titleComponent = createCardTitleWithInfo(
          "The Lucky Escape",
          "Lowest-scoring squad across all leagues that managed to win their matchup this week.",
          "text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30 hover:border-emerald-400/70"
        );
        luckyEscapeCard.innerHTML = `
          <div class="flex flex-col justify-between h-full space-y-3">
            <div>
              <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-emerald-500/20">
                ${titleComponent}
                <div class="text-right flex-shrink-0">
                  <span class="text-lg sm:text-xl font-mono font-black text-emerald-400">${luckyEscape.points.toFixed(2)} <span class="text-xs font-semibold text-emerald-300/80">pts</span></span>
                </div>
              </div>
              <div class="mt-3 space-y-1">
                <div class="text-base sm:text-lg font-black text-white truncate" title="${escapeHtml(luckyEscape.manager)}">${escapeHtml(luckyEscape.manager)}</div>
                <div class="text-xs sm:text-sm text-slate-400 truncate" title="${escapeHtml(luckyEscape.teamName)}">${escapeHtml(luckyEscape.teamName)}</div>
                <div class="text-xs font-semibold text-emerald-400/90 truncate flex items-center gap-1.5 pt-0.5" title="League: ${escapeHtml(luckyEscape.league)}">
                  <span class="truncate">${escapeHtml(luckyEscape.league)}</span>
                </div>
              </div>
            </div>
            <div class="pt-2.5 border-t border-slate-800/80 text-xs text-slate-400 font-semibold truncate">
              Won by ${Math.abs(luckyEscape.margin || 0).toFixed(2)} vs ${escapeHtml(luckyEscape.opponentName || "Rival")}
            </div>
          </div>
        `;
      } else {
        const titleComponent = createCardTitleWithInfo(
          "The Lucky Escape",
          "Lowest-scoring squad across all leagues that managed to win their matchup this week.",
          "text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 hover:border-slate-700"
        );
        luckyEscapeCard.innerHTML = `
          <div class="flex items-center justify-between">
            ${titleComponent}
          </div>
          <div class="text-xs sm:text-sm text-slate-500 italic mt-3">No completed matchup wins recorded.</div>
        `;
      }
    } else {
      if (luckyEscape) {
        const titleComponent = createCardTitleWithInfo(
          "Teflon Squad",
          "Lowest scoring squad across all leagues that maintained a winning record.",
          "text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30 hover:border-emerald-400/70"
        );
        luckyEscapeCard.innerHTML = `
          <div class="flex flex-col justify-between h-full space-y-3">
            <div>
              <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-emerald-500/20">
                ${titleComponent}
                <div class="text-right flex-shrink-0">
                  <span class="text-lg sm:text-xl font-mono font-black text-emerald-400">${(luckyEscape.points || 0).toFixed(1)} <span class="text-xs font-semibold text-emerald-300/80">PPG</span></span>
                </div>
              </div>
              <div class="mt-3 space-y-1">
                <div class="text-base sm:text-lg font-black text-white truncate" title="${escapeHtml(luckyEscape.manager)}">${escapeHtml(luckyEscape.manager)}</div>
                <div class="text-xs sm:text-sm text-slate-400 truncate" title="${escapeHtml(luckyEscape.teamName)}">${escapeHtml(luckyEscape.teamName)}</div>
                <div class="text-xs font-semibold text-emerald-400/90 truncate flex items-center gap-1.5 pt-0.5" title="League: ${escapeHtml(luckyEscape.league)}">
                  <span class="truncate">${escapeHtml(luckyEscape.league)}</span>
                </div>
              </div>
            </div>
            <div class="pt-2.5 border-t border-slate-800/80 text-xs text-slate-400 font-semibold truncate">
              ${luckyEscape.wins || 0}W-${luckyEscape.losses || 0}L (${luckyEscape.winPct || 0}%)
            </div>
          </div>
        `;
      }
    }
  }

  // 3. Bench Heavyweight
  if (benchMvpCard) {
    benchMvpCard.removeAttribute("title");
    if (benchKing && benchKing.benchPoints > 0) {
      const titleComponent = createCardTitleWithInfo(
        "Bench Heavyweight",
        "Squad with the most bench points left unstarted on their roster.",
        "text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-500/30 hover:border-amber-400/70"
      );
      benchMvpCard.innerHTML = `
        <div class="flex flex-col justify-between h-full space-y-3">
          <div>
            <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-amber-500/20">
              ${titleComponent}
              <div class="text-right flex-shrink-0">
                <span class="text-lg sm:text-xl font-mono font-black text-amber-300">${benchKing.benchPoints.toFixed(2)} <span class="text-xs font-semibold text-amber-300/80">pts</span></span>
              </div>
            </div>
            <div class="mt-3 space-y-1">
              <div class="text-base sm:text-lg font-black text-white truncate" title="${escapeHtml(benchKing.manager)}">${escapeHtml(benchKing.manager)}</div>
              <div class="text-xs sm:text-sm text-slate-400 truncate" title="${escapeHtml(benchKing.teamName)}">${escapeHtml(benchKing.teamName)}</div>
              <div class="text-xs font-semibold text-emerald-400/90 truncate flex items-center gap-1.5 pt-0.5" title="League: ${escapeHtml(benchKing.league)}">
                <span class="truncate">${escapeHtml(benchKing.league)}</span>
              </div>
            </div>
          </div>
          <div class="pt-2.5 border-t border-slate-800/80 text-xs text-slate-400 font-semibold truncate">
            ${benchKing.efficiency ?? 100}% Lineup Efficiency
          </div>
        </div>
      `;
    } else {
      const titleComponent = createCardTitleWithInfo(
        "Bench Heavyweight",
        "Squad with the most bench points left unstarted on their roster.",
        "text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 hover:border-slate-700"
      );
      benchMvpCard.innerHTML = `
        <div class="flex items-center justify-between">
          ${titleComponent}
        </div>
        <div class="text-xs sm:text-sm text-slate-500 italic mt-3">No bench scoring recorded yet.</div>
      `;
    }
  }
}

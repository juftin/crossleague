/**
 * CrossLeague • Podium Component (Top 3 Cross-League Finishers)
 */

import { state, getActiveRecords } from "../state/store.js";
import { getAvatarUrl } from "../api/sleeper.js";
import { escapeHtml, createCardTitleWithInfo } from "./dom.js";

/**
 * Renders the top 3 podium cards (1st Gold, 2nd Silver, 3rd Bronze).
 *
 * @param {Array<object>} [records] Records array
 */
export function renderPodium(records = getActiveRecords()) {
  const podiumCards = document.getElementById("podiumCards");
  if (!podiumCards) return;
  podiumCards.innerHTML = "";

  const isSeason = state.currentMode === "SEASON_ROLLUP";
  const sorted = [...(records || [])].sort((a, b) => (b.points || 0) - (a.points || 0));
  const top3 = sorted.slice(0, 3);

  const podiumSlots = [
    {
      rank: 1,
      title: "1ST PLACE",
      medal: "🥇",
      glow: "gold-glow",
      color: "text-amber-400",
      orderClass: "order-1 md:order-2",
      cardClass: "md:min-h-[260px] p-4 sm:p-6",
      scoreSize: "text-3xl sm:text-4xl"
    },
    {
      rank: 2,
      title: "2ND PLACE",
      medal: "🥈",
      glow: "silver-glow",
      color: "text-slate-300",
      orderClass: "order-2 md:order-1",
      cardClass: "md:min-h-[230px] p-4 sm:p-5",
      scoreSize: "text-2xl sm:text-3xl"
    },
    {
      rank: 3,
      title: "3RD PLACE",
      medal: "🥉",
      glow: "bronze-glow",
      color: "text-amber-600",
      orderClass: "order-3 md:order-3",
      cardClass: "md:min-h-[205px] p-4 sm:p-5",
      scoreSize: "text-2xl sm:text-3xl"
    }
  ];

  podiumSlots.forEach(slot => {
    const t = top3[slot.rank - 1];
    if (!t) return;

    const card = document.createElement("div");
    card.className = `glass-card ${slot.glow} ${slot.orderClass} ${slot.cardClass} rounded-2xl flex flex-col justify-between relative`;

    const metricLabel = isSeason ? "Average PPG" : "Total Points";
    const effVal = typeof t.efficiency === "number" && !isNaN(t.efficiency) ? t.efficiency : 100;
    const subMetric = isSeason
      ? `${(t.totalPoints || 0).toFixed(1)} Total PF • ${t.wins || 0}W-${t.losses || 0}L`
      : `Lineup Efficiency: ${effVal}%`;

    const avatarUrl = getAvatarUrl(t.avatar);
    const avatarSize = slot.rank === 1 ? "w-10 sm:w-11 h-10 sm:h-11" : "w-9 sm:w-10 h-9 sm:h-10";
    const avatarHtml = avatarUrl
      ? `<img src="${avatarUrl}" class="${avatarSize} rounded-full object-cover border border-slate-700 flex-shrink-0" alt="" onerror="this.remove()">`
      : "";

    const titleComponent = createCardTitleWithInfo(
      slot.title,
      slot.rank === 1
        ? isSeason
          ? "1st Place Champion with highest average points per game across all leagues."
          : "Weekly Cross-League Champion with highest score."
        : slot.rank === 2
          ? "2nd Place Runner-Up across all participating leagues."
          : "3rd Place Podium Finisher across all participating leagues.",
      `text-xs font-black tracking-wider uppercase ${slot.color} hover:underline`
    );

    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between">
          ${titleComponent}
          <span class="text-2xl">${slot.medal}</span>
        </div>
        <div class="mt-3 flex items-center gap-3">
          ${avatarHtml}
          <div class="min-w-0 flex-1">
            <div class="text-base sm:text-xl font-black text-white truncate" title="${escapeHtml(t.manager)}">
              ${escapeHtml(t.manager)}
            </div>
            <div class="text-xs sm:text-sm text-slate-400 font-medium truncate mt-0.5" title="${escapeHtml(t.teamName)}">
              ${escapeHtml(t.teamName)}
            </div>
            <div class="text-xs font-semibold text-emerald-400/90 truncate flex items-center gap-1 mt-1" title="League: ${escapeHtml(t.league)}">
              <span>🏆</span> <span class="truncate">${escapeHtml(t.league)}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 sm:mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div class="min-w-0">
          <div class="text-[10px] sm:text-xs uppercase font-bold text-slate-400 truncate">${metricLabel}</div>
          <div class="${slot.scoreSize} font-black ${slot.color} font-mono leading-none mt-1">
            ${t.points.toFixed(2)}
          </div>
        </div>
        <div class="text-[11px] sm:text-xs font-semibold text-slate-400 text-right min-w-0">
          ${subMetric}
        </div>
      </div>
    `;

    podiumCards.appendChild(card);
  });
}

/**
 * CrossLeague • League Comparison Grid Component
 */

import { getActiveRecords, getActiveLeaguesMap } from "../state/store.js";
import { escapeHtml } from "./dom.js";

/**
 * Renders the cross-league comparison grid with top 5 performers per league.
 *
 * @param {Array<object>} [records] Records array
 * @param {Record<string, object>} [leagues] Active leagues map
 */
export function renderLeagueGrid(records = getActiveRecords(), leagues = getActiveLeaguesMap()) {
  const grid = document.getElementById("leagueCardsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const leagueKeys = Object.keys(leagues || {});
  if (leagueKeys.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-400 glass-card rounded-2xl border border-slate-800 space-y-3">
        <div class="text-4xl">🏟️</div>
        <div class="font-bold text-lg text-slate-200">No leagues selected.</div>
        <div class="text-sm text-slate-400">Pick one or more leagues from the filter bar above to compare them here.</div>
      </div>
    `;
    return;
  }

  leagueKeys.forEach(lid => {
    const league = leagues[lid];
    const leagueTeams = (records || [])
      .filter(r => r.leagueId === lid)
      .sort((a, b) => (b.points || 0) - (a.points || 0));
    if (leagueTeams.length === 0) return;

    const sum = leagueTeams.reduce((acc, r) => acc + (r.points || 0), 0);
    const avg = (sum / leagueTeams.length).toFixed(2);

    const card = document.createElement("div");
    card.className = "glass-card rounded-2xl p-6 border border-slate-800 space-y-4";
    card.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-800 pb-3.5 gap-3">
        <div class="min-w-0 flex-1">
          <h3 class="font-black text-base sm:text-lg text-white break-words line-clamp-2 leading-snug" title="${escapeHtml(league.name)}">${escapeHtml(league.name)}</h3>
          <div class="text-xs text-slate-400 font-medium mt-1">${leagueTeams.length} squads active</div>
        </div>
        <span class="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs sm:text-sm font-mono font-bold text-emerald-400 flex-shrink-0">
          Avg: ${avg}
        </span>
      </div>

      <div class="space-y-2.5">
        <div class="text-xs font-black uppercase tracking-wider text-slate-400">Top 5 Performers</div>
        <div class="space-y-2">
          ${leagueTeams
            .slice(0, 5)
            .map(
              (t, idx) => `
            <div class="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-900/70 border border-slate-800/60">
              <div class="flex items-center gap-2.5 truncate">
                <span class="font-black ${idx === 0 ? "text-amber-400" : idx === 1 ? "text-slate-300" : idx === 2 ? "text-amber-600" : "text-slate-400"}">#${idx + 1}</span>
                <span class="truncate text-slate-200 font-semibold">${escapeHtml(t.manager)}</span>
              </div>
              <span class="font-mono font-black text-slate-100">${(t.points || 0).toFixed(2)}</span>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

import React from "react";
import { useCrossLeagueStore } from "../../state/useCrossLeagueStore.js";
import { getMaxPlayedWeek } from "../../state/preferences.js";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const WeekNavigator: React.FC = () => {
  const week = useCrossLeagueStore(s => s.week);
  const mode = useCrossLeagueStore(s => s.mode);
  const season = useCrossLeagueStore(s => s.season);
  const nflState = useCrossLeagueStore(s => s.nflState);
  const setWeek = useCrossLeagueStore(s => s.setWeek);

  const maxPlayed = getMaxPlayedWeek();
  const canGoPrev = week > 1;
  const canGoNext = week < maxPlayed;

  const weekLabel =
    mode === "SEASON_ROLLUP" ? (week === 1 ? "Week 1 Rollup" : `Weeks 1–${week}`) : `Week ${week}`;

  let statusText = "Week 1";
  let statusBadgeClass =
    "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-400";

  if (season < nflState.season) {
    statusText = "Final";
    statusBadgeClass =
      "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-400";
  } else if (week < maxPlayed) {
    statusText = "Played";
    statusBadgeClass =
      "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-400";
  } else if (week === maxPlayed && nflState.season_type === "regular") {
    statusText = "Current";
    statusBadgeClass =
      "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 animate-pulse";
  }

  return (
    <div
      id="weekSelectorComponent"
      className="flex items-center gap-1 rounded-xl border border-slate-700/80 bg-slate-900/90 px-2 py-1 shadow-inner"
    >
      <input
        id="weekInput"
        type="hidden"
        value={week}
        onChange={e => setWeek(parseInt(e.target.value, 10) || 1)}
      />

      <button
        id="prevWeekBtn"
        type="button"
        disabled={!canGoPrev}
        onClick={() => {
          if (canGoPrev) setWeek(week - 1);
        }}
        title={canGoPrev ? `Previous Week (Week ${week - 1}) • Press ←` : "At first week (Week 1)"}
        className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm font-black text-slate-300 transition ${
          canGoPrev
            ? "cursor-pointer hover:bg-slate-800 active:scale-95"
            : "cursor-not-allowed opacity-40"
        }`}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      <div className="flex min-w-[110px] items-center justify-center gap-2 px-2 text-center select-none">
        <span
          id="weekDisplayValue"
          className="text-xs font-black whitespace-nowrap text-slate-100 sm:text-sm"
        >
          {weekLabel}
        </span>
        <span id="weekStatusBadge" className={statusBadgeClass}>
          {statusText}
        </span>
      </div>

      <button
        id="nextWeekBtn"
        type="button"
        disabled={!canGoNext}
        onClick={() => {
          if (canGoNext) setWeek(week + 1);
        }}
        title={
          canGoNext ? `Next Week (Week ${week + 1}) • Press →` : `At current week (Week ${week})`
        }
        className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm font-black text-slate-300 transition ${
          canGoNext
            ? "cursor-pointer hover:bg-slate-800 active:scale-95"
            : "cursor-not-allowed opacity-40"
        }`}
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

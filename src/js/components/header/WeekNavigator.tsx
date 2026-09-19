import React from "react";
import { useCrossLeagueStore } from "../../state/useCrossLeagueStore.js";
import { getMaxPlayedWeek } from "../../state/preferences.js";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const WeekNavigator: React.FC = () => {
  const week = useCrossLeagueStore((s) => s.week);
  const mode = useCrossLeagueStore((s) => s.mode);
  const season = useCrossLeagueStore((s) => s.season);
  const nflState = useCrossLeagueStore((s) => s.nflState);
  const setWeek = useCrossLeagueStore((s) => s.setWeek);

  const maxPlayed = getMaxPlayedWeek();
  const canGoPrev = week > 1;
  const canGoNext = week < maxPlayed;

  const weekLabel =
    mode === "SEASON_ROLLUP"
      ? week === 1
        ? "Week 1 Rollup"
        : `Weeks 1–${week}`
      : `Week ${week}`;

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
      className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-xl px-2 py-1 shadow-inner"
    >
      <input
        id="weekInput"
        type="hidden"
        value={week}
        onChange={(e) => setWeek(parseInt(e.target.value, 10) || 1)}
      />

      <button
        id="prevWeekBtn"
        type="button"
        disabled={!canGoPrev}
        onClick={() => {
          if (canGoPrev) setWeek(week - 1);
        }}
        title={canGoPrev ? `Previous Week (Week ${week - 1}) • Press ←` : "At first week (Week 1)"}
        className={`w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 text-sm font-black transition ${
          canGoPrev
            ? "hover:bg-slate-800 cursor-pointer active:scale-95"
            : "opacity-40 cursor-not-allowed"
        }`}
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      <div className="px-2 flex items-center gap-2 select-none min-w-[110px] justify-center text-center">
        <span id="weekDisplayValue" className="text-xs sm:text-sm font-black text-slate-100 whitespace-nowrap">
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
        title={canGoNext ? `Next Week (Week ${week + 1}) • Press →` : `At current week (Week ${week})`}
        className={`w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 text-sm font-black transition ${
          canGoNext
            ? "hover:bg-slate-800 cursor-pointer active:scale-95"
            : "opacity-40 cursor-not-allowed"
        }`}
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

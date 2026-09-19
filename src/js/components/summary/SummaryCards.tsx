import React from "react";
import {
  Building2,
  Flame,
  Snowflake,
  BarChart3,
  Crown,
  Trophy
} from "lucide-react";
import { useCrossLeagueStore, useActiveRecords, useActiveLeaguesMap } from "../../state/useCrossLeagueStore.js";

export const SummaryCards: React.FC = () => {
  const records = useActiveRecords();
  const activeLeagues = useActiveLeaguesMap();
  const mode = useCrossLeagueStore((s) => s.mode);

  const totalSquads = records.length;
  const totalActiveLeagues = Object.keys(activeLeagues || {}).length;

  const sortedByPts = [...records].sort((a, b) => (b.points || 0) - (a.points || 0));
  const topOverall = sortedByPts[0];
  const lowestOverall = sortedByPts[sortedByPts.length - 1];

  const sumPts = records.reduce((acc, r) => acc + (r.points || 0), 0);
  const avgPts = totalSquads > 0 ? sumPts / totalSquads : 0;

  const mid = Math.floor(sortedByPts.length / 2);
  const medianPts =
    totalSquads === 0
      ? 0
      : sortedByPts.length % 2 !== 0
        ? sortedByPts[mid].points || 0
        : ((sortedByPts[mid - 1]?.points || 0) + (sortedByPts[mid]?.points || 0)) / 2;

  // Power League Benchmark
  let topLeagueAvg = 0;
  let topLeagueName = "-";
  Object.keys(activeLeagues || {}).forEach((lid) => {
    const leagueTeams = records.filter((r) => r.leagueId === lid);
    if (leagueTeams.length > 0) {
      const lSum = leagueTeams.reduce((a, b) => a + (b.points || 0), 0);
      const lAvg = lSum / leagueTeams.length;
      if (lAvg > topLeagueAvg) {
        topLeagueAvg = lAvg;
        topLeagueName = activeLeagues[lid]?.name || `League ${lid}`;
      }
    }
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {/* 1. Leagues & Squads */}
      <div className="glass-card rounded-2xl p-5 glass-card-hover border border-slate-800/80 relative flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-black uppercase tracking-wider">
              Leagues &amp; Squads
            </span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <div className="flex items-baseline gap-1">
              <span id="statTotalLeagues" className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-mono">
                {totalActiveLeagues}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase">Leagues</span>
            </div>
            <span className="text-slate-600 font-black">•</span>
            <div className="flex items-baseline gap-1">
              <span id="statTotalTeams" className="text-2xl sm:text-3xl lg:text-4xl font-black text-cyan-300 font-mono">
                {totalSquads}
              </span>
              <span className="text-xs font-bold text-cyan-400/80 uppercase">Teams</span>
            </div>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800/60">
          <div className="text-xs text-slate-500 font-semibold">Active in filter</div>
        </div>
      </div>

      {/* 2. Peak Score */}
      <div className="glass-card rounded-2xl p-5 glass-card-hover border border-slate-800/80 relative flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-black uppercase tracking-wider">
              {mode === "SEASON_ROLLUP" ? "Peak PPG" : "Peak Score"}
            </span>
            <Flame className="w-4 h-4 text-emerald-400" />
          </div>
          <div id="statHighScore" className="text-3xl sm:text-4xl font-black text-emerald-400 mt-2 font-mono">
            {topOverall ? topOverall.points.toFixed(2) : "0.00"}
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800/60">
          <div
            id="statHighTeam"
            className="text-xs sm:text-sm text-slate-200 font-bold truncate"
            title={topOverall ? `${topOverall.manager} (${topOverall.teamName})` : ""}
          >
            {topOverall ? `${topOverall.manager} - ${topOverall.teamName}` : "-"}
          </div>
          <div
            id="statHighLeague"
            className="text-xs text-emerald-400/90 font-semibold truncate flex items-center gap-1 mt-0.5"
            title={topOverall ? `League: ${(topOverall as any).league || topOverall.leagueName}` : ""}
          >
            <Trophy className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">
              {topOverall ? (topOverall as any).league || topOverall.leagueName : "-"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Lowest Score */}
      <div className="glass-card rounded-2xl p-5 glass-card-hover border border-slate-800/80 relative flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-black uppercase tracking-wider">
              {mode === "SEASON_ROLLUP" ? "Lowest PPG" : "Lowest Score"}
            </span>
            <Snowflake className="w-4 h-4 text-rose-400" />
          </div>
          <div id="statLowScore" className="text-3xl sm:text-4xl font-black text-rose-400 mt-2 font-mono">
            {lowestOverall ? lowestOverall.points.toFixed(2) : "0.00"}
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800/60">
          <div
            id="statLowTeam"
            className="text-xs sm:text-sm text-slate-200 font-bold truncate"
            title={lowestOverall ? `${lowestOverall.manager} (${lowestOverall.teamName})` : ""}
          >
            {lowestOverall ? `${lowestOverall.manager} - ${lowestOverall.teamName}` : "-"}
          </div>
          <div
            id="statLowLeague"
            className="text-xs text-rose-400/90 font-semibold truncate flex items-center gap-1 mt-0.5"
            title={lowestOverall ? `League: ${(lowestOverall as any).league || lowestOverall.leagueName}` : ""}
          >
            <Trophy className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">
              {lowestOverall ? (lowestOverall as any).league || lowestOverall.leagueName : "-"}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Benchmark */}
      <div className="glass-card rounded-2xl p-5 glass-card-hover border border-slate-800/80 relative flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-black uppercase tracking-wider">
              Benchmark
            </span>
            <BarChart3 className="w-4 h-4 text-indigo-400" />
          </div>
          <div id="statAvgScore" className="text-3xl sm:text-4xl font-black text-indigo-300 mt-2 font-mono">
            {avgPts.toFixed(2)}
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800/60">
          <div id="statMedianScore" className="text-xs sm:text-sm text-slate-300 font-semibold">
            Median: {medianPts.toFixed(2)} pts
          </div>
          <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
            Cross-league average
          </div>
        </div>
      </div>

      {/* 5. Power League */}
      <div className="glass-card rounded-2xl p-5 glass-card-hover border border-slate-800/80 relative flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-black uppercase tracking-wider">
              Power League
            </span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <div id="statTopLeagueAvg" className="text-3xl sm:text-4xl font-black text-amber-400 mt-2 font-mono">
            {topLeagueAvg > 0 ? topLeagueAvg.toFixed(2) : "0.00"}
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800/60">
          <div
            id="statTopLeagueName"
            className="text-xs sm:text-sm text-slate-200 font-bold truncate flex items-center gap-1"
            title={topLeagueAvg > 0 ? topLeagueName : ""}
          >
            {topLeagueAvg > 0 ? (
              <>
                <Trophy className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="truncate">{topLeagueName}</span>
              </>
            ) : (
              "-"
            )}
          </div>
          <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
            Highest league average
          </div>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { Building2, Flame, Snowflake, BarChart3, Crown, Trophy } from "lucide-react";
import {
  useCrossLeagueStore,
  useActiveRecords,
  useActiveLeaguesMap
} from "../../state/useCrossLeagueStore.js";

export const SummaryCards: React.FC = () => {
  const records = useActiveRecords();
  const activeLeagues = useActiveLeaguesMap();
  const mode = useCrossLeagueStore(s => s.mode);

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
  Object.keys(activeLeagues || {}).forEach(lid => {
    const leagueTeams = records.filter(r => r.leagueId === lid);
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
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 ${totalActiveLeagues > 1 ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}
    >
      {/* 1. Leagues & Squads */}
      <div className="glass-card glass-card-hover relative flex flex-col justify-between rounded-2xl border border-slate-800/80 p-5">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black tracking-wider text-slate-400 uppercase">
              {totalActiveLeagues === 1 ? "League Squads" : "Leagues & Squads"}
            </span>
            <Building2 className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            {totalActiveLeagues !== 1 && (
              <div className="flex items-baseline gap-1">
                <span
                  id="statTotalLeagues"
                  className="font-mono text-2xl font-black text-white sm:text-3xl lg:text-4xl"
                >
                  {totalActiveLeagues}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase">Leagues</span>
              </div>
            )}
            {totalActiveLeagues !== 1 && <span className="font-black text-slate-600">•</span>}
            <div className="flex items-baseline gap-1">
              <span
                id="statTotalTeams"
                className="font-mono text-2xl font-black text-cyan-300 sm:text-3xl lg:text-4xl"
              >
                {totalSquads}
              </span>
              <span className="text-xs font-bold text-cyan-400/80 uppercase">Teams</span>
            </div>
          </div>
        </div>
        <div className="mt-2 border-t border-slate-800/60 pt-2">
          <div className="text-xs font-semibold text-slate-500">
            {totalActiveLeagues === 1 ? "In this league" : "Active in filter"}
          </div>
        </div>
      </div>

      {/* 2. Peak Score */}
      <div className="glass-card glass-card-hover relative flex flex-col justify-between rounded-2xl border border-slate-800/80 p-5">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black tracking-wider text-slate-400 uppercase">
              {mode === "SEASON_ROLLUP" ? "Peak PPG" : "Peak Score"}
            </span>
            <Flame className="h-4 w-4 text-emerald-400" />
          </div>
          <div
            id="statHighScore"
            className="mt-2 font-mono text-3xl font-black text-emerald-400 sm:text-4xl"
          >
            {topOverall ? topOverall.points.toFixed(2) : "0.00"}
          </div>
        </div>
        <div className="mt-2 border-t border-slate-800/60 pt-2">
          <div
            id="statHighTeam"
            className="truncate text-xs font-bold text-slate-200 sm:text-sm"
            title={topOverall ? `${topOverall.manager} (${topOverall.teamName})` : ""}
          >
            {topOverall ? `${topOverall.manager} - ${topOverall.teamName}` : "-"}
          </div>
          <div
            id="statHighLeague"
            className="mt-0.5 flex items-center gap-1 truncate text-xs font-semibold text-emerald-400/90"
            title={
              topOverall ? `League: ${(topOverall as any).league || topOverall.leagueName}` : ""
            }
          >
            <Trophy className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">
              {topOverall ? (topOverall as any).league || topOverall.leagueName : "-"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Lowest Score */}
      <div className="glass-card glass-card-hover relative flex flex-col justify-between rounded-2xl border border-slate-800/80 p-5">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black tracking-wider text-slate-400 uppercase">
              {mode === "SEASON_ROLLUP" ? "Lowest PPG" : "Lowest Score"}
            </span>
            <Snowflake className="h-4 w-4 text-rose-400" />
          </div>
          <div
            id="statLowScore"
            className="mt-2 font-mono text-3xl font-black text-rose-400 sm:text-4xl"
          >
            {lowestOverall ? lowestOverall.points.toFixed(2) : "0.00"}
          </div>
        </div>
        <div className="mt-2 border-t border-slate-800/60 pt-2">
          <div
            id="statLowTeam"
            className="truncate text-xs font-bold text-slate-200 sm:text-sm"
            title={lowestOverall ? `${lowestOverall.manager} (${lowestOverall.teamName})` : ""}
          >
            {lowestOverall ? `${lowestOverall.manager} - ${lowestOverall.teamName}` : "-"}
          </div>
          <div
            id="statLowLeague"
            className="mt-0.5 flex items-center gap-1 truncate text-xs font-semibold text-rose-400/90"
            title={
              lowestOverall
                ? `League: ${(lowestOverall as any).league || lowestOverall.leagueName}`
                : ""
            }
          >
            <Trophy className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">
              {lowestOverall ? (lowestOverall as any).league || lowestOverall.leagueName : "-"}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Benchmark */}
      <div className="glass-card glass-card-hover relative flex flex-col justify-between rounded-2xl border border-slate-800/80 p-5">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black tracking-wider text-slate-400 uppercase">
              Benchmark
            </span>
            <BarChart3 className="h-4 w-4 text-indigo-400" />
          </div>
          <div
            id="statAvgScore"
            className="mt-2 font-mono text-3xl font-black text-indigo-300 sm:text-4xl"
          >
            {avgPts.toFixed(2)}
          </div>
        </div>
        <div className="mt-2 border-t border-slate-800/60 pt-2">
          <div id="statMedianScore" className="text-xs font-semibold text-slate-300 sm:text-sm">
            Median: {medianPts.toFixed(2)} pts
          </div>
          <div className="mt-0.5 truncate text-[11px] font-medium text-slate-500">
            {totalActiveLeagues === 1 ? "League average" : "Cross-league average"}
          </div>
        </div>
      </div>

      {/* 5. Power League */}
      {totalActiveLeagues > 1 && (
        <div className="glass-card glass-card-hover relative flex flex-col justify-between rounded-2xl border border-slate-800/80 p-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black tracking-wider text-slate-400 uppercase">
                Power League
              </span>
              <Crown className="h-4 w-4 text-amber-400" />
            </div>
            <div
              id="statTopLeagueAvg"
              className="mt-2 font-mono text-3xl font-black text-amber-400 sm:text-4xl"
            >
              {topLeagueAvg > 0 ? topLeagueAvg.toFixed(2) : "0.00"}
            </div>
          </div>
          <div className="mt-2 border-t border-slate-800/60 pt-2">
            <div
              id="statTopLeagueName"
              className="flex items-center gap-1 truncate text-xs font-bold text-slate-200 sm:text-sm"
              title={topLeagueAvg > 0 ? topLeagueName : ""}
            >
              {topLeagueAvg > 0 ? (
                <>
                  <Trophy className="h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
                  <span className="truncate">{topLeagueName}</span>
                </>
              ) : (
                "-"
              )}
            </div>
            <div className="mt-0.5 truncate text-[11px] font-medium text-slate-500">
              Highest league average
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

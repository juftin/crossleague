import React, { useMemo } from "react";
import {
  Crown,
  Medal,
  TrendingUp,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { BrandBoltIcon } from "../common/BrandBoltIcon.tsx";
import { useCrossLeagueStore, useActiveRecords } from "../../state/useCrossLeagueStore.js";
import { getAvatarUrl } from "../../api/sleeper.js";
import { useStickyTableHeader } from "../common/useStickyTableHeader.ts";

export const LeaderboardTab: React.FC = () => {
  const tableRef = useStickyTableHeader();
  const records = useActiveRecords();
  const selectedLeagueIds = useCrossLeagueStore(s => s.selectedLeagueIds);
  const mode = useCrossLeagueStore(s => s.mode);
  const searchQuery = useCrossLeagueStore(s => s.searchQuery);
  const setSearchQuery = useCrossLeagueStore(s => s.setSearchQuery);
  const sortColumn = useCrossLeagueStore(s => s.sortColumn);
  const sortAsc = useCrossLeagueStore(s => s.sortAsc);
  const setSortColumn = useCrossLeagueStore(s => s.setSortColumn);
  const tierFilter = useCrossLeagueStore(s => s.tierFilter);
  const setTierFilter = useCrossLeagueStore(s => s.setTierFilter);
  const mainPage = useCrossLeagueStore(s => s.mainPage);
  const setMainPage = useCrossLeagueStore(s => s.setMainPage);
  const mainPageSize = useCrossLeagueStore(s => s.mainPageSize);
  const setMainPageSize = useCrossLeagueStore(s => s.setMainPageSize);
  const expandedRowIds = useCrossLeagueStore(s => s.expandedRowIds);
  const toggleRowExpand = useCrossLeagueStore(s => s.toggleRowExpand);

  const isSeason = mode === "SEASON_ROLLUP";

  const { rankedRecords, paginatedRecords, totalPages, totalCount, startIdx, endIdx } =
    useMemo(() => {
      if (!records || records.length === 0) {
        return {
          rankedRecords: [],
          paginatedRecords: [],
          totalPages: 0,
          totalCount: 0,
          startIdx: 0,
          endIdx: 0
        };
      }

      const sortedMaster = [...records].sort((a, b) => (b.points || 0) - (a.points || 0));
      const maxScore = sortedMaster[0] ? sortedMaster[0].points || 0 : 100;

      const masterWithRank = sortedMaster.map((item, idx) => ({
        ...item,
        rank: idx + 1,
        percentOfMax: maxScore > 0 ? Math.round(((item.points || 0) / maxScore) * 100) : 0
      }));

      // Filter by tier and search query
      const filtered = masterWithRank.filter(item => {
        const pts = item.points || 0;
        if (isSeason) {
          if (tierFilter === "BOOM" && pts < 130) return false;
          if (tierFilter === "SOLID" && (pts < 105 || pts >= 130)) return false;
          if (tierFilter === "COLD" && pts >= 105) return false;
        } else {
          if (tierFilter === "BOOM" && pts < 140) return false;
          if (tierFilter === "SOLID" && (pts < 100 || pts >= 140)) return false;
          if (tierFilter === "COLD" && pts >= 100) return false;
        }

        if (searchQuery && searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const m = (item.manager || "").toLowerCase();
          const t = (item.teamName || "").toLowerCase();
          const l = ((item as any).league || item.leagueName || "").toLowerCase();
          return m.includes(q) || t.includes(q) || l.includes(q);
        }
        return true;
      });

      // Sort
      filtered.sort((a, b) => {
        let valA: any;
        let valB: any;

        if (sortColumn === "Points") {
          valA = a.points || 0;
          valB = b.points || 0;
        } else if (sortColumn === "Rank") {
          valA = a.rank || 0;
          valB = b.rank || 0;
        } else if (sortColumn === "Manager") {
          valA = (a.manager || "").toLowerCase();
          valB = (b.manager || "").toLowerCase();
        } else if (sortColumn === "Team") {
          valA = (a.teamName || "").toLowerCase();
          valB = (b.teamName || "").toLowerCase();
        } else if (sortColumn === "League") {
          valA = ((a as any).league || a.leagueName || "").toLowerCase();
          valB = ((b as any).league || b.leagueName || "").toLowerCase();
        } else if (sortColumn === "Record") {
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
        } else if (sortColumn === "Efficiency") {
          valA = typeof a.efficiency === "number" ? a.efficiency : 0;
          valB = typeof b.efficiency === "number" ? b.efficiency : 0;
        } else {
          valA = a.points || 0;
          valB = b.points || 0;
        }

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });

      const count = filtered.length;
      const size = mainPageSize === Infinity || mainPageSize >= 10000 ? count || 1 : mainPageSize;
      const pages = Math.ceil(count / size) || 1;
      const clampedPage = Math.max(1, Math.min(mainPage, pages));
      const start = (clampedPage - 1) * size;
      const end = Math.min(start + size, count);
      const paginated = filtered.slice(start, end);

      return {
        rankedRecords: filtered,
        paginatedRecords: paginated,
        totalPages: pages,
        totalCount: count,
        startIdx: count > 0 ? start + 1 : 0,
        endIdx: end
      };
    }, [records, isSeason, tierFilter, searchQuery, sortColumn, sortAsc, mainPage, mainPageSize]);

  const handleSort = (column: string) => {
    setSortColumn(column);
  };

  return (
    <div id="viewLeaderboard" className="w-full space-y-4">
      {/* Advanced Filter & Search Deck */}
      <div className="glass-card flex w-full flex-col items-stretch justify-between gap-3 rounded-2xl border border-slate-800 p-3.5 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
        <div className="flex w-full flex-1 flex-col items-stretch gap-2.5 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
          {/* Search */}
          <div className="relative flex-1 sm:w-80">
            <input
              type="text"
              id="tableSearch"
              placeholder="Search manager, squad, league..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950/90 py-2.5 pr-4 pl-10 text-xs font-medium text-white placeholder-slate-500 focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none sm:text-sm"
            />
            <Search className="absolute top-3 left-3.5 h-4 w-4 text-slate-500" />
          </div>

          {/* Score Tier Filter */}
          <select
            id="scoreTierSelect"
            value={tierFilter}
            onChange={e => setTierFilter(e.target.value)}
            className="cursor-pointer rounded-xl border border-slate-700/80 bg-slate-950/90 px-3.5 py-2.5 text-xs font-semibold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none sm:text-sm"
          >
            {isSeason ? (
              <>
                <option value="ALL">All Averages</option>
                <option value="BOOM">Elite PPG (130+)</option>
                <option value="SOLID">Solid PPG (105 - 130)</option>
                <option value="COLD">Sub-105 PPG</option>
              </>
            ) : (
              <>
                <option value="ALL">All Scores</option>
                <option value="BOOM">Nuclear (140+ pts)</option>
                <option value="SOLID">Solid (100 - 140)</option>
                <option value="COLD">Ice Cold (&lt; 100)</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Master Power Board Table */}
      <div className="glass-card w-full space-y-4 rounded-2xl border border-slate-800 p-4 sm:p-6">
        <div className="flex items-center justify-between px-1 text-xs text-slate-400 sm:text-sm">
          <span id="rowCount">
            {records.length === 0
              ? "Showing 0 squads"
              : `Showing ${rankedRecords.length} of ${records.length} squads across ${selectedLeagueIds.size} leagues`}
          </span>
        </div>

        <div className="table-scroll-container rounded-xl border border-slate-800">
          <table ref={tableRef} className="w-full border-collapse text-left" id="mainTable">
            <thead className="sticky-table-header border-b border-slate-800 bg-slate-900/95 text-[11px] font-black tracking-wider text-slate-400 uppercase select-none sm:text-xs md:text-sm">
              <tr>
                <th
                  className="cursor-pointer px-2 py-2.5 transition hover:text-emerald-400 sm:px-4 sm:py-3.5"
                  onClick={() => handleSort("Rank")}
                  title="Sort by Rank"
                >
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span>#</span>
                    <span
                      id="sortIconRank"
                      className={`text-xs ${sortColumn === "Rank" ? "text-emerald-400" : "text-slate-500"}`}
                    >
                      {sortColumn === "Rank" ? (
                        sortAsc ? (
                          <ChevronUp className="inline h-3 w-3" />
                        ) : (
                          <ChevronDown className="inline h-3 w-3" />
                        )
                      ) : null}
                    </span>
                  </div>
                </th>
                <th
                  className="cursor-pointer px-2 py-2.5 transition hover:text-emerald-400 sm:px-4 sm:py-3.5"
                  onClick={() => handleSort("Points")}
                  title="Sort by Points"
                >
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span id="thPoints">{isSeason ? "AVG PPG" : "POINTS"}</span>
                    <span
                      id="sortIconPoints"
                      className={`text-xs ${sortColumn === "Points" ? "text-emerald-400" : "text-slate-500"}`}
                    >
                      {sortColumn === "Points" ? (
                        sortAsc ? (
                          <ChevronUp className="inline h-3 w-3" />
                        ) : (
                          <ChevronDown className="inline h-3 w-3" />
                        )
                      ) : null}
                    </span>
                  </div>
                </th>
                <th
                  className="cursor-pointer px-2 py-2.5 transition hover:text-emerald-400 sm:px-4 sm:py-3.5"
                  onClick={() => handleSort("Manager")}
                  title="Sort by Manager"
                >
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span>MANAGER</span>
                    <span
                      id="sortIconManager"
                      className={`text-xs ${sortColumn === "Manager" ? "text-emerald-400" : "text-slate-500"}`}
                    >
                      {sortColumn === "Manager" ? (
                        sortAsc ? (
                          <ChevronUp className="inline h-3 w-3" />
                        ) : (
                          <ChevronDown className="inline h-3 w-3" />
                        )
                      ) : null}
                    </span>
                  </div>
                </th>
                <th
                  className="cursor-pointer px-2 py-2.5 transition hover:text-emerald-400 sm:px-4 sm:py-3.5"
                  onClick={() => handleSort("Team")}
                  title="Sort by Squad"
                >
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span>SQUAD</span>
                    <span
                      id="sortIconTeam"
                      className={`text-xs ${sortColumn === "Team" ? "text-emerald-400" : "text-slate-500"}`}
                    >
                      {sortColumn === "Team" ? (
                        sortAsc ? (
                          <ChevronUp className="inline h-3 w-3" />
                        ) : (
                          <ChevronDown className="inline h-3 w-3" />
                        )
                      ) : null}
                    </span>
                  </div>
                </th>
                <th
                  className="cursor-pointer px-2 py-2.5 transition hover:text-emerald-400 sm:px-4 sm:py-3.5"
                  onClick={() => handleSort("League")}
                  title="Sort by League"
                >
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span>LEAGUE</span>
                    <span
                      id="sortIconLeague"
                      className={`text-xs ${sortColumn === "League" ? "text-emerald-400" : "text-slate-500"}`}
                    >
                      {sortColumn === "League" ? (
                        sortAsc ? (
                          <ChevronUp className="inline h-3 w-3" />
                        ) : (
                          <ChevronDown className="inline h-3 w-3" />
                        )
                      ) : null}
                    </span>
                  </div>
                </th>
                <th
                  className="cursor-pointer px-2 py-2.5 text-center transition hover:text-emerald-400 sm:px-4 sm:py-3.5"
                  onClick={() => handleSort("Record")}
                  title="Sort by Matchup / Win %"
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                    <span>MATCHUP</span>
                    <span
                      id="sortIconRecord"
                      className={`text-xs ${sortColumn === "Record" ? "text-emerald-400" : "text-slate-500"}`}
                    >
                      {sortColumn === "Record" ? (
                        sortAsc ? (
                          <ChevronUp className="inline h-3 w-3" />
                        ) : (
                          <ChevronDown className="inline h-3 w-3" />
                        )
                      ) : null}
                    </span>
                  </div>
                </th>
                <th
                  className="cursor-pointer px-2 py-2.5 text-center transition hover:text-emerald-400 sm:px-4 sm:py-3.5"
                  onClick={() => handleSort("Efficiency")}
                  title="Sort by Lineup Efficiency"
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                    <span>EFFICIENCY</span>
                    <span
                      id="sortIconEfficiency"
                      className={`text-xs ${sortColumn === "Efficiency" ? "text-emerald-400" : "text-slate-500"}`}
                    >
                      {sortColumn === "Efficiency" ? (
                        sortAsc ? (
                          <ChevronUp className="inline h-3 w-3" />
                        ) : (
                          <ChevronDown className="inline h-3 w-3" />
                        )
                      ) : null}
                    </span>
                  </div>
                </th>
                <th className="w-10 px-1.5 py-2.5 text-center sm:w-12 sm:px-3 sm:py-3.5" />
              </tr>
            </thead>
            <tbody
              id="tableBody"
              className="divide-y divide-slate-800/60 font-sans text-xs sm:text-sm"
            >
              {paginatedRecords.map(r => {
                const isExpanded = expandedRowIds.includes(r.id);
                const avatarUrl = getAvatarUrl(r.avatar);
                const leagueTitle = (r as any).league || r.leagueName || "League";

                let rankBadge = (
                  <span className="font-mono text-xs font-black text-slate-400 sm:text-base">
                    #{r.rank}
                  </span>
                );
                if (r.rank === 1) {
                  rankBadge = (
                    <span className="inline-flex items-center gap-1 text-xs font-black text-amber-300 sm:text-base">
                      <Crown className="h-4 w-4 text-amber-300" /> #1
                    </span>
                  );
                } else if (r.rank === 2) {
                  rankBadge = (
                    <span className="inline-flex items-center gap-1 text-xs font-black text-slate-200 sm:text-base">
                      <Medal className="h-4 w-4 text-slate-200" /> #2
                    </span>
                  );
                } else if (r.rank === 3) {
                  rankBadge = (
                    <span className="inline-flex items-center gap-1 text-xs font-black text-amber-500 sm:text-base">
                      <Medal className="h-4 w-4 text-amber-500" /> #3
                    </span>
                  );
                }

                // Matchup Result Pill
                let matchupPill = <span className="text-[10px] text-slate-600 sm:text-xs">-</span>;
                if (isSeason) {
                  const winPct = r.winPct || 0;
                  const winClass =
                    winPct >= 60
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      : winPct >= 40
                        ? "bg-slate-800 text-slate-300 border border-slate-700"
                        : "bg-rose-500/15 text-rose-300 border border-rose-500/30";

                  matchupPill = (
                    <div className="text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-black sm:px-3 sm:py-1 sm:text-xs ${winClass}`}
                      >
                        {r.wins || 0}W - {r.losses || 0}L{(r.ties || 0) > 0 ? ` - ${r.ties}T` : ""}
                      </span>
                      <div className="mt-0.5 font-mono text-[10px] text-slate-400 sm:text-xs">
                        {winPct}% Win
                      </div>
                    </div>
                  );
                } else {
                  if (r.outcome === "win") {
                    matchupPill = (
                      <div className="text-center">
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-300 sm:px-2.5 sm:py-1 sm:text-xs">
                          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" /> W (+
                          {Math.abs(r.margin || 0).toFixed(1)})
                        </span>
                        <div
                          className="mx-auto mt-0.5 max-w-[110px] truncate text-[10px] font-medium text-slate-400 sm:max-w-[130px] sm:text-xs"
                          title={`vs ${r.opponentName || "Opponent"}`}
                        >
                          vs {r.opponentName || "Opp"}
                        </div>
                      </div>
                    );
                  } else if (r.outcome === "loss") {
                    matchupPill = (
                      <div className="text-center">
                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/20 px-2 py-0.5 text-[10px] font-black text-rose-300 sm:px-2.5 sm:py-1 sm:text-xs">
                          <span className="inline-block h-2 w-2 rounded-full bg-rose-400" /> L (-
                          {Math.abs(r.margin || 0).toFixed(1)})
                        </span>
                        <div
                          className="mx-auto mt-0.5 max-w-[110px] truncate text-[10px] font-medium text-slate-400 sm:max-w-[130px] sm:text-xs"
                          title={`vs ${r.opponentName || "Opponent"}`}
                        >
                          vs {r.opponentName || "Opp"}
                        </div>
                      </div>
                    );
                  } else if (r.outcome === "tie") {
                    matchupPill = (
                      <div className="text-center">
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-black text-slate-300 sm:px-2.5 sm:py-1 sm:text-xs">
                          <span className="inline-block h-2 w-2 rounded-full bg-slate-400" /> TIE
                        </span>
                      </div>
                    );
                  } else if (r.outcome === "unplayed") {
                    matchupPill = (
                      <div className="text-center">
                        <span
                          className="mx-auto inline-flex max-w-[110px] items-center gap-1 truncate rounded-full border border-slate-700/60 bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-400 sm:max-w-[130px] sm:px-2.5 sm:py-1 sm:text-xs"
                          title={`vs ${r.opponentName || "Opponent"}`}
                        >
                          vs {r.opponentName || "Opp"}
                        </span>
                        <div className="mt-0.5 font-mono text-[10px] text-slate-500 sm:text-xs">
                          Upcoming
                        </div>
                      </div>
                    );
                  }
                }

                const effVal =
                  typeof r.efficiency === "number" && !isNaN(r.efficiency) ? r.efficiency : 100;
                const benchPtsVal =
                  typeof r.benchPoints === "number" && !isNaN(r.benchPoints) ? r.benchPoints : 0;

                return (
                  <React.Fragment key={r.id}>
                    <tr className="transition-colors hover:bg-slate-800/60">
                      <td className="px-2 py-2.5 whitespace-nowrap sm:px-4 sm:py-4">{rankBadge}</td>

                      <td className="px-2 py-2.5 whitespace-nowrap sm:px-4 sm:py-4">
                        <div className="space-y-0.5 sm:space-y-1">
                          <div
                            className={`font-mono text-sm font-black sm:text-lg ${
                              r.rank <= 3 ? "text-emerald-400" : "text-white"
                            }`}
                          >
                            {(r.points || 0).toFixed(2)}{" "}
                            <span className="text-[10px] font-semibold text-slate-400 sm:text-xs">
                              {isSeason ? "ppg" : "pts"}
                            </span>
                          </div>
                          <div className="h-1 w-24 overflow-hidden rounded-full bg-slate-800/90 sm:h-1.5 sm:w-36">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                              style={{ width: `${r.percentOfMax}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-2.5 whitespace-nowrap sm:px-4 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {avatarUrl && (
                            <img
                              src={avatarUrl}
                              className="h-7 w-7 flex-shrink-0 rounded-full border border-slate-700 object-cover sm:h-9 sm:w-9"
                              alt=""
                              onError={e => ((e.target as HTMLElement).style.display = "none")}
                            />
                          )}
                          <div className="min-w-0">
                            <span className="block truncate text-xs font-black text-slate-100 sm:text-base">
                              {r.manager}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="max-w-[140px] truncate px-2 py-2.5 text-[11px] font-medium whitespace-nowrap text-slate-300 sm:max-w-[180px] sm:px-4 sm:py-4 sm:text-sm">
                        {r.teamName}
                      </td>

                      <td className="px-2 py-2.5 font-medium text-slate-300 sm:px-4 sm:py-4">
                        <div className="max-w-[200px] text-[11px] leading-snug font-bold break-words text-slate-200 sm:max-w-[260px] sm:text-sm">
                          <span>{leagueTitle}</span>
                        </div>
                      </td>

                      <td className="px-2 py-2.5 text-center whitespace-nowrap sm:px-4 sm:py-4">
                        {matchupPill}
                      </td>

                      <td className="px-2 py-2.5 text-center whitespace-nowrap sm:px-4 sm:py-4">
                        <div className="text-center">
                          <span
                            className={`font-mono text-xs font-black sm:text-sm ${
                              effVal >= 90
                                ? "text-emerald-400"
                                : effVal >= 75
                                  ? "text-slate-300"
                                  : "text-amber-400"
                            }`}
                          >
                            {effVal}%
                          </span>
                          <div className="text-[10px] font-medium text-slate-400 sm:text-xs">
                            {benchPtsVal.toFixed(1)} benched
                          </div>
                        </div>
                      </td>

                      <td className="px-1.5 py-2.5 text-center whitespace-nowrap sm:px-3 sm:py-4">
                        <button
                          type="button"
                          onClick={() => toggleRowExpand(r.id)}
                          className="mx-auto flex cursor-pointer items-center justify-center rounded-lg border border-slate-800 bg-slate-900 p-1.5 font-mono text-[10px] font-bold text-slate-400 transition hover:bg-slate-800 hover:text-white sm:p-2 sm:text-xs"
                          title="Toggle Details"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="border-b border-slate-800 bg-slate-950/90">
                        <td colSpan={8} className="p-5">
                          {isSeason ? (
                            <div className="glass-card space-y-3.5 rounded-xl border border-slate-800/80 p-5">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                                <div className="flex items-center gap-2 text-xs font-black tracking-wider text-slate-200 uppercase sm:text-sm">
                                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                                  <span>Season Consistency & Breakdown</span>
                                </div>
                                <div className="text-xs font-semibold text-slate-400 sm:text-sm">
                                  Season High:{" "}
                                  <span className="font-mono font-black text-emerald-400">
                                    {(r.highScore || 0).toFixed(2)} pts
                                  </span>{" "}
                                  • Season Low:{" "}
                                  <span className="font-mono font-black text-rose-400">
                                    {(r.lowScore || 0).toFixed(2)} pts
                                  </span>{" "}
                                  • Consistency (Std Dev):{" "}
                                  <span className="font-mono font-black text-cyan-300">
                                    ±{r.stdDev || 0}
                                  </span>
                                </div>
                              </div>

                              <div className="text-xs text-slate-300 sm:text-sm">
                                <span className="font-bold text-slate-200">
                                  Weekly Score Progression:
                                </span>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {(r.weeklyScores || []).map((pt: any, idx: number) => (
                                    <span
                                      key={idx}
                                      className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 font-mono text-xs text-slate-200 sm:text-sm"
                                    >
                                      W{idx + 1}:{" "}
                                      <span className="font-black text-emerald-400">
                                        {parseFloat(pt || 0).toFixed(1)}
                                      </span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="glass-card space-y-3.5 rounded-xl border border-slate-800/80 p-5">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                                <div className="flex items-center gap-2 text-xs font-black tracking-wider text-slate-200 uppercase sm:text-sm">
                                  <BrandBoltIcon className="h-4 w-4 text-amber-400" />
                                  <span>Starting Lineup vs Bench</span>
                                  <span className="font-normal text-slate-400">
                                    | Matchup #{r.matchupId || "N/A"}
                                  </span>
                                </div>
                                <div className="text-xs font-semibold text-slate-400 sm:text-sm">
                                  Starters:{" "}
                                  <span className="font-mono font-black text-emerald-400">
                                    {(r.startersTotal || 0).toFixed(2)} pts
                                  </span>{" "}
                                  • Bench:{" "}
                                  <span className="font-mono font-black text-slate-300">
                                    {(r.benchPoints || 0).toFixed(2)} pts
                                  </span>{" "}
                                  • Optimal Potential:{" "}
                                  <span className="font-mono font-black text-amber-300">
                                    {(r.optimalPoints || 0).toFixed(2)} pts
                                  </span>{" "}
                                  ({r.efficiency || 100}% efficiency)
                                </div>
                              </div>

                              <div className="text-xs text-slate-300 sm:text-sm">
                                <span className="font-bold text-slate-200">
                                  Starter Point Breakdown:
                                </span>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {r.startersPoints && r.startersPoints.length > 0 ? (
                                    r.startersPoints.map((pt: any, idx: number) => (
                                      <span
                                        key={idx}
                                        className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 font-mono text-xs text-slate-200 sm:text-sm"
                                      >
                                        S{idx + 1}:{" "}
                                        <span className="font-black text-emerald-400">
                                          {parseFloat(pt || 0).toFixed(1)}
                                        </span>
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-slate-500 italic">
                                      No individual starter data available.
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty search state */}
        {rankedRecords.length === 0 && (
          <div id="noResultsFound" className="space-y-2 py-12 text-center text-slate-400">
            <Search className="mx-auto mb-2 h-8 w-8 text-slate-500" />
            <div className="font-bold text-slate-200">
              {selectedLeagueIds.size === 0
                ? "No leagues selected."
                : "Nothing on the board matching that search."}
            </div>
            <div className="text-xs text-slate-500">
              {selectedLeagueIds.size === 0
                ? "Select one or more leagues in the filter bar above to display rankings."
                : "Try clearing the keyword search or resetting filters."}
            </div>
          </div>
        )}

        {/* Pagination Footer for Main Board */}
        <div
          id="mainPaginationFooter"
          className="flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-3 text-xs text-slate-400 sm:flex-row sm:text-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 py-1.5">
              <span className="text-xs font-bold text-slate-400">Show:</span>
              <select
                id="mainPageSizeSelect"
                value={mainPageSize >= 10000 ? "all" : String(mainPageSize)}
                onChange={e =>
                  setMainPageSize(e.target.value === "all" ? Infinity : Number(e.target.value))
                }
                className="cursor-pointer bg-transparent text-xs font-black text-white focus:outline-none"
              >
                <option value="25" className="bg-slate-900 text-white">
                  25
                </option>
                <option value="50" className="bg-slate-900 text-white">
                  50
                </option>
                <option value="100" className="bg-slate-900 text-white">
                  100
                </option>
                <option value="all" className="bg-slate-900 text-white">
                  All
                </option>
              </select>
            </div>
            <span id="mainPageInfoText" className="font-medium text-slate-400">
              {totalCount === 0
                ? "Showing 0 of 0"
                : `Showing ${startIdx}–${endIdx} of ${totalCount}`}
            </span>
          </div>

          <div
            id="mainPaginationControls"
            className="flex flex-wrap items-center justify-center gap-1 sm:justify-end sm:gap-1.5"
          >
            <button
              id="btnPrevMainPage"
              type="button"
              disabled={mainPage <= 1 || totalCount === 0}
              onClick={() => setMainPage(mainPage - 1)}
              className="flex cursor-pointer items-center gap-1 rounded-xl border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prev</span>
            </button>
            <div id="mainPageNumberButtons" className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = i + 1;
                const isCurrent = p === mainPage;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setMainPage(p)}
                    className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-xl text-xs font-bold transition sm:h-8 sm:w-8 ${
                      isCurrent
                        ? "bg-emerald-500 font-black text-slate-950 shadow-lg shadow-emerald-500/20"
                        : "border border-slate-700/80 bg-slate-900 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <button
              id="btnNextMainPage"
              type="button"
              disabled={mainPage >= totalPages || totalCount === 0}
              onClick={() => setMainPage(mainPage + 1)}
              className="flex cursor-pointer items-center gap-1 rounded-xl border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

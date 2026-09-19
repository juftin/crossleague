import React, { useMemo } from "react";
import {
  Crown,
  Medal,
  TrendingUp,
  Zap,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flame,
  Snowflake
} from "lucide-react";
import { useCrossLeagueStore, useActiveRecords } from "../../state/useCrossLeagueStore.js";
import { getAvatarUrl } from "../../api/sleeper.js";

export const LeaderboardTab: React.FC = () => {
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
      let filtered = masterWithRank.filter(item => {
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
    <div id="viewLeaderboard" className="space-y-4 w-full">
      {/* Advanced Filter & Search Deck */}
      <div className="glass-card rounded-2xl p-3.5 sm:p-5 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 w-full">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto flex-1">
          {/* Search */}
          <div className="relative flex-1 sm:w-80">
            <input
              type="text"
              id="tableSearch"
              placeholder="Search manager, squad, league..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          </div>

          {/* Score Tier Filter */}
          <select
            id="scoreTierSelect"
            value={tierFilter}
            onChange={e => setTierFilter(e.target.value)}
            className="bg-slate-950/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer"
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
      <div className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-800 space-y-4 w-full">
        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-400 px-1">
          <span id="rowCount">
            {records.length === 0
              ? "Showing 0 squads"
              : `Showing ${rankedRecords.length} of ${records.length} squads across ${selectedLeagueIds.size} leagues`}
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left border-collapse" id="mainTable">
            <thead className="bg-slate-900/90 text-slate-400 text-[11px] sm:text-xs md:text-sm font-black uppercase tracking-wider border-b border-slate-800 select-none">
              <tr>
                <th
                  className="py-2.5 sm:py-3.5 px-2 sm:px-4 cursor-pointer hover:text-emerald-400 transition"
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
                          <ChevronUp className="w-3 h-3 inline" />
                        ) : (
                          <ChevronDown className="w-3 h-3 inline" />
                        )
                      ) : null}
                    </span>
                  </div>
                </th>
                <th
                  className="py-2.5 sm:py-3.5 px-2 sm:px-4 cursor-pointer hover:text-emerald-400 transition"
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
                          <ChevronUp className="w-3 h-3 inline" />
                        ) : (
                          <ChevronDown className="w-3 h-3 inline" />
                        )
                      ) : null}
                    </span>
                  </div>
                </th>
                <th
                  className="py-2.5 sm:py-3.5 px-2 sm:px-4 cursor-pointer hover:text-emerald-400 transition"
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
                          <ChevronUp className="w-3 h-3 inline" />
                        ) : (
                          <ChevronDown className="w-3 h-3 inline" />
                        )
                      ) : null}
                    </span>
                  </div>
                </th>
                <th
                  className="py-2.5 sm:py-3.5 px-2 sm:px-4 cursor-pointer hover:text-emerald-400 transition"
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
                          <ChevronUp className="w-3 h-3 inline" />
                        ) : (
                          <ChevronDown className="w-3 h-3 inline" />
                        )
                      ) : null}
                    </span>
                  </div>
                </th>
                <th
                  className="py-2.5 sm:py-3.5 px-2 sm:px-4 cursor-pointer hover:text-emerald-400 transition"
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
                          <ChevronUp className="w-3 h-3 inline" />
                        ) : (
                          <ChevronDown className="w-3 h-3 inline" />
                        )
                      ) : null}
                    </span>
                  </div>
                </th>
                <th
                  className="py-2.5 sm:py-3.5 px-2 sm:px-4 text-center cursor-pointer hover:text-emerald-400 transition"
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
                          <ChevronUp className="w-3 h-3 inline" />
                        ) : (
                          <ChevronDown className="w-3 h-3 inline" />
                        )
                      ) : null}
                    </span>
                  </div>
                </th>
                <th
                  className="py-2.5 sm:py-3.5 px-2 sm:px-4 text-center cursor-pointer hover:text-emerald-400 transition"
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
                          <ChevronUp className="w-3 h-3 inline" />
                        ) : (
                          <ChevronDown className="w-3 h-3 inline" />
                        )
                      ) : null}
                    </span>
                  </div>
                </th>
                <th className="py-2.5 sm:py-3.5 px-1.5 sm:px-3 w-10 sm:w-12 text-center" />
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
                  <span className="font-black text-slate-400 font-mono text-xs sm:text-base">
                    #{r.rank}
                  </span>
                );
                if (r.rank === 1) {
                  rankBadge = (
                    <span className="inline-flex items-center gap-1 font-black text-amber-300 text-xs sm:text-base">
                      <Crown className="w-4 h-4 text-amber-300" /> #1
                    </span>
                  );
                } else if (r.rank === 2) {
                  rankBadge = (
                    <span className="inline-flex items-center gap-1 font-black text-slate-200 text-xs sm:text-base">
                      <Medal className="w-4 h-4 text-slate-200" /> #2
                    </span>
                  );
                } else if (r.rank === 3) {
                  rankBadge = (
                    <span className="inline-flex items-center gap-1 font-black text-amber-500 text-xs sm:text-base">
                      <Medal className="w-4 h-4 text-amber-500" /> #3
                    </span>
                  );
                }

                // Matchup Result Pill
                let matchupPill = <span className="text-slate-600 text-[10px] sm:text-xs">-</span>;
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
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-black ${winClass}`}
                      >
                        {r.wins || 0}W - {r.losses || 0}L{(r.ties || 0) > 0 ? ` - ${r.ties}T` : ""}
                      </span>
                      <div className="text-[10px] sm:text-xs text-slate-400 font-mono mt-0.5">
                        {winPct}% Win
                      </div>
                    </div>
                  );
                } else {
                  if (r.outcome === "win") {
                    matchupPill = (
                      <div className="text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> W (+
                          {Math.abs(r.margin || 0).toFixed(1)})
                        </span>
                        <div
                          className="text-[10px] sm:text-xs text-slate-400 truncate max-w-[110px] sm:max-w-[130px] mt-0.5 font-medium mx-auto"
                          title={`vs ${r.opponentName || "Opponent"}`}
                        >
                          vs {r.opponentName || "Opp"}
                        </div>
                      </div>
                    );
                  } else if (r.outcome === "loss") {
                    matchupPill = (
                      <div className="text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" /> L (-
                          {Math.abs(r.margin || 0).toFixed(1)})
                        </span>
                        <div
                          className="text-[10px] sm:text-xs text-slate-400 truncate max-w-[110px] sm:max-w-[130px] mt-0.5 font-medium mx-auto"
                          title={`vs ${r.opponentName || "Opponent"}`}
                        >
                          vs {r.opponentName || "Opp"}
                        </div>
                      </div>
                    );
                  } else if (r.outcome === "tie") {
                    matchupPill = (
                      <div className="text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black bg-slate-800 text-slate-300 border border-slate-700">
                          <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" /> TIE
                        </span>
                      </div>
                    );
                  } else if (r.outcome === "unplayed") {
                    matchupPill = (
                      <div className="text-center">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60 truncate max-w-[110px] sm:max-w-[130px] mx-auto"
                          title={`vs ${r.opponentName || "Opponent"}`}
                        >
                          vs {r.opponentName || "Opp"}
                        </span>
                        <div className="text-[10px] sm:text-xs text-slate-500 font-mono mt-0.5">
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
                      <td className="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap">{rankBadge}</td>

                      <td className="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap">
                        <div className="space-y-0.5 sm:space-y-1">
                          <div
                            className={`font-mono text-sm sm:text-lg font-black ${
                              r.rank <= 3 ? "text-emerald-400" : "text-white"
                            }`}
                          >
                            {(r.points || 0).toFixed(2)}{" "}
                            <span className="text-[10px] sm:text-xs font-semibold text-slate-400">
                              {isSeason ? "ppg" : "pts"}
                            </span>
                          </div>
                          <div className="w-24 sm:w-36 bg-slate-800/90 rounded-full h-1 sm:h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full"
                              style={{ width: `${r.percentOfMax}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {avatarUrl && (
                            <img
                              src={avatarUrl}
                              className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-700 flex-shrink-0"
                              alt=""
                              onError={e => ((e.target as HTMLElement).style.display = "none")}
                            />
                          )}
                          <div className="min-w-0">
                            <span className="font-black text-xs sm:text-base text-slate-100 truncate block">
                              {r.manager}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 sm:py-4 px-2 sm:px-4 whitespace-nowrap text-[11px] sm:text-sm text-slate-300 font-medium truncate max-w-[140px] sm:max-w-[180px]">
                        {r.teamName}
                      </td>

                      <td className="py-2.5 sm:py-4 px-2 sm:px-4 text-slate-300 font-medium">
                        <div className="text-[11px] sm:text-sm font-bold text-slate-200 break-words leading-snug max-w-[200px] sm:max-w-[260px]">
                          <span>{leagueTitle}</span>
                        </div>
                      </td>

                      <td className="py-2.5 sm:py-4 px-2 sm:px-4 text-center whitespace-nowrap">
                        {matchupPill}
                      </td>

                      <td className="py-2.5 sm:py-4 px-2 sm:px-4 text-center whitespace-nowrap">
                        <div className="text-center">
                          <span
                            className={`text-xs sm:text-sm font-mono font-black ${
                              effVal >= 90
                                ? "text-emerald-400"
                                : effVal >= 75
                                  ? "text-slate-300"
                                  : "text-amber-400"
                            }`}
                          >
                            {effVal}%
                          </span>
                          <div className="text-[10px] sm:text-xs text-slate-400 font-medium">
                            {benchPtsVal.toFixed(1)} benched
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 sm:py-4 px-1.5 sm:px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => toggleRowExpand(r.id)}
                          className="p-1.5 sm:p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition text-[10px] sm:text-xs font-mono font-bold border border-slate-800 cursor-pointer flex items-center justify-center mx-auto"
                          title="Toggle Details"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-slate-950/90 border-b border-slate-800">
                        <td colSpan={8} className="p-5">
                          {isSeason ? (
                            <div className="glass-card rounded-xl p-5 border border-slate-800/80 space-y-3.5">
                              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 flex-wrap gap-2">
                                <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                                  <span>Season Consistency & Breakdown</span>
                                </div>
                                <div className="text-xs sm:text-sm text-slate-400 font-semibold">
                                  Season High:{" "}
                                  <span className="font-black text-emerald-400 font-mono">
                                    {(r.highScore || 0).toFixed(2)} pts
                                  </span>{" "}
                                  • Season Low:{" "}
                                  <span className="font-black text-rose-400 font-mono">
                                    {(r.lowScore || 0).toFixed(2)} pts
                                  </span>{" "}
                                  • Consistency (Std Dev):{" "}
                                  <span className="font-black text-cyan-300 font-mono">
                                    ±{r.stdDev || 0}
                                  </span>
                                </div>
                              </div>

                              <div className="text-xs sm:text-sm text-slate-300">
                                <span className="font-bold text-slate-200">
                                  Weekly Score Progression:
                                </span>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {(r.weeklyScores || []).map((pt: any, idx: number) => (
                                    <span
                                      key={idx}
                                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs sm:text-sm text-slate-200"
                                    >
                                      W{idx + 1}:{" "}
                                      <span className="text-emerald-400 font-black">
                                        {parseFloat(pt || 0).toFixed(1)}
                                      </span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="glass-card rounded-xl p-5 border border-slate-800/80 space-y-3.5">
                              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 flex-wrap gap-2">
                                <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                                  <Zap className="w-4 h-4 text-amber-400" />
                                  <span>Starting Lineup vs Bench</span>
                                  <span className="text-slate-400 font-normal">
                                    | Matchup #{r.matchupId || "N/A"}
                                  </span>
                                </div>
                                <div className="text-xs sm:text-sm text-slate-400 font-semibold">
                                  Starters:{" "}
                                  <span className="font-black text-emerald-400 font-mono">
                                    {(r.startersTotal || 0).toFixed(2)} pts
                                  </span>{" "}
                                  • Bench:{" "}
                                  <span className="font-black text-slate-300 font-mono">
                                    {(r.benchPoints || 0).toFixed(2)} pts
                                  </span>{" "}
                                  • Optimal Potential:{" "}
                                  <span className="font-black text-amber-300 font-mono">
                                    {(r.optimalPoints || 0).toFixed(2)} pts
                                  </span>{" "}
                                  ({r.efficiency || 100}% efficiency)
                                </div>
                              </div>

                              <div className="text-xs sm:text-sm text-slate-300">
                                <span className="font-bold text-slate-200">
                                  Starter Point Breakdown:
                                </span>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {r.startersPoints && r.startersPoints.length > 0 ? (
                                    r.startersPoints.map((pt: any, idx: number) => (
                                      <span
                                        key={idx}
                                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs sm:text-sm text-slate-200"
                                      >
                                        S{idx + 1}:{" "}
                                        <span className="text-emerald-400 font-black">
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
          <div id="noResultsFound" className="py-12 text-center text-slate-400 space-y-2">
            <Search className="w-8 h-8 text-slate-500 mx-auto mb-2" />
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
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800 text-xs sm:text-sm text-slate-400"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700/80">
              <span className="text-slate-400 font-bold text-xs">Show:</span>
              <select
                id="mainPageSizeSelect"
                value={mainPageSize >= 10000 ? "all" : String(mainPageSize)}
                onChange={e =>
                  setMainPageSize(e.target.value === "all" ? Infinity : Number(e.target.value))
                }
                className="bg-transparent text-white font-black text-xs focus:outline-none cursor-pointer"
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
            <span id="mainPageInfoText" className="text-slate-400 font-medium">
              {totalCount === 0
                ? "Showing 0 of 0"
                : `Showing ${startIdx}–${endIdx} of ${totalCount}`}
            </span>
          </div>

          <div
            id="mainPaginationControls"
            className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center sm:justify-end"
          >
            <button
              id="btnPrevMainPage"
              type="button"
              disabled={mainPage <= 1 || totalCount === 0}
              onClick={() => setMainPage(mainPage - 1)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 hover:text-white border border-slate-700/80 transition font-bold flex items-center gap-1 cursor-pointer text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
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
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                      isCurrent
                        ? "bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20"
                        : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80"
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
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 hover:text-white border border-slate-700/80 transition font-bold flex items-center gap-1 cursor-pointer text-xs"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

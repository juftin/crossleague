import React, { useMemo } from "react";
import { useCrossLeagueStore, useActiveRecords } from "../../state/useCrossLeagueStore.js";
import { aggregatePlayers } from "../../analytics/aggregation.js";
import { getPlayerInfo } from "../../api/players.js";
import {
  Sparkles,
  Crown,
  Medal,
  Target,
  Zap,
  Flame,
  Shield,
  Footprints,
  Castle,
  Trophy,
  ClipboardList,
  CheckCircle2,
  Armchair,
  Info,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export const PlayersTab: React.FC = () => {
  const records = useActiveRecords();
  const mode = useCrossLeagueStore(s => s.mode);
  const week = useCrossLeagueStore(s => s.week);
  const playerPositionFilter = useCrossLeagueStore(s => s.playerPositionFilter);
  const setPlayerPositionFilter = useCrossLeagueStore(s => s.setPlayerPositionFilter);
  const playerStatusFilter = useCrossLeagueStore(s => s.playerStatusFilter);
  const setPlayerStatusFilter = useCrossLeagueStore(s => s.setPlayerStatusFilter);
  const playerSearch = useCrossLeagueStore(s => s.playerSearch);
  const setPlayerSearch = useCrossLeagueStore(s => s.setPlayerSearch);
  const playerSortColumn = useCrossLeagueStore(s => s.playerSortColumn);
  const playerSortAsc = useCrossLeagueStore(s => s.playerSortAsc);
  const setPlayerSortColumn = useCrossLeagueStore(s => s.setPlayerSortColumn);
  const playerPage = useCrossLeagueStore(s => s.playerPage);
  const setPlayerPage = useCrossLeagueStore(s => s.setPlayerPage);
  const playerPageSize = useCrossLeagueStore(s => s.playerPageSize);
  const setPlayerPageSize = useCrossLeagueStore(s => s.setPlayerPageSize);
  const expandedPlayerIds = useCrossLeagueStore(s => s.expandedPlayerIds);
  const togglePlayerRowExpand = useCrossLeagueStore(s => s.togglePlayerRowExpand);

  const isSeason = mode === "SEASON_ROLLUP";

  const allPlayers = useMemo<any[]>(() => {
    return aggregatePlayers(records, isSeason, week, getPlayerInfo);
  }, [records, isSeason, week]);

  // Positional MVPs
  const mvpSlots = [
    {
      pos: "QB",
      label: "Top QB",
      icon: Target,
      color: "text-rose-400",
      bg: "from-rose-500/20 via-slate-900/90 to-transparent",
      border: "border-rose-500/30"
    },
    {
      pos: "RB",
      label: "Top RB",
      icon: Zap,
      color: "text-cyan-400",
      bg: "from-cyan-500/20 via-slate-900/90 to-transparent",
      border: "border-cyan-500/30"
    },
    {
      pos: "WR",
      label: "Top WR",
      icon: Flame,
      color: "text-emerald-400",
      bg: "from-emerald-500/20 via-slate-900/90 to-transparent",
      border: "border-emerald-500/30"
    },
    {
      pos: "TE",
      label: "Top TE",
      icon: Shield,
      color: "text-amber-400",
      bg: "from-amber-500/20 via-slate-900/90 to-transparent",
      border: "border-amber-500/30"
    },
    {
      pos: "K",
      label: "Top K",
      icon: Footprints,
      color: "text-purple-400",
      bg: "from-purple-500/20 via-slate-900/90 to-transparent",
      border: "border-purple-500/30"
    },
    {
      pos: "DEF",
      label: "Top DEF",
      icon: Castle,
      color: "text-slate-300",
      bg: "from-slate-700/30 via-slate-900/90 to-transparent",
      border: "border-slate-600/40"
    }
  ];

  const positionalMvps = mvpSlots.map(slot => {
    const topPlayer = (allPlayers || [])
      .filter(p => (p.pos || p.position) === slot.pos)
      .sort((a, b) => (b.points || 0) - (a.points || 0))[0];
    return { ...slot, player: topPlayer };
  });

  // Filter and pagination
  const playerData = useMemo(() => {
    const q = playerSearch.toLowerCase().trim();

    let filtered = (allPlayers || []).filter(p => {
      const pos = p.pos || p.position;

      // 1. Position filter
      if (playerPositionFilter === "FLEX") {
        if (!["RB", "WR", "TE"].includes(pos)) return false;
      } else if (playerPositionFilter !== "ALL") {
        if (pos !== playerPositionFilter) return false;
      }

      // 2. Status filter
      if (playerStatusFilter === "STARTERS" && (p.startedCount || 0) === 0) return false;
      if (playerStatusFilter === "BENCH" && (p.benchedCount || 0) === 0) return false;

      // 3. Search query
      if (q) {
        const matchName = (p.name || "").toLowerCase().includes(q);
        const matchTeam = (p.team || "").toLowerCase().includes(q);
        const matchOwner = (p.owners || []).some(
          (o: any) =>
            (o.manager || "").toLowerCase().includes(q) ||
            (o.league || o.leagueName || "").toLowerCase().includes(q)
        );
        if (!matchName && !matchTeam && !matchOwner) return false;
      }
      return true;
    });

    const rankByPlayerId = new Map(
      [...filtered]
        .sort((a, b) => (b.points || 0) - (a.points || 0))
        .map((player, index) => [player.id, index + 1])
    );

    filtered.sort((a, b) => {
      let valA: any = a[playerSortColumn as keyof typeof a];
      let valB: any = b[playerSortColumn as keyof typeof b];

      if (playerSortColumn === "points") {
        valA = a.points || 0;
        valB = b.points || 0;
      } else if (playerSortColumn === "rostered") {
        valA = a.rosteredCount || (a.owners && a.owners.length) || 0;
        valB = b.rosteredCount || (b.owners && b.owners.length) || 0;
      } else if (playerSortColumn === "name") {
        valA = (a.name || "").toLowerCase();
        valB = (b.name || "").toLowerCase();
      }

      if (valA < valB) return playerSortAsc ? -1 : 1;
      if (valA > valB) return playerSortAsc ? 1 : -1;
      return (b.points || 0) - (a.points || 0);
    });

    const count = filtered.length;
    const size =
      playerPageSize === Infinity || playerPageSize >= 10000 ? count || 1 : playerPageSize;
    const pages = Math.ceil(count / size) || 1;
    const clampedPage = Math.max(1, Math.min(playerPage, pages));
    const start = (clampedPage - 1) * size;
    const end = Math.min(start + size, count);
    const paginated = filtered.slice(start, end);

    return {
      paginatedPlayers: paginated,
      totalPages: pages,
      totalCount: count,
      startIdx: count > 0 ? start + 1 : 0,
      endIdx: end,
      rankByPlayerId
    };
  }, [
    allPlayers,
    playerPositionFilter,
    playerStatusFilter,
    playerSearch,
    playerSortColumn,
    playerSortAsc,
    playerPage,
    playerPageSize
  ]);
  const { paginatedPlayers, totalPages, totalCount, startIdx, endIdx, rankByPlayerId } = playerData;

  return (
    <div id="viewPlayers" className="space-y-6 w-full">
      {/* Positional MVP Spotlight Cards */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" /> Top Positional Performers
          </h3>
        </div>
        <div
          id="positionalMvpDeck"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 w-full"
        >
          {positionalMvps.map(slot => {
            const p = slot.player;
            const SlotIcon = slot.icon;
            return (
              <div
                key={slot.pos}
                className={`glass-card rounded-2xl p-4 flex flex-col justify-between border ${slot.border} bg-gradient-to-b ${slot.bg} transition hover:scale-[1.02] duration-200`}
              >
                {p && p.points > 0 ? (
                  <>
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="card-info-wrapper group">
                        <button
                          type="button"
                          className={`card-info-trigger text-xs font-black uppercase tracking-wider ${slot.color} hover:underline flex items-center gap-1 cursor-pointer`}
                          aria-label={`More info about ${slot.label}`}
                          aria-expanded="false"
                        >
                          <span className="flex items-center gap-1">
                            <SlotIcon className="w-3.5 h-3.5" />
                            <span>{slot.label}</span>
                          </span>
                          <Info className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <div className="card-info-popover" role="tooltip">
                          <div className="font-bold text-white text-xs mb-1 flex items-center gap-1">
                            <SlotIcon className="w-3.5 h-3.5" />
                            <span>{slot.label}</span>
                          </div>
                          <div className="text-slate-300 text-[11px] leading-relaxed font-normal">
                            Highest scoring {slot.pos} across all participating leagues for this
                            matchup period.
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {p.team || "FA"}
                      </span>
                    </div>

                    <div className="my-2.5 flex items-center gap-2.5">
                      {p.headshotUrl && (
                        <img
                          src={p.headshotUrl}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700 bg-slate-800 flex-shrink-0"
                          alt=""
                          onError={e => ((e.target as HTMLElement).style.display = "none")}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-black text-sm text-white truncate" title={p.name}>
                          {p.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-semibold truncate">
                          {p.pos || p.position} • {p.startRate || 100}% Started
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-end justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">
                          {isSeason ? "Avg PPG" : "Points"}
                        </div>
                        <div className={`text-xl font-mono font-black ${slot.color}`}>
                          {(p.points || 0).toFixed(2)}
                        </div>
                      </div>
                      {p.owners && p.owners[0] && (
                        <div
                          className="text-[10px] text-slate-400 text-right truncate max-w-[120px]"
                          title={`Rostered by ${p.owners[0].manager} in ${p.owners[0].league || p.owners[0].leagueName}`}
                        >
                          <span className="text-slate-500 block">Top Owner</span>
                          <span className="font-bold text-slate-300 truncate block">
                            {p.owners[0].manager}
                          </span>
                          <span className="text-slate-400 truncate flex items-center justify-end gap-1 text-[10px]">
                            <Trophy className="w-3 h-3 text-amber-400 flex-shrink-0" />
                            <span className="truncate">
                              {p.owners[0].league || p.owners[0].leagueName}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span
                        className={`text-xs font-black uppercase tracking-wider ${slot.color} flex items-center gap-1`}
                      >
                        <SlotIcon className="w-3.5 h-3.5" />
                        <span>{slot.label}</span>
                      </span>
                    </div>
                    <div className="py-6 text-center text-xs text-slate-500 italic">
                      No {slot.pos} data recorded yet.
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Player Leaderboard Section */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-800 space-y-5 w-full">
        {/* Filter & Search Toolbar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          {/* Position Filter Pills */}
          <div className="flex items-center gap-1 sm:gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar touch-scroll max-w-full">
            {["ALL", "QB", "RB", "WR", "TE", "FLEX", "K", "DEF"].map(pos => {
              const active = playerPositionFilter === pos;
              return (
                <button
                  key={pos}
                  type="button"
                  id={`posFilter${pos}`}
                  onClick={() => setPlayerPositionFilter(pos)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer whitespace-nowrap flex-shrink-0 ${
                    active
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {pos}
                </button>
              );
            })}
          </div>

          {/* Search and Roster Filter */}
          <div className="flex flex-wrap items-center gap-3 flex-1 lg:justify-end">
            <div className="relative min-w-[200px] flex-1 sm:flex-initial sm:w-64">
              <input
                type="text"
                id="playerSearchInput"
                placeholder="Search player, team..."
                value={playerSearch}
                onChange={e => setPlayerSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>

            <select
              id="playerStatusFilter"
              value={playerStatusFilter}
              onChange={e => setPlayerStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">
                All Players
              </option>
              <option value="STARTERS" className="bg-slate-900 text-white">
                Starters Only
              </option>
              <option value="BENCH" className="bg-slate-900 text-white">
                Benched Only
              </option>
            </select>
          </div>
        </div>

        {/* Player Table Count & Meta */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-400 px-1">
          <span id="playerRowCount">
            Showing {totalCount} of {allPlayers.length} players across selected leagues
          </span>
          <span className="text-xs text-slate-500 italic">
            Click a player row to see owner breakdown across leagues
          </span>
        </div>

        {/* Player Leaderboard Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left border-collapse" id="playerTable">
            <thead className="bg-slate-900/90 text-slate-400 text-[11px] sm:text-xs md:text-sm font-black uppercase tracking-wider border-b border-slate-800 select-none">
              <tr>
                <th className="py-2.5 sm:py-3.5 px-2 sm:px-4 w-10 sm:w-12 text-center">#</th>
                <th
                  className="py-2.5 sm:py-3.5 px-2 sm:px-4 cursor-pointer hover:text-emerald-400 transition"
                  onClick={() => setPlayerSortColumn("name")}
                >
                  Player
                </th>
                <th className="py-2.5 sm:py-3.5 px-1.5 sm:px-3 text-center">Pos</th>
                <th className="py-2.5 sm:py-3.5 px-1.5 sm:px-3 text-center">Team</th>
                <th
                  className="py-2.5 sm:py-3.5 px-2 sm:px-4 cursor-pointer hover:text-emerald-400 transition"
                  id="thPlayerPoints"
                  onClick={() => setPlayerSortColumn("points")}
                >
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span id="labelPlayerPoints">{isSeason ? "Avg PPG" : "Points"}</span>
                    <span
                      id="sortIconPlayerPoints"
                      className={`text-xs ${playerSortColumn === "points" ? "text-emerald-400" : "text-slate-500"}`}
                    >
                      {playerSortColumn === "points" ? (
                        playerSortAsc ? (
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
                  id="thPlayerRostered"
                  onClick={() => setPlayerSortColumn("rostered")}
                >
                  Start Rate
                </th>
                <th className="py-2.5 sm:py-3.5 px-2 sm:px-4">Managers &amp; Exposure</th>
                <th className="py-2.5 sm:py-3.5 px-1.5 sm:px-3 w-10 sm:w-12 text-center" />
              </tr>
            </thead>
            <tbody
              id="playerTableBody"
              className="divide-y divide-slate-800/60 font-sans text-xs sm:text-sm"
            >
              {paginatedPlayers.map((p, idx) => {
                const isExpanded = expandedPlayerIds.includes(p.id);
                const pos = p.pos || p.position;
                const owners = p.owners || [];
                const rank = rankByPlayerId.get(p.id) || startIdx + idx;
                const visibleOwners = owners.slice(0, 3);
                const remainingOwners = owners.length - visibleOwners.length;
                const startTotal = (p.startedCount || 0) + (p.benchedCount || 0);
                let rankBadge = (
                  <span className="font-black text-slate-400 font-mono text-xs sm:text-base">
                    #{rank}
                  </span>
                );
                if (rank === 1) {
                  rankBadge = (
                    <span className="inline-flex items-center gap-1 font-black text-amber-300 text-xs sm:text-base">
                      <Crown className="w-4 h-4 text-amber-300" /> #1
                    </span>
                  );
                } else if (rank === 2) {
                  rankBadge = (
                    <span className="inline-flex items-center gap-1 font-black text-slate-200 text-xs sm:text-base">
                      <Medal className="w-4 h-4 text-slate-200" /> #2
                    </span>
                  );
                } else if (rank === 3) {
                  rankBadge = (
                    <span className="inline-flex items-center gap-1 font-black text-amber-500 text-xs sm:text-base">
                      <Medal className="w-4 h-4 text-amber-500" /> #3
                    </span>
                  );
                }

                let posBadgeClass = "bg-slate-800 text-slate-300 border-slate-700";
                if (pos === "QB") posBadgeClass = "bg-rose-500/15 text-rose-300 border-rose-500/30";
                else if (pos === "RB")
                  posBadgeClass = "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
                else if (pos === "WR")
                  posBadgeClass = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
                else if (pos === "TE")
                  posBadgeClass = "bg-amber-500/15 text-amber-300 border-amber-500/30";
                else if (pos === "K")
                  posBadgeClass = "bg-purple-500/15 text-purple-300 border-purple-500/30";
                else if (pos === "DEF")
                  posBadgeClass = "bg-slate-700/40 text-slate-300 border-slate-600/40";

                return (
                  <React.Fragment key={p.id}>
                    <tr className="hover:bg-slate-800/60 transition">
                      <td className="py-2.5 sm:py-4 px-2 sm:px-4 text-center">{rankBadge}</td>

                      <td className="py-2.5 sm:py-3.5 px-2 sm:px-4">
                        <div className="flex items-center gap-2.5">
                          {p.headshotUrl && (
                            <img
                              src={p.headshotUrl}
                              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-700 bg-slate-800 flex-shrink-0"
                              alt=""
                              onError={e => ((e.target as HTMLElement).style.display = "none")}
                            />
                          )}
                          <div className="min-w-0">
                            <span className="font-black text-slate-100 text-xs sm:text-sm truncate block">
                              {p.name}
                            </span>
                            <span className="text-[10px] sm:text-xs text-slate-400 font-semibold block">
                              {p.team || "FA"} • {pos}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 sm:py-3.5 px-1.5 sm:px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase font-mono border ${posBadgeClass}`}
                        >
                          {pos}
                        </span>
                      </td>

                      <td className="py-2.5 sm:py-3.5 px-1.5 sm:px-3 text-center font-mono font-bold text-slate-400 text-xs">
                        {p.team || "FA"}
                      </td>

                      <td className="py-2.5 sm:py-3.5 px-2 sm:px-4 text-left">
                        <div className="font-mono text-sm sm:text-lg font-black text-emerald-400">
                          {(p.points || 0).toFixed(2)}{" "}
                          <span className="text-[10px] sm:text-xs font-semibold text-slate-400">
                            {isSeason ? "ppg" : "pts"}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 sm:py-3.5 px-2 sm:px-4 text-center">
                        <div className="inline-block text-left">
                          <div className="text-xs font-mono font-bold text-slate-200">
                            {p.startRate || 0}%{" "}
                            <span className="text-slate-500 font-normal">
                              ({p.startedCount || 0}/{startTotal})
                            </span>
                          </div>
                          <div className="mt-1 w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full"
                              style={{ width: `${Math.min(100, Math.max(0, p.startRate || 0))}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 sm:py-3.5 px-2 sm:px-4">
                        {owners.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1.5 max-w-md">
                            {visibleOwners.map((owner: any, ownerIndex: number) => {
                              const isStarter = owner.isStarter || owner.starts > 0;
                              return (
                                <span
                                  key={`${owner.manager}-${ownerIndex}`}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                    isStarter
                                      ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/30"
                                      : "bg-slate-900 text-slate-300 border-slate-800"
                                  }`}
                                  title={`${owner.manager} • ${owner.league || owner.leagueName}`}
                                >
                                  <span
                                    className={`w-2.5 h-2.5 rounded-full ${
                                      isStarter ? "bg-green-500" : "bg-slate-500"
                                    }`}
                                  />
                                  <span className="truncate max-w-[110px]">{owner.manager}</span>
                                </span>
                              );
                            })}
                            {remainingOwners > 0 && (
                              <span className="text-xs font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                                +{remainingOwners} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">
                            Free Agent / Unrostered
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 sm:py-3.5 px-1.5 sm:px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => togglePlayerRowExpand(p.id)}
                          className="p-1.5 sm:p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition text-[10px] sm:text-xs font-mono font-bold border border-slate-800 cursor-pointer flex items-center justify-center mx-auto"
                          title="Toggle Roster Exposure Breakdown"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable ownership details */}
                    {isExpanded && (
                      <tr className="bg-slate-950/90 border-b border-slate-800">
                        <td colSpan={7} className="p-4 sm:p-5">
                          <div className="glass-card rounded-xl p-4 border border-slate-800/80 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                                <ClipboardList className="w-4 h-4 text-slate-400" />
                                <span>Ownership & Roster Status ({owners.length} Teams)</span>
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                              {owners.map((o: any, oIdx: number) => (
                                <div
                                  key={oIdx}
                                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-bold text-slate-100 truncate">
                                      {o.manager}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-medium truncate flex items-center gap-1 mt-0.5">
                                      <Trophy className="w-3 h-3 text-amber-400 flex-shrink-0" />
                                      <span className="truncate">{o.league || o.leagueName}</span>
                                    </div>
                                  </div>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex-shrink-0 flex items-center gap-1 ${
                                      o.isStarter
                                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                        : "bg-slate-800 text-slate-400 border border-slate-700"
                                    }`}
                                  >
                                    {o.isStarter ? (
                                      <>
                                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                        <span>Started</span>
                                      </>
                                    ) : (
                                      <>
                                        <Armchair className="w-3 h-3 text-slate-400" />
                                        <span>Benched</span>
                                      </>
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginator */}
        <div
          id="playerPaginationFooter"
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800 text-xs sm:text-sm text-slate-400"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700/80">
              <span className="text-slate-400 font-bold text-xs">Show:</span>
              <select
                id="playerPageSizeSelect"
                value={playerPageSize >= 10000 ? "all" : String(playerPageSize)}
                onChange={e =>
                  setPlayerPageSize(e.target.value === "all" ? Infinity : Number(e.target.value))
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
            <span id="playerPageInfoText" className="text-slate-400 font-medium">
              {totalCount === 0
                ? "Showing 0 of 0"
                : `Showing ${startIdx}–${endIdx} of ${totalCount}`}
            </span>
          </div>

          <div
            id="playerPaginationControls"
            className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center sm:justify-end"
          >
            <button
              id="btnPrevPlayerPage"
              type="button"
              disabled={playerPage <= 1 || totalCount === 0}
              onClick={() => setPlayerPage(playerPage - 1)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 hover:text-white border border-slate-700/80 transition font-bold flex items-center gap-1 cursor-pointer text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <div id="playerPageNumberButtons" className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = i + 1;
                const isCurrent = p === playerPage;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlayerPage(p)}
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
              id="btnNextPlayerPage"
              type="button"
              disabled={playerPage >= totalPages || totalCount === 0}
              onClick={() => setPlayerPage(playerPage + 1)}
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

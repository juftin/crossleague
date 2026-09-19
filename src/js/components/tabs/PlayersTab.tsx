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

    const filtered = (allPlayers || []).filter(p => {
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
    <div id="viewPlayers" className="w-full space-y-6">
      {/* Positional MVP Spotlight Cards */}
      <div>
        <div className="mb-3.5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base font-black tracking-wider text-white uppercase sm:text-lg">
            <Sparkles className="h-5 w-5 text-amber-400" /> Top Positional Performers
          </h3>
        </div>
        <div
          id="positionalMvpDeck"
          className="grid w-full grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
        >
          {positionalMvps.map(slot => {
            const p = slot.player;
            const SlotIcon = slot.icon;
            return (
              <div
                key={slot.pos}
                className={`glass-card flex flex-col justify-between rounded-2xl border p-4 ${slot.border} bg-gradient-to-b ${slot.bg} transition duration-200 hover:scale-[1.02]`}
              >
                {p && p.points > 0 ? (
                  <>
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="card-info-wrapper group">
                        <button
                          type="button"
                          className={`card-info-trigger text-xs font-black tracking-wider uppercase ${slot.color} flex cursor-pointer items-center gap-1 hover:underline`}
                          aria-label={`More info about ${slot.label}`}
                          aria-expanded="false"
                        >
                          <span className="flex items-center gap-1">
                            <SlotIcon className="h-3.5 w-3.5" />
                            <span>{slot.label}</span>
                          </span>
                          <Info className="h-3 w-3 opacity-70 transition-opacity group-hover:opacity-100" />
                        </button>
                        <div className="card-info-popover" role="tooltip">
                          <div className="mb-1 flex items-center gap-1 text-xs font-bold text-white">
                            <SlotIcon className="h-3.5 w-3.5" />
                            <span>{slot.label}</span>
                          </div>
                          <div className="text-[11px] leading-relaxed font-normal text-slate-300">
                            Highest scoring {slot.pos} across all participating leagues for this
                            matchup period.
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-400">
                        {p.team || "FA"}
                      </span>
                    </div>

                    <div className="my-2.5 flex items-center gap-2.5">
                      {p.headshotUrl && (
                        <img
                          src={p.headshotUrl}
                          className="h-10 w-10 flex-shrink-0 rounded-full border border-slate-700 bg-slate-800 object-cover"
                          alt=""
                          onError={e => ((e.target as HTMLElement).style.display = "none")}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-black text-white" title={p.name}>
                          {p.name}
                        </div>
                        <div className="truncate text-[11px] font-semibold text-slate-400">
                          {p.pos || p.position} • {p.startRate || 100}% Started
                        </div>
                      </div>
                    </div>

                    <div className="flex items-end justify-between border-t border-white/10 pt-2">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">
                          {isSeason ? "Avg PPG" : "Points"}
                        </div>
                        <div className={`font-mono text-xl font-black ${slot.color}`}>
                          {(p.points || 0).toFixed(2)}
                        </div>
                      </div>
                      {p.owners && p.owners[0] && (
                        <div
                          className="max-w-[120px] truncate text-right text-[10px] text-slate-400"
                          title={`Rostered by ${p.owners[0].manager} in ${p.owners[0].league || p.owners[0].leagueName}`}
                        >
                          <span className="block text-slate-500">Top Owner</span>
                          <span className="block truncate font-bold text-slate-300">
                            {p.owners[0].manager}
                          </span>
                          <span className="flex items-center justify-end gap-1 truncate text-[10px] text-slate-400">
                            <Trophy className="h-3 w-3 flex-shrink-0 text-amber-400" />
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
                        className={`text-xs font-black tracking-wider uppercase ${slot.color} flex items-center gap-1`}
                      >
                        <SlotIcon className="h-3.5 w-3.5" />
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
      <div className="glass-card w-full space-y-5 rounded-2xl border border-slate-800 p-4 sm:p-6">
        {/* Filter & Search Toolbar */}
        <div className="flex flex-col items-stretch justify-between gap-4 border-b border-slate-800/80 pb-4 lg:flex-row lg:items-center">
          {/* Position Filter Pills */}
          <div className="no-scrollbar touch-scroll flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/90 p-1 sm:gap-1.5">
            {["ALL", "QB", "RB", "WR", "TE", "FLEX", "K", "DEF"].map(pos => {
              const active = playerPositionFilter === pos;
              return (
                <button
                  key={pos}
                  type="button"
                  id={`posFilter${pos}`}
                  onClick={() => setPlayerPositionFilter(pos)}
                  className={`flex-shrink-0 cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-black whitespace-nowrap transition sm:px-3 ${
                    active
                      ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {pos}
                </button>
              );
            })}
          </div>

          {/* Search and Roster Filter */}
          <div className="flex flex-1 flex-wrap items-center gap-3 lg:justify-end">
            <div className="relative min-w-[200px] flex-1 sm:w-64 sm:flex-initial">
              <input
                type="text"
                id="playerSearchInput"
                placeholder="Search player, team..."
                value={playerSearch}
                onChange={e => setPlayerSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 py-2 pr-3 pl-9 text-sm text-slate-100 placeholder-slate-500 transition focus:border-emerald-500 focus:outline-none"
              />
              <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
            </div>

            <select
              id="playerStatusFilter"
              value={playerStatusFilter}
              onChange={e => setPlayerStatusFilter(e.target.value)}
              className="cursor-pointer rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-xs font-semibold text-slate-200 focus:border-emerald-500 focus:outline-none sm:text-sm"
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
        <div className="flex items-center justify-between px-1 text-xs text-slate-400 sm:text-sm">
          <span id="playerRowCount">
            Showing {totalCount} of {allPlayers.length} players across selected leagues
          </span>
          <span className="text-xs text-slate-500 italic">
            Click a player row to see owner breakdown across leagues
          </span>
        </div>

        {/* Player Leaderboard Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full border-collapse text-left" id="playerTable">
            <thead className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-black tracking-wider text-slate-400 uppercase select-none sm:text-xs md:text-sm">
              <tr>
                <th className="w-10 px-2 py-2.5 text-center sm:w-12 sm:px-4 sm:py-3.5">#</th>
                <th
                  className="cursor-pointer px-2 py-2.5 transition hover:text-emerald-400 sm:px-4 sm:py-3.5"
                  onClick={() => setPlayerSortColumn("name")}
                >
                  Player
                </th>
                <th className="px-1.5 py-2.5 text-center sm:px-3 sm:py-3.5">Pos</th>
                <th className="px-1.5 py-2.5 text-center sm:px-3 sm:py-3.5">Team</th>
                <th
                  className="cursor-pointer px-2 py-2.5 transition hover:text-emerald-400 sm:px-4 sm:py-3.5"
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
                  id="thPlayerRostered"
                  onClick={() => setPlayerSortColumn("rostered")}
                >
                  Start Rate
                </th>
                <th className="px-2 py-2.5 sm:px-4 sm:py-3.5">Managers &amp; Exposure</th>
                <th className="w-10 px-1.5 py-2.5 text-center sm:w-12 sm:px-3 sm:py-3.5" />
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
                  <span className="font-mono text-xs font-black text-slate-400 sm:text-base">
                    #{rank}
                  </span>
                );
                if (rank === 1) {
                  rankBadge = (
                    <span className="inline-flex items-center gap-1 text-xs font-black text-amber-300 sm:text-base">
                      <Crown className="h-4 w-4 text-amber-300" /> #1
                    </span>
                  );
                } else if (rank === 2) {
                  rankBadge = (
                    <span className="inline-flex items-center gap-1 text-xs font-black text-slate-200 sm:text-base">
                      <Medal className="h-4 w-4 text-slate-200" /> #2
                    </span>
                  );
                } else if (rank === 3) {
                  rankBadge = (
                    <span className="inline-flex items-center gap-1 text-xs font-black text-amber-500 sm:text-base">
                      <Medal className="h-4 w-4 text-amber-500" /> #3
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
                    <tr className="transition hover:bg-slate-800/60">
                      <td className="px-2 py-2.5 text-center sm:px-4 sm:py-4">{rankBadge}</td>

                      <td className="px-2 py-2.5 sm:px-4 sm:py-3.5">
                        <div className="flex items-center gap-2.5">
                          {p.headshotUrl && (
                            <img
                              src={p.headshotUrl}
                              className="h-8 w-8 flex-shrink-0 rounded-full border border-slate-700 bg-slate-800 object-cover sm:h-9 sm:w-9"
                              alt=""
                              onError={e => ((e.target as HTMLElement).style.display = "none")}
                            />
                          )}
                          <div className="min-w-0">
                            <span className="block truncate text-xs font-black text-slate-100 sm:text-sm">
                              {p.name}
                            </span>
                            <span className="block text-[10px] font-semibold text-slate-400 sm:text-xs">
                              {p.team || "FA"} • {pos}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-1.5 py-2.5 text-center sm:px-3 sm:py-3.5">
                        <span
                          className={`inline-block rounded-full border px-2 py-0.5 font-mono text-[10px] font-black uppercase ${posBadgeClass}`}
                        >
                          {pos}
                        </span>
                      </td>

                      <td className="px-1.5 py-2.5 text-center font-mono text-xs font-bold text-slate-400 sm:px-3 sm:py-3.5">
                        {p.team || "FA"}
                      </td>

                      <td className="px-2 py-2.5 text-left sm:px-4 sm:py-3.5">
                        <div className="font-mono text-sm font-black text-emerald-400 sm:text-lg">
                          {(p.points || 0).toFixed(2)}{" "}
                          <span className="text-[10px] font-semibold text-slate-400 sm:text-xs">
                            {isSeason ? "ppg" : "pts"}
                          </span>
                        </div>
                      </td>

                      <td className="px-2 py-2.5 text-center sm:px-4 sm:py-3.5">
                        <div className="inline-block text-left">
                          <div className="font-mono text-xs font-bold text-slate-200">
                            {p.startRate || 0}%{" "}
                            <span className="font-normal text-slate-500">
                              ({p.startedCount || 0}/{startTotal})
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                              style={{ width: `${Math.min(100, Math.max(0, p.startRate || 0))}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-2.5 sm:px-4 sm:py-3.5">
                        {owners.length > 0 ? (
                          <div className="flex max-w-md flex-wrap items-center gap-1.5">
                            {visibleOwners.map((owner: any, ownerIndex: number) => {
                              const isStarter = owner.isStarter || owner.starts > 0;
                              return (
                                <span
                                  key={`${owner.manager}-${ownerIndex}`}
                                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold ${
                                    isStarter
                                      ? "border-emerald-500/30 bg-emerald-950/80 text-emerald-300"
                                      : "border-slate-800 bg-slate-900 text-slate-300"
                                  }`}
                                  title={`${owner.manager} • ${owner.league || owner.leagueName}`}
                                >
                                  <span
                                    className={`h-2.5 w-2.5 rounded-full ${
                                      isStarter ? "bg-green-500" : "bg-slate-500"
                                    }`}
                                  />
                                  <span className="max-w-[110px] truncate">{owner.manager}</span>
                                </span>
                              );
                            })}
                            {remainingOwners > 0 && (
                              <span className="rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 text-xs font-bold text-slate-400">
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

                      <td className="px-1.5 py-2.5 text-center whitespace-nowrap sm:px-3 sm:py-3.5">
                        <button
                          type="button"
                          onClick={() => togglePlayerRowExpand(p.id)}
                          className="mx-auto flex cursor-pointer items-center justify-center rounded-lg border border-slate-800 bg-slate-900 p-1.5 font-mono text-[10px] font-bold text-slate-400 transition hover:bg-slate-800 hover:text-white sm:p-2 sm:text-xs"
                          title="Toggle Roster Exposure Breakdown"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable ownership details */}
                    {isExpanded && (
                      <tr className="border-b border-slate-800 bg-slate-950/90">
                        <td colSpan={7} className="p-4 sm:p-5">
                          <div className="glass-card space-y-3 rounded-xl border border-slate-800/80 p-4">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <span className="flex items-center gap-1.5 text-xs font-black tracking-wider text-slate-300 uppercase">
                                <ClipboardList className="h-4 w-4 text-slate-400" />
                                <span>Ownership & Roster Status ({owners.length} Teams)</span>
                              </span>
                            </div>

                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
                              {owners.map((o: any, oIdx: number) => (
                                <div
                                  key={oIdx}
                                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-2.5"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="truncate text-xs font-bold text-slate-100">
                                      {o.manager}
                                    </div>
                                    <div className="mt-0.5 flex items-center gap-1 truncate text-[10px] font-medium text-slate-400">
                                      <Trophy className="h-3 w-3 flex-shrink-0 text-amber-400" />
                                      <span className="truncate">{o.league || o.leagueName}</span>
                                    </div>
                                  </div>
                                  <span
                                    className={`flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                                      o.isStarter
                                        ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
                                        : "border border-slate-700 bg-slate-800 text-slate-400"
                                    }`}
                                  >
                                    {o.isStarter ? (
                                      <>
                                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                        <span>Started</span>
                                      </>
                                    ) : (
                                      <>
                                        <Armchair className="h-3 w-3 text-slate-400" />
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
          className="flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-3 text-xs text-slate-400 sm:flex-row sm:text-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 py-1.5">
              <span className="text-xs font-bold text-slate-400">Show:</span>
              <select
                id="playerPageSizeSelect"
                value={playerPageSize >= 10000 ? "all" : String(playerPageSize)}
                onChange={e =>
                  setPlayerPageSize(e.target.value === "all" ? Infinity : Number(e.target.value))
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
            <span id="playerPageInfoText" className="font-medium text-slate-400">
              {totalCount === 0
                ? "Showing 0 of 0"
                : `Showing ${startIdx}–${endIdx} of ${totalCount}`}
            </span>
          </div>

          <div
            id="playerPaginationControls"
            className="flex flex-wrap items-center justify-center gap-1 sm:justify-end sm:gap-1.5"
          >
            <button
              id="btnPrevPlayerPage"
              type="button"
              disabled={playerPage <= 1 || totalCount === 0}
              onClick={() => setPlayerPage(playerPage - 1)}
              className="flex cursor-pointer items-center gap-1 rounded-xl border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
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
              id="btnNextPlayerPage"
              type="button"
              disabled={playerPage >= totalPages || totalCount === 0}
              onClick={() => setPlayerPage(playerPage + 1)}
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

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useCrossLeagueStore, useActiveRecords } from "../../state/useCrossLeagueStore.js";
import { getAvatarUrl } from "../../api/sleeper.js";
import {
  Clover,
  Scale,
  HeartCrack,
  Crown,
  Shield,
  Trophy,
  HelpCircle,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export const LuckTab: React.FC = () => {
  const [isAllPlayInfoOpen, setIsAllPlayInfoOpen] = useState(false);
  const allPlayInfoRef = useRef<HTMLDivElement>(null);
  const records = useActiveRecords();
  const luckSearch = useCrossLeagueStore(s => s.luckSearch);
  const setLuckSearch = useCrossLeagueStore(s => s.setLuckSearch);
  const luckCategory = useCrossLeagueStore(s => s.luckCategory);
  const setLuckCategory = useCrossLeagueStore(s => s.setLuckCategory);
  const luckSortColumn = useCrossLeagueStore(s => s.luckSortColumn);
  const luckSortAsc = useCrossLeagueStore(s => s.luckSortAsc);
  const setLuckSortColumn = useCrossLeagueStore(s => s.setLuckSortColumn);
  const luckPage = useCrossLeagueStore(s => s.luckPage);
  const setLuckPage = useCrossLeagueStore(s => s.setLuckPage);
  const luckPageSize = useCrossLeagueStore(s => s.luckPageSize);
  const setLuckPageSize = useCrossLeagueStore(s => s.setLuckPageSize);
  const openLuckModal = useCrossLeagueStore(s => s.openLuckModal);

  // Superlatives
  const sortedByLuckDesc = [...(records || [])].sort(
    (a, b) => (b.luck || (b as any).luckIndex || 0) - (a.luck || (a as any).luckIndex || 0)
  );
  const sortedByLuckAsc = [...(records || [])].sort(
    (a, b) => (a.luck || (a as any).luckIndex || 0) - (b.luck || (b as any).luckIndex || 0)
  );
  const sortedByAllPlay = [...(records || [])].sort(
    (a, b) => (b.allPlayWinPct || 0) - (a.allPlayWinPct || 0)
  );
  const sortedByPA = [...(records || [])].sort(
    (a, b) =>
      ((b as any).pointsAgainst || (b as any).pa || 0) -
      ((a as any).pointsAgainst || (a as any).pa || 0)
  );

  const luckiest = sortedByLuckDesc[0];
  const unluckiest = sortedByLuckAsc[0];
  const allPlayLeader = sortedByAllPlay[0];
  const toughest = sortedByPA[0];

  const { paginatedRecords, totalPages, totalCount, startIdx, endIdx } = useMemo(() => {
    if (!records || records.length === 0) {
      return { paginatedRecords: [], totalPages: 0, totalCount: 0, startIdx: 0, endIdx: 0 };
    }

    const filtered = records.filter(item => {
      const luck = item.luck || (item as any).luckIndex || 0;
      if (luckCategory === "LUCKY" && luck <= 0.5) return false;
      if (luckCategory === "FAIR" && (luck < -0.5 || luck > 0.5)) return false;
      if (luckCategory === "UNLUCKY" && luck >= -0.5) return false;

      if (luckSearch && luckSearch.trim()) {
        const q = luckSearch.toLowerCase().trim();
        const m = (item.manager || "").toLowerCase();
        const t = (item.teamName || "").toLowerCase();
        const l = ((item as any).league || item.leagueName || "").toLowerCase();
        return m.includes(q) || t.includes(q) || l.includes(q);
      }
      return true;
    });

    filtered.sort((a, b) => {
      let valA: any;
      let valB: any;

      if (luckSortColumn === "Rank") {
        valA = a.luck || (a as any).luckIndex || 0;
        valB = b.luck || (b as any).luckIndex || 0;
      } else if (luckSortColumn === "Manager") {
        valA = (a.manager || "").toLowerCase();
        valB = (b.manager || "").toLowerCase();
      } else if (luckSortColumn === "League") {
        valA = ((a as any).league || a.leagueName || "").toLowerCase();
        valB = ((b as any).league || b.leagueName || "").toLowerCase();
      } else if (luckSortColumn === "Actual") {
        valA = typeof a.winPct === "number" ? a.winPct : 0;
        valB = typeof b.winPct === "number" ? b.winPct : 0;
      } else if (luckSortColumn === "AllPlay") {
        valA = a.allPlayWinPct || 0;
        valB = b.allPlayWinPct || 0;
      } else if (luckSortColumn === "Expected") {
        valA = a.expectedWins || 0;
        valB = b.expectedWins || 0;
      } else if (luckSortColumn === "Luck") {
        valA = a.luck || (a as any).luckIndex || 0;
        valB = b.luck || (b as any).luckIndex || 0;
      } else if (luckSortColumn === "PF") {
        valA = a.points || 0;
        valB = b.points || 0;
      } else if (luckSortColumn === "PA") {
        valA = (a as any).pointsAgainst || (a as any).pa || 0;
        valB = (b as any).pointsAgainst || (b as any).pa || 0;
      } else {
        valA = a.luck || (a as any).luckIndex || 0;
        valB = b.luck || (b as any).luckIndex || 0;
      }

      if (valA < valB) return luckSortAsc ? -1 : 1;
      if (valA > valB) return luckSortAsc ? 1 : -1;
      return (b.points || 0) - (a.points || 0);
    });

    const count = filtered.length;
    const size = luckPageSize === Infinity || luckPageSize >= 10000 ? count || 1 : luckPageSize;
    const pages = Math.ceil(count / size) || 1;
    const clampedPage = Math.max(1, Math.min(luckPage, pages));
    const start = (clampedPage - 1) * size;
    const end = Math.min(start + size, count);
    const paginated = filtered.slice(start, end);

    return {
      paginatedRecords: paginated,
      totalPages: pages,
      totalCount: count,
      startIdx: count > 0 ? start + 1 : 0,
      endIdx: end
    };
  }, [records, luckCategory, luckSearch, luckSortColumn, luckSortAsc, luckPage, luckPageSize]);

  const handleSort = (col: string) => {
    setLuckSortColumn(col);
  };

  useEffect(() => {
    if (!isAllPlayInfoOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!allPlayInfoRef.current?.contains(event.target as Node)) {
        setIsAllPlayInfoOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsAllPlayInfoOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAllPlayInfoOpen]);

  return (
    <div id="viewLuck" className="w-full space-y-6">
      {/* Educational / Explanation Hero Card */}
      <div className="glass-card relative space-y-4 overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-slate-900/90 p-5 sm:p-6">
        {/* Card Header Row */}
        <div className="flex flex-col justify-between gap-3 border-b border-slate-800/80 pb-3.5 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2.5">
            <Clover className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-black tracking-wide text-white sm:text-xl">
              Schedule Luck & All-Play Index
            </h3>
            <div ref={allPlayInfoRef} className="card-info-wrapper group relative inline-flex">
              <button
                type="button"
                className="card-info-trigger inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/30"
                aria-describedby="allPlayFormulaInfo"
                aria-expanded={isAllPlayInfoOpen}
                onClick={() => setIsAllPlayInfoOpen(isOpen => !isOpen)}
              >
                All-Play Formula
                <HelpCircle className="h-3 w-3 opacity-70 group-hover:opacity-100" />
              </button>
              <div
                id="allPlayFormulaInfo"
                className={`card-info-popover ${isAllPlayInfoOpen ? "is-open" : ""}`}
                role="tooltip"
              >
                The <strong>Luck Index</strong> measures how much a squad&apos;s win-loss record was
                helped or hindered by their weekly head-to-head schedule draw. Using the{" "}
                <strong>All-Play simulation</strong>, each team&apos;s weekly score is evaluated
                against every other manager in their league to compute true scoring expectation.
              </div>
            </div>
          </div>
          <button
            id="btnOpenLuckModal"
            type="button"
            onClick={openLuckModal}
            className="inline-flex cursor-pointer items-center gap-2 self-start rounded-xl border border-emerald-500/30 bg-slate-950 px-4 py-2 text-xs font-bold text-emerald-400 shadow-sm transition hover:bg-slate-800 hover:text-emerald-300 sm:self-auto sm:text-sm"
            title="View full Luck Index, Expected Wins (xW), and All-Play simulation methodology."
          >
            <HelpCircle className="h-4 w-4 text-emerald-400" />
            <span>Read Full Methodology</span>
          </button>
        </div>

        {/* 3 Legend Tier Cards (Grid) */}
        <div className="grid grid-cols-1 gap-2.5 pt-1 md:grid-cols-3">
          <div
            className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-slate-950/60 p-2.5"
            title="Positive Luck Index (>= +0.50): Won games against opponents who had down scoring weeks."
          >
            <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400"></span>
            <div className="text-xs">
              <strong className="inline-flex items-center gap-1 font-bold text-emerald-300">
                <Clover className="h-3.5 w-3.5" /> &gt; +0.50 (Lucky):
              </strong>{" "}
              <span className="text-slate-400">
                Gained extra wins from favorable schedule matchups
              </span>
            </div>
          </div>
          <div
            className="flex items-start gap-2 rounded-xl border border-slate-700/50 bg-slate-950/60 p-2.5"
            title="Neutral Luck Index (-0.50 to +0.50): Record aligns directly with scoring output."
          >
            <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-slate-400"></span>
            <div className="text-xs">
              <strong className="inline-flex items-center gap-1 font-bold text-slate-300">
                <Scale className="h-3.5 w-3.5" /> -0.50 to +0.50 (Fair):
              </strong>{" "}
              <span className="text-slate-400">
                Win-loss record mirrors true scoring performance
              </span>
            </div>
          </div>
          <div
            className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-slate-950/60 p-2.5"
            title="Negative Luck Index (<= -0.50): Lost games despite putting up strong weekly scores because opponents scored higher."
          >
            <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-rose-400"></span>
            <div className="text-xs">
              <strong className="inline-flex items-center gap-1 font-bold text-rose-300">
                <HeartCrack className="h-3.5 w-3.5" /> &lt; -0.50 (Unlucky):
              </strong>{" "}
              <span className="text-slate-400">Lost matchups despite strong point totals</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Superlative Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Luckiest */}
        <div
          id="luckLuckiestCard"
          className="glass-card glass-card-hover flex flex-col justify-between rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="card-info-wrapper group relative inline-block">
                <button
                  type="button"
                  className="card-info-trigger flex cursor-pointer items-center gap-1.5 text-xs font-black tracking-wider text-emerald-400 uppercase transition hover:text-emerald-300 focus:outline-none"
                  aria-expanded="false"
                >
                  <span className="flex items-center gap-1.5">
                    <Clover className="h-4 w-4" /> Luckiest Squad
                  </span>
                  <HelpCircle className="h-3 w-3 opacity-70 transition-opacity group-hover:opacity-100" />
                </button>
                <div className="card-info-popover" role="tooltip">
                  <div className="text-[11px] leading-relaxed font-normal text-slate-200">
                    Highest positive luck index — gained the most bonus wins above scoring
                    expectation due to favorable opponent matchups.
                  </div>
                </div>
              </div>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-300">
                Lucky Draw
              </span>
            </div>
            <div
              id="statLuckiestVal"
              className="mt-2 font-mono text-3xl font-black text-emerald-300"
            >
              {luckiest
                ? `+${(luckiest.luck || (luckiest as any).luckIndex || 0).toFixed(2)}`
                : "+0.00"}
            </div>
          </div>
          <div className="mt-2 border-t border-emerald-500/20 pt-2">
            <div id="statLuckiestTeam" className="truncate text-sm font-bold text-slate-100">
              {luckiest ? `${luckiest.manager} - ${luckiest.teamName}` : "-"}
            </div>
            <div
              id="statLuckiestLeague"
              className="mt-0.5 flex items-center gap-1 truncate text-xs font-semibold text-emerald-300/90"
              title="League Name"
            >
              <Trophy className="h-3 w-3 flex-shrink-0 text-emerald-400" />
              <span className="truncate">
                {luckiest ? (luckiest as any).league || luckiest.leagueName : "-"}
              </span>
            </div>
            <div id="statLuckiestSub" className="mt-1 text-xs font-medium text-slate-400">
              {luckiest
                ? `${luckiest.wins || 0}W-${luckiest.losses || 0}L (vs ${(luckiest.expectedWins || 0).toFixed(1)} xW)`
                : "-"}
            </div>
          </div>
        </div>

        {/* Unluckiest */}
        <div
          id="luckUnluckiestCard"
          className="glass-card glass-card-hover flex flex-col justify-between rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="card-info-wrapper group relative inline-block">
                <button
                  type="button"
                  className="card-info-trigger flex cursor-pointer items-center gap-1.5 text-xs font-black tracking-wider text-rose-400 uppercase transition hover:text-rose-300 focus:outline-none"
                  aria-expanded="false"
                >
                  <span className="flex items-center gap-1.5">
                    <HeartCrack className="h-4 w-4" /> Unluckiest Squad
                  </span>
                  <HelpCircle className="h-3 w-3 opacity-70 transition-opacity group-hover:opacity-100" />
                </button>
                <div className="card-info-popover" role="tooltip">
                  <div className="text-[11px] leading-relaxed font-normal text-slate-200">
                    Lowest negative luck index — lost the most games below scoring expectation due
                    to high-scoring opponent matchups.
                  </div>
                </div>
              </div>
              <span className="rounded-full border border-rose-500/30 bg-rose-500/20 px-2.5 py-0.5 font-mono text-xs font-bold text-rose-300">
                Tough Schedule
              </span>
            </div>
            <div
              id="statUnluckiestVal"
              className="mt-2 font-mono text-3xl font-black text-rose-400"
            >
              {unluckiest
                ? (unluckiest.luck || (unluckiest as any).luckIndex || 0).toFixed(2)
                : "-0.00"}
            </div>
          </div>
          <div className="mt-2 border-t border-rose-500/20 pt-2">
            <div id="statUnluckiestTeam" className="truncate text-sm font-bold text-slate-100">
              {unluckiest ? `${unluckiest.manager} - ${unluckiest.teamName}` : "-"}
            </div>
            <div
              id="statUnluckiestLeague"
              className="mt-0.5 flex items-center gap-1 truncate text-xs font-semibold text-rose-300/90"
              title="League Name"
            >
              <Trophy className="h-3 w-3 flex-shrink-0 text-rose-400" />
              <span className="truncate">
                {unluckiest ? (unluckiest as any).league || unluckiest.leagueName : "-"}
              </span>
            </div>
            <div id="statUnluckiestSub" className="mt-1 text-xs font-medium text-slate-400">
              {unluckiest
                ? `${unluckiest.wins || 0}W-${unluckiest.losses || 0}L (vs ${(unluckiest.expectedWins || 0).toFixed(1)} xW)`
                : "-"}
            </div>
          </div>
        </div>

        {/* All-Play Leader */}
        <div
          id="luckAllPlayLeaderCard"
          className="glass-card glass-card-hover flex flex-col justify-between rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="card-info-wrapper group relative inline-block">
                <button
                  type="button"
                  className="card-info-trigger flex cursor-pointer items-center gap-1.5 text-xs font-black tracking-wider text-amber-400 uppercase transition hover:text-amber-300 focus:outline-none"
                  aria-expanded="false"
                >
                  <span className="flex items-center gap-1.5">
                    <Crown className="h-4 w-4" /> All-Play Powerhouse
                  </span>
                  <HelpCircle className="h-3 w-3 opacity-70 transition-opacity group-hover:opacity-100" />
                </button>
                <div className="card-info-popover" role="tooltip">
                  <div className="text-[11px] leading-relaxed font-normal text-slate-200">
                    Squad with the highest win percentage when simulated against every other league
                    team every week.
                  </div>
                </div>
              </div>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/20 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-300">
                True Dominance
              </span>
            </div>
            <div
              id="statAllPlayLeaderVal"
              className="mt-2 font-mono text-3xl font-black text-amber-300"
            >
              {allPlayLeader ? `${(allPlayLeader.allPlayWinPct || 0).toFixed(1)}%` : "0%"}
            </div>
          </div>
          <div className="mt-2 border-t border-amber-500/20 pt-2">
            <div id="statAllPlayLeaderTeam" className="truncate text-sm font-bold text-slate-100">
              {allPlayLeader ? `${allPlayLeader.manager} - ${allPlayLeader.teamName}` : "-"}
            </div>
            <div
              id="statAllPlayLeaderLeague"
              className="mt-0.5 flex items-center gap-1 truncate text-xs font-semibold text-amber-300/90"
              title="League Name"
            >
              <Trophy className="h-3 w-3 flex-shrink-0 text-amber-400" />
              <span className="truncate">
                {allPlayLeader ? (allPlayLeader as any).league || allPlayLeader.leagueName : "-"}
              </span>
            </div>
            <div id="statAllPlayLeaderSub" className="mt-1 text-xs font-medium text-slate-400">
              {allPlayLeader
                ? `${allPlayLeader.allPlayWins || 0}W - ${allPlayLeader.allPlayLosses || 0}L All-Play Record`
                : "-"}
            </div>
          </div>
        </div>

        {/* Toughest Opponents */}
        <div
          id="luckToughestCard"
          className="glass-card glass-card-hover flex flex-col justify-between rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-5"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="card-info-wrapper group relative inline-block">
                <button
                  type="button"
                  className="card-info-trigger flex cursor-pointer items-center gap-1.5 text-xs font-black tracking-wider text-indigo-400 uppercase transition hover:text-indigo-300 focus:outline-none"
                  aria-expanded="false"
                >
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-4 w-4" /> Toughest Opponents
                  </span>
                  <HelpCircle className="h-3 w-3 opacity-70 transition-opacity group-hover:opacity-100" />
                </button>
                <div className="card-info-popover popover-right" role="tooltip">
                  <div className="text-[11px] leading-relaxed font-normal text-slate-200">
                    Faced the highest average opponent scoring output (Points Against) across all
                    matchups.
                  </div>
                </div>
              </div>
              <span className="rounded-full border border-indigo-500/30 bg-indigo-500/20 px-2.5 py-0.5 font-mono text-xs font-bold text-indigo-300">
                Heavy Schedule
              </span>
            </div>
            <div
              id="statToughestScheduleVal"
              className="mt-2 font-mono text-3xl font-black text-indigo-300"
            >
              {toughest
                ? ((toughest as any).pointsAgainst || (toughest as any).pa || 0).toFixed(1)
                : "0.0"}
            </div>
          </div>
          <div className="mt-2 border-t border-indigo-500/20 pt-2">
            <div
              id="statToughestScheduleTeam"
              className="truncate text-sm font-bold text-slate-100"
            >
              {toughest ? `${toughest.manager} - ${toughest.teamName}` : "-"}
            </div>
            <div
              id="statToughestScheduleLeague"
              className="mt-0.5 flex items-center gap-1 truncate text-xs font-semibold text-indigo-300/90"
              title="League Name"
            >
              <Trophy className="h-3 w-3 flex-shrink-0 text-indigo-400" />
              <span className="truncate">
                {toughest ? (toughest as any).league || toughest.leagueName : "-"}
              </span>
            </div>
            <div id="statToughestScheduleSub" className="mt-1 text-xs font-medium text-slate-400">
              Points Against Total
            </div>
          </div>
        </div>
      </div>

      {/* Master Luck Table */}
      <div className="glass-card w-full space-y-4 rounded-2xl border border-slate-800 p-4 sm:p-6">
        {/* Toolbar */}
        <div className="flex flex-col items-stretch justify-between gap-3 border-b border-slate-800/80 pb-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:w-80">
            <input
              type="text"
              id="luckSearch"
              placeholder="Search manager, squad, league..."
              value={luckSearch}
              onChange={e => setLuckSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950/90 py-2 pr-4 pl-10 text-sm font-medium text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <Search className="pointer-events-none absolute top-3 left-3.5 h-4 w-4 text-slate-500" />
          </div>
          <div className="flex items-center gap-2">
            <select
              id="luckCategoryFilter"
              value={luckCategory}
              onChange={e => setLuckCategory(e.target.value)}
              className="cursor-pointer rounded-xl border border-slate-700/80 bg-slate-950/90 px-3 py-2 text-xs font-semibold text-white focus:outline-none sm:text-sm"
              title="Filter table by Schedule Luck Tier"
            >
              <option value="ALL">All Luck Tiers</option>
              <option value="LUCKY">Lucky Draws (&gt; +0.50)</option>
              <option value="FAIR">Fair / Neutral (-0.50 to +0.50)</option>
              <option value="UNLUCKY">Unlucky Draws (&lt; -0.50)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between px-1 text-xs text-slate-400 sm:text-sm">
          <span id="luckRowCount">Showing {totalCount} squads</span>
          <span className="text-xs text-slate-500 italic">
            Click column headers to sort by metric
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full border-collapse text-left" id="luckTable">
            <thead className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-black tracking-wider text-slate-400 uppercase select-none sm:text-xs md:text-sm">
              <tr>
                <th
                  className="cursor-pointer px-2 py-2.5 transition hover:text-emerald-400 sm:px-4 sm:py-3.5"
                  onClick={() => handleSort("Rank")}
                  title="Sort by Rank"
                >
                  <div className="flex items-center gap-1">
                    <span>#</span>
                    <span
                      id="sortIconLuckRank"
                      className={`text-xs ${luckSortColumn === "Rank" ? "text-emerald-400" : "text-slate-500"}`}
                    >
                      {luckSortColumn === "Rank" ? (
                        luckSortAsc ? (
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
                  <div className="flex items-center gap-1">
                    <span>MANAGER / SQUAD</span>
                    <span
                      id="sortIconLuckManager"
                      className={`text-xs ${luckSortColumn === "Manager" ? "text-emerald-400" : "text-slate-500"}`}
                    >
                      {luckSortColumn === "Manager" ? (
                        luckSortAsc ? (
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
                  <div className="flex items-center gap-1">
                    <span>LEAGUE</span>
                    <span
                      id="sortIconLuckLeague"
                      className={`text-xs ${luckSortColumn === "League" ? "text-emerald-400" : "text-slate-500"}`}
                    >
                      {luckSortColumn === "League" ? (
                        luckSortAsc ? (
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
                  onClick={() => handleSort("Actual")}
                  title="Sort by Actual Record"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>ACTUAL RECORD</span>
                    <span
                      id="sortIconLuckActual"
                      className={`text-xs ${luckSortColumn === "Actual" ? "text-emerald-400" : "text-slate-500"}`}
                    >
                      {luckSortColumn === "Actual" ? (
                        luckSortAsc ? (
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
                  onClick={() => handleSort("AllPlay")}
                  title="Sort by All-Play Record"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>ALL-PLAY RECORD</span>
                    <span
                      id="sortIconLuckAllPlay"
                      className={`text-xs ${luckSortColumn === "AllPlay" ? "text-emerald-400" : "text-slate-500"}`}
                    >
                      {luckSortColumn === "AllPlay" ? (
                        luckSortAsc ? (
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
                  onClick={() => handleSort("Expected")}
                  title="Sort by Expected Wins"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>EXP. WINS</span>
                    <span
                      id="sortIconLuckExpected"
                      className={`text-xs ${luckSortColumn === "Expected" ? "text-emerald-400" : "text-slate-500"}`}
                    >
                      {luckSortColumn === "Expected" ? (
                        luckSortAsc ? (
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
                  onClick={() => handleSort("Luck")}
                  title="Sort by Luck Index"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>LUCK INDEX</span>
                    <span
                      id="sortIconLuckLuck"
                      className={`text-xs ${luckSortColumn === "Luck" ? "text-emerald-400" : "text-slate-500"}`}
                    >
                      {luckSortColumn === "Luck" ? (
                        luckSortAsc ? (
                          <ChevronUp className="inline h-3 w-3" />
                        ) : (
                          <ChevronDown className="inline h-3 w-3" />
                        )
                      ) : null}
                    </span>
                  </div>
                </th>
                <th
                  className="cursor-pointer px-2 py-2.5 text-right transition hover:text-emerald-400 sm:px-4 sm:py-3.5"
                  onClick={() => handleSort("PF")}
                  title="Sort by Points For"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>PF (PTS)</span>
                    <span
                      id="sortIconLuckPF"
                      className={`text-xs ${luckSortColumn === "PF" ? "text-emerald-400" : "text-slate-500"}`}
                    >
                      {luckSortColumn === "PF" ? (
                        luckSortAsc ? (
                          <ChevronUp className="inline h-3 w-3" />
                        ) : (
                          <ChevronDown className="inline h-3 w-3" />
                        )
                      ) : null}
                    </span>
                  </div>
                </th>
                <th
                  className="cursor-pointer px-2 py-2.5 text-right transition hover:text-emerald-400 sm:px-4 sm:py-3.5"
                  onClick={() => handleSort("PA")}
                  title="Sort by Points Against"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>PA (AGAINST)</span>
                    <span
                      id="sortIconLuckPA"
                      className={`text-xs ${luckSortColumn === "PA" ? "text-emerald-400" : "text-slate-500"}`}
                    >
                      {luckSortColumn === "PA" ? (
                        luckSortAsc ? (
                          <ChevronUp className="inline h-3 w-3" />
                        ) : (
                          <ChevronDown className="inline h-3 w-3" />
                        )
                      ) : null}
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody
              id="luckTableBody"
              className="divide-y divide-slate-800/60 font-sans text-xs sm:text-sm"
            >
              {paginatedRecords.map((team, idx) => {
                const avatarUrl = getAvatarUrl((team as any).avatar || team.managerAvatar);
                const rank = startIdx + idx;
                const luckVal = team.luck || (team as any).luckIndex || 0;
                const expWins = team.expectedWins || 0;
                const allPlayPct = team.allPlayWinPct || 0;
                const paVal = (team as any).pointsAgainst || (team as any).pa || 0;
                const allPlayWins = team.allPlayWins || 0;
                const allPlayLosses = team.allPlayLosses || 0;
                const allPlayTies = team.allPlayTies || 0;
                const opponentName = (team as any).opponentName || "Opp";
                const outcome = (team as any).outcome;
                const actualRecord =
                  outcome === "win"
                    ? "1-0"
                    : outcome === "loss"
                      ? "0-1"
                      : outcome === "tie"
                        ? "0-0-1"
                        : `${(team as any).rawWins ?? (team as any).wins ?? 0}W-${(team as any).rawLosses ?? (team as any).losses ?? 0}L`;
                const actualRecordClass =
                  outcome === "loss"
                    ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                    : outcome === "win"
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      : "bg-slate-800 text-slate-300 border-slate-700";
                const LuckIcon = luckVal >= 0.5 ? Clover : luckVal <= -0.5 ? HeartCrack : Scale;

                const luckBadgeClass =
                  luckVal >= 0.5
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : luckVal <= -0.5
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : "bg-slate-800 text-slate-300 border border-slate-700";
                return (
                  <tr
                    key={team.id || `${team.leagueId}-${team.rosterId}`}
                    className="transition hover:bg-slate-800/60"
                  >
                    <td className="px-2 py-2.5 font-mono font-bold whitespace-nowrap text-slate-400 sm:px-4 sm:py-3.5">
                      #{rank}
                    </td>
                    <td className="px-2 py-2.5 sm:px-4 sm:py-3.5">
                      <div className="flex items-center gap-3">
                        {avatarUrl && (
                          <img
                            src={avatarUrl}
                            className="h-9 w-9 flex-shrink-0 rounded-full border border-slate-700 object-cover"
                            alt=""
                            onError={e => ((e.target as HTMLElement).style.display = "none")}
                          />
                        )}
                        <div className="min-w-0">
                          <div className="truncate font-black text-slate-100" title={team.manager}>
                            {team.manager}
                          </div>
                          <div
                            className="truncate text-[11px] font-semibold text-slate-400"
                            title={team.teamName}
                          >
                            {team.teamName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 sm:px-4 sm:py-3.5">
                      <div className="flex max-w-[200px] items-center gap-1.5 truncate font-medium text-slate-300">
                        <Trophy className="h-3 w-3 flex-shrink-0 text-amber-400" />
                        <span className="truncate">{(team as any).league || team.leagueName}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-center sm:px-4 sm:py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-xs font-black ${actualRecordClass}`}
                      >
                        {outcome === "win" && (
                          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                        )}
                        {actualRecord}
                      </span>
                      <div className="mx-auto mt-0.5 max-w-[120px] truncate text-[11px] font-medium text-slate-400">
                        vs {opponentName}
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-center font-mono sm:px-4 sm:py-3.5">
                      <div className="font-bold text-slate-200">
                        {allPlayWins}W − {allPlayLosses}L
                        {allPlayTies > 0 ? ` − ${allPlayTies}T` : ""}
                      </div>
                      <div className="text-xs font-semibold text-cyan-400">{allPlayPct}% Win</div>
                    </td>
                    <td className="px-2 py-2.5 text-center font-mono font-bold text-slate-300 sm:px-4 sm:py-3.5">
                      {expWins.toFixed(2)}
                    </td>
                    <td className="px-2 py-2.5 text-center sm:px-4 sm:py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-xs font-black ${luckBadgeClass}`}
                      >
                        <LuckIcon className="h-3.5 w-3.5" />
                        {luckVal > 0 ? `+${luckVal.toFixed(2)}` : luckVal.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-right font-mono font-bold text-emerald-400 sm:px-4 sm:py-3.5">
                      {(team.points || 0).toFixed(2)}{" "}
                      <span className="text-xs font-normal text-slate-400">pts</span>
                    </td>
                    <td className="px-2 py-2.5 text-right font-mono font-bold text-slate-300 sm:px-4 sm:py-3.5">
                      {paVal.toFixed(2)}{" "}
                      <span className="text-xs font-normal text-slate-400">pts</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginator */}
        <div
          id="luckPaginationFooter"
          className="flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-3 text-xs text-slate-400 sm:flex-row sm:text-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 py-1.5">
              <span className="text-xs font-bold text-slate-400">Show:</span>
              <select
                id="luckPageSizeSelect"
                value={luckPageSize >= 10000 ? "all" : String(luckPageSize)}
                onChange={e =>
                  setLuckPageSize(e.target.value === "all" ? Infinity : Number(e.target.value))
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
            <span id="luckPageInfoText" className="font-medium text-slate-400">
              {totalCount === 0
                ? "Showing 0 of 0"
                : `Showing ${startIdx}–${endIdx} of ${totalCount}`}
            </span>
          </div>

          <div
            id="luckPaginationControls"
            className="flex flex-wrap items-center justify-center gap-1 sm:justify-end sm:gap-1.5"
          >
            <button
              id="btnPrevLuckPage"
              type="button"
              disabled={luckPage <= 1 || totalCount === 0}
              onClick={() => setLuckPage(luckPage - 1)}
              className="flex cursor-pointer items-center gap-1 rounded-xl border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prev</span>
            </button>

            <div id="luckPageNumberButtons" className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = i + 1;
                const isCurrent = p === luckPage;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setLuckPage(p)}
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
              id="btnNextLuckPage"
              type="button"
              disabled={luckPage >= totalPages || totalCount === 0}
              onClick={() => setLuckPage(luckPage + 1)}
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

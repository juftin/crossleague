import React from "react";
import { Trophy, HeartCrack, Sparkles, Armchair } from "lucide-react";
import { useCrossLeagueStore, useActiveRecords } from "../../state/useCrossLeagueStore.js";
import { computeSuperlatives } from "../../analytics/superlatives.js";
import { Podium } from "../summary/Podium.tsx";
import { SummaryCards } from "../summary/SummaryCards.tsx";

interface CardTitleProps {
  title: string;
  icon?: React.ReactNode;
  infoText: string;
  badgeClasses?: string;
  isRightAligned?: boolean;
}

const CardTitleWithInfo: React.FC<CardTitleProps> = ({
  title,
  icon,
  infoText,
  badgeClasses = "text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 hover:border-slate-700",
  isRightAligned = false
}) => {
  return (
    <div className="card-info-wrapper group">
      <button
        type="button"
        className={`card-info-trigger ${badgeClasses} flex cursor-pointer items-center gap-1.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-emerald-500`}
        aria-label={`More info about ${title}`}
        aria-expanded="false"
      >
        {icon}
        <span>{title}</span>
        <svg
          className="h-3.5 w-3.5 flex-shrink-0 opacity-60 transition-opacity group-hover:opacity-100"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
          <line x1="12" y1="16" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"></line>
          <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2.5" strokeLinecap="round"></line>
        </svg>
      </button>
      <div className={`card-info-popover ${isRightAligned ? "popover-right" : ""}`} role="tooltip">
        <div className="mb-1 flex items-center gap-1 text-xs font-bold text-white">
          {icon}
          <span>{title}</span>
        </div>
        <div className="text-[11px] leading-relaxed font-normal text-slate-300">{infoText}</div>
      </div>
    </div>
  );
};

export const AwardsTab: React.FC = () => {
  const records = useActiveRecords();
  const mode = useCrossLeagueStore(s => s.mode);

  const isSeason = mode === "SEASON_ROLLUP";
  const { badBeat, luckyEscape, benchKing } = computeSuperlatives(records, isSeason) as any;

  return (
    <div id="viewAwards" className="w-full space-y-7">
      {/* THE PODIUM */}
      <div id="podiumSection" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h2 className="text-base font-black tracking-wider text-slate-200 uppercase sm:text-lg">
              The Podium • Heavy Hitters
            </h2>
          </div>
        </div>

        <Podium />
      </div>

      {/* SUPERLATIVES SHOWCASE DECK */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3" id="superlativesGrid">
        {/* 1. The Bad Beat */}
        <div
          id="badBeatCard"
          className={`glass-card glass-card-hover flex flex-col justify-between rounded-2xl border border-rose-500/25 bg-rose-950/20 p-5`}
        >
          {badBeat ? (
            <div className="flex h-full flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-rose-500/20 pb-2.5">
                  <CardTitleWithInfo
                    title={isSeason ? "Season Heartbreak" : "The Bad Beat"}
                    icon={<HeartCrack className="h-3.5 w-3.5 flex-shrink-0 text-rose-400" />}
                    infoText={
                      isSeason
                        ? "Highest scoring squad that suffered a losing overall record."
                        : "Highest scoring squad that still took a loss in their matchup this week."
                    }
                    badgeClasses="text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-full border border-rose-500/30 hover:border-rose-400/70"
                  />
                  <div className="flex-shrink-0 text-right">
                    <span className="font-mono text-lg font-black text-rose-400 sm:text-xl">
                      {isSeason ? (badBeat.points || 0).toFixed(1) : badBeat.points.toFixed(2)}{" "}
                      <span className="text-xs font-semibold text-rose-300/80">
                        {isSeason ? "PPG" : "pts"}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <div
                    className="truncate text-base font-black text-white sm:text-lg"
                    title={badBeat.manager}
                  >
                    {badBeat.manager}
                  </div>
                  <div
                    className="truncate text-xs text-slate-400 sm:text-sm"
                    title={badBeat.teamName}
                  >
                    {badBeat.teamName}
                  </div>
                  <div
                    className="flex items-center gap-1.5 truncate pt-0.5 text-xs font-semibold text-emerald-400/90"
                    title={`League: ${(badBeat as any).league || badBeat.leagueName}`}
                  >
                    <Trophy className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {(badBeat as any).league || badBeat.leagueName}
                    </span>
                  </div>
                </div>
              </div>
              <div className="truncate border-t border-slate-800/80 pt-2.5 text-xs font-semibold text-slate-400">
                {isSeason
                  ? `${badBeat.wins || 0}W-${badBeat.losses || 0}L (${badBeat.winPct || 0}%) • ${((badBeat as any).totalPoints || 0).toFixed(1)} Total PF`
                  : `Lost by ${Math.abs(badBeat.margin || 0).toFixed(2)} to ${badBeat.opponentName || "Rival"}`}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <CardTitleWithInfo
                  title={isSeason ? "Season Heartbreak" : "The Bad Beat"}
                  icon={<HeartCrack className="h-3.5 w-3.5 flex-shrink-0 text-rose-400" />}
                  infoText={
                    isSeason
                      ? "Highest scoring squad that suffered a losing overall record."
                      : "Highest scoring squad that still took a loss in their matchup this week."
                  }
                  badgeClasses="text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 hover:border-slate-700"
                />
              </div>
              <div className="mt-3 text-xs text-slate-500 italic sm:text-sm">
                No completed matchup losses recorded.
              </div>
            </div>
          )}
        </div>

        {/* 2. The Lucky Escape */}
        <div
          id="luckyEscapeCard"
          className={`glass-card glass-card-hover flex flex-col justify-between rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-5`}
        >
          {luckyEscape ? (
            <div className="flex h-full flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-emerald-500/20 pb-2.5">
                  <CardTitleWithInfo
                    title={isSeason ? "Teflon Squad" : "The Lucky Escape"}
                    icon={<Sparkles className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />}
                    infoText={
                      isSeason
                        ? "Lowest scoring squad that maintained a winning record."
                        : "Lowest-scoring squad that managed to win their matchup this week."
                    }
                    badgeClasses="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30 hover:border-emerald-400/70"
                  />
                  <div className="flex-shrink-0 text-right">
                    <span className="font-mono text-lg font-black text-emerald-400 sm:text-xl">
                      {isSeason
                        ? (luckyEscape.points || 0).toFixed(1)
                        : luckyEscape.points.toFixed(2)}{" "}
                      <span className="text-xs font-semibold text-emerald-300/80">
                        {isSeason ? "PPG" : "pts"}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <div
                    className="truncate text-base font-black text-white sm:text-lg"
                    title={luckyEscape.manager}
                  >
                    {luckyEscape.manager}
                  </div>
                  <div
                    className="truncate text-xs text-slate-400 sm:text-sm"
                    title={luckyEscape.teamName}
                  >
                    {luckyEscape.teamName}
                  </div>
                  <div
                    className="flex items-center gap-1.5 truncate pt-0.5 text-xs font-semibold text-emerald-400/90"
                    title={`League: ${(luckyEscape as any).league || luckyEscape.leagueName}`}
                  >
                    <Trophy className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {(luckyEscape as any).league || luckyEscape.leagueName}
                    </span>
                  </div>
                </div>
              </div>
              <div className="truncate border-t border-slate-800/80 pt-2.5 text-xs font-semibold text-slate-400">
                {isSeason
                  ? `${luckyEscape.wins || 0}W-${luckyEscape.losses || 0}L (${luckyEscape.winPct || 0}%)`
                  : `Won by ${Math.abs(luckyEscape.margin || 0).toFixed(2)} vs ${luckyEscape.opponentName || "Rival"}`}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <CardTitleWithInfo
                  title={isSeason ? "Teflon Squad" : "The Lucky Escape"}
                  icon={<Sparkles className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />}
                  infoText={
                    isSeason
                      ? "Lowest scoring squad that maintained a winning record."
                      : "Lowest-scoring squad that managed to win their matchup this week."
                  }
                  badgeClasses="text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 hover:border-slate-700"
                />
              </div>
              <div className="mt-3 text-xs text-slate-500 italic sm:text-sm">
                No completed matchup wins recorded.
              </div>
            </div>
          )}
        </div>

        {/* 3. Bench Heavyweight */}
        <div
          id="benchMvpCard"
          className={`glass-card glass-card-hover flex flex-col justify-between rounded-2xl border border-amber-500/25 bg-amber-950/20 p-5`}
        >
          {benchKing && benchKing.benchPoints > 0 ? (
            <div className="flex h-full flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
                  <CardTitleWithInfo
                    title="Bench Heavyweight"
                    icon={<Armchair className="h-3.5 w-3.5 flex-shrink-0 text-amber-400" />}
                    infoText="Squad with the most bench points left unstarted on their roster."
                    badgeClasses="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-500/30 hover:border-amber-400/70"
                  />
                  <div className="flex-shrink-0 text-right">
                    <span className="font-mono text-lg font-black text-amber-300 sm:text-xl">
                      {benchKing.benchPoints.toFixed(2)}{" "}
                      <span className="text-xs font-semibold text-amber-300/80">pts</span>
                    </span>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <div
                    className="truncate text-base font-black text-white sm:text-lg"
                    title={benchKing.manager}
                  >
                    {benchKing.manager}
                  </div>
                  <div
                    className="truncate text-xs text-slate-400 sm:text-sm"
                    title={benchKing.teamName}
                  >
                    {benchKing.teamName}
                  </div>
                  <div
                    className="flex items-center gap-1.5 truncate pt-0.5 text-xs font-semibold text-emerald-400/90"
                    title={`League: ${(benchKing as any).league || benchKing.leagueName}`}
                  >
                    <Trophy className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {(benchKing as any).league || benchKing.leagueName}
                    </span>
                  </div>
                </div>
              </div>
              <div className="truncate border-t border-slate-800/80 pt-2.5 text-xs font-semibold text-slate-400">
                {benchKing.efficiency ?? 100}% Lineup Efficiency
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <CardTitleWithInfo
                  title="Bench Heavyweight"
                  icon={<Armchair className="h-3.5 w-3.5 flex-shrink-0 text-amber-400" />}
                  infoText="Squad with the most bench points left unstarted on their roster."
                  badgeClasses="text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 hover:border-slate-700"
                />
              </div>
              <div className="mt-3 text-xs text-slate-500 italic sm:text-sm">
                No bench scoring recorded yet.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SUMMARY KPI METRIC CARDS */}
      <SummaryCards />
    </div>
  );
};

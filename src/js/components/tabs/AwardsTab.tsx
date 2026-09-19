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
        className={`card-info-trigger ${badgeClasses} flex items-center gap-1.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer`}
        aria-label={`More info about ${title}`}
        aria-expanded="false"
      >
        {icon}
        <span>{title}</span>
        <svg
          className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0"
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
        <div className="font-bold text-white text-xs mb-1 flex items-center gap-1">
          {icon}
          <span>{title}</span>
        </div>
        <div className="text-slate-300 text-[11px] leading-relaxed font-normal">{infoText}</div>
      </div>
    </div>
  );
};

export const AwardsTab: React.FC = () => {
  const records = useActiveRecords();
  const mode = useCrossLeagueStore((s) => s.mode);

  const isSeason = mode === "SEASON_ROLLUP";
  const { badBeat, luckyEscape, benchKing } = computeSuperlatives(records, isSeason) as any;

  return (
    <div id="viewAwards" className="space-y-7 w-full">
      {/* THE PODIUM */}
      <div id="podiumSection" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-200">
              The Podium • Heavy Hitters
            </h2>
          </div>
        </div>

        <Podium />
      </div>

      {/* SUPERLATIVES SHOWCASE DECK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="superlativesGrid">
        {/* 1. The Bad Beat */}
        <div
          id="badBeatCard"
          className={`glass-card rounded-2xl p-5 border border-rose-500/25 bg-rose-950/20 glass-card-hover flex flex-col justify-between`}
        >
          {badBeat ? (
            <div className="flex flex-col justify-between h-full space-y-3">
              <div>
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-rose-500/20">
                  <CardTitleWithInfo
                    title={isSeason ? "Season Heartbreak" : "The Bad Beat"}
                    icon={<HeartCrack className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />}
                    infoText={
                      isSeason
                        ? "Highest scoring squad across all leagues that suffered a losing overall record."
                        : "Highest scoring squad across all leagues that still took a loss in their matchup this week."
                    }
                    badgeClasses="text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-full border border-rose-500/30 hover:border-rose-400/70"
                  />
                  <div className="text-right flex-shrink-0">
                    <span className="text-lg sm:text-xl font-mono font-black text-rose-400">
                      {isSeason ? (badBeat.points || 0).toFixed(1) : badBeat.points.toFixed(2)}{" "}
                      <span className="text-xs font-semibold text-rose-300/80">
                        {isSeason ? "PPG" : "pts"}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <div
                    className="text-base sm:text-lg font-black text-white truncate"
                    title={badBeat.manager}
                  >
                    {badBeat.manager}
                  </div>
                  <div
                    className="text-xs sm:text-sm text-slate-400 truncate"
                    title={badBeat.teamName}
                  >
                    {badBeat.teamName}
                  </div>
                  <div
                    className="text-xs font-semibold text-emerald-400/90 truncate flex items-center gap-1.5 pt-0.5"
                    title={`League: ${(badBeat as any).league || badBeat.leagueName}`}
                  >
                    <Trophy className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{(badBeat as any).league || badBeat.leagueName}</span>
                  </div>
                </div>
              </div>
              <div className="pt-2.5 border-t border-slate-800/80 text-xs text-slate-400 font-semibold truncate">
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
                  icon={<HeartCrack className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />}
                  infoText={
                    isSeason
                      ? "Highest scoring squad across all leagues that suffered a losing overall record."
                      : "Highest scoring squad across all leagues that still took a loss in their matchup this week."
                  }
                  badgeClasses="text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 hover:border-slate-700"
                />
              </div>
              <div className="text-xs sm:text-sm text-slate-500 italic mt-3">
                No completed matchup losses recorded.
              </div>
            </div>
          )}
        </div>

        {/* 2. The Lucky Escape */}
        <div
          id="luckyEscapeCard"
          className={`glass-card rounded-2xl p-5 border border-emerald-500/25 bg-emerald-950/20 glass-card-hover flex flex-col justify-between`}
        >
          {luckyEscape ? (
            <div className="flex flex-col justify-between h-full space-y-3">
              <div>
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-emerald-500/20">
                  <CardTitleWithInfo
                    title={isSeason ? "Teflon Squad" : "The Lucky Escape"}
                    icon={<Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                    infoText={
                      isSeason
                        ? "Lowest scoring squad across all leagues that maintained a winning record."
                        : "Lowest-scoring squad across all leagues that managed to win their matchup this week."
                    }
                    badgeClasses="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30 hover:border-emerald-400/70"
                  />
                  <div className="text-right flex-shrink-0">
                    <span className="text-lg sm:text-xl font-mono font-black text-emerald-400">
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
                    className="text-base sm:text-lg font-black text-white truncate"
                    title={luckyEscape.manager}
                  >
                    {luckyEscape.manager}
                  </div>
                  <div
                    className="text-xs sm:text-sm text-slate-400 truncate"
                    title={luckyEscape.teamName}
                  >
                    {luckyEscape.teamName}
                  </div>
                  <div
                    className="text-xs font-semibold text-emerald-400/90 truncate flex items-center gap-1.5 pt-0.5"
                    title={`League: ${(luckyEscape as any).league || luckyEscape.leagueName}`}
                  >
                    <Trophy className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {(luckyEscape as any).league || luckyEscape.leagueName}
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-2.5 border-t border-slate-800/80 text-xs text-slate-400 font-semibold truncate">
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
                  icon={<Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                  infoText={
                    isSeason
                      ? "Lowest scoring squad across all leagues that maintained a winning record."
                      : "Lowest-scoring squad across all leagues that managed to win their matchup this week."
                  }
                  badgeClasses="text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 hover:border-slate-700"
                />
              </div>
              <div className="text-xs sm:text-sm text-slate-500 italic mt-3">
                No completed matchup wins recorded.
              </div>
            </div>
          )}
        </div>

        {/* 3. Bench Heavyweight */}
        <div
          id="benchMvpCard"
          className={`glass-card rounded-2xl p-5 border border-amber-500/25 bg-amber-950/20 glass-card-hover flex flex-col justify-between`}
        >
          {benchKing && benchKing.benchPoints > 0 ? (
            <div className="flex flex-col justify-between h-full space-y-3">
              <div>
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-amber-500/20">
                  <CardTitleWithInfo
                    title="Bench Heavyweight"
                    icon={<Armchair className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                    infoText="Squad with the most bench points left unstarted on their roster."
                    badgeClasses="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-500/30 hover:border-amber-400/70"
                  />
                  <div className="text-right flex-shrink-0">
                    <span className="text-lg sm:text-xl font-mono font-black text-amber-300">
                      {benchKing.benchPoints.toFixed(2)}{" "}
                      <span className="text-xs font-semibold text-amber-300/80">pts</span>
                    </span>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <div
                    className="text-base sm:text-lg font-black text-white truncate"
                    title={benchKing.manager}
                  >
                    {benchKing.manager}
                  </div>
                  <div
                    className="text-xs sm:text-sm text-slate-400 truncate"
                    title={benchKing.teamName}
                  >
                    {benchKing.teamName}
                  </div>
                  <div
                    className="text-xs font-semibold text-emerald-400/90 truncate flex items-center gap-1.5 pt-0.5"
                    title={`League: ${(benchKing as any).league || benchKing.leagueName}`}
                  >
                    <Trophy className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {(benchKing as any).league || benchKing.leagueName}
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-2.5 border-t border-slate-800/80 text-xs text-slate-400 font-semibold truncate">
                {benchKing.efficiency ?? 100}% Lineup Efficiency
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <CardTitleWithInfo
                  title="Bench Heavyweight"
                  icon={<Armchair className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                  infoText="Squad with the most bench points left unstarted on their roster."
                  badgeClasses="text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 hover:border-slate-700"
                />
              </div>
              <div className="text-xs sm:text-sm text-slate-500 italic mt-3">
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

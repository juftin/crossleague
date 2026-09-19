import React from "react";
import { useCrossLeagueStore } from "../../state/useCrossLeagueStore.js";
import { Clover, Scale, HeartCrack, X } from "lucide-react";

export const LuckModal: React.FC = () => {
  const isLuckModalOpen = useCrossLeagueStore(s => s.isLuckModalOpen);
  const closeLuckModal = useCrossLeagueStore(s => s.closeLuckModal);

  if (!isLuckModalOpen) return null;

  return (
    <div
      id="luckMethodologyModal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md transition-opacity"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="glass-card relative max-h-[90vh] w-full max-w-2xl space-y-6 overflow-y-auto rounded-2xl border border-slate-700/80 bg-slate-900/95 p-6 text-left shadow-2xl sm:p-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="h-6 w-6 text-emerald-400" />
              <h3 className="text-xl font-black text-white sm:text-2xl">Luck Index Methodology</h3>
            </div>
            <p className="mt-1 text-xs text-slate-400 sm:text-sm">
              How All-Play simulation isolates true roster dominance from schedule luck.
            </p>
          </div>
          <button
            id="btnCloseLuckModal"
            type="button"
            onClick={closeLuckModal}
            className="cursor-pointer rounded-xl border border-slate-700/50 bg-slate-800/60 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close methodology modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body Sections */}
        <div className="space-y-6 text-sm leading-relaxed text-slate-300">
          {/* Section 1: The Schedule Bias Problem */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-base font-bold text-white">
              <span className="text-emerald-400">1.</span> The Head-to-Head Schedule Dilemma
            </h4>
            <p className="text-slate-300">
              In standard fantasy football leagues, a team’s win-loss record is heavily influenced
              by weekly matchup luck rather than pure scoring strength:
            </p>
            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
              <div className="rounded-xl border border-rose-500/20 bg-slate-950/60 p-3 text-xs">
                <span className="mb-1 flex items-center gap-1.5 font-bold text-rose-400">
                  <HeartCrack className="h-3.5 w-3.5" /> Unlucky Matchup
                </span>
                Scoring the <strong>2nd highest points</strong> in the entire league, but taking an
                <strong> 0-1 loss</strong> because you faced the #1 scorer that week.
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-slate-950/60 p-3 text-xs">
                <span className="mb-1 flex items-center gap-1.5 font-bold text-emerald-400">
                  <Clover className="h-3.5 w-3.5" /> Lucky Matchup
                </span>
                Scoring the <strong>2nd lowest points</strong> across the league, but walking away
                with a <strong>1-0 win</strong> against the #12 scorer.
              </div>
            </div>
          </div>

          {/* Section 2: All-Play Simulation */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-base font-bold text-white">
              <span className="text-emerald-400">2.</span> All-Play Simulation
            </h4>
            <p className="text-slate-300">
              To eliminate schedule bias, CrossLeague runs a complete{" "}
              <strong>All-Play simulation</strong> for every completed matchup week. Each team’s
              weekly score is evaluated against all other{" "}
              <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-cyan-300">
                N - 1
              </code>{" "}
              rivals in their league:
            </p>
            <ul className="list-inside list-disc space-y-1 pl-1 text-xs text-slate-300">
              <li>
                <strong>Win (1.0)</strong>: Scored more points than rival
              </li>
              <li>
                <strong>Loss (0.0)</strong>: Scored fewer points than rival
              </li>
              <li>
                <strong>Tie (0.5)</strong>: Scored exactly identical points
              </li>
            </ul>
          </div>

          {/* Section 3: Expected Wins (xW) */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-base font-bold text-white">
              <span className="text-emerald-400">3.</span> Expected Wins (
              <span className="font-mono text-cyan-300">xW</span>)
            </h4>
            <p className="text-slate-300">
              For each week, a team earns a <strong>Weekly Expected Win percentage</strong>:
            </p>
            <div className="rounded-xl border border-cyan-500/30 bg-slate-950/80 p-3 text-center font-mono text-xs text-cyan-300">
              Weekly Expected Win % = (Weekly All-Play Wins) / (Total League Teams - 1)
            </div>
            <p className="text-xs text-slate-400">
              Cumulative{" "}
              <strong>
                Expected Wins (<span className="font-mono text-slate-300">xW</span>)
              </strong>{" "}
              is the sum of these weekly percentages across all completed weeks. This represents how
              many wins a team deserved based solely on their scoring rank each week.
            </p>
          </div>

          {/* Section 4: The Luck Index Formula */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-base font-bold text-white">
              <span className="text-emerald-400">4.</span> Luck Index Formula
            </h4>
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 text-center">
              <div className="font-mono text-base font-black text-emerald-300 sm:text-lg">
                Luck Index = Actual Wins - Expected Wins (xW)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-400">
                Normalized differential between actual head-to-head record and true All-Play scoring
                expectation.
              </div>
            </div>
          </div>

          {/* Section 5: Classification Tiers */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-base font-bold text-white">
              <span className="text-emerald-400">5.</span> How to Interpret Ratings
            </h4>
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-slate-950/50 p-3">
                <Clover className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                <div>
                  <span className="block font-bold text-emerald-300">
                    Positive (&ge; +0.50) • Lucky Draw
                  </span>
                  <span className="text-slate-300">
                    Overperforming expectation. The manager won bonus matchups against opponents on
                    their off-weeks.
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl border border-slate-700/50 bg-slate-950/50 p-3">
                <Scale className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                <div>
                  <span className="block font-bold text-slate-300">
                    Neutral (-0.50 to +0.50) • Fair / True to Form
                  </span>
                  <span className="text-slate-300">
                    Record accurately mirrors roster scoring output. Schedule variance is minimal.
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-slate-950/50 p-3">
                <HeartCrack className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-400" />
                <div>
                  <span className="block font-bold text-rose-300">
                    Negative (&le; -0.50) • Tough Schedule
                  </span>
                  <span className="text-slate-300">
                    Underperforming expectation. The manager lost games despite strong point totals
                    due to high opponent scores (Points Against).
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={closeLuckModal}
            className="cursor-pointer rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 sm:text-sm"
          >
            Got It, Close
          </button>
        </div>
      </div>
    </div>
  );
};

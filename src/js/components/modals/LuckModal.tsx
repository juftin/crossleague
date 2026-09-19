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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="glass-card bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full overflow-y-auto max-h-[90vh] text-left relative space-y-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-6 h-6 text-emerald-400" />
              <h3 className="text-xl sm:text-2xl font-black text-white">Luck Index Methodology</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              How All-Play simulation isolates true roster dominance from schedule luck.
            </p>
          </div>
          <button
            id="btnCloseLuckModal"
            type="button"
            onClick={closeLuckModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition cursor-pointer"
            aria-label="Close methodology modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Sections */}
        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          {/* Section 1: The Schedule Bias Problem */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <span className="text-emerald-400">1.</span> The Head-to-Head Schedule Dilemma
            </h4>
            <p className="text-slate-300">
              In standard fantasy football leagues, a team’s win-loss record is heavily influenced
              by weekly matchup luck rather than pure scoring strength:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-rose-500/20 text-xs">
                <span className="font-bold text-rose-400 flex items-center gap-1.5 mb-1">
                  <HeartCrack className="w-3.5 h-3.5" /> Unlucky Matchup
                </span>
                Scoring the <strong>2nd highest points</strong> in the entire league, but taking an
                <strong> 0-1 loss</strong> because you faced the #1 scorer that week.
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/20 text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                  <Clover className="w-3.5 h-3.5" /> Lucky Matchup
                </span>
                Scoring the <strong>2nd lowest points</strong> across the league, but walking away
                with a <strong>1-0 win</strong> against the #12 scorer.
              </div>
            </div>
          </div>

          {/* Section 2: All-Play Simulation */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <span className="text-emerald-400">2.</span> All-Play Simulation
            </h4>
            <p className="text-slate-300">
              To eliminate schedule bias, CrossLeague runs a complete{" "}
              <strong>All-Play simulation</strong> for every completed matchup week. Each team’s
              weekly score is evaluated against all other{" "}
              <code className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-xs">
                N - 1
              </code>{" "}
              rivals in their league:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 pl-1">
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
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <span className="text-emerald-400">3.</span> Expected Wins (
              <span className="font-mono text-cyan-300">xW</span>)
            </h4>
            <p className="text-slate-300">
              For each week, a team earns a <strong>Weekly Expected Win percentage</strong>:
            </p>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-center font-mono text-xs text-cyan-300">
              Weekly Expected Win % = (Weekly All-Play Wins) / (Total League Teams - 1)
            </div>
            <p className="text-xs text-slate-400">
              Cumulative{" "}
              <strong>
                Expected Wins (<span className="text-slate-300 font-mono">xW</span>)
              </strong>{" "}
              is the sum of these weekly percentages across all completed weeks. This represents how
              many wins a team deserved based solely on their scoring rank each week.
            </p>
          </div>

          {/* Section 4: The Luck Index Formula */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <span className="text-emerald-400">4.</span> Luck Index Formula
            </h4>
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 text-center">
              <div className="font-mono font-black text-base sm:text-lg text-emerald-300">
                Luck Index = Actual Wins - Expected Wins (xW)
              </div>
              <div className="text-xs text-slate-400 mt-1 font-medium">
                Normalized differential between actual head-to-head record and true All-Play scoring
                expectation.
              </div>
            </div>
          </div>

          {/* Section 5: Classification Tiers */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <span className="text-emerald-400">5.</span> How to Interpret Ratings
            </h4>
            <div className="space-y-2 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/50 border border-emerald-500/30 flex items-start gap-2.5">
                <Clover className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-300 block">
                    Positive (&ge; +0.50) • Lucky Draw
                  </span>
                  <span className="text-slate-300">
                    Overperforming expectation. The manager won bonus matchups against opponents on
                    their off-weeks.
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-700/50 flex items-start gap-2.5">
                <Scale className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-300 block">
                    Neutral (-0.50 to +0.50) • Fair / True to Form
                  </span>
                  <span className="text-slate-300">
                    Record accurately mirrors roster scoring output. Schedule variance is minimal.
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/50 border border-rose-500/30 flex items-start gap-2.5">
                <HeartCrack className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-rose-300 block">
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
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={closeLuckModal}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            Got It, Close
          </button>
        </div>
      </div>
    </div>
  );
};

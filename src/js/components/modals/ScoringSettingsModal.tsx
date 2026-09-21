import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ScoringSettingsModalProps {
  /** Whether the warning is visible. */
  isOpen: boolean;
  /** Selected leagues with settings available for comparison. */
  leagues: Array<{ id: string; name: string }>;
  /** Closes the warning for the current league selection. */
  onClose: () => void;
}

/** Warns when selected leagues have different platform-reported scoring settings. */
export const ScoringSettingsModal: React.FC<ScoringSettingsModalProps> = ({
  isOpen,
  leagues,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="scoringSettingsWarningModal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scoringSettingsWarningTitle"
    >
      <div className="glass-card w-full max-w-lg rounded-2xl border border-amber-500/40 bg-slate-900/95 p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-400" />
            <div>
              <h3 id="scoringSettingsWarningTitle" className="text-xl font-black text-white">
                Scoring settings differ
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                The selected leagues do not use identical scoring rules. Raw team and player point
                totals should not be compared as equivalent across these leagues.
              </p>
            </div>
          </div>
          <button
            id="btnCloseScoringSettingsWarning"
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-slate-700/50 bg-slate-800/60 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close scoring settings warning"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-100">
          <span className="font-bold">Compared leagues: </span>
          {leagues.map(league => league.name).join(", ")}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-slate-400">
          All-Play and Luck Index remain valid because they compare each team only with rivals in
          its own league.
        </p>
      </div>
    </div>
  );
};

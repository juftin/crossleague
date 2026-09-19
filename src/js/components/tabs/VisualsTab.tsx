import React, { useEffect, useRef } from "react";
import { BarChart3, Building2, Info } from "lucide-react";
import {
  useCrossLeagueStore,
  useActiveRecords,
  useActiveLeaguesMap
} from "../../state/useCrossLeagueStore.js";
import { renderCharts } from "../charts.js";

export const VisualsTab: React.FC = () => {
  const records = useActiveRecords();
  const activeLeagues = useActiveLeaguesMap();
  const mode = useCrossLeagueStore((s) => s.mode);

  const distCanvasRef = useRef<HTMLCanvasElement>(null);
  const avgCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    renderCharts(records, activeLeagues);
  }, [records, activeLeagues, mode]);

  return (
    <div id="viewVisuals" className="space-y-6 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Score Distribution Histogram */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div>
            <div className="relative inline-block card-info-wrapper group">
              <button
                type="button"
                className="card-info-trigger text-base font-black text-white hover:text-emerald-300 uppercase tracking-wider flex items-center gap-2 focus:outline-none transition cursor-pointer"
                aria-expanded="false"
              >
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <span>Score Distribution</span>
                <Info className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
              </button>
              <div className="card-info-popover" role="tooltip">
                <div className="text-[11px] text-slate-200 leading-relaxed font-normal">
                  Frequency histogram of squad scores grouped into 20-point scoring tiers across all
                  active leagues.
                </div>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Spread of scoring outputs across all active squads
            </p>
          </div>
          <div className="h-80 sm:h-96 relative">
            <canvas id="scoreDistChart" ref={distCanvasRef}></canvas>
          </div>
        </div>

        {/* League Scoring Power */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div>
            <div className="relative inline-block card-info-wrapper group">
              <button
                type="button"
                className="card-info-trigger text-base font-black text-white hover:text-emerald-300 uppercase tracking-wider flex items-center gap-2 focus:outline-none transition cursor-pointer"
                aria-expanded="false"
              >
                <Building2 className="w-5 h-5 text-indigo-400" />
                <span>League Scoring Power</span>
                <Info className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
              </button>
              <div className="card-info-popover" role="tooltip">
                <div className="text-[11px] text-slate-200 leading-relaxed font-normal">
                  Comparing league scoring averages and peak team outputs side-by-side.
                </div>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Comparing league scoring averages and peak team outputs
            </p>
          </div>
          <div className="h-80 sm:h-96 relative">
            <canvas id="leagueAvgChart" ref={avgCanvasRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const mode = useCrossLeagueStore(s => s.mode);
  const theme = useCrossLeagueStore(s => s.theme);

  const distCanvasRef = useRef<HTMLCanvasElement>(null);
  const avgCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    renderCharts(records, activeLeagues, theme);
  }, [records, activeLeagues, mode, theme]);

  return (
    <div id="viewVisuals" className="w-full space-y-6">
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Score Distribution Histogram */}
        <div className="glass-card space-y-4 rounded-2xl border border-slate-800 p-6">
          <div>
            <div className="card-info-wrapper group relative inline-block">
              <button
                type="button"
                className="card-info-trigger flex cursor-pointer items-center gap-2 text-base font-black tracking-wider text-white uppercase transition hover:text-emerald-300 focus:outline-none"
                aria-expanded="false"
              >
                <BarChart3 className="h-5 w-5 text-emerald-400" />
                <span>Score Distribution</span>
                <Info className="h-3.5 w-3.5 opacity-70 transition-opacity group-hover:opacity-100" />
              </button>
              <div className="card-info-popover" role="tooltip">
                <div className="text-[11px] leading-relaxed font-normal text-slate-200">
                  Frequency histogram of squad scores grouped into 20-point scoring tiers across all
                  active leagues.
                </div>
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-400 sm:text-sm">
              Spread of scoring outputs across all active squads
            </p>
          </div>
          <div className="relative h-80 sm:h-96">
            <canvas id="scoreDistChart" ref={distCanvasRef}></canvas>
          </div>
        </div>

        {/* League Scoring Power */}
        <div className="glass-card space-y-4 rounded-2xl border border-slate-800 p-6">
          <div>
            <div className="card-info-wrapper group relative inline-block">
              <button
                type="button"
                className="card-info-trigger flex cursor-pointer items-center gap-2 text-base font-black tracking-wider text-white uppercase transition hover:text-emerald-300 focus:outline-none"
                aria-expanded="false"
              >
                <Building2 className="h-5 w-5 text-indigo-400" />
                <span>League Scoring Power</span>
                <Info className="h-3.5 w-3.5 opacity-70 transition-opacity group-hover:opacity-100" />
              </button>
              <div className="card-info-popover" role="tooltip">
                <div className="text-[11px] leading-relaxed font-normal text-slate-200">
                  Comparing league scoring averages and peak team outputs side-by-side.
                </div>
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-400 sm:text-sm">
              Comparing league scoring averages and peak team outputs
            </p>
          </div>
          <div className="relative h-80 sm:h-96">
            <canvas id="leagueAvgChart" ref={avgCanvasRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

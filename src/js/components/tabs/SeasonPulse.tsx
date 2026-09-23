import React, { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { TrendingUp } from "lucide-react";
import { calculateSeasonPulse } from "../../analytics/seasonPulse.js";
import { useActiveRecords, useCrossLeagueStore } from "../../state/useCrossLeagueStore.js";

/** Show one squad's completed season scores against its league's weekly average. */
export const SeasonPulse: React.FC = () => {
  const records = useActiveRecords();
  const mode = useCrossLeagueStore(s => s.mode);
  const theme = useCrossLeagueStore(s => s.theme);
  const setMode = useCrossLeagueStore(s => s.setMode);
  const [selectedId, setSelectedId] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const rankedRecords = useMemo(
    () => [...records].sort((a, b) => (b.points || 0) - (a.points || 0)),
    [records]
  );
  const selectedRecord = rankedRecords.find(record => record.id === selectedId) || rankedRecords[0];
  const pulse = useMemo(
    () => (selectedRecord ? calculateSeasonPulse(selectedRecord, records) : null),
    [selectedRecord, records]
  );
  const leagueGroups = useMemo(() => {
    const groups = new Map<string, typeof rankedRecords>();
    rankedRecords.forEach(record => {
      const group = groups.get(record.leagueId) || [];
      group.push(record);
      groups.set(record.leagueId, group);
    });
    return [...groups.entries()];
  }, [rankedRecords]);

  useEffect(() => {
    if (selectedId && !rankedRecords.some(record => record.id === selectedId)) {
      setSelectedId(rankedRecords[0]?.id || "");
    }
  }, [rankedRecords, selectedId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (mode !== "SEASON_ROLLUP" || !canvas || !pulse?.weeks.length) return;

    const light = theme === "light";
    const chart = new Chart(canvas, {
      type: "line",
      data: {
        labels: pulse.weeks.map(point => `Week ${point.week}`),
        datasets: [
          {
            label: selectedRecord.teamName || selectedRecord.manager || "Squad",
            data: pulse.weeks.map(point => point.squadPoints),
            borderColor: "#10b981",
            backgroundColor: "#10b981",
            borderWidth: 3,
            pointRadius: 4,
            tension: 0.2,
            spanGaps: false
          },
          {
            label: "League average",
            data: pulse.weeks.map(point => point.leagueAverage),
            borderColor: "#818cf8",
            backgroundColor: "#818cf8",
            borderWidth: 2,
            pointRadius: 3,
            borderDash: [6, 4],
            tension: 0.2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: light ? "#1e293b" : "#cbd5e1" } },
          tooltip: {
            backgroundColor: light ? "#ffffff" : "#0f172a",
            titleColor: light ? "#0f172a" : "#f8fafc",
            bodyColor: light ? "#334155" : "#cbd5e1",
            borderColor: light ? "#cbd5e1" : "#475569",
            borderWidth: 1,
            callbacks: {
              label: context => `${context.dataset.label}: ${context.parsed.y.toFixed(2)} pts`
            }
          }
        },
        scales: {
          x: {
            grid: { color: light ? "rgba(100, 116, 139, 0.2)" : "rgba(255, 255, 255, 0.08)" },
            ticks: { color: light ? "#334155" : "#cbd5e1" }
          },
          y: {
            grid: { color: light ? "rgba(100, 116, 139, 0.2)" : "rgba(255, 255, 255, 0.08)" },
            ticks: { color: light ? "#334155" : "#cbd5e1" }
          }
        }
      }
    });

    return () => chart.destroy();
  }, [mode, pulse, selectedRecord, theme]);

  return (
    <section
      className="glass-card space-y-5 rounded-2xl border border-slate-800 p-6"
      aria-labelledby="seasonPulseTitle"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            id="seasonPulseTitle"
            className="flex items-center gap-2 text-base font-black tracking-wider text-white uppercase"
          >
            <TrendingUp className="h-5 w-5 text-emerald-400" /> Season Pulse
          </h2>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Weekly squad scores compared with the league average
          </p>
        </div>
        {mode === "SEASON_ROLLUP" && rankedRecords.length > 0 && (
          <div className="min-w-0 sm:w-72">
            <label
              htmlFor="seasonPulseSquad"
              className="mb-1 block text-xs font-bold text-slate-400"
            >
              Squad
            </label>
            <select
              id="seasonPulseSquad"
              value={selectedRecord.id}
              onChange={event => setSelectedId(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            >
              {leagueGroups.map(([leagueId, teams]) => (
                <optgroup key={leagueId} label={teams[0].leagueName || teams[0].league || leagueId}>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.manager} — {team.teamName}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        )}
      </div>

      {mode !== "SEASON_ROLLUP" ? (
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5 text-sm text-slate-300">
          <p>Season Pulse uses completed weeks of season data.</p>
          <button
            type="button"
            onClick={() => setMode("SEASON_ROLLUP")}
            className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:outline-none"
          >
            View Season-to-Date
          </button>
        </div>
      ) : !pulse?.weeks.length ? (
        <p className="rounded-xl border border-slate-700 bg-slate-900/60 p-5 text-sm text-slate-400">
          No completed weekly scores are available for the selected leagues.
        </p>
      ) : (
        <>
          <div className="relative h-72 sm:h-80">
            <canvas
              ref={canvasRef}
              aria-label="Weekly squad scores and league average"
              role="img"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-4">
              <div className="text-xs font-bold text-slate-400 uppercase">Best week</div>
              <div className="mt-1 font-mono text-lg font-black text-emerald-400">
                {pulse.bestWeek ? `${pulse.bestWeek.points.toFixed(2)} pts` : "—"}
              </div>
              <div className="text-xs text-slate-400">
                {pulse.bestWeek ? `Week ${pulse.bestWeek.week}` : "No completed score"}
              </div>
            </div>
            <div className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-4">
              <div className="text-xs font-bold text-slate-400 uppercase">Worst week</div>
              <div className="mt-1 font-mono text-lg font-black text-rose-400">
                {pulse.worstWeek ? `${pulse.worstWeek.points.toFixed(2)} pts` : "—"}
              </div>
              <div className="text-xs text-slate-400">
                {pulse.worstWeek ? `Week ${pulse.worstWeek.week}` : "No completed score"}
              </div>
            </div>
            <div className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-4">
              <div className="text-xs font-bold text-slate-400 uppercase">Recent form</div>
              <div className="mt-1 font-mono text-lg font-black text-cyan-400">
                {pulse.recentAverage === null ? "—" : `${pulse.recentAverage.toFixed(2)} PPG`}
              </div>
              <div className="text-xs text-slate-400">
                {pulse.recentDelta === null
                  ? "Available after 3 completed weeks"
                  : `${pulse.recentDelta >= 0 ? "+" : ""}${pulse.recentDelta.toFixed(2)} vs season average`}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

/**
 * CrossLeague • CSV Exporter
 *
 * Exports active league records to CSV format for download.
 */

import { state, getActiveRecords } from "../state/store.js";

/**
 * Exports current active records to a CSV file.
 */
export function exportCsv() {
  const activeRecords = getActiveRecords();
  if (!activeRecords.length) return;
  const sorted = [...activeRecords].sort((a, b) => b.points - a.points);
  const isSeason = state.currentMode === "SEASON_ROLLUP";
  const weekInput = document.getElementById("weekInput");
  const seasonInput = document.getElementById("seasonInput");
  const weekVal = weekInput ? weekInput.value : "1";
  const seasonVal = seasonInput ? seasonInput.value : "2026";

  let headers, rows;
  if (isSeason) {
    headers = [
      "Rank",
      "Avg PPG",
      "Total PF",
      "Points Against",
      "Manager",
      "Team Name",
      "League",
      "League ID",
      "Wins",
      "Losses",
      "Ties",
      "Win %",
      "All-Play Record",
      "All-Play Win %",
      "Expected Wins",
      "Luck Index",
      "Std Dev",
      "Lineup Efficiency %"
    ];
    rows = sorted.map((r, i) => [
      i + 1,
      r.points,
      r.totalPoints || 0,
      r.pointsAgainst || 0,
      `"${(r.manager || "").replace(/"/g, '""')}"`,
      `"${(r.teamName || "").replace(/"/g, '""')}"`,
      `"${(r.league || "").replace(/"/g, '""')}"`,
      r.leagueId,
      r.wins || 0,
      r.losses || 0,
      r.ties || 0,
      `${r.winPct || 0}%`,
      `"${r.allPlayWins || 0}-${r.allPlayLosses || 0}${r.allPlayTies > 0 ? `-${r.allPlayTies}` : ""}"`,
      `${r.allPlayWinPct || 0}%`,
      (r.expectedWins || 0).toFixed(2),
      (r.luckIndex || 0).toFixed(2),
      r.stdDev || 0,
      `${r.efficiency ?? 100}%`
    ]);
  } else {
    headers = [
      "Rank",
      "Points",
      "Points Against",
      "Manager",
      "Team Name",
      "League",
      "League ID",
      "Week",
      "Matchup Result",
      "Opponent",
      "Margin",
      "All-Play Record",
      "Expected Wins",
      "Luck Index",
      "Starters Total",
      "Bench Points",
      "Lineup Efficiency %"
    ];
    rows = sorted.map((r, i) => [
      i + 1,
      r.points,
      r.pointsAgainst || 0,
      `"${(r.manager || "").replace(/"/g, '""')}"`,
      `"${(r.teamName || "").replace(/"/g, '""')}"`,
      `"${(r.league || "").replace(/"/g, '""')}"`,
      r.leagueId,
      r.week,
      r.outcome || "N/A",
      `"${(r.opponentName || "").replace(/"/g, '""')}"`,
      r.margin || 0,
      `"${r.allPlayWins || 0}-${r.allPlayLosses || 0}${r.allPlayTies > 0 ? `-${r.allPlayTies}` : ""}"`,
      (r.expectedWins || 0).toFixed(2),
      (r.luckIndex || 0).toFixed(2),
      r.startersTotal || 0,
      r.benchPoints || 0,
      `${r.efficiency ?? 100}%`
    ]);
  }

  const csvContent =
    "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `crossleague_${state.currentMode.toLowerCase()}_week_${weekVal}_${seasonVal}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

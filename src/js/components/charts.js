/**
 * CrossLeague • Chart.js Visualizations (Score Distribution & League Averages)
 */

import Chart from "chart.js/auto";
import { state, getActiveRecords, getActiveLeaguesMap } from "../state/store.js";

/**
 * Wraps long label strings across multiple lines for compact chart display.
 *
 * @param {string} str Raw text label
 * @param {number} [maxLen] Max length per line
 * @param {number} [maxLines] Max line count
 * @returns {string|Array<string>} Wrapped text line array or string
 */
export function wrapLabel(str, maxLen = 16, maxLines = 3) {
  if (!str) return "";
  const words = str.split(" ");
  const lines = [];
  let currentLine = "";
  for (const word of words) {
    if ((currentLine + (currentLine ? " " : "") + word).length <= maxLen) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      if (currentLine) lines.push(currentLine);
      if (word.length > maxLen) {
        let remaining = word;
        while (remaining.length > maxLen && lines.length < maxLines - 1) {
          lines.push(remaining.slice(0, maxLen));
          remaining = remaining.slice(maxLen);
        }
        currentLine = remaining;
      } else {
        currentLine = word;
      }
    }
    if (lines.length >= maxLines) break;
  }
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }
  return lines.length > 1 ? lines : lines[0] || str;
}

/**
 * Renders both the Score Distribution bar chart and League Averages comparison chart.
 *
 * @param {Array<object>} [records] Records array
 * @param {Record<string, object>} [leagues] Active leagues map
 * @param {"dark"|"light"} [theme="dark"] Active application theme
 */
export function renderCharts(
  records = getActiveRecords(),
  leagues = getActiveLeaguesMap(),
  theme = "dark"
) {
  const distEl = document.getElementById("scoreDistChart");
  const avgEl = document.getElementById("leagueAvgChart");
  if (!distEl || !avgEl) return;
  if (typeof Chart === "undefined") return;

  const isLightTheme = theme === "light";
  const textColor = isLightTheme ? "#1e293b" : "#cbd5e1";
  const gridColor = isLightTheme ? "rgba(100, 116, 139, 0.28)" : "rgba(255, 255, 255, 0.08)";
  const tooltipColors = isLightTheme
    ? {
        backgroundColor: "#ffffff",
        titleColor: "#0f172a",
        bodyColor: "#334155",
        borderColor: "rgba(100, 116, 139, 0.35)"
      }
    : {
        backgroundColor: "#0f172a",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "rgba(255, 255, 255, 0.15)"
      };

  const buckets = {
    "< 80": 0,
    "80 - 100": 0,
    "100 - 120": 0,
    "120 - 140": 0,
    "140 - 160": 0,
    "160+": 0
  };

  (records || []).forEach(r => {
    const pts = r.points || 0;
    if (pts < 80) buckets["< 80"]++;
    else if (pts < 100) buckets["80 - 100"]++;
    else if (pts < 120) buckets["100 - 120"]++;
    else if (pts < 140) buckets["120 - 140"]++;
    else if (pts < 160) buckets["140 - 160"]++;
    else buckets["160+"]++;
  });

  const distCtx = distEl.getContext("2d");
  if (state.scoreDistChartInstance) state.scoreDistChartInstance.destroy();

  state.scoreDistChartInstance = new Chart(distCtx, {
    type: "bar",
    data: {
      labels: Object.keys(buckets),
      datasets: [
        {
          label: "Squads",
          data: Object.values(buckets),
          backgroundColor: [
            "rgba(6, 182, 212, 0.55)",
            "rgba(16, 185, 129, 0.55)",
            "rgba(52, 211, 153, 0.65)",
            "rgba(245, 158, 11, 0.65)",
            "rgba(249, 115, 22, 0.75)",
            "rgba(239, 68, 68, 0.85)"
          ],
          borderColor: ["#06b6d4", "#10b981", "#34d399", "#f59e0b", "#f97316", "#ef4444"],
          borderWidth: 1.5,
          borderRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          ...tooltipColors,
          bodyFont: { size: 13 },
          titleFont: { size: 13, weight: "bold" },
          borderColor: "rgba(255, 255, 255, 0.15)",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            font: { family: "Plus Jakarta Sans", size: 12, weight: "bold" }
          }
        },
        y: {
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            precision: 0,
            font: { family: "Plus Jakarta Sans", size: 12 }
          },
          beginAtZero: true
        }
      }
    }
  });

  const rawLeagueNames = [];
  const leagueLabels = [];
  const leagueAverages = [];
  const leagueHighs = [];

  Object.keys(leagues || {}).forEach(lid => {
    const l = leagues[lid];
    const squadScores = (records || []).filter(r => r.leagueId === lid).map(r => r.points || 0);
    const scores = l && l.scores && l.scores.length > 0 ? l.scores : squadScores;
    if (scores && scores.length > 0) {
      const name = (l && l.name) || `League ${lid}`;
      rawLeagueNames.push(name);
      leagueLabels.push(wrapLabel(name, 16, 3));
      const sum = scores.reduce((a, b) => a + b, 0);
      leagueAverages.push(Math.round((sum / scores.length) * 100) / 100);
      leagueHighs.push(Math.max(...scores));
    }
  });

  const avgCtx = avgEl.getContext("2d");
  if (state.leagueAvgChartInstance) state.leagueAvgChartInstance.destroy();

  state.leagueAvgChartInstance = new Chart(avgCtx, {
    type: "bar",
    data: {
      labels: leagueLabels,
      datasets: [
        {
          label: state.currentMode === "SEASON_ROLLUP" ? "League Avg PPG" : "League Avg",
          data: leagueAverages,
          backgroundColor: "rgba(99, 102, 241, 0.65)",
          borderColor: "#6366f1",
          borderWidth: 1.5,
          borderRadius: 6
        },
        {
          label: "High Score",
          data: leagueHighs,
          backgroundColor: "rgba(16, 185, 129, 0.65)",
          borderColor: "#10b981",
          borderWidth: 1.5,
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: textColor,
            font: { family: "Plus Jakarta Sans", size: 12, weight: "bold" }
          }
        },
        tooltip: {
          ...tooltipColors,
          bodyFont: { size: 13 },
          titleFont: { size: 13, weight: "bold" },
          borderColor: "rgba(255, 255, 255, 0.15)",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            title: function (tooltipItems) {
              const idx = tooltipItems[0].dataIndex;
              return rawLeagueNames[idx] || "";
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            font: { family: "Plus Jakarta Sans", size: 11, weight: "bold" },
            autoSkip: false,
            maxRotation: 0
          }
        },
        y: {
          grid: { color: gridColor },
          ticks: { color: textColor, font: { family: "Plus Jakarta Sans", size: 12 } },
          beginAtZero: true
        }
      }
    }
  });
}

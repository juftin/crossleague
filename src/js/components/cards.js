/**
 * CrossLeague • Summary & Benchmark Statistics Cards
 */

import { getActiveRecords, getActiveLeaguesMap } from "../state/store.js";
import { escapeHtml } from "./dom.js";

/**
 * Renders high-level overview metrics (total squads, total leagues, high/low scores, median, power league).
 *
 * @param {Array<object>} [records] Records array
 * @param {Record<string, object>} [activeLeagues] Active leagues map
 */
export function renderSummaryCards(
  records = getActiveRecords(),
  activeLeagues = getActiveLeaguesMap()
) {
  const totalSquads = records.length;
  const totalActiveLeagues = Object.keys(activeLeagues || {}).length;

  const elLeagues = document.getElementById("statTotalLeagues");
  if (elLeagues) elLeagues.textContent = totalActiveLeagues;

  const elTeams = document.getElementById("statTotalTeams");
  if (elTeams) elTeams.textContent = totalSquads;

  if (totalSquads === 0) {
    if (document.getElementById("statHighScore"))
      document.getElementById("statHighScore").textContent = "0.00";
    if (document.getElementById("statHighTeam"))
      document.getElementById("statHighTeam").textContent = "-";
    if (document.getElementById("statLowScore"))
      document.getElementById("statLowScore").textContent = "0.00";
    if (document.getElementById("statLowTeam"))
      document.getElementById("statLowTeam").textContent = "-";
    if (document.getElementById("statAvgScore"))
      document.getElementById("statAvgScore").textContent = "0.00";
    if (document.getElementById("statMedianScore"))
      document.getElementById("statMedianScore").textContent = "Median: 0.00";
    if (document.getElementById("statTopLeagueAvg"))
      document.getElementById("statTopLeagueAvg").textContent = "0.00";
    if (document.getElementById("statTopLeagueName"))
      document.getElementById("statTopLeagueName").textContent = "-";
    return;
  }

  const sortedByPts = [...records].sort((a, b) => (b.points || 0) - (a.points || 0));
  const topOverall = sortedByPts[0];
  const lowestOverall = sortedByPts[sortedByPts.length - 1];

  if (document.getElementById("statHighScore")) {
    document.getElementById("statHighScore").textContent = topOverall
      ? topOverall.points.toFixed(2)
      : "0.00";
  }
  if (document.getElementById("statHighTeam")) {
    document.getElementById("statHighTeam").textContent = topOverall
      ? `${topOverall.manager} - ${topOverall.teamName}`
      : "-";
    document.getElementById("statHighTeam").title = topOverall
      ? `${topOverall.manager} (${topOverall.teamName})`
      : "";
  }
  if (document.getElementById("statHighLeague")) {
    document.getElementById("statHighLeague").innerHTML = topOverall
      ? `<span class="truncate">${escapeHtml(topOverall.league)}</span>`
      : "-";
    document.getElementById("statHighLeague").title = topOverall
      ? `League: ${topOverall.league}`
      : "";
  }

  if (document.getElementById("statLowScore")) {
    document.getElementById("statLowScore").textContent = lowestOverall
      ? lowestOverall.points.toFixed(2)
      : "0.00";
  }
  if (document.getElementById("statLowTeam")) {
    document.getElementById("statLowTeam").textContent = lowestOverall
      ? `${lowestOverall.manager} - ${lowestOverall.teamName}`
      : "-";
    document.getElementById("statLowTeam").title = lowestOverall
      ? `${lowestOverall.manager} (${lowestOverall.teamName})`
      : "";
  }
  if (document.getElementById("statLowLeague")) {
    document.getElementById("statLowLeague").innerHTML = lowestOverall
      ? `<span class="truncate">${escapeHtml(lowestOverall.league)}</span>`
      : "-";
    document.getElementById("statLowLeague").title = lowestOverall
      ? `League: ${lowestOverall.league}`
      : "";
  }

  const sumPts = records.reduce((acc, r) => acc + (r.points || 0), 0);
  const avgPts = sumPts / totalSquads;
  if (document.getElementById("statAvgScore")) {
    document.getElementById("statAvgScore").textContent = avgPts.toFixed(2);
  }

  const mid = Math.floor(sortedByPts.length / 2);
  const medianPts =
    sortedByPts.length % 2 !== 0
      ? sortedByPts[mid].points
      : ((sortedByPts[mid - 1]?.points || 0) + (sortedByPts[mid]?.points || 0)) / 2;
  if (document.getElementById("statMedianScore")) {
    document.getElementById("statMedianScore").textContent = `Median: ${medianPts.toFixed(2)} pts`;
  }

  // Power League Benchmark
  let topLeagueAvg = 0;
  let topLeagueName = "-";
  const leagues = activeLeagues || getActiveLeaguesMap();
  Object.keys(leagues).forEach(lid => {
    const leagueTeams = records.filter(r => r.leagueId === lid);
    if (leagueTeams.length > 0) {
      const lSum = leagueTeams.reduce((a, b) => a + (b.points || 0), 0);
      const lAvg = lSum / leagueTeams.length;
      if (lAvg > topLeagueAvg) {
        topLeagueAvg = lAvg;
        topLeagueName = leagues[lid].name || `League ${lid}`;
      }
    }
  });
  if (document.getElementById("statTopLeagueAvg")) {
    document.getElementById("statTopLeagueAvg").textContent =
      topLeagueAvg > 0 ? topLeagueAvg.toFixed(2) : "0.00";
  }
  if (document.getElementById("statTopLeagueName")) {
    document.getElementById("statTopLeagueName").innerHTML =
      topLeagueAvg > 0 ? `<span class="truncate">${escapeHtml(topLeagueName)}</span>` : "-";
    document.getElementById("statTopLeagueName").title = topLeagueAvg > 0 ? topLeagueName : "";
  }
}

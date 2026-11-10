/**
 * CrossLeague • Chat Recap Exporter
 *
 * Formats weekly and season recap summaries for Slack/Discord/chat.
 */

import {
  getActiveLeaguesMap,
  getActiveRecords,
  useCrossLeagueStore
} from "../state/useCrossLeagueStore.js";

/** Escapes interpolated values in clipboard HTML. */
function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Formats weekly and season fantasy recaps for Slack/Discord/HTML.
 *
 * @param {Array<object>} records Active records
 * @param {Record<string, object>} activeLeagues Active leagues map
 * @param {object} options Options { isSeason, week, season }
 * @returns {{ plainText: string, htmlText: string }}
 */
export function formatRecapText(records, activeLeagues, options = {}) {
  const isSeason = options.isSeason ?? useCrossLeagueStore.getState().mode === "SEASON_ROLLUP";
  const week = options.week ?? 1;
  const season = options.season ?? "2026";

  const sorted = [...records].sort((a, b) => b.points - a.points);
  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];
  const lowest = sorted[sorted.length - 1];

  const totalLeagues = Object.keys(activeLeagues).length;
  const totalSquads = records.length;

  let topLeagueAvg = 0;
  let topLeagueName = "N/A";
  Object.keys(activeLeagues).forEach(lid => {
    const lTeams = records.filter(r => r.leagueId === lid);
    if (lTeams.length > 0) {
      const avg = lTeams.reduce((a, b) => a + b.points, 0) / lTeams.length;
      if (avg > topLeagueAvg) {
        topLeagueAvg = avg;
        topLeagueName = activeLeagues[lid].name || `League ${lid}`;
      }
    }
  });

  // Cross-league Benchmark Stats
  const totalPointsSum = records.reduce((acc, r) => acc + (r.points || 0), 0);
  const avgScore = totalSquads > 0 ? totalPointsSum / totalSquads : 0;
  const sortedScores = [...records].map(r => r.points || 0).sort((a, b) => a - b);
  const midIdx = Math.floor(sortedScores.length / 2);
  const medianScore =
    sortedScores.length % 2 !== 0
      ? sortedScores[midIdx]
      : (sortedScores[midIdx - 1] + sortedScores[midIdx]) / 2;

  // Superlatives
  let badBeat;
  let luckyEscape;
  if (!isSeason) {
    const losers = records
      .filter(r => r.outcome === "loss" && r.points > 0)
      .sort((a, b) => b.points - a.points);
    badBeat = losers[0];
    const winners = records
      .filter(r => r.outcome === "win" && r.points > 0)
      .sort((a, b) => a.points - b.points);
    luckyEscape = winners[0];
  } else {
    const losingSquads = records
      .filter(r => (r.losses ?? r.rawLosses ?? 0) > (r.wins ?? r.rawWins ?? 0))
      .sort((a, b) => (b.totalPoints || b.points || 0) - (a.totalPoints || a.points || 0));
    badBeat =
      losingSquads[0] ||
      [...records].sort((a, b) => (b.pointsAgainst || 0) - (a.pointsAgainst || 0))[0];
    const winningSquads = records
      .filter(r => (r.wins ?? r.rawWins ?? 0) > (r.losses ?? r.rawLosses ?? 0))
      .sort((a, b) => (a.totalPoints || a.points || 0) - (b.totalPoints || b.points || 0));
    luckyEscape =
      winningSquads[0] ||
      [...records].sort((a, b) => (a.pointsAgainst || 0) - (b.pointsAgainst || 0))[0];
  }

  const sortedBench = records
    .filter(r => (r.benchPoints || 0) > 0)
    .sort((a, b) => b.benchPoints - a.benchPoints);
  const benchKing = sortedBench[0];

  // Schedule Luck & All-Play Leaders
  const sortedByLuckDesc = [...records].sort(
    (a, b) => (b.luckIndex ?? b.luck ?? 0) - (a.luckIndex ?? a.luck ?? 0)
  );
  const luckiest = sortedByLuckDesc[0];
  const sortedByLuckAsc = [...records].sort(
    (a, b) => (a.luckIndex ?? a.luck ?? 0) - (b.luckIndex ?? b.luck ?? 0)
  );
  const unluckiest = sortedByLuckAsc[0];
  const sortedByAllPlay = [...records].sort((a, b) => {
    const pctDiff = (b.allPlayWinPct || 0) - (a.allPlayWinPct || 0);
    if (pctDiff !== 0) return pctDiff;
    const ptsA = typeof a.totalPoints === "number" ? a.totalPoints : a.points || 0;
    const ptsB = typeof b.totalPoints === "number" ? b.totalPoints : b.points || 0;
    return ptsB - ptsA;
  });
  const allPlayLeader = sortedByAllPlay[0];

  const titleText = isSeason
    ? `🏈 Season-to-Date Fantasy Recap (Weeks 1-${week}, ${season})`
    : `🏈 Week ${week} Fantasy Recap (${season})`;

  let plainText;
  let htmlText;

  if (isSeason) {
    plainText = `*${titleText}*\n\n`;
    htmlText = `<p><strong>${escapeHtml(titleText)}</strong></p><br>`;

    plainText += `*The Podium (Avg PPG)*\n`;
    htmlText += `<p><strong><u>The Podium (Avg PPG)</u></strong></p>`;
    if (first) {
      const fWins = first.wins ?? first.rawWins ?? 0;
      const fLosses = first.losses ?? first.rawLosses ?? 0;
      const fLeague = first.league || first.leagueName || "";
      plainText += `• 🥇 *#1* ${first.manager} (${first.teamName}) — *${first.points.toFixed(2)} PPG* (${(first.totalPoints || 0).toFixed(1)} PF, ${fWins}W-${fLosses}L) • _${fLeague}_\n`;
      htmlText += `<p>• 🥇 <strong>#1</strong> ${escapeHtml(first.manager)} (${escapeHtml(first.teamName)}) — <strong>${first.points.toFixed(2)} PPG</strong> (${(first.totalPoints || 0).toFixed(1)} PF, ${fWins}W-${fLosses}L) • <em>${escapeHtml(fLeague)}</em></p>`;
    }
    if (second) {
      const sWins = second.wins ?? second.rawWins ?? 0;
      const sLosses = second.losses ?? second.rawLosses ?? 0;
      const sLeague = second.league || second.leagueName || "";
      plainText += `• 🥈 *#2* ${second.manager} (${second.teamName}) — *${second.points.toFixed(2)} PPG* (${(second.totalPoints || 0).toFixed(1)} PF, ${sWins}W-${sLosses}L) • _${sLeague}_\n`;
      htmlText += `<p>• 🥈 <strong>#2</strong> ${escapeHtml(second.manager)} (${escapeHtml(second.teamName)}) — <strong>${second.points.toFixed(2)} PPG</strong> (${(second.totalPoints || 0).toFixed(1)} PF, ${sWins}W-${sLosses}L) • <em>${escapeHtml(sLeague)}</em></p>`;
    }
    if (third) {
      const tWins = third.wins ?? third.rawWins ?? 0;
      const tLosses = third.losses ?? third.rawLosses ?? 0;
      const tLeague = third.league || third.leagueName || "";
      plainText += `• 🥉 *#3* ${third.manager} (${third.teamName}) — *${third.points.toFixed(2)} PPG* (${(third.totalPoints || 0).toFixed(1)} PF, ${tWins}W-${tLosses}L) • _${tLeague}_\n\n`;
      htmlText += `<p>• 🥉 <strong>#3</strong> ${escapeHtml(third.manager)} (${escapeHtml(third.teamName)}) — <strong>${third.points.toFixed(2)} PPG</strong> (${(third.totalPoints || 0).toFixed(1)} PF, ${tWins}W-${tLosses}L) • <em>${escapeHtml(tLeague)}</em></p><br>`;
    } else {
      plainText += `\n`;
      htmlText += `<br>`;
    }

    plainText += `*Superlatives Showcase*\n`;
    htmlText += `<p><strong><u>Superlatives Showcase</u></strong></p>`;
    if (badBeat) {
      const bbWins = badBeat.wins ?? badBeat.rawWins ?? 0;
      const bbLosses = badBeat.losses ?? badBeat.rawLosses ?? 0;
      const bbLeague = badBeat.league || badBeat.leagueName || "";
      plainText += `• 💔 *Season Heartbreak:* ${badBeat.manager} (${badBeat.teamName}) — *${(badBeat.points || 0).toFixed(1)} PPG* with a ${bbWins}W-${bbLosses}L record • _${bbLeague}_\n`;
      htmlText += `<p>• 💔 <strong>Season Heartbreak:</strong> ${escapeHtml(badBeat.manager)} (${escapeHtml(badBeat.teamName)}) — <strong>${(badBeat.points || 0).toFixed(1)} PPG</strong> with a ${bbWins}W-${bbLosses}L record • <em>${escapeHtml(bbLeague)}</em></p>`;
    }
    if (luckyEscape) {
      const leWins = luckyEscape.wins ?? luckyEscape.rawWins ?? 0;
      const leLosses = luckyEscape.losses ?? luckyEscape.rawLosses ?? 0;
      const leLeague = luckyEscape.league || luckyEscape.leagueName || "";
      plainText += `• 🪄 *Teflon Squad:* ${luckyEscape.manager} (${luckyEscape.teamName}) — *${(luckyEscape.points || 0).toFixed(1)} PPG* with a ${leWins}W-${leLosses}L winning record • _${leLeague}_\n`;
      htmlText += `<p>• 🪄 <strong>Teflon Squad:</strong> ${escapeHtml(luckyEscape.manager)} (${escapeHtml(luckyEscape.teamName)}) — <strong>${(luckyEscape.points || 0).toFixed(1)} PPG</strong> with a ${leWins}W-${leLosses}L winning record • <em>${escapeHtml(leLeague)}</em></p>`;
    }
    if (benchKing && benchKing.benchPoints > 0) {
      const bkLeague = benchKing.league || benchKing.leagueName || "";
      plainText += `• 🪑 *Bench Heavyweight:* ${benchKing.manager} (${benchKing.teamName}) — *${benchKing.benchPoints.toFixed(1)} pts* left on bench (${benchKing.efficiency ?? 100}% Lineup Efficiency) • _${bkLeague}_\n\n`;
      htmlText += `<p>• 🪑 <strong>Bench Heavyweight:</strong> ${escapeHtml(benchKing.manager)} (${escapeHtml(benchKing.teamName)}) — <strong>${benchKing.benchPoints.toFixed(1)} pts</strong> left on bench (${benchKing.efficiency ?? 100}% Lineup Efficiency) • <em>${escapeHtml(bkLeague)}</em></p><br>`;
    } else {
      plainText += `\n`;
      htmlText += `<br>`;
    }

    plainText += `*Schedule Luck & All-Play*\n`;
    htmlText += `<p><strong><u>Schedule Luck & All-Play</u></strong></p>`;
    if (luckiest) {
      const luckVal = luckiest.luckIndex ?? luckiest.luck ?? 0;
      const lWins = luckiest.wins ?? luckiest.rawWins ?? 0;
      const lLeague = luckiest.league || luckiest.leagueName || "";
      const luckStr = `${luckVal >= 0 ? "+" : ""}${luckVal.toFixed(2)}`;
      plainText += `• 🍀 *Luckiest Squad:* ${luckiest.manager} — *${luckStr} Luck Index* (${lWins}W actual vs ${(luckiest.expectedWins || 0).toFixed(2)} xW) • _${lLeague}_\n`;
      htmlText += `<p>• 🍀 <strong>Luckiest Squad:</strong> ${escapeHtml(luckiest.manager)} — <strong>${luckStr} Luck Index</strong> (${lWins}W actual vs ${(luckiest.expectedWins || 0).toFixed(2)} xW) • <em>${escapeHtml(lLeague)}</em></p>`;
    }
    if (unluckiest) {
      const unluckVal = unluckiest.luckIndex ?? unluckiest.luck ?? 0;
      const ulWins = unluckiest.wins ?? unluckiest.rawWins ?? 0;
      const ulLeague = unluckiest.league || unluckiest.leagueName || "";
      const unluckStr = `${unluckVal >= 0 ? "+" : ""}${unluckVal.toFixed(2)}`;
      plainText += `• 💔 *Toughest Schedule:* ${unluckiest.manager} — *${unluckStr} Luck Index* (${ulWins}W actual vs ${(unluckiest.expectedWins || 0).toFixed(2)} xW) • _${ulLeague}_\n`;
      htmlText += `<p>• 💔 <strong>Toughest Schedule:</strong> ${escapeHtml(unluckiest.manager)} — <strong>${unluckStr} Luck Index</strong> (${ulWins}W actual vs ${(unluckiest.expectedWins || 0).toFixed(2)} xW) • <em>${escapeHtml(ulLeague)}</em></p>`;
    }
    if (allPlayLeader) {
      const aplLeague = allPlayLeader.league || allPlayLeader.leagueName || "";
      plainText += `• ⚡ *All-Play Dominance:* ${allPlayLeader.manager} — *${allPlayLeader.allPlayWinPct || 0}% All-Play Win Rate* (${allPlayLeader.allPlayWins || 0}W-${allPlayLeader.allPlayLosses || 0}L) • _${aplLeague}_\n\n`;
      htmlText += `<p>• ⚡ <strong>All-Play Dominance:</strong> ${escapeHtml(allPlayLeader.manager)} — <strong>${allPlayLeader.allPlayWinPct || 0}% All-Play Win Rate</strong> (${allPlayLeader.allPlayWins || 0}W-${allPlayLeader.allPlayLosses || 0}L) • <em>${escapeHtml(aplLeague)}</em></p><br>`;
    } else {
      plainText += `\n`;
      htmlText += `<br>`;
    }

    plainText += `*Overview*\n`;
    htmlText += `<p><strong><u>Overview</u></strong></p>`;
    plainText += `• 👑 *Power League:* ${topLeagueName} (Avg: *${topLeagueAvg.toFixed(2)} PPG*)\n`;
    htmlText += `<p>• 👑 <strong>Power League:</strong> ${escapeHtml(topLeagueName)} (Avg: <strong>${topLeagueAvg.toFixed(2)} PPG</strong>)</p>`;
    if (first && lowest) {
      plainText += `• 🔥 *Peak PPG:* ${first.points.toFixed(2)} (${first.manager}) | ❄️ *Lowest PPG:* ${lowest.points.toFixed(2)} (${lowest.manager})\n`;
      htmlText += `<p>• 🔥 <strong>Peak PPG:</strong> ${first.points.toFixed(2)} (${escapeHtml(first.manager)}) | ❄️ <strong>Lowest PPG:</strong> ${lowest.points.toFixed(2)} (${escapeHtml(lowest.manager)})</p>`;
    }
    plainText += `• 📈 *Benchmark:* Avg: *${avgScore.toFixed(2)} PPG* | Median: *${medianScore.toFixed(2)} PPG*\n`;
    htmlText += `<p>• 📈 <strong>Benchmark:</strong> Avg: <strong>${avgScore.toFixed(2)} PPG</strong> | Median: <strong>${medianScore.toFixed(2)} PPG</strong></p>`;
    plainText += `• 🏟️ *Scope:* ${totalLeagues} Leagues | ${totalSquads} Squads`;
    htmlText += `<p>• 🏟️ <strong>Scope:</strong> ${totalLeagues} Leagues | ${totalSquads} Squads</p>`;
  } else {
    plainText = `*${titleText}*\n\n`;
    htmlText = `<p><strong>${escapeHtml(titleText)}</strong></p><br>`;

    plainText += `*The Podium (Top Scores)*\n`;
    htmlText += `<p><strong><u>The Podium (Top Scores)</u></strong></p>`;
    if (first) {
      plainText += `• 🥇 *#1* ${first.manager} (${first.teamName}) — *${first.points.toFixed(2)} pts* • _${first.league}_\n`;
      htmlText += `<p>• 🥇 <strong>#1</strong> ${escapeHtml(first.manager)} (${escapeHtml(first.teamName)}) — <strong>${first.points.toFixed(2)} pts</strong> • <em>${escapeHtml(first.league)}</em></p>`;
    }
    if (second) {
      plainText += `• 🥈 *#2* ${second.manager} (${second.teamName}) — *${second.points.toFixed(2)} pts* • _${second.league}_\n`;
      htmlText += `<p>• 🥈 <strong>#2</strong> ${escapeHtml(second.manager)} (${escapeHtml(second.teamName)}) — <strong>${second.points.toFixed(2)} pts</strong> • <em>${escapeHtml(second.league)}</em></p>`;
    }
    if (third) {
      plainText += `• 🥉 *#3* ${third.manager} (${third.teamName}) — *${third.points.toFixed(2)} pts* • _${third.league}_\n\n`;
      htmlText += `<p>• 🥉 <strong>#3</strong> ${escapeHtml(third.manager)} (${escapeHtml(third.teamName)}) — <strong>${third.points.toFixed(2)} pts</strong> • <em>${escapeHtml(third.league)}</em></p><br>`;
    } else {
      plainText += `\n`;
      htmlText += `<br>`;
    }

    plainText += `*Superlatives Showcase*\n`;
    htmlText += `<p><strong><u>Superlatives Showcase</u></strong></p>`;
    if (badBeat) {
      plainText += `• 💔 *The Bad Beat:* ${badBeat.manager} (${badBeat.teamName}) scored *${badBeat.points.toFixed(2)} pts* and lost by ${Math.abs(badBeat.margin || 0).toFixed(2)} to ${badBeat.opponentName || "rival"} • _${badBeat.league}_\n`;
      htmlText += `<p>• 💔 <strong>The Bad Beat:</strong> ${escapeHtml(badBeat.manager)} (${escapeHtml(badBeat.teamName)}) scored <strong>${badBeat.points.toFixed(2)} pts</strong> and lost by ${Math.abs(badBeat.margin || 0).toFixed(2)} to ${escapeHtml(badBeat.opponentName || "rival")} • <em>${escapeHtml(badBeat.league)}</em></p>`;
    }
    if (luckyEscape) {
      plainText += `• 🪄 *The Lucky Escape:* ${luckyEscape.manager} (${luckyEscape.teamName}) won with *${luckyEscape.points.toFixed(2)} pts* vs ${luckyEscape.opponentName || "rival"} • _${luckyEscape.league}_\n`;
      htmlText += `<p>• 🪄 <strong>The Lucky Escape:</strong> ${escapeHtml(luckyEscape.manager)} (${escapeHtml(luckyEscape.teamName)}) won with <strong>${luckyEscape.points.toFixed(2)} pts</strong> vs ${escapeHtml(luckyEscape.opponentName || "rival")} • <em>${escapeHtml(luckyEscape.league)}</em></p>`;
    }
    if (benchKing && benchKing.benchPoints > 0) {
      plainText += `• 🪑 *Bench Heavyweight:* ${benchKing.manager} (${benchKing.teamName}) left *${benchKing.benchPoints.toFixed(2)} pts* on bench (${benchKing.efficiency ?? 100}% Lineup Efficiency) • _${benchKing.league}_\n\n`;
      htmlText += `<p>• 🪑 <strong>Bench Heavyweight:</strong> ${escapeHtml(benchKing.manager)} (${escapeHtml(benchKing.teamName)}) left <strong>${benchKing.benchPoints.toFixed(2)} pts</strong> on bench (${benchKing.efficiency ?? 100}% Lineup Efficiency) • <em>${escapeHtml(benchKing.league)}</em></p><br>`;
    } else {
      plainText += `\n`;
      htmlText += `<br>`;
    }

    plainText += `*Schedule Luck & All-Play*\n`;
    htmlText += `<p><strong><u>Schedule Luck & All-Play</u></strong></p>`;
    if (luckiest) {
      const luckStr = `${(luckiest.luckIndex || 0) >= 0 ? "+" : ""}${(luckiest.luckIndex || 0).toFixed(2)}`;
      plainText += `• 🍀 *Luckiest Draw:* ${luckiest.manager} — *${luckStr} Luck Index* (${(luckiest.expectedWins || 0).toFixed(2)} xW) • _${luckiest.league}_\n`;
      htmlText += `<p>• 🍀 <strong>Luckiest Draw:</strong> ${escapeHtml(luckiest.manager)} — <strong>${luckStr} Luck Index</strong> (${(luckiest.expectedWins || 0).toFixed(2)} xW) • <em>${escapeHtml(luckiest.league)}</em></p>`;
    }
    if (unluckiest) {
      const unluckStr = `${(unluckiest.luckIndex || 0) >= 0 ? "+" : ""}${(unluckiest.luckIndex || 0).toFixed(2)}`;
      plainText += `• 💔 *Toughest Draw:* ${unluckiest.manager} — *${unluckStr} Luck Index* (${(unluckiest.expectedWins || 0).toFixed(2)} xW) • _${unluckiest.league}_\n`;
      htmlText += `<p>• 💔 <strong>Toughest Draw:</strong> ${escapeHtml(unluckiest.manager)} — <strong>${unluckStr} Luck Index</strong> (${(unluckiest.expectedWins || 0).toFixed(2)} xW) • <em>${escapeHtml(unluckiest.league)}</em></p>`;
    }
    if (allPlayLeader) {
      plainText += `• ⚡ *All-Play Leader:* ${allPlayLeader.manager} — *${allPlayLeader.allPlayWinPct || 0}% Win Rate* (${allPlayLeader.allPlayWins || 0}W-${allPlayLeader.allPlayLosses || 0}L) • _${allPlayLeader.league}_\n\n`;
      htmlText += `<p>• ⚡ <strong>All-Play Leader:</strong> ${escapeHtml(allPlayLeader.manager)} — <strong>${allPlayLeader.allPlayWinPct || 0}% Win Rate</strong> (${allPlayLeader.allPlayWins || 0}W-${allPlayLeader.allPlayLosses || 0}L) • <em>${escapeHtml(allPlayLeader.league)}</em></p><br>`;
    } else {
      plainText += `\n`;
      htmlText += `<br>`;
    }

    plainText += `*Overview*\n`;
    htmlText += `<p><strong><u>Overview</u></strong></p>`;
    plainText += `• 👑 *Power League:* ${topLeagueName} (Avg: *${topLeagueAvg.toFixed(2)} pts*)\n`;
    htmlText += `<p>• 👑 <strong>Power League:</strong> ${escapeHtml(topLeagueName)} (Avg: <strong>${topLeagueAvg.toFixed(2)} pts</strong>)</p>`;
    if (first && lowest) {
      plainText += `• 🔥 *Peak Score:* ${first.points.toFixed(2)} pts (${first.manager}) | ❄️ *Lowest Score:* ${lowest.points.toFixed(2)} pts (${lowest.manager})\n`;
      htmlText += `<p>• 🔥 <strong>Peak Score:</strong> ${first.points.toFixed(2)} pts (${escapeHtml(first.manager)}) | ❄️ <strong>Lowest Score:</strong> ${lowest.points.toFixed(2)} pts (${escapeHtml(lowest.manager)})</p>`;
    }
    plainText += `• 📈 *Benchmark:* Avg: *${avgScore.toFixed(2)} pts* | Median: *${medianScore.toFixed(2)} pts* | Spread: *${(first.points - lowest.points).toFixed(2)} pts*\n`;
    htmlText += `<p>• 📈 <strong>Benchmark:</strong> Avg: <strong>${avgScore.toFixed(2)} pts</strong> | Median: <strong>${medianScore.toFixed(2)} pts</strong> | Spread: <strong>${(first.points - lowest.points).toFixed(2)} pts</strong></p>`;
    plainText += `• 🏟️ *Scope:* ${totalLeagues} Leagues | ${totalSquads} Squads`;
    htmlText += `<p>• 🏟️ <strong>Scope:</strong> ${totalLeagues} Leagues | ${totalSquads} Squads</p>`;
  }

  return { plainText, htmlText };
}

/**
 * Fallback clipboard copy via textarea element.
 *
 * @param {string} text Text to copy
 */
export function fallbackCopyText(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  let copied = false;
  try {
    document.execCommand("copy");
    copied = true;
  } catch (err) {
    console.error("Fallback copy failed:", err);
    console.error("Could not copy to clipboard. Please copy manually from the table.");
  }
  document.body.removeChild(textArea);
  return copied;
}

/**
 * One-Click Copy Chat Recap formatted for Slack mrkdwn and HTML clipboard.
 */
export async function copyChatRecap() {
  const activeRecords = getActiveRecords();
  if (!activeRecords || activeRecords.length === 0) {
    console.warn("No data available to generate chat recap.");
    return false;
  }

  const { mode, week, season } = useCrossLeagueStore.getState();
  const isSeason = mode === "SEASON_ROLLUP";
  const activeLeagues = getActiveLeaguesMap();

  const { plainText, htmlText } = formatRecapText(activeRecords, activeLeagues, {
    isSeason,
    week,
    season: String(season)
  });

  try {
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard && navigator.clipboard.write) {
      const item = new ClipboardItem({
        "text/html": new Blob([htmlText], { type: "text/html" }),
        "text/plain": new Blob([plainText], { type: "text/plain" })
      });
      await navigator.clipboard.write([item]);
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(plainText);
    } else {
      return fallbackCopyText(plainText);
    }
    return true;
  } catch (err) {
    console.warn("ClipboardItem write failed, fallback to plain text:", err);
    return fallbackCopyText(plainText);
  }
}

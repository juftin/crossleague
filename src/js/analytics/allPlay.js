/**
 * CrossLeague • All-Play & Expected Wins (xW) Analytics
 *
 * Simulates head-to-head records against every other manager in the same league
 * for a given week or across the entire season.
 */

/**
 * Calculates all-play record, win percentage, and expected wins for a team score
 * relative to all team scores in the league.
 *
 * @param {number} teamScore Score achieved by the team
 * @param {Array<number>} allScores Array of all team scores in the league
 * @returns {{ wins: number, losses: number, ties: number, xw: number, winPct: number }} All-play stats
 */
export function calculateAllPlay(teamScore, allScores) {
  let wins = 0;
  let losses = 0;
  let ties = 0;
  let matchedSelf = false;

  allScores.forEach(s => {
    if (s === teamScore && !matchedSelf) {
      matchedSelf = true;
      return;
    }
    if (teamScore > s) wins++;
    else if (teamScore < s) losses++;
    else ties++;
  });

  const totalOpponents = Math.max(0, allScores.length - 1);
  const xw = totalOpponents > 0 ? (wins + ties * 0.5) / totalOpponents : 0;
  const totalGames = wins + losses + ties;
  const winPct = totalGames > 0 ? Math.round(((wins + ties * 0.5) / totalGames) * 1000) / 10 : 0;

  return { wins, losses, ties, xw, winPct };
}

/**
 * Tiebreaker sorting comparator for all-play rankings:
 * 1. Higher allPlayWinPct wins.
 * 2. Higher total points / points wins tiebreaker.
 *
 * @param {object} a Team record A
 * @param {object} b Team record B
 * @returns {number} Sorting direction
 */
export function allPlayTiebreaker(a, b) {
  const pctDiff = (b.allPlayWinPct || 0) - (a.allPlayWinPct || 0);
  if (pctDiff !== 0) return pctDiff;
  const ptsA = typeof a.totalPoints === "number" ? a.totalPoints : a.points || 0;
  const ptsB = typeof b.totalPoints === "number" ? b.totalPoints : b.points || 0;
  return ptsB - ptsA;
}

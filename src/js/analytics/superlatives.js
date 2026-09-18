/**
 * CrossLeague • Superlatives & Podium Engine
 *
 * Computes top performing squads (Podium #1, #2, #3), Bad Beat heartbreak losers,
 * Lucky Escape winners, and Bench Heavyweight roster mismanagement leaders.
 */

/**
 * Computes top 3 podium finishers sorted by points scored descending.
 *
 * @param {Array<object>} records List of team records
 * @returns {Array<object>} Top 3 squads
 */
export function computePodium(records = []) {
  if (!records || records.length === 0) return [];
  const sorted = [...records].sort((a, b) => (b.points || 0) - (a.points || 0));
  return sorted.slice(0, 3);
}

/**
 * Computes superlatives (Bad Beat, Lucky Escape, Bench Heavyweight) from records.
 *
 * @param {Array<object>} records Team records
 * @param {boolean} isSeason Whether evaluating season rollup
 * @returns {{ badBeat: object|null, luckyEscape: object|null, benchKing: object|null }} Superlative winners
 */
export function computeSuperlatives(records = [], isSeason = false) {
  if (!records || records.length === 0) {
    return { badBeat: null, luckyEscape: null, benchKing: null };
  }

  let badBeat = null;
  let luckyEscape = null;

  if (!isSeason) {
    // Single Week Mode
    const losers = records
      .filter(r => r.outcome === "loss" && (r.points || 0) > 0)
      .sort((a, b) => (b.points || 0) - (a.points || 0));
    badBeat = losers[0] || null;

    const winners = records
      .filter(r => r.outcome === "win" && (r.points || 0) > 0)
      .sort((a, b) => (a.points || 0) - (b.points || 0));
    luckyEscape = winners[0] || null;
  } else {
    // Season Rollup Mode
    const losingSquads = records
      .filter(r => (r.losses || 0) > (r.wins || 0))
      .sort((a, b) => (b.totalPoints || b.points || 0) - (a.totalPoints || a.points || 0));
    badBeat =
      losingSquads[0] ||
      [...records].sort((a, b) => (b.pointsAgainst || 0) - (a.pointsAgainst || 0))[0] ||
      null;

    const winningSquads = records
      .filter(r => (r.wins || 0) > (r.losses || 0))
      .sort((a, b) => (a.totalPoints || a.points || 0) - (b.totalPoints || b.points || 0));
    luckyEscape =
      winningSquads[0] ||
      [...records].sort((a, b) => (a.pointsAgainst || 0) - (b.pointsAgainst || 0))[0] ||
      null;
  }

  const sortedBench = records
    .filter(r => (r.benchPoints || 0) > 0)
    .sort((a, b) => (b.benchPoints || 0) - (a.benchPoints || 0));
  const benchKing = sortedBench[0] || null;

  return { badBeat, luckyEscape, benchKing };
}

export { computeSuperlatives as calculateSuperlatives };

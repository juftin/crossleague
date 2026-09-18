/**
 * CrossLeague • Statistical Rollup & Distribution Calculations
 *
 * Provides statistical utilities including sample standard deviation,
 * arithmetic mean, median, and cross-league scoring aggregations.
 */

/**
 * Calculates sample standard deviation (N-1 degrees of freedom) for a series of scores.
 *
 * @param {Array<number>} scores Array of numeric scores
 * @returns {number} Standard deviation rounded to 1 decimal place
 */
export function calculateStdDev(scores) {
  if (!scores || scores.length < 2) return 0;
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance =
    scores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (scores.length - 1);
  return Math.round(Math.sqrt(variance) * 10) / 10;
}

/**
 * Calculates arithmetic mean of a numeric array.
 *
 * @param {Array<number>} numbers Array of numbers
 * @returns {number} Mean average
 */
export function calculateMean(numbers) {
  if (!numbers || numbers.length === 0) return 0;
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

/**
 * Calculates median score of a numeric array.
 *
 * @param {Array<number>} numbers Array of numbers
 * @returns {number} Median value
 */
export function calculateMedian(numbers) {
  if (!numbers || numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Aggregates average score per league across a set of team records.
 *
 * @param {Array<object>} records Team records
 * @param {Record<string, object>} leaguesMap Map of league metadata
 * @returns {Array<{ leagueId: string, name: string, avgScore: number, teamsCount: number }>} League scoring averages
 */
export function calculateLeagueAverages(records = [], leaguesMap = {}) {
  const result = [];
  const groups = {};

  records.forEach(r => {
    if (!groups[r.leagueId]) groups[r.leagueId] = [];
    groups[r.leagueId].push(r.points || 0);
  });

  Object.keys(groups).forEach(lid => {
    const scores = groups[lid];
    const avg = calculateMean(scores);
    const leagueName = leaguesMap[lid]?.name || `League ${lid}`;
    result.push({
      leagueId: lid,
      name: leagueName,
      avgScore: Math.round(avg * 100) / 100,
      teamsCount: scores.length
    });
  });

  return result.sort((a, b) => b.avgScore - a.avgScore);
}

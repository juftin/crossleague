/**
 * CrossLeague • Lineup Efficiency & Bench Optimization
 *
 * Evaluates managerial coaching decision effectiveness by measuring actual starters score
 * versus optimal hypothetical score from all rostered players.
 */

/**
 * Calculates managerial lineup efficiency percentage.
 *
 * @param {number} startersTotal Actual points scored by the starting lineup
 * @param {number} optimalTotal Optimal maximum points possible given roster composition
 * @returns {number} Efficiency percentage (e.g., 94.2)
 */
export function calculateLineupEfficiency(startersTotal, optimalTotal) {
  const actual = Number(startersTotal || 0);
  const optimal = Number(optimalTotal || 0);
  if (optimal <= 0) return 100;
  return Math.round((actual / optimal) * 1000) / 10;
}

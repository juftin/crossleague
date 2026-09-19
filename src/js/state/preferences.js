/**
 * Shared NFL-season helpers for the React dashboard.
 */

import { useCrossLeagueStore } from "./useCrossLeagueStore.js";

/**
 * Returns the final selectable matchup week for the current dashboard season.
 *
 * @returns {number} Week number between 1 and 18.
 */
export function getMaxPlayedWeek() {
  const { nflState, season } = useCrossLeagueStore.getState();

  if (season < nflState.season) return 18;
  if (season > nflState.season || nflState.season_type === "pre") return 1;
  if (nflState.season_type === "post") return 18;

  return Math.max(1, Math.min(18, nflState.display_week || nflState.week || 1));
}

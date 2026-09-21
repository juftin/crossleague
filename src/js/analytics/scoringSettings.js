/**
 * CrossLeague • League Scoring Settings Comparison
 *
 * Detects whether selected leagues use the same platform-provided scoring rules.
 */

/**
 * Serializes a scoring-settings value with object keys in a stable order.
 *
 * @param {unknown} value Platform-provided scoring settings.
 * @returns {string} Stable settings signature.
 */
export function stableSettingsSignature(value) {
  if (Array.isArray(value)) return `[${value.map(stableSettingsSignature).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map(key => `${JSON.stringify(key)}:${stableSettingsSignature(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

/**
 * Compares scoring rules for the currently selected leagues.
 *
 * Leagues without scoring settings are excluded because the application cannot
 * make a reliable comparison for them.
 *
 * @param {Record<string, {scoringSettings?: unknown}>} leaguesMap League metadata.
 * @param {string[]} selectedLeagueIds Active league IDs.
 * @returns {{hasMismatch: boolean, leagues: Array<{id: string, name: string}>, signature: string}}
 * Comparison result and a selection-sensitive signature for dismissal tracking.
 */
export function compareScoringSettings(leaguesMap = {}, selectedLeagueIds = []) {
  const leagues = selectedLeagueIds
    .map(id => leaguesMap[id])
    .filter(league => league?.scoringSettings && Object.keys(league.scoringSettings).length > 0)
    .map(league => ({
      id: String(league.id),
      name: league.name || `League ${league.id}`,
      settingsSignature: stableSettingsSignature(league.scoringSettings)
    }));
  const signatures = new Set(leagues.map(league => league.settingsSignature));
  const signature = leagues
    .map(league => `${league.id}:${league.settingsSignature}`)
    .sort()
    .join("|");

  return {
    hasMismatch: leagues.length > 1 && signatures.size > 1,
    leagues: leagues.map(({ id, name }) => ({ id, name })),
    signature
  };
}

/**
 * CrossLeague • URL Query Parameters & League ID Parser
 *
 * Extracts query parameters from the window URL and parses multi-format league IDs
 * (comma, space, newline, semicolon separated).
 */

/**
 * Extracts and cleans numeric league IDs from a raw string input.
 *
 * @param {string} rawStr Input text (may contain multiple IDs, URLs, hashes)
 * @returns {Array<string>} Unique numeric league ID strings
 */
export function extractCustomLeagueIds(rawStr) {
  if (!rawStr) return [];
  const parts = rawStr
    .split(/[\s,;\n\t]+/)
    .map(s => {
      let cleaned = s.trim().replace(/^#/, "");
      const urlMatch = cleaned.match(/leagueId=(\d+)/i);
      if (urlMatch) {
        cleaned = urlMatch[1];
      }
      return cleaned;
    })
    .filter(s => s.length > 0 && /^\d+$/.test(s));

  return Array.from(new Set(parts));
}

/**
 * Parses URL search parameters into a structured configuration object.
 *
 * @param {string} [searchStr] Optional query string (defaults to window.location.search)
 * @returns {{ platform: string|null, user: string|null, season: string|null, week: string|null, mode: string|null, leagues: string|null }} Parsed parameters
 */
export function getUrlParams(searchStr) {
  const params =
    typeof searchStr === "string"
      ? new URLSearchParams(searchStr)
      : typeof window !== "undefined" && window.location
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams("");

  const platform = params.get("platform") || params.get("plat") || params.get("p");
  const user =
    params.get("user") || params.get("u") || params.get("username") || params.get("userId");
  const season = params.get("season") || params.get("year");
  const week = params.get("week") || params.get("w");
  const mode = params.get("mode") || params.get("m");
  const leagues = params.get("leagues") || params.get("league_ids") || params.get("l");

  return { platform, user, season, week, mode, leagues };
}

/**
 * Removes query parameters from the browser's address bar without reloading the page.
 */
export function clearUrlParams() {
  if (typeof window !== "undefined" && window.history?.replaceState && window.location) {
    const cleanUrl = window.location.pathname + (window.location.hash || "");
    window.history.replaceState(null, "", cleanUrl);
  }
}

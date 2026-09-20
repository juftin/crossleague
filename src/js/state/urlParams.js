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
      let cleaned = s
        .trim()
        .replace(/^#/, "")
        .replace(/^(espn|sleeper):/i, "");
      const urlMatch = cleaned.match(/(?:leagueId=|\/leagues?\/)(\d+)/i);
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

/**
 * Updates the browser's URL search parameters to reflect current data, platform, and league filters.
 *
 * @param {Object} [state] State object containing platform, user, season, week, mode, leagues, etc.
 * @returns {string} The updated relative URL path
 */
export function updateUrlParams(state = {}) {
  if (typeof window === "undefined" || !window.history?.replaceState || !window.location) {
    return "";
  }

  const {
    platform,
    user,
    userName,
    userId,
    season,
    week,
    mode,
    leagues,
    customLeagueIds = [],
    selectedLeagueIds = [],
    allLeaguesData = [],
    syncType,
    rawRecords = []
  } = state;

  const hasData = rawRecords && rawRecords.length > 0;
  const isLeaguesSync = syncType === "leagues" || platform === "espn";
  const currentUser = isLeaguesSync ? "" : (user || userName || userId || "").trim();

  let targetLeagueIds = [];
  if (Array.isArray(leagues) && leagues.length > 0) {
    targetLeagueIds = leagues;
  } else if (typeof leagues === "string" && leagues.trim()) {
    targetLeagueIds = extractCustomLeagueIds(leagues);
  } else if (selectedLeagueIds && selectedLeagueIds.length > 0) {
    targetLeagueIds = selectedLeagueIds;
  } else if (allLeaguesData && allLeaguesData.length > 0) {
    targetLeagueIds = allLeaguesData.map(l => l.league_id);
  } else if (customLeagueIds && customLeagueIds.length > 0) {
    targetLeagueIds = customLeagueIds;
  }

  const cleanLeagueIds = Array.from(
    new Set(
      targetLeagueIds
        .map(id =>
          String(id)
            .replace(/^(espn|sleeper):/i, "")
            .trim()
        )
        .filter(Boolean)
    )
  );

  if (!hasData && !currentUser && cleanLeagueIds.length === 0) {
    clearUrlParams();
    return window.location.pathname + (window.location.hash || "");
  }

  const params = new URLSearchParams();

  if (platform === "espn") {
    params.set("platform", "espn");
  }

  if (currentUser && !isLeaguesSync) {
    params.set("user", currentUser);
  }

  if (season) {
    params.set("season", String(season));
  }

  if (week) {
    params.set("week", String(week));
  }

  if (mode) {
    params.set("mode", String(mode));
  }

  const isSubset =
    allLeaguesData &&
    allLeaguesData.length > 0 &&
    selectedLeagueIds &&
    selectedLeagueIds.length > 0 &&
    selectedLeagueIds.length < allLeaguesData.length;

  if (isLeaguesSync || isSubset || (!currentUser && cleanLeagueIds.length > 0)) {
    if (cleanLeagueIds.length > 0) {
      params.set("leagues", cleanLeagueIds.join(","));
    }
  }

  const qs = params.toString();
  const currentHash = window.location.hash || "";
  const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ""}${currentHash}`;

  window.history.replaceState(null, "", newUrl);
  return newUrl;
}

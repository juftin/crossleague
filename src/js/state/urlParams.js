/**
 * CrossLeague • URL Query Parameters & League ID Parser
 *
 * Extracts query parameters from the window URL and parses multi-format league IDs
 * (comma, space, newline, semicolon separated).
 */

import { state } from "./store.js";
import { savePreferences, updateSettingsButtonBadge } from "./preferences.js";

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
 * Adds parsed custom league IDs to store and updates UI.
 *
 * @param {string} str Raw input string containing league IDs
 * @param {Function} [renderChipsFn] Callback to re-render chip elements
 */
export function addCustomLeagueIds(str, renderChipsFn = null) {
  if (!str) return;
  const parts = extractCustomLeagueIds(str);

  if (parts.length === 0 && str.trim()) {
    return;
  }

  parts.forEach(id => state.customLeagueIds.add(id));
  if (typeof renderChipsFn === "function") {
    renderChipsFn();
  }
  savePreferences();
  updateSettingsButtonBadge();

  const customLeaguesDropdownMenu = document.getElementById("customLeaguesDropdownMenu");
  const customLeaguesDropdownChevron = document.getElementById("customLeaguesDropdownChevron");
  const customLeaguesDropdownBtn = document.getElementById("customLeaguesDropdownBtn");

  if (customLeaguesDropdownMenu && customLeaguesDropdownMenu.classList.contains("hidden")) {
    customLeaguesDropdownMenu.classList.remove("hidden");
    if (customLeaguesDropdownChevron) customLeaguesDropdownChevron.classList.add("rotate-180");
    if (customLeaguesDropdownBtn) customLeaguesDropdownBtn.setAttribute("aria-expanded", "true");
  }
}

/**
 * Removes a specific custom league ID from the store.
 *
 * @param {string} id League ID to remove
 * @param {Function} [renderChipsFn] Callback to re-render chip elements
 */
export function removeCustomLeagueId(id, renderChipsFn = null) {
  state.customLeagueIds.delete(id);
  if (typeof renderChipsFn === "function") {
    renderChipsFn();
  }
  savePreferences();
  updateSettingsButtonBadge();
}

/**
 * Clears all custom league IDs from the store.
 *
 * @param {Function} [renderChipsFn] Callback to re-render chip elements
 */
export function clearCustomLeagueIds(renderChipsFn = null) {
  state.customLeagueIds.clear();
  if (typeof renderChipsFn === "function") {
    renderChipsFn();
  }
  savePreferences();
  updateSettingsButtonBadge();
}

export { syncTabFromHash } from "../components/tabs.js";

/**
 * CrossLeague • Shareable URL Exporter
 *
 * Builds clean, anonymous share links containing filters, active tab, and leagues.
 */

import { useCrossLeagueStore } from "../state/useCrossLeagueStore.js";

/**
 * Builds a shareable CrossLeague URL containing season, week, mode, league IDs, and active tab
 * (Omits user identification so reports can be shared cleanly & anonymously).
 *
 * @returns {string} Shareable URL
 */
export function buildShareableUrl() {
  const {
    activeTab,
    allLeaguesData,
    customLeagueIds,
    mode,
    platform,
    season,
    selectedLeagueIds,
    week
  } = useCrossLeagueStore.getState();

  const url = new URL(window.location.href);
  url.search = "";
  if (platform === "espn") url.searchParams.set("platform", "espn");
  if (season) url.searchParams.set("season", season);
  if (week) url.searchParams.set("week", week);
  if (mode) url.searchParams.set("mode", mode);

  let leagueIds = [];
  if (selectedLeagueIds.length > 0) {
    leagueIds = selectedLeagueIds;
  } else if (allLeaguesData.length > 0) {
    leagueIds = allLeaguesData.map(l => l.league_id);
  } else if (customLeagueIds.length > 0) {
    leagueIds = customLeagueIds;
  }
  const cleanLeagueIds = leagueIds
    .map(id =>
      String(id)
        .replace(/^(espn|sleeper):/i, "")
        .trim()
    )
    .filter(Boolean);
  if (cleanLeagueIds.length > 0) {
    url.searchParams.set("leagues", cleanLeagueIds.join(","));
  }

  url.hash = `#${activeTab}`;
  return url.toString();
}

/**
 * Copies current state URL with week/mode/leagues to clipboard.
 */
export async function shareUrl() {
  const shareableUrl = buildShareableUrl();
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(shareableUrl);
    } else {
      const ta = document.createElement("textarea");
      ta.value = shareableUrl;
      ta.style.position = "fixed";
      ta.style.left = "-999999px";
      ta.style.top = "-999999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    return true;
  } catch (err) {
    console.error("Failed to copy URL:", err);
    console.error("Could not copy link to clipboard.");
    return false;
  }
}

/**
 * CrossLeague • Shareable URL Exporter
 *
 * Builds clean, anonymous share links containing filters, active tab, and leagues.
 */

import { state } from "../state/store.js";
import { getCurrentlyActiveTab } from "../components/tabs.js";
import { showToast } from "../components/toast.js";
import { showError } from "../components/dom.js";

/**
 * Builds a shareable CrossLeague URL containing season, week, mode, league IDs, and active tab
 * (Omits user identification so reports can be shared cleanly & anonymously).
 *
 * @returns {string} Shareable URL
 */
export function buildShareableUrl() {
  const seasonInput = document.getElementById("seasonInput");
  const weekInput = document.getElementById("weekInput");
  const modeSelect = document.getElementById("modeSelect");

  const season = seasonInput ? seasonInput.value : "2024";
  const week = weekInput ? weekInput.value : "1";
  const mode = state.currentMode || (modeSelect ? modeSelect.value : "WEEKLY");
  const currentTab = getCurrentlyActiveTab();

  const url = new URL(window.location.href);
  url.search = "";
  if (state.currentPlatform === "espn") url.searchParams.set("platform", "espn");
  if (season) url.searchParams.set("season", season);
  if (week) url.searchParams.set("week", week);
  if (mode) url.searchParams.set("mode", mode);

  let leagueIds = [];
  if (state.selectedLeagueIds && state.selectedLeagueIds.size > 0) {
    leagueIds = Array.from(state.selectedLeagueIds);
  } else if (state.allLeaguesData && state.allLeaguesData.length > 0) {
    leagueIds = state.allLeaguesData.map(l => l.league_id);
  } else if (state.customLeagueIds && state.customLeagueIds.size > 0) {
    leagueIds = Array.from(state.customLeagueIds);
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

  url.hash = `#${currentTab}`;
  return url.toString();
}

/**
 * Copies current state URL with week/mode/leagues to clipboard.
 */
export async function shareUrl() {
  const shareableUrl = buildShareableUrl();
  const shareUrlBtnText = document.getElementById("shareUrlBtnText");

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
    showToast("Shareable link copied to clipboard!", "🔗");
    if (shareUrlBtnText) {
      const orig = shareUrlBtnText.textContent;
      shareUrlBtnText.textContent = "Link Copied! 🔗";
      setTimeout(() => {
        shareUrlBtnText.textContent = orig;
      }, 2500);
    }
  } catch (err) {
    console.error("Failed to copy URL:", err);
    showError("Could not copy link to clipboard.");
  }
}

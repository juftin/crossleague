/**
 * CrossLeague • Tab Navigation & Mobile Dock Controller
 */

import { TAB_ORDER, TAB_HASH_MAP, HASH_TAB_MAP } from "../state/constants.js";

/**
 * Returns the identifier of the currently visible dashboard tab.
 *
 * @returns {string} Tab identifier (awards, leaderboard, visuals, leagueGrid, luck, players)
 */
export function getCurrentlyActiveTab() {
  const viewAwards = document.getElementById("viewAwards");
  const viewLeaderboard = document.getElementById("viewLeaderboard");
  const viewVisuals = document.getElementById("viewVisuals");
  const viewLeagueGrid = document.getElementById("viewLeagueGrid");
  const viewLuck = document.getElementById("viewLuck");
  const viewPlayers = document.getElementById("viewPlayers");

  if (viewAwards && !viewAwards.classList.contains("hidden")) return "awards";
  if (viewLeaderboard && !viewLeaderboard.classList.contains("hidden")) return "leaderboard";
  if (viewVisuals && !viewVisuals.classList.contains("hidden")) return "visuals";
  if (viewLeagueGrid && !viewLeagueGrid.classList.contains("hidden")) return "leagueGrid";
  if (viewLuck && !viewLuck.classList.contains("hidden")) return "luck";
  if (viewPlayers && !viewPlayers.classList.contains("hidden")) return "players";
  return "awards";
}

/**
 * Triggers full confetti celebration particle burst.
 */
export function triggerConfetti() {
  if (typeof confetti === "function") {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

/**
 * Switches the active tab view, toggles desktop and mobile dock styles, and triggers renders.
 *
 * @param {string} tabName Target tab identifier
 * @param {boolean} [updateHash] Whether to update window location hash
 * @param {object} [renderCallbacks] Callbacks for tab-specific rendering
 */
export function switchTab(tabName, updateHash = true, renderCallbacks = {}) {
  let target = tabName;
  if (!TAB_ORDER.includes(target)) {
    target = "awards";
  }

  const viewLeaderboard = document.getElementById("viewLeaderboard");
  const viewAwards = document.getElementById("viewAwards");
  const viewVisuals = document.getElementById("viewVisuals");
  const viewLeagueGrid = document.getElementById("viewLeagueGrid");
  const viewPlayers = document.getElementById("viewPlayers");
  const viewLuck = document.getElementById("viewLuck");

  const desktopInactive =
    "flex-1 w-full justify-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer active:scale-95 text-center";
  const desktopActive =
    "flex-1 w-full justify-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap font-bold cursor-pointer active:scale-95 shadow-sm text-center";

  const mobileInactive =
    "flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all text-[10px] font-bold gap-1 min-w-[50px] text-slate-400 hover:text-slate-200 border border-transparent active:scale-95 touch-manipulation cursor-pointer";
  const mobileActive =
    "flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all text-[10px] font-extrabold gap-1 min-w-[50px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 shadow-sm active:scale-95 touch-manipulation cursor-pointer";

  // Toggle Desktop & Mobile Tabs
  const tabMap = {
    awards: { desktop: "tabAwards", mobile: "mobileTabAwards" },
    leaderboard: { desktop: "tabLeaderboard", mobile: "mobileTabLeaderboard" },
    visuals: { desktop: "tabVisuals", mobile: "mobileTabVisuals" },
    leagueGrid: { desktop: "tabLeagueGrid", mobile: "mobileTabLeagueGrid" },
    luck: { desktop: "tabLuck", mobile: "mobileTabLuck" },
    players: { desktop: "tabPlayers", mobile: "mobileTabPlayers" }
  };

  TAB_ORDER.forEach(t => {
    const dEl = document.getElementById(tabMap[t].desktop);
    const mEl = document.getElementById(tabMap[t].mobile);
    if (dEl) dEl.className = t === target ? desktopActive : desktopInactive;
    if (mEl) mEl.className = t === target ? mobileActive : mobileInactive;
  });

  if (viewLeaderboard) viewLeaderboard.classList.add("hidden");
  if (viewAwards) viewAwards.classList.add("hidden");
  if (viewVisuals) viewVisuals.classList.add("hidden");
  if (viewLeagueGrid) viewLeagueGrid.classList.add("hidden");
  if (viewPlayers) viewPlayers.classList.add("hidden");
  if (viewLuck) viewLuck.classList.add("hidden");

  if (target === "leaderboard") {
    if (viewLeaderboard) viewLeaderboard.classList.remove("hidden");
    if (renderCallbacks.onLeaderboard) renderCallbacks.onLeaderboard();
  } else if (target === "awards") {
    if (viewAwards) viewAwards.classList.remove("hidden");
    if (renderCallbacks.onAwards) renderCallbacks.onAwards();
  } else if (target === "visuals") {
    if (viewVisuals) viewVisuals.classList.remove("hidden");
    if (renderCallbacks.onVisuals) renderCallbacks.onVisuals();
  } else if (target === "leagueGrid") {
    if (viewLeagueGrid) viewLeagueGrid.classList.remove("hidden");
    if (renderCallbacks.onLeagueGrid) renderCallbacks.onLeagueGrid();
  } else if (target === "players") {
    if (viewPlayers) viewPlayers.classList.remove("hidden");
    if (renderCallbacks.onPlayers) renderCallbacks.onPlayers();
  } else if (target === "luck") {
    if (viewLuck) viewLuck.classList.remove("hidden");
    if (renderCallbacks.onLuck) renderCallbacks.onLuck();
  }

  if (updateHash && typeof window !== "undefined" && window.location) {
    const hash = TAB_HASH_MAP[target] || target;
    if (window.location.hash !== `#${hash}`) {
      history.replaceState(null, "", `#${hash}`);
    }
  }
}

/**
 * Synchronizes currently active tab from window URL location hash.
 *
 * @param {object} [renderCallbacks] Render callbacks
 */
export function syncTabFromHash(renderCallbacks = {}) {
  if (typeof window === "undefined" || !window.location) return;
  const rawHash = (window.location.hash || "").replace(/^#/, "").toLowerCase();
  const targetTab = HASH_TAB_MAP[rawHash];
  if (targetTab) {
    switchTab(targetTab, false, renderCallbacks);
  }
}

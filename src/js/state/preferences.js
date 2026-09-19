/**
 * CrossLeague • User Preferences & Navigation State
 *
 * Handles persistent user preferences (platform selection, sync mode, active season/week),
 * season dropdown generation, and week navigation bounds calculation.
 */

import { state } from "./store.js";
import { cachedApiFetch } from "./cache.js";

/**
 * Sets the active fantasy football platform ("sleeper" or "espn").
 *
 * @param {"sleeper"|"espn"} platform Target platform name
 */
export function setPlatform(platform) {
  state.currentPlatform = platform === "espn" ? "espn" : "sleeper";

  const platformSleeperBtn = document.getElementById("platformSleeperBtn");
  const platformEspnBtn = document.getElementById("platformEspnBtn");
  const syncTypeButtonsContainer = document.getElementById("syncTypeButtonsContainer");
  const userSyncPanel = document.getElementById("userSyncPanel");
  const leaguesSyncPanel = document.getElementById("leaguesSyncPanel");
  const customLeaguesLabel = document.getElementById("customLeaguesLabel");

  if (platformSleeperBtn && platformEspnBtn) {
    if (state.currentPlatform === "espn") {
      platformSleeperBtn.className =
        "flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5 text-xs";
      platformEspnBtn.className =
        "flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer text-white bg-rose-900/80 border border-rose-500/40 shadow-sm flex items-center justify-center gap-1.5 text-xs font-bold";
      if (syncTypeButtonsContainer) syncTypeButtonsContainer.classList.add("hidden");
      if (userSyncPanel) userSyncPanel.classList.add("hidden");
      if (leaguesSyncPanel) leaguesSyncPanel.classList.remove("hidden");
      if (customLeaguesLabel) customLeaguesLabel.textContent = "ESPN League IDs (Public)";
      setSyncType("leagues");
    } else {
      // Sleeper
      platformSleeperBtn.className =
        "flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer text-slate-200 bg-slate-800 shadow-sm flex items-center justify-center gap-1.5 text-xs font-bold";
      platformEspnBtn.className =
        "flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5 text-xs";
      if (syncTypeButtonsContainer) syncTypeButtonsContainer.classList.remove("hidden");
      if (customLeaguesLabel) customLeaguesLabel.textContent = "Sleeper League IDs";
      setSyncType(state.currentSyncType || "user");
    }
  }
  savePreferences();
  updateSettingsButtonBadge();
}

/**
 * Sets the active synchronization source type ("user" account or "leagues" list).
 *
 * @param {"user"|"leagues"} type Sync mode type
 */
export function setSyncType(type) {
  state.currentSyncType = type;
  const syncTypeUserBtn = document.getElementById("syncTypeUserBtn");
  const syncTypeLeaguesBtn = document.getElementById("syncTypeLeaguesBtn");
  const userSyncPanel = document.getElementById("userSyncPanel");
  const leaguesSyncPanel = document.getElementById("leaguesSyncPanel");

  if (type === "leagues" || state.currentPlatform === "espn") {
    if (syncTypeUserBtn) {
      syncTypeUserBtn.className =
        "flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5";
    }
    if (syncTypeLeaguesBtn) {
      syncTypeLeaguesBtn.className =
        "flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer text-slate-200 bg-slate-800 shadow-sm flex items-center justify-center gap-1.5";
    }
    if (userSyncPanel) userSyncPanel.classList.add("hidden");
    if (leaguesSyncPanel) leaguesSyncPanel.classList.remove("hidden");
  } else {
    if (syncTypeUserBtn) {
      syncTypeUserBtn.className =
        "flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer text-slate-200 bg-slate-800 shadow-sm flex items-center justify-center gap-1.5";
    }
    if (syncTypeLeaguesBtn) {
      syncTypeLeaguesBtn.className =
        "flex-1 py-1.5 px-2 rounded-lg text-center transition cursor-pointer text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5";
    }
    if (userSyncPanel) userSyncPanel.classList.remove("hidden");
    if (leaguesSyncPanel) leaguesSyncPanel.classList.add("hidden");
  }
  updateSettingsButtonBadge();
  savePreferences();
}

/**
 * Populates season dropdown options dynamically.
 *
 * @param {number} defaultYear Current default season year
 */
export function populateSeasonOptions(defaultYear) {
  const seasonInput = document.getElementById("seasonInput");
  if (!seasonInput) return;
  const maxYear = Math.max(defaultYear + 1, 2026);
  const minYear = 2020;
  const currentVal = seasonInput.value;
  seasonInput.innerHTML = "";
  for (let y = maxYear; y >= minYear; y--) {
    const opt = document.createElement("option");
    opt.value = String(y);
    opt.textContent = String(y);
    seasonInput.appendChild(opt);
  }
  if (currentVal && Array.from(seasonInput.options).some(o => o.value === currentVal)) {
    seasonInput.value = currentVal;
  } else {
    seasonInput.value = String(defaultYear);
  }
}

/**
 * Calculates the maximum playable NFL week for the currently selected season.
 *
 * @returns {number} Max played week (1-18)
 */
export function getMaxPlayedWeek() {
  const seasonInput = document.getElementById("seasonInput");
  const selectedSeason =
    parseInt(seasonInput ? seasonInput.value : state.nflState.season, 10) || state.nflState.season;
  const currentNflSeason = state.nflState.season;

  if (selectedSeason < currentNflSeason) {
    return 18;
  } else if (selectedSeason > currentNflSeason) {
    return 1;
  } else {
    if (state.nflState.season_type === "post") {
      return 18;
    } else if (state.nflState.season_type === "pre") {
      return 1;
    } else {
      return Math.max(1, Math.min(18, state.nflState.display_week || state.nflState.week || 1));
    }
  }
}

/**
 * Synchronizes the top header week navigator text, status badge, and prev/next buttons.
 */
export function updateWeekNavigatorUI() {
  const weekInput = document.getElementById("weekInput");
  const seasonInput = document.getElementById("seasonInput");
  const weekDisplayValue = document.getElementById("weekDisplayValue");
  const headerWeekValue = document.getElementById("headerWeekValue");
  const headerSeasonValue = document.getElementById("headerSeasonValue");
  const playerSeasonBadge = document.getElementById("playerSeasonBadge");
  const weekStatusBadge = document.getElementById("weekStatusBadge");
  const prevWeekBtn = document.getElementById("prevWeekBtn");
  const nextWeekBtn = document.getElementById("nextWeekBtn");

  if (!weekInput) return;
  const maxPlayed = getMaxPlayedWeek();
  let currentWeek = parseInt(weekInput.value, 10) || 1;

  if (currentWeek > maxPlayed) {
    currentWeek = maxPlayed;
    weekInput.value = String(currentWeek);
    savePreferences();
  } else if (currentWeek < 1) {
    currentWeek = 1;
    weekInput.value = String(currentWeek);
    savePreferences();
  }

  const weekLabel =
    state.currentMode === "SEASON_ROLLUP"
      ? currentWeek === 1
        ? "Week 1 Rollup"
        : `Weeks 1–${currentWeek}`
      : `Week ${currentWeek}`;

  if (weekDisplayValue) weekDisplayValue.textContent = weekLabel;
  if (headerWeekValue) headerWeekValue.textContent = weekLabel;
  if (headerSeasonValue && seasonInput) headerSeasonValue.textContent = seasonInput.value;
  if (playerSeasonBadge && seasonInput) playerSeasonBadge.textContent = seasonInput.value;

  if (weekStatusBadge) {
    const selectedSeason =
      parseInt(seasonInput ? seasonInput.value : state.nflState.season, 10) ||
      state.nflState.season;
    if (selectedSeason < state.nflState.season) {
      weekStatusBadge.textContent = "Final";
      weekStatusBadge.className =
        "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-400";
    } else if (currentWeek < maxPlayed) {
      weekStatusBadge.textContent = "Played";
      weekStatusBadge.className =
        "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-400";
    } else if (currentWeek === maxPlayed && state.nflState.season_type === "regular") {
      weekStatusBadge.textContent = "Current";
      weekStatusBadge.className =
        "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 animate-pulse";
    } else {
      weekStatusBadge.textContent = "Week 1";
      weekStatusBadge.className =
        "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-400";
    }
  }

  if (prevWeekBtn) {
    const canGoPrev = currentWeek > 1;
    prevWeekBtn.disabled = !canGoPrev;
    if (canGoPrev) {
      prevWeekBtn.classList.remove("opacity-40", "cursor-not-allowed");
      prevWeekBtn.classList.add("hover:bg-slate-800", "cursor-pointer");
      prevWeekBtn.title = `Previous Week (Week ${currentWeek - 1}) • Press ←`;
    } else {
      prevWeekBtn.classList.add("opacity-40", "cursor-not-allowed");
      prevWeekBtn.classList.remove("hover:bg-slate-800", "cursor-pointer");
      prevWeekBtn.title = "At first week (Week 1)";
    }
  }

  if (nextWeekBtn) {
    const canGoNext = currentWeek < maxPlayed;
    nextWeekBtn.disabled = !canGoNext;
    if (canGoNext) {
      nextWeekBtn.classList.remove("opacity-40", "cursor-not-allowed");
      nextWeekBtn.classList.add("hover:bg-slate-800", "cursor-pointer");
      nextWeekBtn.title = `Next Week (Week ${currentWeek + 1}) • Press →`;
    } else {
      nextWeekBtn.classList.add("opacity-40", "cursor-not-allowed");
      nextWeekBtn.classList.remove("hover:bg-slate-800", "cursor-pointer");
      nextWeekBtn.title = `At current week (Week ${currentWeek})`;
    }
  }
}

/**
 * Updates the Settings button badge label and user title.
 */
export function updateSettingsButtonBadge() {
  const userIdInput = document.getElementById("userIdInput");
  const seasonInput = document.getElementById("seasonInput");
  const settingsBtnUserBadge = document.getElementById("settingsBtnUserBadge");
  const btnOpenSettingsModal = document.getElementById("btnOpenSettingsModal");
  const headerSeasonValue = document.getElementById("headerSeasonValue");

  let u = "";
  if (state.currentSyncType === "leagues") {
    const count =
      state.customLeagueIds.size || (state.allLeaguesData ? state.allLeaguesData.length : 0);
    if (count > 0) {
      u = `${count} ${count === 1 ? "League" : "Leagues"}`;
    }
  } else {
    u =
      (userIdInput && typeof userIdInput.value === "string" ? userIdInput.value.trim() : "") ||
      state.currentUserName ||
      "";
  }

  if (settingsBtnUserBadge) {
    if (state.currentSyncType === "leagues" && u) {
      settingsBtnUserBadge.textContent = `League: ${u}`;
      settingsBtnUserBadge.classList.remove("text-slate-400", "border-slate-700/60");
      settingsBtnUserBadge.classList.add("text-emerald-400", "border-emerald-500/30");
    } else if (u) {
      settingsBtnUserBadge.textContent = `@${u}`;
      settingsBtnUserBadge.classList.remove("text-slate-400", "border-slate-700/60");
      settingsBtnUserBadge.classList.add("text-emerald-400", "border-emerald-500/30");
    } else {
      settingsBtnUserBadge.textContent = "No sync source";
      settingsBtnUserBadge.classList.remove("text-emerald-400", "border-emerald-500/30");
      settingsBtnUserBadge.classList.add("text-slate-400", "border-slate-700/60");
    }
  }
  if (btnOpenSettingsModal) {
    if (state.currentSyncType === "leagues" && u) {
      btnOpenSettingsModal.title = `Settings (${u})`;
    } else {
      btnOpenSettingsModal.title = u ? `Settings (@${u})` : "User & League Settings";
    }
  }
  if (headerSeasonValue && seasonInput) {
    headerSeasonValue.textContent = seasonInput.value;
  }
}

/**
 * Updates UI labels and filters when toggling between Single Week and Season Rollup modes.
 */
export function updateModeUI() {
  const modeSelect = document.getElementById("modeSelect");
  const headerBottomRow = document.getElementById("headerBottomRow");
  const weekLabelText = document.getElementById("weekLabelText");
  const scoreTierSelect = document.getElementById("scoreTierSelect");

  if (!modeSelect) return;
  state.currentMode = modeSelect.value;
  if (state.currentMode === "SEASON_ROLLUP") {
    if (headerBottomRow) headerBottomRow.classList.add("hidden");
    if (weekLabelText) weekLabelText.textContent = "Through Week";
    if (scoreTierSelect) {
      scoreTierSelect.innerHTML = `
        <option value="ALL">All Averages</option>
        <option value="BOOM">Elite PPG (130+)</option>
        <option value="SOLID">Solid PPG (105 - 130)</option>
        <option value="COLD">Sub-105 PPG</option>
      `;
    }
  } else {
    if (headerBottomRow) headerBottomRow.classList.remove("hidden");
    if (weekLabelText) weekLabelText.textContent = "Matchup Week";
    if (scoreTierSelect) {
      scoreTierSelect.innerHTML = `
        <option value="ALL">All Scores</option>
        <option value="BOOM">Nuclear (140+ pts)</option>
        <option value="SOLID">Solid (100 - 140)</option>
        <option value="COLD">Ice Cold (&lt; 100)</option>
      `;
    }
  }
  updateSettingsButtonBadge();
  updateWeekNavigatorUI();
}

/**
 * Loads user preferences from localStorage.
 */
export function loadSavedPreferences() {
  const savedPlatform = localStorage.getItem("crossleague_platform");
  if (savedPlatform === "espn" || savedPlatform === "sleeper") {
    state.currentPlatform = savedPlatform;
  }

  const savedSyncType = localStorage.getItem("sleeper_sync_type");
  if (savedSyncType === "leagues" || savedSyncType === "user") {
    state.currentSyncType = savedSyncType;
  }
  const savedCustomLeagues = localStorage.getItem("sleeper_custom_league_ids");
  if (savedCustomLeagues) {
    try {
      const parsed = JSON.parse(savedCustomLeagues);
      if (Array.isArray(parsed)) {
        state.customLeagueIds = new Set(parsed.filter(Boolean));
      }
    } catch (e) {
      console.warn("Could not parse saved custom league IDs:", e);
    }
  }
  const userIdInput = document.getElementById("userIdInput");
  const seasonInput = document.getElementById("seasonInput");
  const weekInput = document.getElementById("weekInput");
  const modeSelect = document.getElementById("modeSelect");

  const savedUser =
    localStorage.getItem("sleeper_username") || localStorage.getItem("sleeper_user_id");
  if (savedUser && userIdInput) userIdInput.value = savedUser;
  const savedSeason = localStorage.getItem("sleeper_season");
  if (savedSeason && seasonInput) seasonInput.value = savedSeason;
  const savedWeek = localStorage.getItem("sleeper_week");
  if (savedWeek && weekInput) weekInput.value = savedWeek;
  const savedMode = localStorage.getItem("sleeper_mode");
  if (savedMode && modeSelect) {
    modeSelect.value = savedMode;
    state.currentMode = savedMode;
    updateModeUI();
  }
  setPlatform(state.currentPlatform);
  updateSettingsButtonBadge();
  updateWeekNavigatorUI();
}

/**
 * Saves current user selections to localStorage.
 */
export function savePreferences() {
  const userIdInput = document.getElementById("userIdInput");
  const seasonInput = document.getElementById("seasonInput");
  const weekInput = document.getElementById("weekInput");
  const modeSelect = document.getElementById("modeSelect");

  localStorage.setItem("crossleague_platform", state.currentPlatform);
  localStorage.setItem("sleeper_sync_type", state.currentSyncType);
  if (userIdInput) {
    const username = userIdInput.value.trim();
    localStorage.setItem("sleeper_username", username);
    localStorage.setItem("sleeper_user_id", username);
  }
  if (seasonInput) localStorage.setItem("sleeper_season", seasonInput.value);
  if (weekInput) localStorage.setItem("sleeper_week", weekInput.value);
  if (modeSelect) localStorage.setItem("sleeper_mode", modeSelect.value);
  localStorage.setItem(
    "sleeper_custom_league_ids",
    JSON.stringify(Array.from(state.customLeagueIds))
  );
  updateSettingsButtonBadge();
}

/**
 * Initializes default settings, NFL state metadata, and URL query parameter overrides.
 */
export async function initDefaults() {
  const currentYear = new Date().getFullYear();
  populateSeasonOptions(currentYear);
  loadSavedPreferences();

  const userIdInput = document.getElementById("userIdInput");
  const seasonInput = document.getElementById("seasonInput");
  const weekInput = document.getElementById("weekInput");
  const modeSelect = document.getElementById("modeSelect");

  const { getUrlParams } = await import("./urlParams.js");
  const { openSettingsModal, closeSettingsModal } = await import("../components/modal.js");
  const { renderCustomLeagueIdChips, renderLeagueDropdown } =
    await import("../components/dropdowns.js");
  const { BASE_URL } = await import("./constants.js");

  const urlParams = getUrlParams();

  if (urlParams.platform) {
    setPlatform(urlParams.platform.toLowerCase() === "espn" ? "espn" : "sleeper");
  }

  if (urlParams.user) {
    state.currentSyncType = "user";
    if (userIdInput) userIdInput.value = urlParams.user.trim();
    state.currentUserName = urlParams.user.trim();
    state.currentUserId = "";
    state.customLeagueIds.clear();
    state.pendingLeagueIdsFilter = null;
  }

  if (urlParams.leagues) {
    const ids = urlParams.leagues
      .split(",")
      .map(id => id.trim())
      .filter(Boolean);
    state.pendingLeagueIdsFilter = new Set(ids);
    state.customLeagueIds.clear();
    ids.forEach(id => state.customLeagueIds.add(id));
    if (!urlParams.user) {
      state.currentSyncType = "leagues";
      if (userIdInput) userIdInput.value = "";
      state.currentUserName = "";
      state.currentUserId = "";
    }
  }

  if (urlParams.season && seasonInput) {
    seasonInput.value = String(urlParams.season);
  } else if (!localStorage.getItem("sleeper_season") && seasonInput) {
    seasonInput.value = String(currentYear);
  }

  if (urlParams.week && weekInput) {
    weekInput.value = String(urlParams.week);
  }

  if (urlParams.mode && modeSelect) {
    const normalizedMode =
      urlParams.mode.toUpperCase() === "SEASON_ROLLUP" ? "SEASON_ROLLUP" : "WEEKLY";
    modeSelect.value = normalizedMode;
    state.currentMode = normalizedMode;
    updateModeUI();
  }

  setSyncType(state.currentSyncType);
  renderCustomLeagueIdChips();

  try {
    const nflData = await cachedApiFetch(`${BASE_URL}/state/nfl`, {
      ttlMs: 2 * 60 * 60 * 1000
    });
    if (nflData) {
      state.nflState = {
        season: parseInt(nflData.season, 10) || currentYear,
        week: parseInt(nflData.week, 10) || 1,
        display_week: parseInt(nflData.display_week, 10) || parseInt(nflData.week, 10) || 1,
        season_type: nflData.season_type || "regular"
      };
      if (
        !urlParams.season &&
        !localStorage.getItem("sleeper_season") &&
        nflData.season &&
        seasonInput
      ) {
        seasonInput.value = String(nflData.season);
      }
      if (!urlParams.week && !localStorage.getItem("sleeper_week") && weekInput) {
        const defaultWeek = state.nflState.display_week || state.nflState.week || 1;
        if (defaultWeek >= 1 && defaultWeek <= 18) {
          weekInput.value = String(defaultWeek);
        }
      }
    }
  } catch (err) {
    console.warn("Could not fetch NFL state for defaults:", err);
  }

  const hasSharedLeagues = Boolean(
    (state.pendingLeagueIdsFilter && state.pendingLeagueIdsFilter.size > 0) ||
    (state.currentSyncType === "leagues" && state.customLeagueIds.size > 0)
  );
  const hasSavedUser =
    Boolean(urlParams.user) ||
    Boolean(localStorage.getItem("sleeper_user_id")) ||
    Boolean(userIdInput && userIdInput.value.trim()) ||
    hasSharedLeagues;
  if (!hasSavedUser) {
    openSettingsModal();
  } else {
    closeSettingsModal();
  }
  updateSettingsButtonBadge();
  updateWeekNavigatorUI();
  renderLeagueDropdown();
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", savePreferences);
}

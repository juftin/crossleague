/**
 * CrossLeague • LocalStorage Caching Subsystem
 *
 * Provides weekly data caching, cache key hashing, finished week evaluation,
 * cache validation, and data clearing/reset routines.
 */

import { state } from "./store.js";
import { initPlayersDb } from "../api/players.js";

// In-memory fallback cache for API responses
const memoryApiCache = new Map();

/**
 * Fetches an API resource with storage-backed TTL caching.
 * Prevents redundant network calls on page refreshes, live reloads, and repeated requests.
 *
 * @param {string} url Target URL
 * @param {object} [options] Fetch and cache options
 * @param {boolean} [options.forceRefresh] Bypass cache and force network request
 * @param {number} [options.ttlMs] Cache Time-To-Live in milliseconds (default: 15 mins)
 * @returns {Promise<any>} Parsed JSON response
 */
export async function cachedApiFetch(url, options = {}) {
  const { forceRefresh = false, ttlMs = 15 * 60 * 1000, ...fetchOptions } = options;
  const cacheKey = `crossleague_api_${url}`;

  if (!forceRefresh) {
    // 1. Check sessionStorage
    try {
      if (typeof sessionStorage !== "undefined") {
        const raw = sessionStorage.getItem(cacheKey);
        if (raw) {
          const entry = JSON.parse(raw);
          if (entry && Date.now() - entry.timestamp < (entry.ttlMs || ttlMs)) {
            return entry.data;
          }
        }
      }
    } catch {
      // Ignore storage read errors
    }

    // 2. Check in-memory cache
    if (memoryApiCache.has(cacheKey)) {
      const entry = memoryApiCache.get(cacheKey);
      if (entry && Date.now() - entry.timestamp < (entry.ttlMs || ttlMs)) {
        return entry.data;
      }
    }
  }

  // 3. Perform network fetch
  const resp = await fetch(url, fetchOptions);
  if (!resp.ok) {
    throw new Error(`API error (${resp.status}): ${url}`);
  }
  const data = await resp.json();

  // 4. Save to cache
  const cacheEntry = {
    timestamp: Date.now(),
    ttlMs: ttlMs,
    data: data
  };

  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    }
  } catch {
    // Storage might be full or disabled, fallback to memory
  }
  memoryApiCache.set(cacheKey, cacheEntry);

  return data;
}

/**
 * Clears all cached API responses from sessionStorage and memory.
 */
export function clearApiCache() {
  memoryApiCache.clear();
  try {
    if (typeof sessionStorage !== "undefined") {
      const keysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith("crossleague_api_")) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => sessionStorage.removeItem(k));
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Generates a normalized localStorage cache key.
 *
 * @param {string} user Username, user ID, or leagues key
 * @param {string|number} season Season year
 * @param {string} mode Mode ("WEEKLY" or "SEASON_ROLLUP")
 * @param {string|number} week Matchup week
 * @returns {string} Cache key string
 */
export function getCacheKey(user, season, mode, week) {
  const u = (user || "").toLowerCase().trim();
  return `crossleague_cache_${u}_${season}_${mode}_${week}`;
}

/**
 * Evaluates whether a given NFL matchup week has concluded.
 *
 * @param {number|string} season Target season year
 * @param {number|string} week Target week number
 * @param {object} [nflState] Current NFL state object
 * @returns {boolean} True if the week is finished
 */
export function isWeekFinished(season, week, nflState = state.nflState) {
  const s = parseInt(season, 10);
  const w = parseInt(week, 10);
  if (!nflState || !nflState.season) return false;
  if (s < nflState.season) return true;
  if (s === nflState.season) {
    if (nflState.season_type === "post") return true;
    const currentNflWeek = nflState.week || 1;
    return w < currentNflWeek;
  }
  return false;
}

/**
 * Saves fetched dataset and metadata to localStorage cache under all relevant lookup keys.
 *
 * @param {string} userId User ID
 * @param {string} userName Username
 * @param {string} userAvatar Avatar hash
 * @param {string|number} season Season year
 * @param {string} mode WEEKLY or SEASON_ROLLUP
 * @param {number} week Matchup week
 * @param {Array<object>} records Raw team records
 * @param {Record<string, object>} leagues Map of leagues
 * @param {Array<object>} allLeagues List of all league metadata
 */
export function saveDataToCache(
  userId,
  userName,
  userAvatar,
  season,
  mode,
  week,
  records,
  leagues,
  allLeagues
) {
  try {
    const payload = {
      version: "2.0",
      cachedAt: new Date().toISOString(),
      isFinished: isWeekFinished(season, week),
      mode: mode,
      user: {
        id: userId,
        name: userName,
        avatar: userAvatar
      },
      season: season,
      week: week,
      records: records,
      leaguesMap: leagues,
      allLeaguesData: allLeagues,
      selectedLeagueIds: Array.from(state.selectedLeagueIds),
      playersDb: state.sleeperPlayersDb || {},
      espnPlayersDb: state.espnPlayersDb || {}
    };
    const serialized = JSON.stringify(payload);
    const keys = new Set();
    const userIdInput = document.getElementById("userIdInput");
    const queryUser = userIdInput ? userIdInput.value.trim() : "";
    if (queryUser) keys.add(getCacheKey(queryUser, season, mode, week));
    if (userName) keys.add(getCacheKey(userName, season, mode, week));
    if (userId) keys.add(getCacheKey(userId, season, mode, week));
    if (state.customLeagueIds && state.customLeagueIds.size > 0) {
      const sortedLeagueIds = Array.from(state.customLeagueIds).sort().join(",");
      keys.add(getCacheKey(`leagues:${sortedLeagueIds}`, season, mode, week));
    }
    keys.forEach(k => {
      localStorage.setItem(k, serialized);
    });
  } catch (e) {
    console.warn("Could not save to localStorage cache:", e);
  }
}

/**
 * Loads and restores cached dataset into in-memory store.
 *
 * @param {object} data Serialized cache payload
 * @param {object} [callbacks] UI refresh callbacks
 * @returns {boolean} True if data loaded successfully
 */
export function loadCachedData(data, callbacks = {}) {
  if (!data || !data.records || data.records.length === 0) return false;

  state.currentMode = data.mode || "WEEKLY";
  const modeSelect = document.getElementById("modeSelect");
  if (modeSelect) modeSelect.value = state.currentMode;

  state.currentUserId = data.user ? data.user.id : "";
  state.currentUserName = data.user ? data.user.name : "";
  state.currentUserAvatar = data.user ? data.user.avatar : "";

  const userIdInput = document.getElementById("userIdInput");
  const seasonInput = document.getElementById("seasonInput");
  const weekInput = document.getElementById("weekInput");

  if (userIdInput) {
    const saved = localStorage.getItem("sleeper_user_id");
    if (saved) {
      userIdInput.value = saved;
    } else if (state.currentUserName) {
      userIdInput.value = state.currentUserName || state.currentUserId;
    }
  }
  if (seasonInput && data.season) {
    seasonInput.value = String(data.season);
  }
  if (weekInput && data.week) {
    weekInput.value = String(data.week);
  }

  if (data.playersDb && Object.keys(data.playersDb).length > 0) {
    state.sleeperPlayersDb = data.playersDb;
  }
  if (data.espnPlayersDb && Object.keys(data.espnPlayersDb).length > 0) {
    state.espnPlayersDb = { ...state.espnPlayersDb, ...data.espnPlayersDb };
  }

  state.rawRecords = (data.records || []).map(r => ({
    ...r,
    efficiency: typeof r.efficiency === "number" && !isNaN(r.efficiency) ? r.efficiency : 100,
    benchPoints: typeof r.benchPoints === "number" && !isNaN(r.benchPoints) ? r.benchPoints : 0,
    outcome: r.outcome || "unpaired",
    winPct: typeof r.winPct === "number" && !isNaN(r.winPct) ? r.winPct : 0,
    startersList: Array.isArray(r.startersList) ? r.startersList : [],
    allPlayersList: Array.isArray(r.allPlayersList) ? r.allPlayersList : [],
    playersPointsMap: r.playersPointsMap || {},
    startersPoints: Array.isArray(r.startersPoints) ? r.startersPoints : [],
    weeklyPlayerRecords: Array.isArray(r.weeklyPlayerRecords) ? r.weeklyPlayerRecords : []
  }));

  state.leaguesMap = data.leaguesMap || {};
  state.allLeaguesData =
    data.allLeaguesData && data.allLeaguesData.length > 0
      ? data.allLeaguesData
      : Array.from(new Set(state.rawRecords.map(r => r.leagueId))).map(lid => {
          const sample = state.rawRecords.find(r => r.leagueId === lid);
          return {
            league_id: lid,
            name:
              (state.leaguesMap[lid] && state.leaguesMap[lid].name) ||
              (sample && sample.league) ||
              `League ${lid}`,
            avatar:
              (state.leaguesMap[lid] && state.leaguesMap[lid].avatar) ||
              (sample && sample.leagueAvatar) ||
              null
          };
        });

  if (state.pendingLeagueIdsFilter && state.pendingLeagueIdsFilter.size > 0) {
    state.selectedLeagueIds = new Set(
      state.allLeaguesData.map(l => l.league_id).filter(id => state.pendingLeagueIdsFilter.has(id))
    );
    if (state.selectedLeagueIds.size === 0) {
      state.selectedLeagueIds = new Set(state.allLeaguesData.map(l => l.league_id));
    }
    state.pendingLeagueIdsFilter = null;
  } else {
    state.selectedLeagueIds = new Set(
      data.selectedLeagueIds && data.selectedLeagueIds.length > 0
        ? data.selectedLeagueIds
        : state.allLeaguesData.map(l => l.league_id)
    );
  }

  const initialState = document.getElementById("initialState");
  const skeletonLoader = document.getElementById("skeletonLoader");
  const reportContent = document.getElementById("reportContent");
  const copyRecapBtn = document.getElementById("copyRecapBtn");
  const shareUrlBtn = document.getElementById("shareUrlBtn");
  const exportCsvBtn = document.getElementById("exportCsvBtn");

  if (initialState) initialState.classList.add("hidden");
  if (skeletonLoader) skeletonLoader.classList.add("hidden");
  if (reportContent) reportContent.classList.remove("hidden");
  if (copyRecapBtn) copyRecapBtn.classList.remove("hidden");
  if (shareUrlBtn) shareUrlBtn.classList.remove("hidden");
  if (exportCsvBtn) exportCsvBtn.classList.remove("hidden");

  initPlayersDb();
  if (callbacks.updateUI) callbacks.updateUI();
  if (callbacks.renderDropdown) callbacks.renderDropdown();
  if (callbacks.refresh) callbacks.refresh();

  return true;
}

/**
 * Attempts to retrieve and restore a cached report payload based on active settings.
 *
 * @param {number|null} [overrideWeek] Optional week number override
 * @param {object} [callbacks] UI refresh callbacks
 * @returns {boolean} True if matching cache found and restored
 */
export function tryLoadFromCache(overrideWeek = null, callbacks = {}) {
  try {
    const userIdInput = document.getElementById("userIdInput");
    const seasonInput = document.getElementById("seasonInput");
    const modeSelect = document.getElementById("modeSelect");
    const weekInput = document.getElementById("weekInput");

    let user = userIdInput ? userIdInput.value.trim() : "";
    if (!user && state.customLeagueIds && state.customLeagueIds.size > 0) {
      user = `leagues:${Array.from(state.customLeagueIds).sort().join(",")}`;
    }
    const season = seasonInput ? seasonInput.value : "";
    const mode = modeSelect ? modeSelect.value : "WEEKLY";
    const week =
      overrideWeek !== null
        ? parseInt(overrideWeek, 10)
        : weekInput
          ? parseInt(weekInput.value, 10)
          : 1;

    if (!user) return false;
    const key = getCacheKey(user, season, mode, week);
    const raw = localStorage.getItem(key);

    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.version === "2.0" && data.records && data.records.length > 0) {
        // Strict settings matching
        if (String(data.season) !== String(season)) return false;
        if (data.mode !== mode) return false;
        if (parseInt(data.week, 10) !== parseInt(week, 10)) return false;

        const cachedPlatform = data.records[0]?.platform || "sleeper";
        if (cachedPlatform !== state.currentPlatform) return false;

        if (state.currentSyncType === "leagues" && state.customLeagueIds.size > 0) {
          const cachedLids = new Set(
            (data.allLeaguesData || []).map(l =>
              String(l.league_id).replace(/^(espn|sleeper):/, "")
            )
          );
          const expectedLids = Array.from(state.customLeagueIds).map(id =>
            String(id).replace(/^(espn|sleeper):/, "")
          );
          const allMatch = expectedLids.every(id => cachedLids.has(id));
          if (!allMatch) return false;
        }

        if (state.currentSyncType === "user" && userIdInput && userIdInput.value.trim()) {
          const queryUser = userIdInput.value.trim().toLowerCase();
          const cachedUserName = (data.user?.name || "").toLowerCase();
          const cachedUserId = (data.user?.id || "").toLowerCase();
          if (cachedUserName !== queryUser && cachedUserId !== queryUser) {
            return false;
          }
        }

        return loadCachedData(data, callbacks);
      }
    }
  } catch (e) {
    console.warn("Could not load from localStorage cache:", e);
  }
  return false;
}

/**
 * Clears all cached data, local preferences, and resets in-memory application state.
 *
 * @param {object} [callbacks] UI reset callbacks
 */
export function clearAllData(callbacks = {}) {
  const confirmed =
    typeof window !== "undefined" && window.confirm
      ? window.confirm(
          "Are you sure you want to clear all stored data, cached leagues, credentials, and settings? This will reset CrossLeague to its default state."
        )
      : true;
  if (!confirmed) return;

  try {
    localStorage.clear();
  } catch (e) {
    console.warn("Could not clear localStorage:", e);
  }

  // Reset in-memory state
  state.rawRecords = [];
  state.allLeaguesData = [];
  state.leaguesMap = {};
  state.selectedLeagueIds.clear();
  state.customLeagueIds.clear();
  state.currentUserId = "";
  state.currentUserName = "";
  state.currentUserAvatar = "";
  state.currentPlatform = "sleeper";
  state.currentSyncType = "user";

  const userIdInput = document.getElementById("userIdInput");
  const customLeagueIdInput = document.getElementById("customLeagueIdInput");
  const seasonInput = document.getElementById("seasonInput");
  const weekInput = document.getElementById("weekInput");
  const modeSelect = document.getElementById("modeSelect");
  const reportContent = document.getElementById("reportContent");
  const initialState = document.getElementById("initialState");
  const skeletonLoader = document.getElementById("skeletonLoader");
  const syncControlCenter = document.getElementById("syncControlCenter");
  const liveSyncIndicator = document.getElementById("liveSyncIndicator");
  const headerSeasonBadge = document.getElementById("headerSeasonBadge");
  const headerWeekBadge = document.getElementById("headerWeekBadge");
  const shareUrlBtn = document.getElementById("shareUrlBtn");
  const copyRecapBtn = document.getElementById("copyRecapBtn");

  if (userIdInput) userIdInput.value = "";
  if (customLeagueIdInput) customLeagueIdInput.value = "";
  if (seasonInput) seasonInput.value = "2026";
  if (weekInput) weekInput.value = "1";
  if (modeSelect) modeSelect.value = "WEEKLY";

  if (reportContent) reportContent.classList.add("hidden");
  if (initialState) initialState.classList.remove("hidden");
  if (skeletonLoader) skeletonLoader.classList.add("hidden");
  if (syncControlCenter) syncControlCenter.classList.add("hidden");
  if (liveSyncIndicator) liveSyncIndicator.classList.add("hidden");
  if (headerSeasonBadge) headerSeasonBadge.classList.add("hidden");
  if (headerWeekBadge) headerWeekBadge.classList.add("hidden");
  if (shareUrlBtn) shareUrlBtn.classList.add("hidden");
  if (copyRecapBtn) copyRecapBtn.classList.add("hidden");

  if (window.history && window.history.replaceState) {
    window.history.replaceState(null, "", window.location.pathname);
  }

  if (callbacks.onReset) callbacks.onReset();
}

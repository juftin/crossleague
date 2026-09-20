/**
 * CrossLeague • Caching & Storage Layer
 *
 * Provides structured multi-tier caching (in-memory + Web Storage),
 * deterministic cache key generation, TTL expiration, finished-week evaluation,
 * and pure state integration without DOM coupling.
 */

import { CACHE_PREFIXES, TTL } from "./constants.js";
import { getItem, setItem, clearAllStorage, safeJsonParse } from "./storage.js";
import { useCrossLeagueStore } from "./useCrossLeagueStore.js";

// Bounded in-memory LRU cache for upstream API responses (max 120 entries)
const MAX_MEMORY_API_ENTRIES = 120;
const memoryApiCache = new Map();

/**
 * Normalizes a user string (removes whitespace and lowercases).
 *
 * @param {string} user
 * @returns {string}
 */
export function normalizeUser(user) {
  return (user || "").toLowerCase().trim();
}

/**
 * Normalizes custom league IDs into a deterministic comma-separated string.
 *
 * @param {Array<string|number>|Set<string|number>} customLeagueIds
 * @returns {string}
 */
export function normalizeLeagueIds(customLeagueIds) {
  const arr = Array.isArray(customLeagueIds)
    ? customLeagueIds
    : customLeagueIds instanceof Set
      ? Array.from(customLeagueIds)
      : [];

  return arr
    .map(id =>
      String(id)
        .trim()
        .replace(/^(espn|sleeper):/, "")
    )
    .filter(Boolean)
    .sort()
    .join(",");
}

/**
 * Generates the canonical modern namespaced cache key for a report.
 *
 * @param {object} params
 * @param {string} [params.platform="sleeper"] Fantasy platform ("sleeper" | "espn")
 * @param {string} [params.user=""] Username or User ID
 * @param {Array<string|number>|Set<string|number>} [params.customLeagueIds=[]] Custom league IDs
 * @param {string|number} params.season Season year
 * @param {string} [params.mode="WEEKLY"] Sync mode ("WEEKLY" | "SEASON_ROLLUP")
 * @param {string|number} params.week Matchup week
 * @returns {string} Modern cache key
 */
export function getReportCacheKey({
  platform = "sleeper",
  user = "",
  customLeagueIds = [],
  season,
  mode = "WEEKLY",
  week
}) {
  const normUser = platform === "espn" ? "" : normalizeUser(user);
  const normLids = normalizeLeagueIds(customLeagueIds);
  const target = normUser ? `user:${normUser}` : `leagues:${normLids}`;
  return `${CACHE_PREFIXES.REPORT}${platform}:${target}:${season}:${mode}:${week}`;
}

/**
 * Generates a legacy localStorage cache key for backward-compatibility.
 *
 * @param {string} user Username, user ID, or leagues key
 * @param {string|number} season Season year
 * @param {string} mode Mode ("WEEKLY" or "SEASON_ROLLUP")
 * @param {string|number} week Matchup week
 * @returns {string} Legacy cache key string
 */
export function getCacheKey(user, season, mode, week) {
  const u = normalizeUser(user);
  return `${CACHE_PREFIXES.LEGACY_REPORT}${u}_${season}_${mode}_${week}`;
}

/**
 * Evaluates whether a given NFL matchup week has concluded and is immutable.
 *
 * @param {number|string} season Target season year
 * @param {number|string} week Target week number
 * @param {object} [nflState] Current NFL state object
 * @returns {boolean} True if the week is finished
 */
export function isWeekFinished(season, week, nflState = useCrossLeagueStore.getState().nflState) {
  const s = parseInt(season, 10);
  const w = parseInt(week, 10);
  if (!nflState || !nflState.season) return false;
  if (s < nflState.season) return true;
  if (s === nflState.season) {
    if (nflState.season_type === "post" || nflState.season_type === "off") return true;
    const currentNflWeek = nflState.week || nflState.display_week || 1;
    return w < currentNflWeek;
  }
  return false;
}

/**
 * Fetches an API resource with storage-backed TTL caching.
 * Prevents redundant network calls on page refreshes, live reloads, and repeated requests.
 *
 * @param {string} url Target URL
 * @param {object} [options] Fetch and cache options
 * @param {boolean} [options.forceRefresh=false] Bypass cache and force network request
 * @param {number} [options.ttlMs=TTL.API_DEFAULT] Cache Time-To-Live in milliseconds
 * @returns {Promise<any>} Parsed JSON response
 */
export async function cachedApiFetch(url, options = {}) {
  const { forceRefresh = false, ttlMs = TTL.API_DEFAULT, ...fetchOptions } = options;
  const modernKey = `${CACHE_PREFIXES.API}${url}`;
  const legacyKey = `${CACHE_PREFIXES.LEGACY_API}${url}`;
  const now = Date.now();

  if (!forceRefresh) {
    // 1. Check in-memory LRU cache
    if (memoryApiCache.has(modernKey)) {
      const entry = memoryApiCache.get(modernKey);
      if (entry && now - entry.timestamp < (entry.ttlMs || ttlMs)) {
        return entry.data;
      }
      memoryApiCache.delete(modernKey);
    }

    // 2. Check sessionStorage
    try {
      if (typeof sessionStorage !== "undefined") {
        const raw = sessionStorage.getItem(modernKey) || sessionStorage.getItem(legacyKey);
        if (raw) {
          const entry = safeJsonParse(raw, null);
          if (entry && now - entry.timestamp < (entry.ttlMs || ttlMs)) {
            // Re-populate in-memory cache
            memoryApiCache.set(modernKey, entry);
            return entry.data;
          }
        }
      }
    } catch {
      // Ignore storage read errors
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
    timestamp: now,
    ttlMs: ttlMs,
    data: data
  };

  // Enforce memory bounds
  if (memoryApiCache.size >= MAX_MEMORY_API_ENTRIES) {
    const oldestKey = memoryApiCache.keys().next().value;
    if (oldestKey) memoryApiCache.delete(oldestKey);
  }
  memoryApiCache.set(modernKey, cacheEntry);

  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(modernKey, JSON.stringify(cacheEntry));
    }
  } catch {
    // Storage might be full or disabled, memory fallback works
  }

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
        if (k && (k.startsWith(CACHE_PREFIXES.API) || k.startsWith(CACHE_PREFIXES.LEGACY_API))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => sessionStorage.removeItem(k));
    }
  } catch {}
}

/**
 * Saves report dataset and metadata to storage with calculated TTL.
 *
 * @param {object} params Report parameters and data payload
 * @param {string} [params.platform="sleeper"] Platform
 * @param {string} [params.user=""] Username or ID
 * @param {Array<string>} [params.customLeagueIds=[]] Custom league IDs
 * @param {string|number} params.season Season year
 * @param {string} [params.mode="WEEKLY"] Sync mode
 * @param {number|string} params.week Matchup week
 * @param {Array<object>} params.records Raw team records
 * @param {Record<string, object>} params.leaguesMap Map of leagues
 * @param {Array<object>} params.allLeaguesData List of all league metadata
 * @param {Array<string>} [params.selectedLeagueIds] Active selected league IDs
 * @param {object} [params.nflState] NFL state for finished evaluation
 * @returns {boolean} True if saved successfully
 */
export function saveReportToCache({
  platform = "sleeper",
  user = "",
  userId = "",
  userAvatar = "",
  customLeagueIds = [],
  season,
  mode = "WEEKLY",
  week,
  records = [],
  leaguesMap = {},
  allLeaguesData = [],
  selectedLeagueIds = [],
  nflState
}) {
  if (!records || records.length === 0) return false;

  const isFinished = isWeekFinished(season, week, nflState);
  const ttlMs = isFinished ? TTL.REPORT_FINISHED : TTL.REPORT_ACTIVE;

  const currentEspnPlayers = useCrossLeagueStore?.getState?.()?.espnPlayersDb || {};

  const payload = {
    version: "2.1",
    cachedAt: new Date().toISOString(),
    ttlMs: ttlMs,
    isFinished: isFinished,
    platform: platform,
    mode: mode,
    season: Number(season),
    week: Number(week),
    user: {
      name: user,
      id: userId || user,
      avatar: userAvatar || ""
    },
    records: records,
    leaguesMap: leaguesMap,
    allLeaguesData: allLeaguesData,
    selectedLeagueIds: selectedLeagueIds.length > 0 ? selectedLeagueIds : Object.keys(leaguesMap),
    espnPlayersDb: currentEspnPlayers
  };

  // 1. Write modern namespaced cache key
  const modernKey = getReportCacheKey({
    platform,
    user,
    customLeagueIds,
    season,
    mode,
    week
  });
  const success = setItem(modernKey, payload);

  // 2. Write legacy cache key for backward-compatibility
  const legacyTarget =
    user || (customLeagueIds.length > 0 ? `leagues:${normalizeLeagueIds(customLeagueIds)}` : "");
  if (legacyTarget) {
    const legacyKey = getCacheKey(legacyTarget, season, mode, week);
    setItem(legacyKey, payload);
  }

  return success;
}

/**
 * Loads a cached report payload from storage if available and valid.
 *
 * @param {object} params
 * @param {string} [params.platform="sleeper"]
 * @param {string} [params.user=""]
 * @param {Array<string>} [params.customLeagueIds=[]]
 * @param {string|number} params.season
 * @param {string} [params.mode="WEEKLY"]
 * @param {number|string} params.week
 * @returns {object|null} Restored report payload or null if cache miss/expired
 */
export function loadReportFromCache({
  platform = "sleeper",
  user = "",
  customLeagueIds = [],
  season,
  mode = "WEEKLY",
  week
}) {
  const modernKey = getReportCacheKey({
    platform,
    user,
    customLeagueIds,
    season,
    mode,
    week
  });

  // Try modern key first
  let data = getItem(modernKey, null);

  // Fallback to legacy key if modern is empty
  if (!data) {
    const legacyTarget =
      user || (customLeagueIds.length > 0 ? `leagues:${normalizeLeagueIds(customLeagueIds)}` : "");
    if (legacyTarget) {
      const legacyKey = getCacheKey(legacyTarget, season, mode, week);
      data = getItem(legacyKey, null);
    }
  }

  if (!data || !data.records || data.records.length === 0) return null;

  // Validate settings matching
  if (Number(data.season) !== Number(season)) return null;
  if (data.mode !== mode) return null;
  if (Number(data.week) !== Number(week)) return null;
  if ((data.platform || "sleeper") !== (platform || "sleeper")) return null;

  // Validate TTL
  if (data.cachedAt && data.ttlMs) {
    const age = Date.now() - new Date(data.cachedAt).getTime();
    if (age > data.ttlMs) return null;
  }

  return data;
}

/**
 * Clears all cached data, stored preferences, and resets the Zustand store.
 */
export function clearAllAppData() {
  clearAllStorage();
  clearApiCache();
  useCrossLeagueStore.getState().resetData();
}

/**
 * Legacy API compatibility adapters
 */
export function saveDataToCache(
  userIdOrOptions,
  userName,
  userAvatar,
  season,
  mode,
  week,
  records,
  leagues,
  allLeagues
) {
  if (typeof userIdOrOptions === "object" && userIdOrOptions !== null) {
    return saveReportToCache(userIdOrOptions);
  }
  return saveReportToCache({
    user: userName || userIdOrOptions,
    season,
    mode,
    week,
    records,
    leaguesMap: leagues,
    allLeaguesData: allLeagues
  });
}

export function tryLoadFromCache(userOrWeek, season, mode, week) {
  if (typeof userOrWeek === "object" && userOrWeek !== null) {
    return loadReportFromCache(userOrWeek);
  }
  if (season !== undefined && mode !== undefined && week !== undefined) {
    return loadReportFromCache({
      user: String(userOrWeek || ""),
      season,
      mode,
      week
    });
  }
  const s = useCrossLeagueStore.getState();
  return loadReportFromCache({
    platform: s.platform,
    user: s.userName || s.userId,
    customLeagueIds: s.customLeagueIds,
    season: s.season,
    mode: s.mode,
    week: userOrWeek || s.week
  });
}

export function clearAllData() {
  clearAllAppData();
}

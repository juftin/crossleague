/**
 * CrossLeague • Storage Management Subsystem
 *
 * Provides safe JSON serialization, quota management with LRU pruning,
 * backward-compatible preference migration, and unified storage access.
 */

import { STORAGE_KEYS, CACHE_PREFIXES, LEGACY_STORAGE_MAP } from "./constants.js";

/**
 * Checks if a Web Storage area (localStorage or sessionStorage) is available.
 *
 * @param {"localStorage" | "sessionStorage"} [type="localStorage"]
 * @returns {boolean}
 */
export function isStorageAvailable(type = "localStorage") {
  try {
    if (typeof window === "undefined") return false;
    const storage = window[type];
    if (!storage) return false;
    const testKey = `__crossleague_test_${Date.now()}__`;
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely parses JSON string with a fallback.
 *
 * @template T
 * @param {string|null} raw
 * @param {T} [defaultValue=null]
 * @returns {T}
 */
export function safeJsonParse(raw, defaultValue = null) {
  if (raw === null || raw === undefined) return defaultValue;
  try {
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

/**
 * Prunes expired or oldest cache entries when storage quota is near capacity or on explicit cleanup.
 *
 * @param {Storage} [storage=localStorage]
 * @param {number} [targetEvictions=5]
 * @returns {number} Number of evicted keys
 */
export function pruneCache(
  storage = typeof localStorage !== "undefined" ? localStorage : null,
  targetEvictions = 5
) {
  if (!storage) return 0;

  const cacheEntries = [];
  const now = Date.now();
  let evicted = 0;

  try {
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (!key) continue;

      const isCacheKey =
        key.startsWith(CACHE_PREFIXES.REPORT) ||
        key.startsWith(CACHE_PREFIXES.API) ||
        key.startsWith(CACHE_PREFIXES.LEGACY_REPORT) ||
        key.startsWith(CACHE_PREFIXES.LEGACY_API);

      if (isCacheKey) {
        const raw = storage.getItem(key);
        const parsed = safeJsonParse(raw, null);
        const timestamp = parsed?.cachedAt
          ? new Date(parsed.cachedAt).getTime()
          : parsed?.timestamp || 0;
        const ttl = parsed?.ttlMs || 0;

        // Evict expired entries immediately
        if (ttl > 0 && timestamp > 0 && now - timestamp > ttl) {
          storage.removeItem(key);
          evicted++;
          continue;
        }

        cacheEntries.push({ key, timestamp, isFinished: parsed?.isFinished });
      }
    }

    // If more space needed, evict oldest entries (preferring active/unfinished weeks over finished ones)
    if (evicted < targetEvictions && cacheEntries.length > 0) {
      cacheEntries.sort((a, b) => {
        if (a.isFinished !== b.isFinished) {
          return a.isFinished ? 1 : -1; // keep finished immutable weeks longer if possible
        }
        return a.timestamp - b.timestamp; // oldest first
      });

      const needed = targetEvictions - evicted;
      for (let i = 0; i < Math.min(needed, cacheEntries.length); i++) {
        storage.removeItem(cacheEntries[i].key);
        evicted++;
      }
    }
  } catch (err) {
    console.warn("Error while pruning cache entries:", err);
  }

  return evicted;
}

/**
 * Safely reads a value from storage.
 *
 * @template T
 * @param {string} key Storage key
 * @param {T} [defaultValue=null] Fallback value if key does not exist or fails
 * @param {Storage} [storage=localStorage] Storage implementation
 * @returns {T}
 */
export function getItem(
  key,
  defaultValue = null,
  storage = typeof localStorage !== "undefined" ? localStorage : null
) {
  if (!storage) return defaultValue;
  try {
    const raw = storage.getItem(key);
    if (raw === null) return defaultValue;
    return safeJsonParse(raw, raw);
  } catch {
    return defaultValue;
  }
}

/**
 * Safely writes a value to storage with quota error recovery.
 *
 * @param {string} key Storage key
 * @param {any} value Value to serialize & store
 * @param {Storage} [storage=localStorage] Storage implementation
 * @returns {boolean} True if successfully stored
 */
export function setItem(
  key,
  value,
  storage = typeof localStorage !== "undefined" ? localStorage : null
) {
  if (!storage) return false;

  const serialized = typeof value === "string" ? value : JSON.stringify(value);

  try {
    storage.setItem(key, serialized);
    return true;
  } catch (err) {
    // Check for QuotaExceededError
    const isQuotaError =
      err instanceof DOMException &&
      (err.code === 22 ||
        err.code === 1014 ||
        err.name === "QuotaExceededError" ||
        err.name === "NS_ERROR_DOM_QUOTA_REACHED");

    if (isQuotaError) {
      console.warn("Storage quota exceeded. Evicting older cache entries...");
      const freed = pruneCache(storage, 8);
      if (freed > 0) {
        try {
          storage.setItem(key, serialized);
          return true;
        } catch {
          console.error(`Failed to store key "${key}" even after cache eviction.`);
        }
      }
    }
    return false;
  }
}

/**
 * Removes an item from storage.
 *
 * @param {string} key Storage key
 * @param {Storage} [storage=localStorage] Storage implementation
 */
export function removeItem(
  key,
  storage = typeof localStorage !== "undefined" ? localStorage : null
) {
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {}
}

/**
 * Retrieves a preference value by modern key, with transparent fallback to legacy keys.
 *
 * @template T
 * @param {string} key Modern preference key from STORAGE_KEYS
 * @param {T} [defaultValue=null] Fallback value
 * @returns {T}
 */
export function getPreference(key, defaultValue = null) {
  if (typeof localStorage === "undefined") return defaultValue;

  // 1. Try modern key
  const val = getItem(key, null, localStorage);
  if (val !== null && val !== undefined) return val;

  // 2. Check legacy fallback keys
  const legacyKeys = LEGACY_STORAGE_MAP[key] || [];
  for (const legacyKey of legacyKeys) {
    const legacyVal = getItem(legacyKey, null, localStorage);
    if (legacyVal !== null && legacyVal !== undefined) {
      return legacyVal;
    }
  }

  return defaultValue;
}

/**
 * Saves a user preference under the standardized namespaced key.
 *
 * @param {string} key Modern preference key from STORAGE_KEYS
 * @param {any} value Value to persist
 */
export function setPreference(key, value) {
  setItem(key, value, typeof localStorage !== "undefined" ? localStorage : null);
}

/**
 * Hydrates all stored user preferences into a normalized object.
 *
 * @returns {{
 *   platform: "sleeper" | "espn",
 *   syncType: "user" | "leagues",
 *   userName: string,
 *   userId: string,
 *   customLeagueIds: string[],
 *   season: number,
 *   week: number,
 *   mode: "WEEKLY" | "SEASON_ROLLUP"
 * }}
 */
export function getAllPreferences() {
  const currentYear = new Date().getFullYear();

  const rawPlatform = getPreference(STORAGE_KEYS.PREF_PLATFORM, "sleeper");
  const platform = rawPlatform === "espn" ? "espn" : "sleeper";

  const generalUserName = getPreference(STORAGE_KEYS.PREF_USER_NAME, "");
  const generalUserId = getPreference(STORAGE_KEYS.PREF_USER_ID, "");
  const generalSyncType = getPreference(STORAGE_KEYS.PREF_SYNC_TYPE, "user");
  const generalCustomLeaguesRaw = getPreference(STORAGE_KEYS.PREF_CUSTOM_LEAGUES, []);
  const generalCustomLeagueIds = Array.isArray(generalCustomLeaguesRaw)
    ? generalCustomLeaguesRaw.filter(Boolean)
    : [];

  const sleeperSyncType = getPreference(STORAGE_KEYS.PREF_SLEEPER_SYNC_TYPE, generalSyncType);
  const sleeperUserName = getPreference(STORAGE_KEYS.PREF_SLEEPER_USER_NAME, generalUserName);
  const sleeperUserId = getPreference(STORAGE_KEYS.PREF_SLEEPER_USER_ID, generalUserId);
  const rawSleeperCustom = getPreference(STORAGE_KEYS.PREF_SLEEPER_CUSTOM_LEAGUES, null);
  const sleeperCustomLeagueIds =
    Array.isArray(rawSleeperCustom) && rawSleeperCustom.length > 0
      ? rawSleeperCustom.filter(Boolean)
      : platform === "sleeper"
        ? generalCustomLeagueIds
        : [];

  const rawEspnCustom = getPreference(STORAGE_KEYS.PREF_ESPN_CUSTOM_LEAGUES, null);
  const espnCustomLeagueIds =
    Array.isArray(rawEspnCustom) && rawEspnCustom.length > 0
      ? rawEspnCustom.filter(Boolean)
      : platform === "espn"
        ? generalCustomLeagueIds
        : [];

  const season = Number(getPreference(STORAGE_KEYS.PREF_SEASON, currentYear)) || currentYear;
  const week = Number(getPreference(STORAGE_KEYS.PREF_WEEK, 1)) || 1;
  const mode = getPreference(STORAGE_KEYS.PREF_MODE, "WEEKLY");

  const syncType =
    platform === "espn" ? "leagues" : sleeperSyncType === "leagues" ? "leagues" : "user";
  const customLeagueIds =
    platform === "espn"
      ? espnCustomLeagueIds.length > 0
        ? espnCustomLeagueIds
        : generalCustomLeagueIds
      : sleeperCustomLeagueIds.length > 0
        ? sleeperCustomLeagueIds
        : generalCustomLeagueIds;
  const userName =
    typeof sleeperUserName === "string" && sleeperUserName
      ? sleeperUserName
      : typeof generalUserName === "string"
        ? generalUserName
        : "";
  const userId =
    typeof sleeperUserId === "string" && sleeperUserId
      ? sleeperUserId
      : typeof generalUserId === "string"
        ? generalUserId
        : "";

  return {
    platform,
    syncType,
    userName,
    userId,
    customLeagueIds,
    sleeperUserName: typeof sleeperUserName === "string" ? sleeperUserName : "",
    sleeperUserId: typeof sleeperUserId === "string" ? sleeperUserId : "",
    sleeperSyncType: sleeperSyncType === "leagues" ? "leagues" : "user",
    sleeperCustomLeagueIds,
    espnCustomLeagueIds,
    season,
    week,
    mode: mode === "SEASON_ROLLUP" ? "SEASON_ROLLUP" : "WEEKLY"
  };
}

/**
 * Clears all CrossLeague data and preferences from localStorage and sessionStorage.
 */
export function clearAllStorage() {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
  } catch (err) {
    console.warn("Could not clear localStorage:", err);
  }

  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.clear();
    }
  } catch (err) {
    console.warn("Could not clear sessionStorage:", err);
  }
}

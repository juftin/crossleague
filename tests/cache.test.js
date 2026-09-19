import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  getReportCacheKey,
  getCacheKey,
  isWeekFinished,
  saveReportToCache,
  loadReportFromCache,
  clearAllAppData
} from "../src/js/state/cache.js";
import { initPlayersDb, getPlayerInfo } from "../src/js/api/players.js";
import { state } from "../src/js/state/store.js";
import {
  pruneCache,
  getPreference,
  setPreference,
  getAllPreferences,
  getItem,
  setItem
} from "../src/js/state/storage.js";
import { STORAGE_KEYS } from "../src/js/state/constants.js";

// In-memory mock storage implementation for Node.js test environment
class MockStorage {
  constructor() {
    this.store = new Map();
  }

  get length() {
    return this.store.size;
  }

  key(index) {
    return Array.from(this.store.keys())[index] || null;
  }

  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  setItem(key, value) {
    this.store.set(String(key), String(value));
  }

  removeItem(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

describe("CrossLeague Storage & Caching Subsystem", () => {
  let mockLocalStorage;

  beforeEach(() => {
    mockLocalStorage = new MockStorage();
    globalThis.localStorage = mockLocalStorage;
    globalThis.sessionStorage = new MockStorage();
  });

  describe("Cache Key Generation", () => {
    it("should generate canonical namespaced report keys", () => {
      const keyUser = getReportCacheKey({
        platform: "sleeper",
        user: "Juftin ",
        season: 2024,
        mode: "WEEKLY",
        week: 1
      });
      assert.equal(keyUser, "crossleague:cache:report:sleeper:user:juftin:2024:WEEKLY:1");

      const keyLeagues = getReportCacheKey({
        platform: "espn",
        customLeagueIds: ["espn:999", "123"],
        season: 2024,
        mode: "SEASON_ROLLUP",
        week: 5
      });
      assert.equal(
        keyLeagues,
        "crossleague:cache:report:espn:leagues:123,999:2024:SEASON_ROLLUP:5"
      );
    });

    it("should generate backward-compatible legacy keys", () => {
      const keyW1 = getCacheKey("Juftin ", "2024", "WEEKLY", 1);
      const keyW2 = getCacheKey("juftin", "2024", "WEEKLY", 2);
      const keySeason = getCacheKey("juftin", "2024", "SEASON_ROLLUP", 5);

      assert.equal(keyW1, "crossleague_cache_juftin_2024_WEEKLY_1");
      assert.equal(keyW2, "crossleague_cache_juftin_2024_WEEKLY_2");
      assert.equal(keySeason, "crossleague_cache_juftin_2024_SEASON_ROLLUP_5");
      assert.notEqual(keyW1, keyW2);
    });
  });

  describe("Finished Week Determination", () => {
    it("should mark all weeks as finished for past seasons", () => {
      const state = { season: 2024, week: 5, season_type: "regular" };
      assert.equal(isWeekFinished("2023", 1, state), true);
      assert.equal(isWeekFinished("2023", 18, state), true);
      assert.equal(isWeekFinished("2022", 10, state), true);
    });

    it("should mark strictly prior weeks as finished in active season", () => {
      const state = { season: 2024, week: 5, season_type: "regular" };
      assert.equal(isWeekFinished("2024", 1, state), true);
      assert.equal(isWeekFinished("2024", 4, state), true);
      assert.equal(isWeekFinished("2024", 5, state), false); // Current week is active
      assert.equal(isWeekFinished("2024", 6, state), false); // Future week is not finished
    });

    it("should mark all regular season weeks as finished when in post-season or off-season", () => {
      const statePost = { season: 2024, week: 1, season_type: "post" };
      assert.equal(isWeekFinished("2024", 1, statePost), true);
      assert.equal(isWeekFinished("2024", 18, statePost), true);

      const stateOff = { season: 2024, week: 1, season_type: "off" };
      assert.equal(isWeekFinished("2024", 1, stateOff), true);
    });
  });

  describe("Report Caching & Retrieval", () => {
    it("should save and restore cached reports without cross-contamination", () => {
      const week1Records = [{ id: "t1", leagueId: "101", points: 145.2 }];
      const leaguesMap = { 101: { id: "101", name: "Dynasty Alpha", totalRosters: 12 } };
      const allLeaguesData = [{ league_id: "101", name: "Dynasty Alpha" }];

      saveReportToCache({
        platform: "sleeper",
        user: "juftin",
        season: 2024,
        mode: "WEEKLY",
        week: 1,
        records: week1Records,
        leaguesMap,
        allLeaguesData,
        nflState: { season: 2024, week: 5, season_type: "regular" },
        userId: "998877",
        userAvatar: "avatar_hash_123"
      });

      // Retrieve Week 1
      const cachedW1 = loadReportFromCache({
        platform: "sleeper",
        user: "juftin",
        season: 2024,
        mode: "WEEKLY",
        week: 1
      });

      assert.ok(cachedW1);
      assert.equal(cachedW1.week, 1);
      assert.equal(cachedW1.isFinished, true);
      assert.equal(cachedW1.user.id, "998877");
      assert.equal(cachedW1.user.avatar, "avatar_hash_123");
      assert.equal(cachedW1.records[0].points, 145.2);
      assert.equal(cachedW1.allLeaguesData[0].name, "Dynasty Alpha");

      // Verify Week 2 results in cache miss
      const cachedW2 = loadReportFromCache({
        platform: "sleeper",
        user: "juftin",
        season: 2024,
        mode: "WEEKLY",
        week: 2
      });
      assert.equal(cachedW2, null);
    });

    it("should invalidate expired cache entries based on TTL", () => {
      const records = [{ id: "t1", points: 120 }];
      const modernKey = getReportCacheKey({
        platform: "sleeper",
        user: "juftin",
        season: 2024,
        mode: "WEEKLY",
        week: 5
      });

      // Write active week payload with 1ms TTL
      setItem(modernKey, {
        version: "2.1",
        cachedAt: new Date(Date.now() - 50).toISOString(),
        ttlMs: 10,
        isFinished: false,
        platform: "sleeper",
        mode: "WEEKLY",
        season: 2024,
        week: 5,
        records
      });

      const result = loadReportFromCache({
        platform: "sleeper",
        user: "juftin",
        season: 2024,
        mode: "WEEKLY",
        week: 5
      });
      assert.equal(result, null);
    });

    it("should preserve player databases and resolve player metadata across page reloads", async () => {
      // 1. Seed player databases in storage
      setItem(STORAGE_KEYS.PLAYERS_SLEEPER, {
        1001: { name: "Patrick Mahomes", pos: "QB", team: "KC" }
      });
      setItem(STORAGE_KEYS.PLAYERS_ESPN, {
        espn_4040715: { name: "Bijan Robinson", pos: "RB", team: "ATL" }
      });

      // 2. Clear in-memory state (simulating page reload)
      state.sleeperPlayersDb = null;
      state.espnPlayersDb = {};

      // 3. Initialize player databases
      await initPlayersDb();

      // 4. Verify player metadata resolution
      const sleeperPlayer = getPlayerInfo("1001");
      assert.equal(sleeperPlayer.name, "Patrick Mahomes");
      assert.equal(sleeperPlayer.pos, "QB");
      assert.equal(sleeperPlayer.team, "KC");

      const espnPlayer = getPlayerInfo("espn_4040715");
      assert.equal(espnPlayer.name, "Bijan Robinson");
      assert.equal(espnPlayer.pos, "RB");
      assert.equal(espnPlayer.team, "ATL");
    });
  });

  describe("LRU Eviction & Quota Recovery", () => {
    it("should evict expired and oldest cache entries during pruning", () => {
      const now = Date.now();

      // 1. Expired entry
      setItem("crossleague:cache:report:sleeper:user:user1:2024:WEEKLY:1", {
        cachedAt: new Date(now - 100000).toISOString(),
        ttlMs: 5000,
        isFinished: false
      });

      // 2. Old active entry
      setItem("crossleague:cache:report:sleeper:user:user2:2024:WEEKLY:2", {
        cachedAt: new Date(now - 50000).toISOString(),
        ttlMs: 1000000,
        isFinished: false
      });

      // 3. Recent finished entry
      setItem("crossleague:cache:report:sleeper:user:user3:2024:WEEKLY:3", {
        cachedAt: new Date(now - 1000).toISOString(),
        ttlMs: 1000000,
        isFinished: true
      });

      assert.equal(mockLocalStorage.length, 3);

      const evicted = pruneCache(mockLocalStorage, 2);
      assert.ok(evicted >= 1);
      assert.equal(
        getItem(
          "crossleague:cache:report:sleeper:user:user1:2024:WEEKLY:1",
          null,
          mockLocalStorage
        ),
        null
      );
    });
  });

  describe("Preference Migration & Backward Compatibility", () => {
    it("should transparently read legacy storage keys when modern keys are unset", () => {
      mockLocalStorage.setItem("sleeper_username", "legacy_user");
      mockLocalStorage.setItem("crossleague_platform", "espn");
      mockLocalStorage.setItem("sleeper_custom_league_ids", JSON.stringify(["111", "222"]));
      mockLocalStorage.setItem("sleeper_season", "2023");

      assert.equal(getPreference(STORAGE_KEYS.PREF_USER_NAME), "legacy_user");
      assert.equal(getPreference(STORAGE_KEYS.PREF_PLATFORM), "espn");
      assert.deepEqual(getPreference(STORAGE_KEYS.PREF_CUSTOM_LEAGUES), ["111", "222"]);
      assert.equal(Number(getPreference(STORAGE_KEYS.PREF_SEASON)), 2023);

      const prefs = getAllPreferences();
      assert.equal(prefs.userName, "legacy_user");
      assert.equal(prefs.platform, "espn");
      assert.deepEqual(prefs.customLeagueIds, ["111", "222"]);
      assert.equal(prefs.season, 2023);
    });

    it("should prioritize modern namespaced preference keys over legacy keys", () => {
      mockLocalStorage.setItem("sleeper_username", "legacy_user");
      setPreference(STORAGE_KEYS.PREF_USER_NAME, "modern_user");

      assert.equal(getPreference(STORAGE_KEYS.PREF_USER_NAME), "modern_user");
      assert.equal(getAllPreferences().userName, "modern_user");
    });
  });

  describe("Data Clearing & Reset", () => {
    it("should clear all data across storage layers", () => {
      setPreference(STORAGE_KEYS.PREF_PLATFORM, "espn");
      setPreference(STORAGE_KEYS.PREF_USER_NAME, "juftin");
      setItem("crossleague:cache:report:test", { records: [] });

      assert.ok(mockLocalStorage.length >= 2);

      clearAllAppData();

      assert.equal(mockLocalStorage.length, 0);
      assert.equal(getPreference(STORAGE_KEYS.PREF_USER_NAME), null);
    });
  });
});

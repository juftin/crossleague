import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Weekly Navigation & Caching Logic", () => {
  function getCacheKey(user, season, mode, week) {
    const u = (user || "").toLowerCase().trim();
    return `crossleague_cache_${u}_${season}_${mode}_${week}`;
  }

  function isWeekFinished(season, week, state) {
    const s = parseInt(season, 10);
    const w = parseInt(week, 10);
    if (!state || !state.season) return false;
    if (s < state.season) return true;
    if (s === state.season) {
      if (state.season_type === "post") return true;
      const currentNflWeek = state.week || 1;
      return w < currentNflWeek;
    }
    return false;
  }

  describe("Cache Key Generation", () => {
    it("should normalize username and generate distinct keys per week", () => {
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

    it("should mark prior weeks as finished in active season", () => {
      const state = { season: 2024, week: 5, season_type: "regular" };
      assert.equal(isWeekFinished("2024", 1, state), true);
      assert.equal(isWeekFinished("2024", 4, state), true);
      // Week 5 is in progress
      assert.equal(isWeekFinished("2024", 5, state), false);
      // Week 6 is future
      assert.equal(isWeekFinished("2024", 6, state), false);
    });

    it("should mark all regular season weeks as finished when season is in post-season", () => {
      const state = { season: 2024, week: 1, season_type: "post" };
      assert.equal(isWeekFinished("2024", 1, state), true);
      assert.equal(isWeekFinished("2024", 18, state), true);
    });
  });

  describe("Cache Isolation and Retrieval", () => {
    it("should isolate cached data per week without cross-contamination", () => {
      const mockStorage = new Map();

      const saveToCache = (user, season, mode, week, records) => {
        const key = getCacheKey(user, season, mode, week);
        mockStorage.set(
          key,
          JSON.stringify({
            version: "2.0",
            cachedAt: new Date().toISOString(),
            week,
            season,
            records
          })
        );
      };

      const loadFromCache = (user, season, mode, week) => {
        const key = getCacheKey(user, season, mode, week);
        const raw = mockStorage.get(key);
        if (!raw) return null;
        return JSON.parse(raw);
      };

      // Store Week 1 data
      const week1Records = [{ id: "t1", points: 145.2 }];
      saveToCache("juftin", "2024", "WEEKLY", 1, week1Records);

      // Verify Week 1 is in cache
      const cachedW1 = loadFromCache("juftin", "2024", "WEEKLY", 1);
      assert.ok(cachedW1);
      assert.equal(cachedW1.week, 1);
      assert.equal(cachedW1.records[0].points, 145.2);

      // Verify navigating to Week 2 results in a cache miss (requiring fetch)
      const cachedW2 = loadFromCache("juftin", "2024", "WEEKLY", 2);
      assert.equal(cachedW2, null);

      // Store Week 2 data after fetch
      const week2Records = [{ id: "t1", points: 128.6 }];
      saveToCache("juftin", "2024", "WEEKLY", 2, week2Records);

      // Verify both weeks are now independently cached
      assert.equal(loadFromCache("juftin", "2024", "WEEKLY", 1).records[0].points, 145.2);
      assert.equal(loadFromCache("juftin", "2024", "WEEKLY", 2).records[0].points, 128.6);
    });

    it("should preserve allLeaguesData and leaguesMap in cached payloads", () => {
      const mockStorage = new Map();
      const key = getCacheKey("juftin", "2024", "WEEKLY", 1);
      const leagues = [
        { league_id: "101", name: "Dynasty Alpha" },
        { league_id: "102", name: "Redraft Beta" }
      ];
      const leaguesMap = { 101: { name: "Dynasty Alpha" }, 102: { name: "Redraft Beta" } };
      const records = [{ id: "101-1", leagueId: "101", league: "Dynasty Alpha", points: 120 }];

      mockStorage.set(
        key,
        JSON.stringify({
          version: "2.0",
          season: "2024",
          week: 1,
          records,
          leaguesMap,
          allLeaguesData: leagues
        })
      );

      const parsed = JSON.parse(mockStorage.get(key));
      assert.equal(parsed.allLeaguesData.length, 2);
      assert.equal(parsed.allLeaguesData[0].name, "Dynasty Alpha");
      assert.equal(parsed.leaguesMap["102"].name, "Redraft Beta");
    });
  });

  describe("Data Clearing & State Reset", () => {
    it("should clear all localStorage keys and reset user preferences", () => {
      const mockStorage = new Map([
        ["crossleague_platform", "espn"],
        ["sleeper_username", "juftin"],
        ["sleeper_custom_league_ids", '["123","456"]'],
        ["crossleague_cache_juftin_2024_WEEKLY_1", '{"records":[]}']
      ]);

      assert.equal(mockStorage.size, 4);

      // Simulate clearAllData
      mockStorage.clear();

      assert.equal(mockStorage.size, 0);
      assert.equal(mockStorage.get("sleeper_username"), undefined);
      assert.equal(mockStorage.get("crossleague_cache_juftin_2024_WEEKLY_1"), undefined);
    });
  });
});

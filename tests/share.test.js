import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Shareable URL & Parameter Extraction", () => {
  function parseMockUrlParams(searchStr) {
    const params = new URLSearchParams(searchStr);
    const user =
      params.get("user") || params.get("u") || params.get("username") || params.get("userId");
    const season = params.get("season") || params.get("year");
    const week = params.get("week") || params.get("w");
    const mode = params.get("mode") || params.get("m");
    const leagues = params.get("leagues") || params.get("league_ids");
    return { user, season, week, mode, leagues };
  }

  function buildMockShareableUrl({
    origin = "https://crossleague.app",
    pathname = "/",
    season = "2024",
    week = "5",
    mode = "WEEKLY",
    allLeagueIds = ["101", "102", "103"],
    selectedLeagueIds = ["101", "103"],
    currentTab = "awards"
  }) {
    const url = new URL(`${origin}${pathname}`);
    url.search = "";
    if (season) url.searchParams.set("season", season);
    if (week) url.searchParams.set("week", week);
    if (mode) url.searchParams.set("mode", mode);

    let leagueIds = [];
    if (selectedLeagueIds && selectedLeagueIds.length > 0) {
      leagueIds = selectedLeagueIds;
    } else if (allLeagueIds && allLeagueIds.length > 0) {
      leagueIds = allLeagueIds;
    }
    if (leagueIds.length > 0) {
      url.searchParams.set("leagues", leagueIds.join(","));
    }

    url.hash = `#${currentTab}`;
    return url.toString();
  }

  it("should parse standard query parameters correctly", () => {
    const query = "?user=sleeperuser&season=2024&week=8&mode=WEEKLY&leagues=9991,9992";
    const result = parseMockUrlParams(query);

    assert.equal(result.user, "sleeperuser");
    assert.equal(result.season, "2024");
    assert.equal(result.week, "8");
    assert.equal(result.mode, "WEEKLY");
    assert.equal(result.leagues, "9991,9992");
  });

  it("should support shorthand aliases (u, year, w, m, league_ids)", () => {
    const query = "?u=testmgr&year=2023&w=3&m=SEASON_ROLLUP&league_ids=8881";
    const result = parseMockUrlParams(query);

    assert.equal(result.user, "testmgr");
    assert.equal(result.season, "2023");
    assert.equal(result.week, "3");
    assert.equal(result.mode, "SEASON_ROLLUP");
    assert.equal(result.leagues, "8881");
  });

  it("should generate a complete shareable URL with season, week, mode, league IDs, and hash (omitting user)", () => {
    const url = buildMockShareableUrl({
      origin: "https://crossleague.app",
      pathname: "/",
      season: "2025",
      week: "4",
      mode: "WEEKLY",
      allLeagueIds: ["L1", "L2", "L3"],
      selectedLeagueIds: ["L1", "L2"],
      currentTab: "awards"
    });

    assert.equal(
      url,
      "https://crossleague.app/?season=2025&week=4&mode=WEEKLY&leagues=L1%2CL2#awards"
    );
  });

  it("should encode all league IDs when all leagues are selected", () => {
    const url = buildMockShareableUrl({
      origin: "https://crossleague.app",
      pathname: "/",
      season: "2024",
      week: "1",
      mode: "SEASON_ROLLUP",
      allLeagueIds: ["L1", "L2"],
      selectedLeagueIds: ["L1", "L2"],
      currentTab: "luck"
    });

    assert.equal(
      url,
      "https://crossleague.app/?season=2024&week=1&mode=SEASON_ROLLUP&leagues=L1%2CL2#luck"
    );
  });

  it("should parse multi-input league ID strings (comma, space, newline, semicolon separated)", () => {
    function extractCustomLeagueIds(rawStr) {
      if (!rawStr) return [];
      return Array.from(
        new Set(
          rawStr
            .split(/[\s,;\n\t]+/)
            .map(s => s.trim().replace(/^#/, ""))
            .filter(s => s.length > 0 && /^\d+$/.test(s))
        )
      );
    }

    const testInput =
      " 112233445566778899, #998877665544332211;\n112233445566778899\t 445566778899001122  ";
    const ids = extractCustomLeagueIds(testInput);

    assert.deepEqual(ids, ["112233445566778899", "998877665544332211", "445566778899001122"]);
  });

  it("should generate and parse ESPN platform shareable URLs correctly", () => {
    function buildEspnShareableUrl({
      origin = "https://crossleague.app",
      pathname = "/",
      platform = "espn",
      season = "2024",
      week = "1",
      mode = "WEEKLY",
      leagueIds = ["espn:1664455"],
      currentTab = "power"
    }) {
      const url = new URL(`${origin}${pathname}`);
      url.search = "";
      if (platform === "espn") url.searchParams.set("platform", "espn");
      if (season) url.searchParams.set("season", season);
      if (week) url.searchParams.set("week", week);
      if (mode) url.searchParams.set("mode", mode);
      const cleanIds = leagueIds.map(id => String(id).replace(/^espn:/i, ""));
      if (cleanIds.length > 0) url.searchParams.set("leagues", cleanIds.join(","));
      url.hash = `#${currentTab}`;
      return url.toString();
    }

    const shareUrl = buildEspnShareableUrl({
      season: "2024",
      week: "1",
      mode: "WEEKLY",
      leagueIds: ["espn:1664455"],
      currentTab: "power"
    });

    assert.equal(
      shareUrl,
      "https://crossleague.app/?platform=espn&season=2024&week=1&mode=WEEKLY&leagues=1664455#power"
    );

    const parsed = new URL(shareUrl);
    assert.equal(parsed.searchParams.get("platform"), "espn");
    assert.equal(parsed.searchParams.get("leagues"), "1664455");
    assert.equal(parsed.searchParams.get("season"), "2024");
    assert.equal(parsed.searchParams.get("week"), "1");
    assert.equal(parsed.hash, "#power");
  });

  it("should wipe prior custom leagues and switch syncType when loading query params with leagues", () => {
    // Simulate previous local state with existing custom leagues and user
    let customLeagueIds = new Set(["old_league_1", "old_league_2"]);
    let currentSyncType = "user";
    let userId = "old_user";

    const queryParams = { leagues: "1664455,998877", platform: "espn", season: "2024", week: "1" };

    if (queryParams.leagues) {
      const ids = queryParams.leagues
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);
      customLeagueIds.clear(); // Must wipe old custom leagues
      ids.forEach(id => customLeagueIds.add(id));
      if (!queryParams.user) {
        currentSyncType = "leagues";
        userId = "";
      }
    }

    assert.equal(currentSyncType, "leagues");
    assert.equal(userId, "");
    assert.deepEqual(Array.from(customLeagueIds), ["1664455", "998877"]);
    assert.equal(customLeagueIds.has("old_league_1"), false);
  });

  it("should invalidate cache if cached settings or platform do not match current query parameters", () => {
    const cachedData = {
      version: "2.0",
      season: "2024",
      week: 1,
      mode: "WEEKLY",
      records: [{ id: "espn-1", platform: "espn", points: 100 }],
      allLeaguesData: [{ league_id: "espn:1664455" }]
    };

    function validateCache(cache, currentSettings) {
      if (!cache || cache.version !== "2.0") return false;
      if (String(cache.season) !== String(currentSettings.season)) return false;
      if (cache.mode !== currentSettings.mode) return false;
      if (parseInt(cache.week, 10) !== parseInt(currentSettings.week, 10)) return false;
      if ((cache.records[0]?.platform || "sleeper") !== currentSettings.platform) return false;

      if (currentSettings.syncType === "leagues" && currentSettings.customLeagueIds.size > 0) {
        const cachedLids = new Set(
          (cache.allLeaguesData || []).map(l => String(l.league_id).replace(/^(espn|sleeper):/, ""))
        );
        const expectedLids = Array.from(currentSettings.customLeagueIds).map(id =>
          String(id).replace(/^(espn|sleeper):/, "")
        );
        const allMatch = expectedLids.every(id => cachedLids.has(id));
        if (!allMatch) return false;
      }
      return true;
    }

    // Matching settings -> valid
    assert.equal(
      validateCache(cachedData, {
        season: "2024",
        week: 1,
        mode: "WEEKLY",
        platform: "espn",
        syncType: "leagues",
        customLeagueIds: new Set(["1664455"])
      }),
      true
    );

    // Mismatched platform (sleeper requested, espn in cache) -> invalid
    assert.equal(
      validateCache(cachedData, {
        season: "2024",
        week: 1,
        mode: "WEEKLY",
        platform: "sleeper",
        syncType: "leagues",
        customLeagueIds: new Set(["1664455"])
      }),
      false
    );

    // Mismatched week (week 2 requested, week 1 in cache) -> invalid
    assert.equal(
      validateCache(cachedData, {
        season: "2024",
        week: 2,
        mode: "WEEKLY",
        platform: "espn",
        syncType: "leagues",
        customLeagueIds: new Set(["1664455"])
      }),
      false
    );

    // Mismatched leagues (league 999999 requested, not in cache) -> invalid
    assert.equal(
      validateCache(cachedData, {
        season: "2024",
        week: 1,
        mode: "WEEKLY",
        platform: "espn",
        syncType: "leagues",
        customLeagueIds: new Set(["999999"])
      }),
      false
    );
  });
});

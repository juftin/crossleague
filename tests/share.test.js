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
});

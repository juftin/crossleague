/** Season Pulse analytics stay aligned with completed week numbers. */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateSeasonPulse } from "../src/js/analytics/seasonPulse.js";

/** Build a season record with paired scores and week metadata. */
function team(id, leagueId, scores, weeks) {
  return {
    id,
    leagueId,
    weeklyScores: scores,
    weeklyPlayerRecords: weeks.map(week => ({ week }))
  };
}

describe("Season Pulse", () => {
  it("leaves gaps for missed weeks and averages only completed league scores", () => {
    const selected = team("a", "alpha", [100, 120, 90], [1, 3, 4]);
    const peer = team("b", "alpha", [80, 110, 130, 100], [1, 2, 3, 4]);
    const otherLeague = team("c", "beta", [200, 200, 200, 200], [1, 2, 3, 4]);

    const pulse = calculateSeasonPulse(selected, [selected, peer, otherLeague]);

    assert.deepEqual(pulse.weeks, [
      { week: 1, squadPoints: 100, leagueAverage: 90 },
      { week: 2, squadPoints: null, leagueAverage: 110 },
      { week: 3, squadPoints: 120, leagueAverage: 125 },
      { week: 4, squadPoints: 90, leagueAverage: 95 }
    ]);
    assert.deepEqual(pulse.bestWeek, { week: 3, points: 120 });
    assert.deepEqual(pulse.worstWeek, { week: 4, points: 90 });
    assert.equal(pulse.seasonAverage, 310 / 3);
    assert.equal(pulse.recentAverage, 310 / 3);
    assert.equal(pulse.recentDelta, 0);
  });

  it("uses the last three completed weeks for recent form", () => {
    const selected = team("a", "alpha", [80, 90, 100, 130], [1, 2, 4, 5]);
    const pulse = calculateSeasonPulse(selected, [selected]);

    assert.equal(pulse.seasonAverage, 100);
    assert.equal(pulse.recentAverage, 320 / 3);
    assert.equal(pulse.recentDelta, 320 / 3 - 100);
  });

  it("shows no recent form before three completed weeks", () => {
    const selected = team("a", "alpha", [100, 90], [1, 3]);
    const pulse = calculateSeasonPulse(selected, [selected]);

    assert.equal(pulse.recentAverage, null);
    assert.equal(pulse.recentDelta, null);
    assert.deepEqual(
      pulse.weeks.map(point => point.week),
      [1, 3]
    );
  });

  it("returns an empty result when no completed week metadata is available", () => {
    const selected = team("a", "alpha", [100], []);
    const pulse = calculateSeasonPulse(selected, [selected]);

    assert.deepEqual(pulse.weeks, []);
    assert.equal(pulse.bestWeek, null);
    assert.equal(pulse.seasonAverage, null);
  });
});

/** Tests scoring-settings compatibility detection. */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  compareScoringSettings,
  stableSettingsSignature
} from "../src/js/analytics/scoringSettings.js";

describe("scoring settings comparison", () => {
  it("treats equivalent settings with different object key order as a match", () => {
    const result = compareScoringSettings(
      {
        alpha: { id: "alpha", name: "Alpha", scoringSettings: { rec: 1, pass_td: 4 } },
        beta: { id: "beta", name: "Beta", scoringSettings: { pass_td: 4, rec: 1 } }
      },
      ["alpha", "beta"]
    );

    assert.equal(result.hasMismatch, false);
    assert.equal(stableSettingsSignature({ b: 2, a: 1 }), '{"a":1,"b":2}');
  });

  it("flags selected leagues with different scoring values", () => {
    const result = compareScoringSettings(
      {
        alpha: { id: "alpha", name: "Alpha", scoringSettings: { rec: 1 } },
        beta: { id: "beta", name: "Beta", scoringSettings: { rec: 0.5 } }
      },
      ["alpha", "beta"]
    );

    assert.equal(result.hasMismatch, true);
    assert.deepEqual(result.leagues, [
      { id: "alpha", name: "Alpha" },
      { id: "beta", name: "Beta" }
    ]);
  });

  it("does not warn when fewer than two leagues expose scoring settings", () => {
    const result = compareScoringSettings(
      { alpha: { id: "alpha", name: "Alpha", scoringSettings: { rec: 1 } } },
      ["alpha"]
    );

    assert.equal(result.hasMismatch, false);
  });
});

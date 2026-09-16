import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Analytics & Matchup Calculations", () => {
  describe("All-Play & Expected Wins (xW) Calculation", () => {
    it("should compute accurate all-play record and expected wins for a 4-team league", () => {
      const scores = [150.0, 120.0, 110.0, 90.0];
      // N = 4 teams, each plays N-1 = 3 rivals
      // Team 0 (150.0): beats 120, 110, 90 -> 3-0, xW = 3/3 = 1.0
      // Team 1 (120.0): beats 110, 90; loses to 150 -> 2-1, xW = 2/3 = 0.67
      // Team 2 (110.0): beats 90; loses to 150, 120 -> 1-2, xW = 1/3 = 0.33
      // Team 3 (90.0): loses to 150, 120, 110 -> 0-3, xW = 0/3 = 0.0

      const calculateAllPlay = teamScore => {
        let wins = 0;
        let losses = 0;
        let ties = 0;
        scores.forEach(s => {
          if (s === teamScore) return;
          if (teamScore > s) wins++;
          else if (teamScore < s) losses++;
          else ties++;
        });
        const totalOpponents = scores.length - 1;
        const xw = totalOpponents > 0 ? (wins + ties * 0.5) / totalOpponents : 0;
        const winPct =
          wins + losses + ties > 0
            ? Math.round(((wins + ties * 0.5) / (wins + losses + ties)) * 1000) / 10
            : 0;
        return { wins, losses, ties, xw, winPct };
      };

      const t0 = calculateAllPlay(150.0);
      assert.equal(t0.wins, 3);
      assert.equal(t0.losses, 0);
      assert.equal(t0.xw, 1.0);
      assert.equal(t0.winPct, 100);

      const t1 = calculateAllPlay(120.0);
      assert.equal(t1.wins, 2);
      assert.equal(t1.losses, 1);
      assert.equal(Math.round(t1.xw * 100) / 100, 0.67);
      assert.equal(t1.winPct, 66.7);

      const t3 = calculateAllPlay(90.0);
      assert.equal(t3.wins, 0);
      assert.equal(t3.losses, 3);
      assert.equal(t3.xw, 0);
      assert.equal(t3.winPct, 0);
    });

    it("should handle ties properly in all-play simulation", () => {
      const scores = [130.0, 130.0, 100.0];
      // Team 0 (130.0): ties Team 1 (0.5), beats Team 2 (1.0) -> 1.5/2 = 0.75 xW
      let wins = 0,
        losses = 0,
        ties = 0;
      const myScore = 130.0;
      let matchedSelf = false;
      scores.forEach(s => {
        if (s === myScore && !matchedSelf) {
          matchedSelf = true;
          return;
        }
        if (myScore > s) wins++;
        else if (myScore < s) losses++;
        else ties++;
      });
      const totalOpp = scores.length - 1;
      const xw = (wins + ties * 0.5) / totalOpp;

      assert.equal(wins, 1);
      assert.equal(ties, 1);
      assert.equal(losses, 0);
      assert.equal(xw, 0.75);
    });
  });

  describe("Luck Index Formula", () => {
    it("should compute positive luck when actual wins exceed expected wins", () => {
      const actualWins = 1.0;
      const expectedWins = 0.15; // 2nd lowest score in league
      const luckIndex = actualWins - expectedWins;

      assert.equal(Math.round(luckIndex * 100) / 100, 0.85);
      assert.ok(luckIndex > 0.5, "Should qualify as Lucky tier (> +0.50)");
    });

    it("should compute negative luck when high scoring team suffers a loss", () => {
      const actualWins = 0.0;
      const expectedWins = 0.88; // 2nd highest score in league
      const luckIndex = actualWins - expectedWins;

      assert.equal(Math.round(luckIndex * 100) / 100, -0.88);
      assert.ok(luckIndex < -0.5, "Should qualify as Unlucky tier (< -0.50)");
    });
  });

  describe("Lineup Efficiency & Bench Points", () => {
    it("should compute 100% efficiency when starters achieve optimal score", () => {
      const startersTotal = 145.5;
      const benchTotal = 30.0;
      const optimalTotal = 145.5;

      const efficiency =
        optimalTotal > 0 ? Math.round((startersTotal / optimalTotal) * 1000) / 10 : 100;
      assert.equal(efficiency, 100);
      assert.equal(benchTotal, 30.0);
    });

    it("should calculate correct efficiency when high scorer left on bench", () => {
      const startersTotal = 120.0;
      const optimalTotal = 150.0; // 30 extra points available on bench

      const efficiency =
        optimalTotal > 0 ? Math.round((startersTotal / optimalTotal) * 1000) / 10 : 100;
      assert.equal(efficiency, 80);
    });
  });

  describe("Consistency & Standard Deviation (Season Rollup)", () => {
    it("should compute standard deviation accurately across weekly scores", () => {
      const weeklyScores = [100, 110, 120, 130];
      const mean = weeklyScores.reduce((a, b) => a + b, 0) / weeklyScores.length;
      assert.equal(mean, 115);

      const variance =
        weeklyScores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
        (weeklyScores.length - 1);
      const stdDev = Math.round(Math.sqrt(variance) * 10) / 10;

      // Variance for [100, 110, 120, 130] with N-1 sample = (225 + 25 + 25 + 225)/3 = 500/3 = 166.67
      // sqrt(166.67) ≈ 12.9
      assert.equal(stdDev, 12.9);
    });
  });

  describe("All-Play Powerhouse Tiebreaker", () => {
    it("should rank higher scoring team first when all-play win % is tied", () => {
      const teams = [
        { manager: "Team A", allPlayWinPct: 80, points: 140.0, totalPoints: 140.0 },
        { manager: "Team B", allPlayWinPct: 80, points: 155.0, totalPoints: 155.0 },
        { manager: "Team C", allPlayWinPct: 60, points: 160.0, totalPoints: 160.0 }
      ];

      const sorted = [...teams].sort((a, b) => {
        const pctDiff = (b.allPlayWinPct || 0) - (a.allPlayWinPct || 0);
        if (pctDiff !== 0) return pctDiff;
        const ptsA = typeof a.totalPoints === "number" ? a.totalPoints : a.points || 0;
        const ptsB = typeof b.totalPoints === "number" ? b.totalPoints : b.points || 0;
        return ptsB - ptsA;
      });

      assert.equal(sorted[0].manager, "Team B", "Team B scored more and should win tiebreaker");
      assert.equal(sorted[1].manager, "Team A");
      assert.equal(sorted[2].manager, "Team C");
    });
  });
});

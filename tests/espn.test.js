import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("ESPN Fantasy Adapter & Normalization", () => {
  // ESPN Slot IDs
  const ESPN_SLOT_MAP = {
    0: { pos: "QB", isStarter: true },
    2: { pos: "RB", isStarter: true },
    4: { pos: "WR", isStarter: true },
    6: { pos: "TE", isStarter: true },
    16: { pos: "DEF", isStarter: true },
    17: { pos: "K", isStarter: true },
    20: { pos: "BE", isStarter: false },
    21: { pos: "IR", isStarter: false },
    23: { pos: "FLEX", isStarter: true },
    24: { pos: "OP", isStarter: true }
  };

  const ESPN_POS_MAP = {
    1: "QB",
    2: "RB",
    3: "WR",
    4: "TE",
    5: "K",
    16: "DEF"
  };

  function isEspnStarter(slotId) {
    return slotId !== 20 && slotId !== 21;
  }

  function getEspnPosition(posId) {
    return ESPN_POS_MAP[posId] || "FLEX";
  }

  describe("Slot & Position Mapping", () => {
    it("should correctly identify starter slots vs bench and IR slots", () => {
      Object.entries(ESPN_SLOT_MAP).forEach(([slotId, info]) => {
        assert.equal(
          isEspnStarter(Number(slotId)),
          info.isStarter,
          `Slot ${slotId} starter status mismatch`
        );
      });
    });

    it("should correctly map ESPN numeric position IDs to standard fantasy positions", () => {
      assert.equal(getEspnPosition(1), "QB");
      assert.equal(getEspnPosition(2), "RB");
      assert.equal(getEspnPosition(3), "WR");
      assert.equal(getEspnPosition(4), "TE");
      assert.equal(getEspnPosition(5), "K");
      assert.equal(getEspnPosition(16), "DEF");
      assert.equal(getEspnPosition(99), "FLEX");
    });
  });

  describe("ESPN Boxscore & Lineup Efficiency Transformation", () => {
    it("should parse starters, bench points, optimal points, and lineup efficiency correctly", () => {
      const mockRosterEntries = [
        {
          lineupSlotId: 0, // QB Starter
          playerPoolEntry: {
            player: { id: 101, fullName: "Josh Allen", defaultPositionId: 1 },
            appliedStatTotal: 25.5
          }
        },
        {
          lineupSlotId: 2, // RB Starter
          playerPoolEntry: {
            player: { id: 102, fullName: "Bijan Robinson", defaultPositionId: 2 },
            appliedStatTotal: 18.0
          }
        },
        {
          lineupSlotId: 4, // WR Starter
          playerPoolEntry: {
            player: { id: 103, fullName: "CeeDee Lamb", defaultPositionId: 3 },
            appliedStatTotal: 22.5
          }
        },
        {
          lineupSlotId: 20, // Bench Player with high score
          playerPoolEntry: {
            player: { id: 104, fullName: "Bench High Scorer", defaultPositionId: 3 },
            appliedStatTotal: 20.0
          }
        },
        {
          lineupSlotId: 20, // Bench Player with low score
          playerPoolEntry: {
            player: { id: 105, fullName: "Bench Low Scorer", defaultPositionId: 2 },
            appliedStatTotal: 4.0
          }
        }
      ];

      let startersTotal = 0;
      let benchTotal = 0;
      const startersList = [];
      const allPlayersList = [];
      const playersPointsMap = {};
      let highestBenchScore = 0;

      mockRosterEntries.forEach(entry => {
        const pid = String(entry.playerPoolEntry.player.id);
        const pts = parseFloat(entry.playerPoolEntry.appliedStatTotal || 0);
        allPlayersList.push(pid);
        playersPointsMap[pid] = pts;

        if (isEspnStarter(entry.lineupSlotId)) {
          startersTotal += pts;
          startersList.push(pid);
        } else {
          benchTotal += pts;
          if (pts > highestBenchScore) highestBenchScore = pts;
        }
      });

      // Total starter points = 25.5 + 18.0 + 22.5 = 66.0
      // Total bench points = 20.0 + 4.0 = 24.0
      // Optimal score with 3 starters = top 3 scores (25.5, 22.5, 20.0) = 68.0
      const sortedScores = Object.values(playersPointsMap).sort((a, b) => b - a);
      const optimalPoints = sortedScores.slice(0, startersList.length).reduce((a, b) => a + b, 0);
      const efficiency = Math.round((startersTotal / optimalPoints) * 100);

      assert.equal(startersTotal, 66.0);
      assert.equal(benchTotal, 24.0);
      assert.equal(highestBenchScore, 20.0);
      assert.equal(optimalPoints, 68.0);
      assert.equal(efficiency, 97); // 66.0 / 68.0 = 97.05% -> 97%
    });
  });

  describe("ESPN Matchup Processing & All-Play", () => {
    it("should process ESPN weekly matchups into valid head-to-head outcomes", () => {
      const mockEspnLeague = {
        id: 998877,
        settings: { name: "Test ESPN League", size: 4 },
        members: [
          { id: "{USER-1}", displayName: "Manager One" },
          { id: "{USER-2}", displayName: "Manager Two" },
          { id: "{USER-3}", displayName: "Manager Three" },
          { id: "{USER-4}", displayName: "Manager Four" }
        ],
        teams: [
          { id: 1, name: "Team One", owners: ["{USER-1}"] },
          { id: 2, name: "Team Two", owners: ["{USER-2}"] },
          { id: 3, name: "Team Three", owners: ["{USER-3}"] },
          { id: 4, name: "Team Four", owners: ["{USER-4}"] }
        ],
        schedule: [
          {
            matchupPeriodId: 1,
            home: { teamId: 1, totalPoints: 140.5 },
            away: { teamId: 2, totalPoints: 120.0 },
            winner: "HOME"
          },
          {
            matchupPeriodId: 1,
            home: { teamId: 3, totalPoints: 115.0 },
            away: { teamId: 4, totalPoints: 130.0 },
            winner: "AWAY"
          }
        ]
      };

      // Member lookup map
      const memberMap = {};
      mockEspnLeague.members.forEach(m => {
        memberMap[m.id] = m.displayName;
      });

      // Team lookup map
      const teamMap = {};
      mockEspnLeague.teams.forEach(t => {
        const ownerId = (t.owners && t.owners[0]) || "";
        teamMap[t.id] = {
          name: t.name,
          manager: memberMap[ownerId] || `Manager ${t.id}`
        };
      });

      // Build records for Week 1
      const week1Schedule = mockEspnLeague.schedule.filter(s => s.matchupPeriodId === 1);
      const records = [];

      week1Schedule.forEach(m => {
        const homeTeam = teamMap[m.home.teamId];
        const awayTeam = teamMap[m.away.teamId];

        const homePts = m.home.totalPoints;
        const awayPts = m.away.totalPoints;

        records.push({
          id: `espn-${mockEspnLeague.id}-${m.home.teamId}`,
          leagueId: `espn:${mockEspnLeague.id}`,
          league: mockEspnLeague.settings.name,
          manager: homeTeam.manager,
          teamName: homeTeam.name,
          points: homePts,
          opponentPoints: awayPts,
          opponentName: awayTeam.manager,
          opponentTeam: awayTeam.name,
          margin: Math.round((homePts - awayPts) * 100) / 100,
          outcome: homePts > awayPts ? "win" : homePts < awayPts ? "loss" : "tie"
        });

        records.push({
          id: `espn-${mockEspnLeague.id}-${m.away.teamId}`,
          leagueId: `espn:${mockEspnLeague.id}`,
          league: mockEspnLeague.settings.name,
          manager: awayTeam.manager,
          teamName: awayTeam.name,
          points: awayPts,
          opponentPoints: homePts,
          opponentName: homeTeam.manager,
          opponentTeam: homeTeam.name,
          margin: Math.round((awayPts - homePts) * 100) / 100,
          outcome: awayPts > homePts ? "win" : awayPts < homePts ? "loss" : "tie"
        });
      });

      // 4 squads: 140.5 (T1, W), 130.0 (T4, W), 120.0 (T2, L), 115.0 (T3, L)
      assert.equal(records.length, 4);

      const t1 = records.find(r => r.teamName === "Team One");
      const t4 = records.find(r => r.teamName === "Team Four");
      const t2 = records.find(r => r.teamName === "Team Two");
      const t3 = records.find(r => r.teamName === "Team Three");

      assert.equal(t1.outcome, "win");
      assert.equal(t1.margin, 20.5);
      assert.equal(t4.outcome, "win");
      assert.equal(t4.margin, 15.0);
      assert.equal(t2.outcome, "loss");
      assert.equal(t3.outcome, "loss");

      // Compute All-Play for Team One (140.5) -> beats 130.0, 120.0, 115.0 -> 3-0, xW = 1.0, luck = 0.0
      let apWins = 0;
      records.forEach(other => {
        if (other.id !== t1.id && t1.points > other.points) apWins++;
      });
      const xw = apWins / (records.length - 1);
      const luck = 1.0 - xw;

      assert.equal(apWins, 3);
      assert.equal(xw, 1.0);
      assert.equal(luck, 0.0);

      // Compute All-Play for Team Two (120.0, Lost to T1): beats 115.0, loses to 140.5, 130.0 -> 1-2, xW = 0.33, luck = -0.33
      let t2ApWins = 0;
      records.forEach(other => {
        if (other.id !== t2.id && t2.points > other.points) t2ApWins++;
      });
      const t2Xw = Math.round((t2ApWins / (records.length - 1)) * 100) / 100;
      const t2Luck = Math.round((0 - t2Xw) * 100) / 100;

      assert.equal(t2ApWins, 1);
      assert.equal(t2Xw, 0.33);
      assert.equal(t2Luck, -0.33);
    });

    it("should resolve rosterForMatchupPeriod and calculate bench heavyweight correctly", () => {
      const mockMatchup = {
        home: {
          teamId: 1,
          rosterForMatchupPeriod: {
            entries: [
              {
                lineupSlotId: 0,
                playerPoolEntry: {
                  player: { id: 201, fullName: "Patrick Mahomes", defaultPositionId: 1 },
                  appliedStatTotal: 28.4
                }
              },
              {
                lineupSlotId: 20, // Bench
                playerPoolEntry: {
                  player: { id: 202, fullName: "Jordan Love", defaultPositionId: 1 },
                  appliedStatTotal: 22.0
                }
              },
              {
                lineupSlotId: 20, // Bench
                playerPoolEntry: {
                  player: { id: 203, fullName: "Zack Moss", defaultPositionId: 2 },
                  appliedStatTotal: 14.5
                }
              }
            ]
          }
        }
      };

      const roster =
        mockMatchup.home.rosterForMatchupPeriod ||
        mockMatchup.home.rosterForCurrentScoringPeriod ||
        mockMatchup.home.roster;
      assert.ok(roster, "Should successfully resolve rosterForMatchupPeriod");

      let benchPts = 0;
      let starterPts = 0;
      const ptsMap = {};
      roster.entries.forEach(e => {
        const pts = e.playerPoolEntry.appliedStatTotal;
        ptsMap[e.playerPoolEntry.player.id] = pts;
        if (isEspnStarter(e.lineupSlotId)) {
          starterPts += pts;
        } else {
          benchPts += pts;
        }
      });

      assert.equal(starterPts, 28.4);
      assert.equal(benchPts, 36.5); // 22.0 + 14.5
      assert.equal(ptsMap[201], 28.4);
      assert.equal(ptsMap[202], 22.0);
    });

    it("should aggregate weeklyPlayerRecords across weeks for season player analytics", () => {
      const mockTeamRollup = {
        weeklyPlayerRecords: [
          {
            week: 1,
            startersList: ["espn_101", "espn_102"],
            allPlayersList: ["espn_101", "espn_102", "espn_103"],
            playersPointsMap: { espn_101: 20.0, espn_102: 15.0, espn_103: 18.0 }
          },
          {
            week: 2,
            startersList: ["espn_101", "espn_103"],
            allPlayersList: ["espn_101", "espn_102", "espn_103"],
            playersPointsMap: { espn_101: 25.0, espn_102: 10.0, espn_103: 22.0 }
          }
        ]
      };

      const playerMap = {};
      mockTeamRollup.weeklyPlayerRecords.forEach(wRec => {
        const starters = new Set(wRec.startersList);
        const all = new Set(wRec.allPlayersList);
        all.forEach(pid => {
          if (!playerMap[pid]) {
            playerMap[pid] = { totalPoints: 0, startedCount: 0, benchedCount: 0, weeks: 0 };
          }
          const score = wRec.playersPointsMap[pid] || 0;
          playerMap[pid].totalPoints += score;
          playerMap[pid].weeks++;
          if (starters.has(pid)) playerMap[pid].startedCount++;
          else playerMap[pid].benchedCount++;
        });
      });

      // espn_101: 20.0 + 25.0 = 45.0, avg = 22.5, started 2/2
      assert.equal(playerMap["espn_101"].totalPoints, 45.0);
      assert.equal(playerMap["espn_101"].startedCount, 2);
      assert.equal(playerMap["espn_101"].benchedCount, 0);

      // espn_103: 18.0 + 22.0 = 40.0, avg = 20.0, started 1/2, benched 1/2
      assert.equal(playerMap["espn_103"].totalPoints, 40.0);
      assert.equal(playerMap["espn_103"].startedCount, 1);
      assert.equal(playerMap["espn_103"].benchedCount, 1);
    });

    it("should resolve exact weekly player score instead of cumulative appliedStatTotal", () => {
      const mockPlayerEntry = {
        lineupSlotId: 4,
        playerPoolEntry: {
          appliedStatTotal: 40.6, // Cumulative across 4 weeks
          player: {
            id: 4262921,
            fullName: "Justin Jefferson",
            defaultPositionId: 3,
            stats: [
              { statSourceId: 0, statSplitTypeId: 0, scoringPeriodId: 0, appliedTotal: 316.6 },
              { statSourceId: 0, statSplitTypeId: 1, scoringPeriodId: 4, appliedTotal: 20.5 },
              { statSourceId: 0, statSplitTypeId: 1, scoringPeriodId: 3, appliedTotal: 4.2 },
              { statSourceId: 0, statSplitTypeId: 1, scoringPeriodId: 2, appliedTotal: 23.3 },
              { statSourceId: 0, statSplitTypeId: 1, scoringPeriodId: 1, appliedTotal: 15.9 }
            ]
          }
        }
      };

      function extractScore(entry, targetWeek) {
        const p = entry.playerPoolEntry.player;
        if (p.stats && Array.isArray(p.stats)) {
          const weekStat = p.stats.find(
            s => s.statSourceId === 0 && s.statSplitTypeId === 1 && s.scoringPeriodId === targetWeek
          );
          if (weekStat && typeof weekStat.appliedTotal === "number") {
            return weekStat.appliedTotal;
          }
        }
        return entry.playerPoolEntry.appliedStatTotal || 0;
      }

      assert.equal(extractScore(mockPlayerEntry, 4), 20.5);
      assert.equal(extractScore(mockPlayerEntry, 3), 4.2);
      assert.equal(extractScore(mockPlayerEntry, 2), 23.3);
      assert.equal(extractScore(mockPlayerEntry, 1), 15.9);
    });

    it("should correctly persist and retrieve ESPN players database in cache payload", () => {
      const espnDb = {
        espn_4262921: {
          name: "Justin Jefferson",
          pos: "WR",
          team: "MIN",
          isDef: false
        },
        espn_4040715: {
          name: "Josh Allen",
          pos: "QB",
          team: "BUF",
          isDef: false
        }
      };

      const payload = {
        version: "2.0",
        espnPlayersDb: espnDb,
        records: []
      };

      const serialized = JSON.stringify(payload);
      const parsed = JSON.parse(serialized);

      assert.ok(parsed.espnPlayersDb);
      assert.equal(parsed.espnPlayersDb["espn_4262921"].name, "Justin Jefferson");
      assert.equal(parsed.espnPlayersDb["espn_4040715"].pos, "QB");
    });
  });
});

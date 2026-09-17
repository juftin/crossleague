import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Chat Recap Formatter", () => {
  const formatWeeklyRecap = ({
    week,
    season,
    top3,
    badBeat,
    luckyEscape,
    benchKing,
    shareUrl = "https://crossleague.app/?season=2024&week=1#awards"
  }) => {
    let text = `*<${shareUrl}|Week ${week} Fantasy Recap (${season})>*\n\n`;
    text += `*The Podium (Top Scores)*\n`;
    if (top3[0])
      text += `• 🥇 *#1* ${top3[0].manager} (${top3[0].teamName}) — *${top3[0].points.toFixed(2)} pts* • _${top3[0].league}_\n`;
    if (top3[1])
      text += `• 🥈 *#2* ${top3[1].manager} (${top3[1].teamName}) — *${top3[1].points.toFixed(2)} pts* • _${top3[1].league}_\n`;
    if (top3[2])
      text += `• 🥉 *#3* ${top3[2].manager} (${top3[2].teamName}) — *${top3[2].points.toFixed(2)} pts* • _${top3[2].league}_\n\n`;

    text += `*Superlatives Showcase*\n`;
    if (badBeat)
      text += `• 💔 *The Bad Beat:* ${badBeat.manager} (${badBeat.teamName}) scored *${badBeat.points.toFixed(2)} pts* and lost by ${Math.abs(badBeat.margin || 0).toFixed(2)} to ${badBeat.opponentName || "rival"} • _${badBeat.league}_\n`;
    if (luckyEscape)
      text += `• 🪄 *The Lucky Escape:* ${luckyEscape.manager} (${luckyEscape.teamName}) won with *${luckyEscape.points.toFixed(2)} pts* vs ${luckyEscape.opponentName || "rival"} • _${luckyEscape.league}_\n`;
    if (benchKing)
      text += `• 🪑 *Bench Heavyweight:* ${benchKing.manager} (${benchKing.teamName}) left *${benchKing.benchPoints.toFixed(2)} pts* on bench (${benchKing.efficiency}% Lineup Efficiency) • _${benchKing.league}_\n\n`;

    return text;
  };

  it("should generate valid Slack mrkdwn for weekly recap with emoji indicators and embedded URL in title", () => {
    const data = {
      week: 1,
      season: 2024,
      top3: [
        { manager: "Alice", teamName: "Team Alpha", points: 165.4, league: "League 1" },
        { manager: "Bob", teamName: "Team Beta", points: 142.1, league: "League 2" },
        { manager: "Charlie", teamName: "Team Gamma", points: 138.8, league: "League 1" }
      ],
      badBeat: {
        manager: "Dave",
        teamName: "Team Delta",
        points: 135.0,
        margin: 2.5,
        opponentName: "Charlie",
        league: "League 1"
      },
      luckyEscape: {
        manager: "Eve",
        teamName: "Team Echo",
        points: 88.2,
        opponentName: "Frank",
        league: "League 2"
      },
      benchKing: {
        manager: "Grace",
        teamName: "Team Golf",
        benchPoints: 45.6,
        efficiency: 74,
        league: "League 1"
      }
    };

    const output = formatWeeklyRecap(data);

    assert.ok(
      output.includes(
        "*<https://crossleague.app/?season=2024&week=1#awards|Week 1 Fantasy Recap (2024)>*"
      )
    );
    assert.ok(output.includes("*The Podium (Top Scores)*"));
    assert.ok(!output.includes("*🏆 The Podium"));
    assert.ok(output.includes("*Superlatives Showcase*"));
    assert.ok(!output.includes("*🌟 Superlatives Showcase*"));
    assert.ok(output.includes("• 🥇 *#1* Alice"));
    assert.ok(output.includes("• 🥈 *#2* Bob"));
    assert.ok(output.includes("• 🥉 *#3* Charlie"));
    assert.ok(output.includes("• 💔 *The Bad Beat:* Dave"));
    assert.ok(output.includes("• 🪄 *The Lucky Escape:* Eve"));
    assert.ok(output.includes("• 🪑 *Bench Heavyweight:* Grace"));
    assert.ok(!output.includes("CrossLeague"), "Should not contain CrossLeague brand name in body");
  });
});

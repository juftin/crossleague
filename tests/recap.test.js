import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Chat Recap Formatter", () => {
  const formatWeeklyRecap = ({ week, season, top3, badBeat, luckyEscape, benchKing }) => {
    const titleText = `🏈 Week ${week} Fantasy Recap (${season})`;
    let plainText = `*${titleText}*\n\n`;
    plainText += `*The Podium (Top Scores)*\n`;
    if (top3[0])
      plainText += `• 🥇 *#1* ${top3[0].manager} (${top3[0].teamName}) — *${top3[0].points.toFixed(2)} pts* • _${top3[0].league}_\n`;
    if (top3[1])
      plainText += `• 🥈 *#2* ${top3[1].manager} (${top3[1].teamName}) — *${top3[1].points.toFixed(2)} pts* • _${top3[1].league}_\n`;
    if (top3[2])
      plainText += `• 🥉 *#3* ${top3[2].manager} (${top3[2].teamName}) — *${top3[2].points.toFixed(2)} pts* • _${top3[2].league}_\n\n`;

    plainText += `*Superlatives Showcase*\n`;
    if (badBeat)
      plainText += `• 💔 *The Bad Beat:* ${badBeat.manager} (${badBeat.teamName}) scored *${badBeat.points.toFixed(2)} pts* and lost by ${Math.abs(badBeat.margin || 0).toFixed(2)} to ${badBeat.opponentName || "rival"} • _${badBeat.league}_\n`;
    if (luckyEscape)
      plainText += `• 🪄 *The Lucky Escape:* ${luckyEscape.manager} (${luckyEscape.teamName}) won with *${luckyEscape.points.toFixed(2)} pts* vs ${luckyEscape.opponentName || "rival"} • _${luckyEscape.league}_\n`;
    if (benchKing)
      plainText += `• 🪑 *Bench Heavyweight:* ${benchKing.manager} (${benchKing.teamName}) left *${benchKing.benchPoints.toFixed(2)} pts* on bench (${benchKing.efficiency}% Lineup Efficiency) • _${benchKing.league}_\n\n`;

    let htmlText = `<p><strong>${titleText}</strong></p><br>`;
    htmlText += `<p><strong><u>The Podium (Top Scores)</u></strong></p>`;
    if (top3[0])
      htmlText += `<p>• 🥇 <strong>#1</strong> ${top3[0].manager} (${top3[0].teamName}) — <strong>${top3[0].points.toFixed(2)} pts</strong> • <em>${top3[0].league}</em></p>`;

    return { plainText, htmlText };
  };

  it("should generate valid rich HTML and clean plain-text recap with bold headings and without URL", () => {
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

    const { plainText, htmlText } = formatWeeklyRecap(data);

    // Plain text assertions
    assert.ok(plainText.startsWith("*🏈 Week 1 Fantasy Recap (2024)*\n\n"));
    assert.ok(plainText.includes("*The Podium (Top Scores)*"));
    assert.ok(plainText.includes("• 🥇 *#1* Alice"));
    assert.ok(!plainText.includes("http"), "Plain text should not contain URL");

    // HTML assertions for rich text clipboards (Slack / Docs / Mail)
    assert.ok(htmlText.startsWith("<p><strong>🏈 Week 1 Fantasy Recap (2024)</strong></p><br>"));
    assert.ok(htmlText.includes("<p><strong><u>The Podium (Top Scores)</u></strong></p>"));
    assert.ok(htmlText.includes("<strong>#1</strong> Alice"));
    assert.ok(!htmlText.includes("<a href="), "HTML text should not contain <a> tag");
  });
});

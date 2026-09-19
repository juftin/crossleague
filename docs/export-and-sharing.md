# 📦 Export Subsystems & Sharing

This document details CrossLeague's export capabilities, including Markdown/HTML chat recaps, CSV dataset generation, and shareable deep links.

---

## 📋 Chat Recap Generator (`src/js/export/recap.js`)

CrossLeague generates formatted weekly and season power ranking recaps ready to paste directly into league communication channels (Discord, Slack, GroupMe, or text messages).

### Output Formats

1. **Rich Markdown / Discord**: Uses Discord formatting with bolding, code fences, and emojis.
2. **Slack Compatible**: Uses standard Slack bold syntax (`*heading*`).
3. **Clean Plain Text**: Strips markdown symbols for SMS and GroupMe.

### Generated Sections

- 🏆 **Podium Finishers**: Gold, Silver, and Bronze highest scorers.
- 🍀 **Schedule Luck Highlights**: Most fortunate winner and most heartbreaking loser.
- ⚔️ **Superlatives**: The Bad Beat, The Lucky Escape, and Bench Heavyweight.
- 📊 **Power Rankings Leaderboard**: Top-10 / full rankings with All-Play win percentages and Expected Wins ($xW$).

---

## 📊 CSV Dataset Exporter (`src/js/export/csv.js`)

Generates a downloadable `.csv` spreadsheet containing the active filtered dataset:

### CSV Schema

| Column Header        | Data Type | Description                              |
| :------------------- | :-------- | :--------------------------------------- |
| `Rank`               | `number`  | Power ranking position based on All-Play |
| `Manager`            | `string`  | Manager display name / username          |
| `Team Name`          | `string`  | Custom team name                         |
| `League`             | `string`  | League name                              |
| `Platform`           | `string`  | Platform identifier (`sleeper` / `espn`) |
| `Points`             | `number`  | Score / Total Points For                 |
| `Outcome`            | `string`  | Match outcome (`win`, `loss`, `tie`)     |
| `All-Play W`         | `number`  | Simulated wins against all rivals        |
| `All-Play L`         | `number`  | Simulated losses against all rivals      |
| `All-Play T`         | `number`  | Simulated ties against all rivals        |
| `All-Play Win %`     | `number`  | Simulated win percentage                 |
| `Expected Wins (xW)` | `number`  | Theoretical win expectation              |
| `Luck Index`         | `number`  | Schedule luck score                      |
| `Bench Points`       | `number`  | Unused scoring potential left on bench   |
| `Optimal Points`     | `number`  | Maximum possible lineup score            |
| `Efficiency %`       | `number`  | Coaching efficiency percentage           |

---

## 🔗 Shareable URL Builder (`src/js/export/share.js`)

CrossLeague constructs clean, shareable URLs that encode the active season, week, mode, platform, and selected league IDs into query parameters while preserving the active tab hash:

```javascript
import { generateShareableUrl } from "../export/share.js";

const shareUrl = generateShareableUrl({
  platform: "sleeper",
  season: 2024,
  week: 4,
  mode: "WEEKLY",
  selectedLeagueIds: ["1048123456789"],
  activeTab: "luck"
});
// Result: https://crossleague.pages.dev/?season=2024&week=4&mode=WEEKLY&leagueIds=1048123456789#luck
```

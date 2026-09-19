# 🔗 URL Parameters & Deep Linking

CrossLeague supports URL query parameters and hash fragments to enable instant deep linking, shareable dashboard states, and automated report bookmarking.

---

## 📋 Parameter Reference

The URL parser supports both canonical keys and concise shorthand aliases:

| Canonical Parameter | Shorthand Aliases                   | Type     | Example Values       | Description                                             |
| :------------------ | :---------------------------------- | :------- | :------------------- | :------------------------------------------------------ |
| `userId` / `user`   | `username`, `u`                     | `string` | `juftin`, `12345678` | Sleeper username or numeric User ID.                    |
| `season`            | `year`                              | `number` | `2024`, `2025`       | NFL season year.                                        |
| `week`              | `w`                                 | `number` | `1`, `4`, `17`       | Target matchup week number.                             |
| `mode`              | `m`                                 | `string` | `weekly`, `season`   | Matchup analysis mode (`weekly` or `season_rollup`).    |
| `platform`          | `p`                                 | `string` | `sleeper`, `espn`    | Target fantasy platform.                                |
| `leagueIds`         | `leagueId`, `leagues`, `league_ids` | `string` | `1048...,1049...`    | Comma, space, or semicolon separated league IDs.        |
| `syncType`          | —                                   | `string` | `user`, `leagues`    | Sync mode (by user profile or by explicit league list). |

---

## 🔀 Multi-Format League ID Parsing

CrossLeague safely extracts league IDs from strings formatted with varied delimiters:

```javascript
// Supported formats:
"?leagueIds=104812345,104812346"; // Comma separated
"?leagueId=104812345&leagueId=104812346"; // Repeated keys
"?leagues=104812345 104812346"; // Space separated
"?league_ids=104812345%0A104812346"; // Newline separated
```

---

## 🔖 Tab Hash Navigation

Appending a hash fragment automatically opens the corresponding dashboard tab on page load:

- `#board` — Universal Power Rankings Leaderboard
- `#luck` — Schedule Luck & Expected Wins ($xW$) Breakdown
- `#players` — Player Exposure & Positional MVPs
- `#awards` — Outcome Superlatives & Weekly Podiums
- `#visuals` — Interactive Chart Distributions
- `#leagues` — League Summary & Scoring Comparison Grid

---

## 📤 Shareable URL Generation (`generateShareableUrl`)

The share button generates a clean URL designed for sharing with league members:

```javascript
import { generateShareableUrl } from "../export/share.js";

const url = generateShareableUrl({
  platform: "sleeper",
  season: 2024,
  week: 4,
  mode: "WEEKLY",
  selectedLeagueIds: ["1048123456789"],
  activeTab: "luck"
});
// Output: https://crossleague.pages.dev/?season=2024&week=4&mode=WEEKLY&leagueIds=1048123456789#luck
```

> [!NOTE]
> When sharing league-specific reports, personal user IDs are omitted from the URL by default so recipients view an objective, neutral league comparison.

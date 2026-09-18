# 🏈 CrossLeague • Sleeper Multi-League Power Rankings

**CrossLeague** is a client-side analytics and power ranking dashboard for fantasy football leagues on [Sleeper](https://sleeper.com). Stack all your squads and league rivals on one universal leaderboard with zero backend dependencies.

---

## ✨ Features

- **🏟️ Multi-League Multi-Select Dropdown**: Filter specific leagues or compare all leagues concurrently with live reactive updates.
- **🍀 Schedule Luck & All-Play Index**:
  - Simulates weekly scores against every league rival ($N - 1$ managers) to compute true **Expected Wins ($xW$)**.
  - Calculates the **Luck Index** ($\text{Actual Wins} - \text{Expected Wins}$) to measure schedule fortune vs head-to-head heartbreak.
  - Interactive in-app **Methodology Modal** popup with All-Play formulation.
- **🏈 Player Exposure & Positional MVPs**:
  - Cross-league player ownership, roster exposure percentage, and starter vs bench rates.
  - Positional heavy hitters deck highlighting weekly QB, RB, WR, TE, K, and DEF leaders.
- **⚔️ Cross-League Outcomes & Superlatives**:
  - **The Bad Beat 💔**: Highlights the highest-scoring squad that still suffered a loss.
  - **The Lucky Escape 🪄**: Highlights the lowest-scoring squad that secured a matchup win.
  - **Bench Heavyweight 🪑**: Identifies the team leaving the most scoring potential on their bench.
  - **Lineup Efficiency %**: Calculates `Actual Score / Optimal Potential * 100`.
- **📄 Client-Side Data Table Pagination**:
  - Configurable page sizes (25 default, 50, 100, All) across the Board, Luck Index, and Player Analytics tables.
- **📈 Season-to-Date Rollup Mode**:
  - Aggregates weeks 1 through $N$ to rank squads by Average Points Per Game (Avg PPG), Total Points For (PF), cumulative W-L record, and Consistency rating (Standard Deviation).
- **📋 One-Click Chat Recap & CSV Export**:
  - Formats ready-to-paste markdown rankings and superlatives for Discord, Slack, and GroupMe.
  - One-click CSV download with comprehensive stats including All-Play, Expected Wins, and Luck metrics.
- **📁 Standalone HTML Report Exporter**:
  - Exports a self-contained offline `.html` file with embedded snapshot data that can be shared and opened anywhere without external dependencies.
- **💾 LocalStorage Caching**:
  - Automatically caches synced data per user, season, mode, and week for instant reloading.

---

## 🚀 Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/juftin/sleeper-analytics.git
   cd sleeper-analytics
   ```
2. Open [`index.html`](index.html) in any modern web browser or serve with a static server:
   ```bash
   npx serve .
   # or
   python3 -m http.server 8000
   ```
3. Configure your Sleeper username in **⚙️ Settings**, then navigate weeks seamlessly with automatic data loading and caching.

### Query Parameters

Prefill and filter a report with URL parameters. `userId` and `week` override saved preferences; league IDs may be passed as a comma-separated `leagueIds` value or as repeated `leagueId` values.

```
?userId=123456789&week=4&leagueIds=league-a,league-b
```

---

## 🏗️ Project Architecture

```
crossleague/
├── .github/
│   └── workflows/
│       ├── ci.yml        # GitHub Actions CI pipeline
│       └── publish.yaml  # GitHub Pages deployment workflow
├── src/
│   ├── css/
│   │   └── styles.css    # Glassmorphic design system and styling
│   ├── js/
│   │   ├── analytics/    # All-Play, Expected Wins, Luck Index, Efficiency
│   │   ├── api/          # Sleeper and ESPN fantasy adapters
│   │   ├── components/   # UI components, modals, dropdowns, tables, charts
│   │   ├── export/       # Chat recap, CSV, and offline HTML report export
│   │   ├── state/        # State store, caching, and URL parameter syncing
│   │   └── index.js      # Main JavaScript module & browser entrypoint
│   └── index.html        # Source HTML template (Vite dev server entrypoint)
├── dist/
│   ├── app.min.js        # Minified production bundle (+ sourcemap)
│   ├── styles.min.css    # Minified production CSS
│   └── index.html        # Minified standalone zero-dependency HTML application
├── scripts/
│   ├── build.js          # esbuild bundler and minifier
│   └── generate-snapshots.js # Visual regression snapshot generator & verifier
├── tests/                # Node.js native unit & integration test suites
├── eslint.config.js      # ESLint flat configuration
├── package.json          # Project scripts, exports map, and devDependencies
├── Taskfile.yaml         # Development and CI task orchestration
└── README.md             # Project documentation
```

---

## 🛠️ Development & Testing

This project uses [Task](https://taskfile.dev/) and [`npm`](https://nodejs.org/) to orchestrate development tasks, automated testing, code formatting, and CI validation.

### Standard Entrypoints

| Task           | Purpose                                                       | Command Behind the Scenes          |
| -------------- | ------------------------------------------------------------- | ---------------------------------- |
| `task install` | Install all development and testing dependencies              | `npm install`                      |
| `task dev`     | Start Vite live-reloading dev server (0.0.0.0:3000)           | `npm run dev`                      |
| `task test`    | Run native unit test suite (`node:test`)                      | `npm test`                         |
| `task lint`    | Run formatting check (Prettier) and code linting (ESLint)     | `npm run format:check && eslint .` |
| `task fix`     | Auto-fix formatting and linting errors                        | `npm run format && eslint . --fix` |
| `task build`   | Build minified distribution bundles in `dist/`                | `node scripts/build.js`            |
| `task docs`    | Build site distribution package for GitHub Pages              | `npm run docs`                     |
| `task check`   | Complete quality check: formatting, linting, tests, and build | `task lint && task test && ...`    |

### Running Tests

Unit tests are written using Node.js's native `node:test` runner with zero runtime dependencies:

```bash
task test
```

Pass extra arguments to target specific test files:

```bash
task test -- tests/analytics.test.js
```

---

## 📜 License

MIT License

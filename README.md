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
3. Enter your Sleeper username or numeric User ID, select a season and matchup week, and click **Sync Leagues**.

---

## 🏗️ Project Architecture

```
sleeper-analytics/
├── .github/
│   └── workflows/
│       ├── ci.yml        # GitHub Actions CI pipeline
│       └── publish.yaml  # GitHub Pages deployment workflow
├── scripts/
│   └── bundle.js       # Bundles app.js into index.html for zero-dependency standalone usage
├── tests/
│   ├── analytics.test.js   # Unit tests for All-Play, Expected Wins, Luck Index, Lineup Efficiency
│   ├── bundle.test.js      # Single-bundle syntax and HTML sync verification tests
│   ├── pagination.test.js  # Pagination boundary & slicing logic tests
│   └── recap.test.js       # Slack/Discord chat recap formatting tests
├── index.html          # Standalone client-side web application
├── styles.css          # Glassmorphic design system and styling
├── app.js              # Application logic, Sleeper API client, state, and rendering
├── eslint.config.js    # ESLint flat configuration
├── package.json        # Project scripts and devDependencies
├── Taskfile.yaml       # Development and CI task orchestration
└── README.md           # Project documentation
```

---

## 🛠️ Development & Testing

This project uses [Task](https://taskfile.dev/) and [`npm`](https://nodejs.org/) to orchestrate development tasks, automated testing, code formatting, and CI validation.

### Standard Entrypoints

| Task           | Purpose                                                        | Command Behind the Scenes          |
| -------------- | -------------------------------------------------------------- | ---------------------------------- |
| `task install` | Install all development and testing dependencies               | `npm install`                      |
| `task test`    | Run native unit test suite (`node:test`)                       | `npm test`                         |
| `task lint`    | Run formatting check (Prettier) and code linting (ESLint)      | `npm run format:check && eslint .` |
| `task fix`     | Auto-fix formatting and linting errors                         | `npm run format && eslint . --fix` |
| `task build`   | Synchronize standalone `app.js` into `index.html`              | `node scripts/bundle.js`           |
| `task docs`    | Build site distribution package for GitHub Pages               | `npm run docs`                     |
| `task check`   | Complete quality check: formatting, linting, tests, and bundle | `task lint && task test && ...`    |
| `task dev`     | Start a local development server on port 8080                  | `npx serve -l 8080 .`              |

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

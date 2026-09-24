# 🏗️ CrossLeague Architecture

This document details the architectural design, runtime lifecycle, module organization, build pipeline, and design constraints of the CrossLeague application.

---

## 🎯 Architectural Principles

CrossLeague is designed around four foundational architectural pillars:

1. **Client-Side React 19 + TypeScript Application**:
   The entire user interface is rendered client-side using React 19, typed strictly with TypeScript, and styled with Tailwind CSS. There are no proprietary backend servers or server-side databases.
2. **Centralized State with Zustand**:
   Global application state (league records, user identity, week/season navigation, active filters, and sorting) is managed via a reactive Zustand store in `src/js/state/useCrossLeagueStore.js`.
3. **Pure Functional Analytics Engine**:
   All statistical and analytical algorithms in `src/js/analytics/` are pure functions that take raw matchup data and return computed results without side effects.
4. **Resilient Multi-Platform Integration**:
   Data ingestion services in `src/js/services/syncService.js` coordinate unified data normalization across **Sleeper** and **ESPN** fantasy platforms, backed by a storage-driven TTL caching layer.

---

## 🔄 End-to-End System Data Flow

The following diagram illustrates how user inputs, URL parameters, API adapters, Zustand state, and analytics flow to render the dashboard:

```mermaid
flowchart TD
    subgraph Inputs["1. Triggers & Inputs"]
        URL["URL Search Params / Hash"]
        UserAction["User Interaction (Header / Settings)"]
        LocalStorage["Browser LocalStorage (Cached Payloads)"]
    end

    subgraph StateAndSync["2. Sync Service & State Store"]
        URLSync["URL Parser (src/js/state/urlParams.js)"]
        ZustandStore["Zustand Store (src/js/state/useCrossLeagueStore.js)"]
        SyncService["Sync Service (src/js/services/syncService.js)"]
        CacheLayer["TTL Cache & Storage (src/js/state/cache.js)"]
        SleeperClient["Sleeper Client (src/js/api/sleeper.js)"]
        EspnClient["ESPN Adapter (src/js/api/espn.js)"]
        PlayerDB["Player Metadata Client (src/js/api/players.js)"]
    end

    subgraph AnalyticsEngine["3. Pure Functional Analytics Engine"]
        AllPlay["All-Play & Expected Wins (src/js/analytics/allPlay.js)"]
        LuckCalc["Luck Index (src/js/analytics/luck.js)"]
        EffCalc["Lineup Efficiency (src/js/analytics/efficiency.js)"]
        StatCalc["Consistency / Std Dev (src/js/analytics/statistics.js)"]
        SuperlativeCalc["Superlatives & Podiums (src/js/analytics/superlatives.js)"]
        PlayerAgg["Player Aggregations & MVPs (src/js/analytics/aggregation.js)"]
    end

    subgraph ReactUI["4. React Component Tree (src/js/components/)"]
        App["Root Shell (App.tsx)"]
        Header["Fixed Header & Navigation (Header.tsx)"]
        LeaderboardTab["Leaderboard Tab (LeaderboardTab.tsx)"]
        LuckTab["Luck Index Tab (LuckTab.tsx)"]
        PlayersTab["Player Analytics Tab (PlayersTab.tsx)"]
        AwardsTab["Awards & Superlatives Tab (AwardsTab.tsx)"]
        VisualsTab["Interactive Charts Tab (VisualsTab.tsx)"]
        LeagueGridTab["League Grid Tab (LeagueGridTab.tsx)"]
        Modals["Modals (LuckModal.tsx)"]
        Exports["Export Services (CSV & Chat Recap)"]
    end

    URL --> URLSync --> ZustandStore
    UserAction --> ZustandStore
    LocalStorage <--> CacheLayer <--> SyncService

    ZustandStore --> SyncService
    SyncService --> SleeperClient & EspnClient
    SleeperClient & EspnClient --> PlayerDB --> ZustandStore

    ZustandStore --> AnalyticsEngine
    AnalyticsEngine --> ReactUI
```

---

## 📁 Repository Directory Layout

```
crossleague/
├── .github/
│   └── workflows/
│       ├── ci.yaml           # Automated CI pipeline (lint, types, knip, test, build check)
│       └── publish.yaml      # Automated Cloudflare Pages deployment pipeline
├── docs/                     # Comprehensive technical documentation
│   ├── README.md             # Documentation hub index
│   ├── architecture.md       # System design and build pipeline (this file)
│   ├── analytics.md          # Analytical models & mathematical formulas
│   ├── api-adapters.md       # Sleeper and ESPN API integration
│   ├── state-and-caching.md  # Zustand store, caching, and persistence
│   ├── url-parameters.md     # Query parameter parsing & deep linking
│   ├── ui-components.md      # React components, tables, charts, and styling
│   ├── export-and-sharing.md # Chat recap, CSV, and shareable URLs
│   └── development.md        # Local development, testing, and CI/CD
├── snapshots/                # Visual regression baseline PNG snapshots (18 files)
├── scripts/
│   └── generate-snapshots.js # Automated Chrome headless visual snapshot generator
├── src/
│   ├── css/
│   │   └── styles.css        # Glassmorphic Tailwind CSS stylesheet
│   ├── js/
│   │   ├── analytics/        # Pure analytical calculation modules
│   │   │   ├── aggregation.js    # Player ownership & positional MVP calculation
│   │   │   ├── allPlay.js        # All-Play record & Expected Wins (xW)
│   │   │   ├── efficiency.js     # Lineup efficiency & optimal potential score
│   │   │   ├── index.js          # Analytics subsystem barrel export
│   │   │   ├── luck.js           # Schedule Luck Index and classification
│   │   │   ├── statistics.js     # Standard deviation, mean, median, league averages
│   │   │   └── superlatives.js   # Podiums, Bad Beat, Lucky Escape, Bench King
│   │   ├── api/              # Upstream platform API adapters
│   │   │   ├── espn.js           # ESPN API client, slot mapping, CORS fallback
│   │   │   ├── index.js          # API subsystem barrel export
│   │   │   ├── players.js        # Sleeper & ESPN player database resolution
│   │   │   └── sleeper.js        # Sleeper REST client and matchup parser
│   │   ├── components/       # React 19 components & UI views
│   │   │   ├── App.tsx           # Application root component & shell
│   │   │   ├── charts.js         # Imperative Chart.js canvas renderer
│   │   │   ├── common/           # Shared components (Toast, MobileBottomNav)
│   │   │   ├── header/           # Header, WeekNavigator, LeagueDropdown
│   │   │   ├── modals/           # LuckModal and dialogs
│   │   │   ├── summary/          # Podium and SummaryCards
│   │   │   └── tabs/             # Active dashboard tabs
│   │   ├── export/           # Export and sharing utilities
│   │   │   ├── csv.js            # CSV spreadsheet dataset generator
│   │   │   ├── index.js          # Export subsystem barrel export
│   │   │   ├── recap.js          # Markdown / HTML chat recap generator
│   │   │   └── share.js          # Shareable deep-link URL builder
│   │   ├── services/         # Application services
│   │   │   └── syncService.js    # Multi-platform data loading and synchronization
│   │   ├── state/            # State management and caching
│   │   │   ├── cache.js          # TTL API caching & localStorage manager
│   │   │   ├── constants.js      # Global constants, platform maps, colors
│   │   │   ├── preferences.js    # User preferences persistence
│   │   │   ├── urlParams.js      # URL query parameter synchronization
│   │   │   └── useCrossLeagueStore.js # Central Zustand reactive state store
│   │   ├── types/            # TypeScript type definitions
│   │   │   └── index.ts          # Core data models and component types
│   │   └── index.js          # Application bootstrap & entry point
│   └── index.html            # Application HTML template & entry point
├── dist/                     # Production build artifacts
│   ├── assets/               # Bundled JavaScript and CSS assets
│   └── index.html            # Production HTML entry point
├── public/                   # Static assets copied to dist
│   └── .nojekyll             # Prevents Jekyll processing on static hosts
├── tests/                    # Native Node.js test suite (`node:test`)
├── eslint.config.js          # ESLint flat config
├── knip.json                 # Unused code analyzer configuration
├── tsconfig.json             # TypeScript compiler configuration
├── vite.config.js            # Standard Vite configuration
├── wrangler.jsonc            # Cloudflare Pages deployment configuration
├── package.json              # Package metadata and dependencies
└── Taskfile.yaml             # Development and CI task orchestration
```

---

## ⚙️ Build and Distribution Pipeline

The build process uses standard [Vite](https://vitejs.dev/) (`vite build`) configured in [`vite.config.js`](../vite.config.js):

```mermaid
flowchart LR
    srcHTML["index.html"] --> Vite["Vite Build Engine"]
    srcJS["src/js/index.js (React / TSX)"] --> Vite
    srcCSS["src/css/styles.css (Tailwind v4)"] --> Vite
    Vite --> distHTML["dist/index.html"]
    Vite --> distAssets["dist/assets/*.js & *.css"]
```

1. **Standard Vite Pipeline**:
   `vite build` processes `index.html` as the root entry point, compiling Tailwind CSS v4 ahead-of-time and bundling React components, Chart.js, styles, and dependencies into optimized ES module chunks in `dist/assets/`.
2. **Deterministic Output & Static Hosting**:
   The output in `dist/` is directly deployable to Cloudflare Pages, GitHub Pages, or any static hosting service.

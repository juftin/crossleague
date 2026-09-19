# 🛠️ Development & Testing Guide

This guide covers local development setup, task runner workflows, native Node.js test execution, visual regression snapshot testing, TypeScript verification, unused code analysis with Knip, Git/PR standards, and CI/CD pipelines for CrossLeague.

---

## 📋 Prerequisites

- **Node.js**: Modern LTS (v20+ or v22+ recommended).
- **Task Runner**: [go-task](https://taskfile.dev) installed on your system.
- **Web Browser**: Google Chrome or Chromium (required for generating visual PNG snapshots).

---

## ⚡ Developer Workflows with Task

All development and CI operations are orchestrated via [`Taskfile.yaml`](../Taskfile.yaml).

| Command                | Action               | Description                                                            |
| :--------------------- | :------------------- | :--------------------------------------------------------------------- |
| `task install`         | Install Dependencies | Runs `npm install` and sets up pre-commit hooks.                       |
| `task dev`             | Start Dev Server     | Launches the Vite live-reloading dev server at `http://0.0.0.0:3000`.  |
| `task pages:dev`       | Cloudflare Preview   | Launches Wrangler Cloudflare Pages local emulator against `dist/`.     |
| `task test`            | Run Test Suite       | Executes all native Node.js unit and integration tests (`node:test`).  |
| `task typecheck`       | Type Checking        | Validates TypeScript types across the codebase (`tsc --noEmit`).       |
| `task check:knip`      | Unused Code Check    | Runs Knip to identify unused exports, dependencies, and dead files.    |
| `task lint`            | Check Code Quality   | Runs Prettier format checks and ESLint lint checks.                    |
| `task fix`             | Auto-Fix Quality     | Automatically formats code with Prettier and applies ESLint fixes.     |
| `task build`           | Compile Bundles      | Uses Vite to build minified production bundles in `dist/`.             |
| `task snapshots`       | Generate Snapshots   | Launches headless Chrome to capture 11 visual PNG snapshots.           |
| `task snapshots:check` | Verify Snapshots     | Validates snapshot headers, dimensions, and schema compliance.         |
| `task check`           | Full CI Pipeline     | Runs format check, lint, typecheck, knip, unit tests, and build check. |

---

## 🧪 Automated Testing (`node:test`)

CrossLeague uses Node.js's native test runner (`node:test`) with `node:assert/strict` for high-performance testing with zero runtime dependencies.

### Running Tests

```bash
# Run all test suites
task test

# Target a specific test suite
task test -- tests/analytics.test.js

# Target tests matching a pattern
task test -- tests/espn.test.js
```

### Test Suite Structure

- [`tests/analytics.test.js`](../tests/analytics.test.js): Verifies All-Play math, Expected Wins, Luck Index, and Lineup Efficiency.
- [`tests/espn.test.js`](../tests/espn.test.js): Verifies ESPN slot ID translations and roster parsing.
- [`tests/cache.test.js`](../tests/cache.test.js): Verifies TTL expiration and cache isolation.
- [`tests/share.test.js`](../tests/share.test.js): Verifies query parameter extraction, aliases, and shareable URL construction.
- [`tests/pagination.test.js`](../tests/pagination.test.js): Verifies client-side pagination slicing and bounds clamping.
- [`tests/recap.test.js`](../tests/recap.test.js): Verifies Discord and Slack markdown recap formatting.
- [`tests/react-interactions.test.js`](../tests/react-interactions.test.js): Verifies React component bindings and store interactions.
- [`tests/snapshots.test.js`](../tests/snapshots.test.js): Verifies visual snapshot image dimensions and headers.
- [`tests/bundle.test.js`](../tests/bundle.test.js): Verifies syntax and validity of minified production bundles.

---

## 📸 Visual Regression Snapshot Generator

CrossLeague includes an automated visual snapshot generator ([`scripts/generate-snapshots.js`](../scripts/generate-snapshots.js)) that launches headless Chrome to capture pixel-perfect PNG screenshots of dashboard tabs and modals.

### Generating Snapshots

```bash
task snapshots
```

Snapshots are stored in `snapshots/`:

- Desktop Viewports (1280x800): `leaderboard.png`, `luck.png`, `players.png`, `awards.png`, `visuals.png`, `leagues.png`, `luck-modal.png`, `settings-modal.png`, `empty-state.png`.
- Mobile Viewports (540x960): `mobile-leaderboard.png`, `mobile-awards.png`.

---

## 🧹 Code Quality & Linting Standards

- **TypeScript**: Strict type checking via [`tsconfig.json`](../tsconfig.json).
- **Code Formatter**: [Prettier](https://prettier.io/) with `prettier-plugin-tailwindcss`.
- **Linter**: [ESLint](https://eslint.org/) flat configuration with React hooks and TypeScript plugins.
- **Dead Code Analysis**: [Knip](https://knip.dev/) for detecting unused exports and dependencies.

Run `task fix` before opening a pull request or committing changes.

---

## 📝 Commits, Pull Requests & Documentation

### Gitmoji Commit Standard

Commits follow the conventional Gitmoji format: `<intention> [scope?][:?] <message>`

- ✨ `✨ (players): add positional depth exposure metric`
- 🐛 `🐛 (espn): fix slot ID mapping for FLEX starters`
- ♻️ `♻️ (state): extract selector hooks from store`
- 📝 `📝 (docs): update architecture data flow diagram`
- 💄 `💄 (header): improve mobile navigation spacing`
- 🧪 `🧪 (analytics): add edge cases for All-Play ties`

### Documentation Maintenance

When changing features, components, or analytics:

1. Update the corresponding technical guide in [`docs/`](../docs/).
2. If UI visuals change, update baseline snapshots with `task snapshots` and check [`README.md`](../README.md).
3. If entrypoints or architecture change, update [`AGENTS.md`](../AGENTS.md).
4. Run `task check` to ensure bundle synchronization and type correctness.

---

## 🚀 Continuous Integration & Deployment

Every pull request and push to `main` executes [`.github/workflows/ci.yaml`](../.github/workflows/ci.yaml):

1. Installs dependencies (`task install`).
2. Validates formatting, linting, TypeScript types, and Knip (`task check`).
3. Runs the test suite (`task test`).
4. Verifies visual snapshot baselines (`task snapshots:check`).
5. Asserts production bundles in `dist/` are synchronized (`task check:build`).

# CrossLeague Agent Guide

CrossLeague is a static, client-side dashboard for comparing fantasy-football leagues from Sleeper and ESPN. It is a React 19 + TypeScript application built by Vite, with Zustand for shared state and Tailwind utility classes plus `src/css/styles.css` for styling.

## Project map

- `src/js/components/App.tsx` mounts the dashboard, initializes preferences/URL data, and owns the active-tab shell.
- `src/js/components/header/Header.tsx` contains the fixed header, desktop tabs, the main settings menu, week controls, platform selection, sharing, and league filtering.
- `src/js/components/tabs/*.tsx` are the active dashboard views.
- `src/js/components/modals/LuckModal.tsx` is the Luck Index detail modal.
- `src/js/state/useCrossLeagueStore.js` is the Zustand store. Use its actions rather than duplicating component-local state for shared UI/data state.
- `src/js/services/syncService.js` coordinates data loading; `src/js/api/` contains Sleeper and ESPN adapters.
- `src/js/analytics/` owns calculations and player aggregation.
- `src/js/types/index.ts` holds the shared TypeScript data model.
- `src/js/components/*.js` includes legacy imperative renderers retained for compatibility/tests. Do not wire new UI into them; make product UI changes in the React components.
- `scripts/build.js` produces the committed `dist/` bundles and standalone production HTML.
- `tests/` contains Node tests and visual snapshot fixtures. `tests/.snapshot-tmp/` is generated and should not be committed.

## Working conventions

- Make surgical changes. Preserve existing behavior unless the task explicitly changes it.
- Use Lucide React icons for UI icons. Do not add hardcoded emoji to the interface; the chat recap is the intentional exception.
- Keep accessibility intact: buttons need an accessible name/title where the visible affordance is icon-only, and controls need appropriate `type`, labels, and keyboard behavior.
- Use the established dark slate/emerald/cyan visual language and existing responsive Tailwind patterns. Prefer the existing `glass-card` treatment for dashboard panels.
- Format changed files with Prettier. Do not perform unrelated formatting/refactors, especially in older legacy files.
- Do not reintroduce the removed report/export feature or its generated-template machinery.

## Header and navigation

- The header is intentionally viewport-fixed (`Header.tsx`). `App.tsx` supplies responsive top padding (`pt-20 sm:pt-32`) so content is not obscured. Change them together if header height changes.
- The current platform is shown once in `#headerPlatformBadge`, next to the season badge. Do not repeat Sleeper/ESPN badges in dashboard table rows.
- Keep the platform selector in the settings menu: it is the functional mechanism for changing platforms.
- The settings menu is an existing functional surface. Preserve its current labels/actions and its mobile close behavior unless the requested change explicitly alters them.
- Desktop tab labels are defined in `Header.tsx`; the Luck tab is named **Luck Index**. The mobile bottom navigation deliberately has no Settings button.

## Data and table behavior

- `rawRecords` are the source of truth; `useActiveRecords()` applies the selected-league filter.
- Weekly records use `outcome` (`win`, `loss`, `tie`, etc.) and `opponentName`. Do not render weekly actual records from absent season `wins`/`losses` fields. Season rollups use `rawWins`, `rawLosses`, and `rawTies` when available.
- The Luck table intentionally mirrors the former UI: manager/squad identity, league name, matchup outcome pill plus opponent, All-Play record and win rate, compact Lucide luck badge, and PF/PA units. The All-Play Formula help bubble explains methodology.
- The Player table intentionally mirrors the former UI: rank, player identity, position/team, points, Start Rate with count and bar, manager/exposure chips (first three plus overflow), and a disclosure button for owner detail.
- Preserve table filtering, sorting, pagination, and row-expansion behavior when changing table presentation.

## Commands and verification

Use the Taskfile entry points:

```sh
task dev
task fix
task check
task snapshots:check
task build
```

- Before committing a substantive change, run `task check` and `task snapshots:check`.
- `task check` verifies formatting, linting, TypeScript, tests, and that `dist/` is synchronized with source.
- If `task check` reports stale distribution artifacts, run `task build`, inspect the resulting diff, then rerun checks.
- Run `task snapshots` only when a visual change is intentional and snapshot baselines should be updated; otherwise use `task snapshots:check`.

## Git and pull requests

- Use Gitmoji commit subjects, for example `🐛 (luck): use weekly matchup outcomes` or `💄 (header): centralize platform indicator`.
- Keep commits focused and avoid committing generated temporary files, credentials, or local settings.
- Use the repository PR template when opening/updating a PR. Summarize behavior changes and list the checks run.

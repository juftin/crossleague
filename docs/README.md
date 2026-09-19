# 📚 CrossLeague Documentation Hub

Welcome to the comprehensive technical documentation for **CrossLeague** — the client-side fantasy football analytics and power rankings dashboard for Sleeper and ESPN leagues.

Whether you are a developer, an open-source contributor, or an AI coding agent, this documentation hub provides in-depth technical guides for every subsystem of CrossLeague.

---

## 🧭 Documentation Map

| Guide                                                  | Description                                          | Key Topics                                                                              |
| :----------------------------------------------------- | :--------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| [**Architecture**](architecture.md)                    | High-level system design and execution model         | React 19 + TypeScript runtime, Zustand store, data flow, build pipeline                 |
| [**Analytics & Mathematics**](analytics.md)            | Analytical models, algorithms, and math formulations | All-Play, Expected Wins ($xW$), Luck Index, Lineup Efficiency, Consistency              |
| [**API Adapters**](api-adapters.md)                    | Upstream fantasy platform integration                | Sleeper REST API, ESPN Fantasy API, slot IDs, roster parsing, sync service              |
| [**State Management & Caching**](state-and-caching.md) | Client state and storage persistence                 | Zustand store (`useCrossLeagueStore`), `localStorage` caching, TTL expiration           |
| [**URL Parameters & Deep Linking**](url-parameters.md) | Shareable state and parameter mapping                | Shorthand query aliases, multi-league query parsing, deep linking                       |
| [**UI Components & Visualizations**](ui-components.md) | User interface architecture & glassmorphic design    | React component tree, tabs, modals, podium, Chart.js integrations, Lucide icons         |
| [**Export & Sharing**](export-and-sharing.md)          | Export subsystems and reporting                      | Discord/Slack chat recaps, CSV downloads, shareable URLs                                |
| [**Development & Testing**](development.md)            | Development workflow, tooling, and CI/CD             | `Taskfile.yaml`, Vite dev server, `node:test`, Knip, visual snapshots, Cloudflare Pages |
| [**AI Agents Operating Guide**](../AGENTS.md)          | Operating manual for AI coding assistants            | Core tenets, fast navigation index, commit rules, PR guidelines, Task commands          |

---

## ⚡ Quick Navigation by Persona

### 👨‍💻 For Developers & Contributors

- Getting started locally? Follow the [Development & Testing Guide](development.md).
- Understanding how data flows through the app? Read the [Architecture Guide](architecture.md).
- Adding or modifying UI elements? Check the [React UI Components Guide](ui-components.md).

### 🤖 For AI Coding Agents

- Please start by reading [**`AGENTS.md`**](../AGENTS.md) in the project root for strict coding guidelines, tenets, task commands, and quick topic references.
- For metric implementation rules and mathematical proofs, consult [Analytics & Mathematics](analytics.md).
- For upstream platform API payloads and roster structures, consult [API Adapters](api-adapters.md).

---

## 📦 Key Subsystems Overview

```
src/
├── css/             # Glassmorphic Tailwind CSS design system
├── js/
│   ├── analytics/   # Pure functional mathematical & statistical calculators
│   ├── api/         # Platform adapters (Sleeper, ESPN) & player DB clients
│   ├── components/  # React 19 component tree (Header, Tabs, Modals, Summary)
│   ├── export/      # Chat recaps, CSV exports, shareable link builders
│   ├── services/    # Cross-platform data synchronization service
│   ├── state/       # Zustand store, TTL caching, URL query sync
│   ├── types/       # TypeScript type definitions and interfaces
│   └── index.js     # React application bootstrap & entry point
└── index.html       # Vite development HTML template
```

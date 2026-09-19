/**
 * CrossLeague • Main Application Entry Point & React Root Mounting
 *
 * Modular entry point exporting analytics calculators, API adapters, export utilities,
 * and mounting the React 19 UI onto #root with full backward compatibility.
 */

import React from "react";
import { createRoot } from "react-dom/client";
import { useCrossLeagueStore } from "./state/useCrossLeagueStore.js";
import { syncData } from "./services/syncService.js";
import { savePreferences } from "./state/preferences.js";

// 1. Re-export subsystems for package consumers & test suites
export * from "./state/constants.js";
export * from "./state/store.js";
export * from "./state/cache.js";
export * from "./state/preferences.js";
export * from "./state/urlParams.js";

export * from "./analytics/index.js";
export * from "./api/index.js";
export * from "./components/dom.js";
export * from "./components/toast.js";
export * from "./components/modal.js";
export * from "./components/pagination.js";
export * from "./components/dropdowns.js";
export * from "./components/tabs.js";
export * from "./components/podium.js";
export * from "./components/superlatives.js";
export * from "./components/cards.js";
export * from "./components/table.js";
export * from "./components/charts.js";
export * from "./components/leagueGrid.js";
export * from "./components/playerAnalytics.js";
export * from "./components/luckAnalytics.js";

export * from "./export/index.js";

// Direct public API named exports for package root compliance
export { calculateAllPlay } from "./analytics/allPlay.js";
export { calculateLuckIndex } from "./analytics/luck.js";
export { calculateLineupEfficiency } from "./analytics/efficiency.js";
export { calculateStdDev } from "./analytics/statistics.js";
export { calculateSuperlatives } from "./analytics/superlatives.js";
export { aggregatePlayers } from "./analytics/aggregation.js";
export { fetchEspnLeague } from "./api/espn.js";
export { resolveUser } from "./api/sleeper.js";
export { copyChatRecap } from "./export/recap.js";
export { exportCsv } from "./export/csv.js";

// Global Window Bindings for Snapshot Generation and Script Interoperability
if (typeof window !== "undefined") {
  window.switchTab = (tabId, pushHistory = true) => {
    useCrossLeagueStore.getState().setActiveTab(tabId, pushHistory);
  };

  window.openSettingsModal = () => {
    useCrossLeagueStore.getState().openSettingsModal();
  };

  window.closeSettingsModal = () => {
    useCrossLeagueStore.getState().closeSettingsModal();
  };

  window.toggleSettingsDropdown = () => {
    useCrossLeagueStore.getState().toggleSettingsDropdown();
  };

  window.openLuckModal = () => {
    useCrossLeagueStore.getState().openLuckModal();
  };

  window.closeLuckModal = () => {
    useCrossLeagueStore.getState().closeLuckModal();
  };

  window.savePreferences = savePreferences;
  window.syncData = syncData;
  window.startApp = startApp;
}

// Mount React Root on DOM ready
let reactRoot = null;
export async function mountReactApp() {
  if (typeof document === "undefined") return;
  const rootElement = document.getElementById("root");
  if (!rootElement) return;
  if (reactRoot) return;

  try {
    const { App } = await import("./components/App.tsx");
    if (reactRoot) return;
    reactRoot = createRoot(rootElement);
    reactRoot.render(React.createElement(App, null));
  } catch (err) {
    console.error("Failed to mount React App:", err);
  }
}

export function startApp() {
  mountReactApp();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startApp);
  } else {
    startApp();
  }
}

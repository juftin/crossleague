/**
 * CrossLeague • Main Application Entry Point & React Root Mounting
 *
 * Application entry point mounting the React 19 UI onto #root.
 */

import React from "react";
import { createRoot } from "react-dom/client";
import { useCrossLeagueStore } from "./state/useCrossLeagueStore.js";
import { syncData } from "./services/syncService.js";

// Snapshot scenario hooks.
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

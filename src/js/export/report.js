/**
 * CrossLeague • Standalone Offline Report Exporter & Loader
 *
 * Generates self-contained, offline HTML snapshot files with embedded data,
 * minified JS, and minified CSS, and handles restoring embedded snapshots.
 */

import { state } from "../state/store.js";
import { initPlayersDb } from "../api/players.js";
import { showError, setLoading, updateModeUI } from "../components/dom.js";
import { renderLeagueDropdown } from "../components/dropdowns.js";
import { showToast } from "../components/toast.js";

/**
 * Downloads a standalone offline HTML report of current state.
 */
export async function downloadReport() {
  return shareReport();
}

/**
 * Generates and downloads a self-contained offline HTML snapshot.
 */
export async function shareReport() {
  if (!state.rawRecords || state.rawRecords.length === 0) {
    showError("No data available to generate report. Please sync a Sleeper or ESPN account first.");
    return;
  }

  // Ensure player DB is initialized
  try {
    await initPlayersDb();
  } catch (e) {
    console.warn("Could not prefetch player DB for export:", e);
  }

  const weekInput = document.getElementById("weekInput");
  const seasonInput = document.getElementById("seasonInput");
  const downloadReportBtnText = document.getElementById("downloadReportBtnText");
  const shareReportBtnText = document.getElementById("shareReportBtnText");

  const week = weekInput ? parseInt(weekInput.value, 10) : 1;
  const season = seasonInput ? seasonInput.value : "2026";

  // Only export data for currently selected/filtered leagues
  const exportedLeagueIds = Array.from(state.selectedLeagueIds);
  const exportedRecords = state.rawRecords.filter(r => state.selectedLeagueIds.has(r.leagueId));
  const exportedLeaguesMap = {};
  const exportedAllLeaguesData = [];
  for (const lid of exportedLeagueIds) {
    if (state.leaguesMap[lid]) exportedLeaguesMap[lid] = state.leaguesMap[lid];
    const leagueEntry = state.allLeaguesData.find(l => l.league_id === lid);
    if (leagueEntry) exportedAllLeaguesData.push(leagueEntry);
  }

  const payload = {
    version: "2.0",
    generatedAt: new Date().toISOString(),
    mode: state.currentMode,
    user: {
      id: state.currentUserId,
      name: state.currentUserName,
      avatar: state.currentUserAvatar
    },
    season: season,
    week: week,
    records: exportedRecords,
    leaguesMap: exportedLeaguesMap,
    allLeaguesData: exportedAllLeaguesData,
    selectedLeagueIds: exportedLeagueIds,
    playersDb: state.sleeperPlayersDb || {},
    espnPlayersDb: state.espnPlayersDb || {}
  };

  // Grab stylesheet content (prefer minified dist/styles.min.css, fallback to styles.css)
  let cssContent = "";
  const cssCandidates = [
    "dist/styles.min.css",
    "styles.min.css",
    "styles.css",
    "src/css/styles.css"
  ];
  for (const candidate of cssCandidates) {
    try {
      const cssResp = await fetch(candidate);
      if (cssResp.ok) {
        cssContent = await cssResp.text();
        break;
      }
    } catch {
      // Continue to next candidate
    }
  }

  // Grab app.js content (prefer minified dist/app.min.js, fallback to app.min.js or app.js)
  let jsContent = "";
  const jsCandidates = ["dist/app.min.js", "app.min.js", "app.js", "src/js/index.js"];
  for (const candidate of jsCandidates) {
    try {
      const jsResp = await fetch(candidate);
      if (jsResp.ok) {
        jsContent = await jsResp.text();
        break;
      }
    } catch {
      // Continue to next candidate
    }
  }

  let html = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;

  // Clean out previous embedded scripts
  const existingScriptPattern = new RegExp(
    '<script id="embedded-report-data">[\\s\\S]*?</script>\\n?',
    "gi"
  );
  html = html.replace(existingScriptPattern, "");

  // If external link styles.css is present, inline it safely using function replacer
  if (cssContent) {
    html = html.replace(
      /<link[^>]*href=["'][^"']*styles(\.min)?\.css["'][^>]*>/gi,
      () => `<style>\n${cssContent}\n</style>`
    );
  }

  // If external script is present, inline it safely using function replacer (prevents $ pattern collisions)
  if (jsContent) {
    const sOpen = "<script>";
    const sClose = "</script>";
    const scriptPattern = new RegExp(
      "<script[^>]*src=[\"'][^\"']*(app|index)(\\.min)?\\.js[\"'][^>]*></script>",
      "gi"
    );
    html = html.replace(scriptPattern, () => `${sOpen}\n${jsContent}\n${sClose}`);
  }

  // Create serialized script tag safely escaped
  const jsonStr = JSON.stringify(payload).replace(new RegExp("</script", "gi"), "<\\/script");
  const openTag = '<script id="embedded-report-data">';
  const closeTag = "</script>";

  const embeddedScript = `${openTag}\n  window.__EMBEDDED_REPORT__ = ${jsonStr};\n${closeTag}\n`;

  if (html.includes("</head>")) {
    html = html.replace("</head>", () => `${embeddedScript}</head>`);
  } else {
    html = embeddedScript + html;
  }

  const filename = "crossleague.html";

  // Trigger local file download via Blob
  try {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    showToast("Report downloaded successfully!", "📁");
  } catch (err) {
    console.error("Blob download error:", err);
    showError("Failed to generate download file. Please try again.");
  }

  if (downloadReportBtnText) {
    const originalText = downloadReportBtnText.textContent;
    downloadReportBtnText.textContent = "Report Downloaded! 📁";
    setTimeout(() => {
      downloadReportBtnText.textContent = originalText;
    }, 2500);
  }
  if (shareReportBtnText && shareReportBtnText !== downloadReportBtnText) {
    const originalText = shareReportBtnText.textContent;
    shareReportBtnText.textContent = "Report Downloaded! 📁";
    setTimeout(() => {
      shareReportBtnText.textContent = originalText;
    }, 2500);
  }
}

/**
 * Loads an embedded report snapshot data object into current state.
 *
 * @param {object} data Embedded report data
 * @param {Function} refreshFn Callback to refresh the dashboard
 * @returns {boolean} True if loaded successfully
 */
export function loadEmbeddedReport(data, refreshFn) {
  if (!data) return false;

  const modeSelect = document.getElementById("modeSelect");
  const userIdInput = document.getElementById("userIdInput");
  const seasonInput = document.getElementById("seasonInput");
  const weekInput = document.getElementById("weekInput");
  const reportContent = document.getElementById("reportContent");
  const initialState = document.getElementById("initialState");
  const skeletonLoader = document.getElementById("skeletonLoader");
  const syncControlCenter = document.getElementById("syncControlCenter");
  const liveSyncIndicator = document.getElementById("liveSyncIndicator");
  const headerSeasonBadge = document.getElementById("headerSeasonBadge");
  const headerWeekBadge = document.getElementById("headerWeekBadge");
  const btnOpenSettingsModal = document.getElementById("btnOpenSettingsModal");
  const snapshotSubtitle = document.getElementById("snapshotSubtitle");
  const snapshotIndicator = document.getElementById("snapshotIndicator");
  const shareUrlBtn = document.getElementById("shareUrlBtn");
  const downloadReportBtn = document.getElementById("downloadReportBtn");
  const shareReportBtn = document.getElementById("shareReportBtn");
  const copyRecapBtn = document.getElementById("copyRecapBtn");
  const exportCsvBtn = document.getElementById("exportCsvBtn");

  state.currentMode = data.mode || "WEEKLY";
  if (modeSelect) modeSelect.value = state.currentMode;
  updateModeUI();

  state.currentUserId = data.user ? data.user.id : "";
  state.currentUserName = data.user ? data.user.name : "";
  state.currentUserAvatar = data.user ? data.user.avatar : "";

  if (userIdInput && state.currentUserName) {
    userIdInput.value = state.currentUserName || state.currentUserId;
  }
  if (seasonInput && data.season) {
    seasonInput.value = String(data.season);
  }
  if (weekInput && data.week) {
    weekInput.value = String(data.week);
  }

  if (data.playersDb && Object.keys(data.playersDb).length > 0) {
    state.sleeperPlayersDb = data.playersDb;
  }
  if (data.espnPlayersDb && Object.keys(data.espnPlayersDb).length > 0) {
    state.espnPlayersDb = { ...state.espnPlayersDb, ...data.espnPlayersDb };
  }

  state.rawRecords = (data.records || []).map(r => ({
    ...r,
    efficiency: typeof r.efficiency === "number" && !isNaN(r.efficiency) ? r.efficiency : 100,
    benchPoints: typeof r.benchPoints === "number" && !isNaN(r.benchPoints) ? r.benchPoints : 0,
    outcome: r.outcome || "unpaired",
    winPct: typeof r.winPct === "number" && !isNaN(r.winPct) ? r.winPct : 0,
    startersList: Array.isArray(r.startersList) ? r.startersList : [],
    allPlayersList: Array.isArray(r.allPlayersList) ? r.allPlayersList : [],
    playersPointsMap: r.playersPointsMap || {},
    startersPoints: Array.isArray(r.startersPoints) ? r.startersPoints : [],
    weeklyPlayerRecords: Array.isArray(r.weeklyPlayerRecords) ? r.weeklyPlayerRecords : []
  }));

  state.leaguesMap = data.leaguesMap || {};
  state.allLeaguesData = data.allLeaguesData || [];
  state.selectedLeagueIds = new Set(
    data.selectedLeagueIds || state.allLeaguesData.map(l => l.league_id)
  );

  setLoading(false);
  if (initialState) initialState.classList.add("hidden");
  if (skeletonLoader) skeletonLoader.classList.add("hidden");
  if (syncControlCenter) syncControlCenter.classList.add("hidden");
  if (liveSyncIndicator) liveSyncIndicator.classList.add("hidden");
  if (headerSeasonBadge) headerSeasonBadge.classList.add("hidden");
  if (headerWeekBadge) headerWeekBadge.classList.add("hidden");
  if (btnOpenSettingsModal) btnOpenSettingsModal.classList.add("hidden");

  // Embed snapshot info into the header subtitle
  const dateFormatted = data.generatedAt
    ? new Date(data.generatedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
      })
    : "";
  if (snapshotSubtitle) {
    const modeTitle =
      state.currentMode === "SEASON_ROLLUP"
        ? `Season Rollup (Weeks 1–${data.week || 1})`
        : `Week ${data.week || 1}`;
    snapshotSubtitle.textContent = `📁 ${modeTitle} • ${data.season || 2024} NFL Season${dateFormatted ? " • Generated " + dateFormatted : ""}`;
    snapshotSubtitle.classList.remove("hidden");
  }

  if (snapshotIndicator) {
    snapshotIndicator.classList.remove("hidden");
    snapshotIndicator.title = `Embedded Snapshot${dateFormatted ? " created on " + dateFormatted : ""}`;
  }

  if (reportContent) reportContent.classList.remove("hidden");
  // Hide action buttons that don't work in offline exported reports
  if (shareUrlBtn) shareUrlBtn.classList.add("hidden");
  if (downloadReportBtn) downloadReportBtn.classList.add("hidden");
  if (shareReportBtn) shareReportBtn.classList.add("hidden");
  if (copyRecapBtn) copyRecapBtn.classList.add("hidden");
  if (exportCsvBtn) exportCsvBtn.classList.add("hidden");

  initPlayersDb();
  renderLeagueDropdown();
  if (typeof refreshFn === "function") {
    refreshFn();
  }

  return true;
}

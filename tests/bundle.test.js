import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

describe("Bundle & Syntax Integrity", () => {
  const appJsPath = path.join(rootDir, "app.js");
  const stylesCssPath = path.join(rootDir, "styles.css");
  const indexHtmlPath = path.join(rootDir, "index.html");

  it("should have valid JavaScript syntax in app.js", () => {
    const code = fs.readFileSync(appJsPath, "utf8");
    assert.doesNotThrow(() => {
      new vm.Script(code, { filename: "app.js" });
    }, "app.js should compile without syntax errors");
  });

  it("should save preferences before a page refresh or navigation", () => {
    const code = fs.readFileSync(appJsPath, "utf8");
    assert.match(
      code,
      /window\.addEventListener\("pagehide", savePreferences\)/,
      "The current username and settings must be saved when leaving the page"
    );
  });

  it("should initialize after the document has loaded", () => {
    const code = fs.readFileSync(appJsPath, "utf8");
    assert.match(
      code,
      /document\.addEventListener\("DOMContentLoaded", startApp\)/,
      "Saved preferences must be restored when the document finishes loading"
    );
  });

  it("should support report filters from URL query parameters", () => {
    const code = fs.readFileSync(appJsPath, "utf8");
    assert.match(code, /new URLSearchParams\(window\.location\.search\)/);
    assert.match(code, /function getUrlParams/);
  });

  it("should have valid JavaScript syntax in scripts/bundle.js", () => {
    const bundleScriptPath = path.join(rootDir, "scripts", "bundle.js");
    assert.doesNotThrow(() => {
      execFileSync(process.execPath, ["--check", bundleScriptPath]);
    }, "scripts/bundle.js should compile without syntax errors");
  });

  it("should have index.html with inlined styles.css matching the standalone file", () => {
    const stylesCss = fs.readFileSync(stylesCssPath, "utf8").trim();
    const indexHtml = fs.readFileSync(indexHtmlPath, "utf8");

    const styleStartRegex = /<style>/i;
    const styleEndRegex = /<\/style>/i;

    const styleStartMatch = indexHtml.match(styleStartRegex);
    const styleEndMatch = indexHtml.match(styleEndRegex);

    assert.ok(styleStartMatch, "index.html must contain <style> tag");
    assert.ok(styleEndMatch, "index.html must contain </style> tag");

    const inlinedCss = indexHtml
      .substring(styleStartMatch.index + styleStartMatch[0].length, styleEndMatch.index)
      .trim();
    assert.equal(
      inlinedCss,
      stylesCss,
      "Inlined CSS in index.html must be identical to styles.css. Run 'task build' to sync."
    );
  });

  it("should have index.html with inlined app.js matching the standalone file", () => {
    const appJs = fs.readFileSync(appJsPath, "utf8").trim();
    const indexHtml = fs.readFileSync(indexHtmlPath, "utf8");

    const startRegex = /<!--\s*Application Logic\s*-->\s*<script[^>]*>/i;
    const endRegex = /<\/script>\s*<\/body>/i;

    const startMatch = indexHtml.match(startRegex);
    const endMatch = indexHtml.match(endRegex);

    assert.ok(startMatch, "index.html must contain start tag marker");
    assert.ok(endMatch, "index.html must contain end tag marker");

    const inlinedCode = indexHtml
      .substring(startMatch.index + startMatch[0].length, endMatch.index)
      .trim();
    assert.equal(
      inlinedCode,
      appJs,
      "Inlined code in index.html must be identical to app.js. Run 'task build' to sync."
    );
  });

  it("should contain settings modal and standalone week selector in index.html", () => {
    const indexHtml = fs.readFileSync(indexHtmlPath, "utf8");

    // Settings Dropdown & Modal trigger elements
    assert.ok(
      indexHtml.includes('id="settingsDropdownContainer"'),
      "Must contain #settingsDropdownContainer"
    );
    assert.ok(indexHtml.includes('id="settingsModal"'), "Must contain #settingsModal");
    assert.ok(indexHtml.includes('id="settingsBackdrop"'), "Must contain #settingsBackdrop");
    assert.ok(
      indexHtml.includes('id="btnOpenSettingsModal"'),
      "Must contain #btnOpenSettingsModal"
    );
    assert.ok(
      indexHtml.includes('id="btnCloseSettingsModal"'),
      "Must contain #btnCloseSettingsModal"
    );
    assert.ok(
      indexHtml.includes('id="btnSaveSettingsModal"'),
      "Must contain #btnSaveSettingsModal"
    );
    assert.ok(
      indexHtml.includes('id="btnCancelSettingsModal"'),
      "Must contain #btnCancelSettingsModal"
    );
    assert.ok(indexHtml.includes('id="userIdInput"'), "Must contain #userIdInput");
    assert.ok(indexHtml.includes('id="syncTypeUserBtn"'), "Must contain #syncTypeUserBtn");
    assert.ok(indexHtml.includes('id="syncTypeLeaguesBtn"'), "Must contain #syncTypeLeaguesBtn");
    assert.ok(indexHtml.includes('id="userSyncPanel"'), "Must contain #userSyncPanel");
    assert.ok(indexHtml.includes('id="leaguesSyncPanel"'), "Must contain #leaguesSyncPanel");
    assert.ok(indexHtml.includes('id="customLeagueIdInput"'), "Must contain #customLeagueIdInput");
    assert.ok(
      indexHtml.includes('id="btnAddCustomLeagueId"'),
      "Must contain #btnAddCustomLeagueId"
    );
    assert.ok(
      indexHtml.includes('id="customLeaguesDropdownBtn"'),
      "Must contain #customLeaguesDropdownBtn"
    );
    assert.ok(
      indexHtml.includes('id="customLeaguesDropdownLabel"'),
      "Must contain #customLeaguesDropdownLabel"
    );
    assert.ok(
      indexHtml.includes('id="customLeaguesDropdownMenu"'),
      "Must contain #customLeaguesDropdownMenu"
    );
    assert.ok(
      indexHtml.includes('id="customLeagueIdsChips"'),
      "Must contain #customLeagueIdsChips"
    );
    assert.ok(indexHtml.includes('id="modeSelect"'), "Must contain #modeSelect");
    assert.ok(indexHtml.includes('id="seasonInput"'), "Must contain #seasonInput");

    // Standalone League Filter Dropdown in Header
    assert.ok(
      indexHtml.includes('id="leagueDropdownContainer"'),
      "Must contain #leagueDropdownContainer"
    );
    assert.ok(indexHtml.includes('id="leagueDropdownBtn"'), "Must contain #leagueDropdownBtn");
    assert.ok(indexHtml.includes('id="leagueDropdownLabel"'), "Must contain #leagueDropdownLabel");
    assert.ok(indexHtml.includes('id="leagueDropdownBadge"'), "Must contain #leagueDropdownBadge");
    assert.ok(indexHtml.includes('id="leagueDropdownMenu"'), "Must contain #leagueDropdownMenu");
    assert.ok(indexHtml.includes('id="leagueDropdownList"'), "Must contain #leagueDropdownList");
    assert.ok(indexHtml.includes('id="selectAllLeaguesBtn"'), "Must contain #selectAllLeaguesBtn");
    assert.ok(indexHtml.includes('id="clearAllLeaguesBtn"'), "Must contain #clearAllLeaguesBtn");

    // Menu Action Buttons (Copy Recap, Share, Download Report)
    assert.ok(indexHtml.includes('id="copyRecapBtn"'), "Must contain #copyRecapBtn");
    assert.ok(indexHtml.includes('id="shareUrlBtn"'), "Must contain #shareUrlBtn");
    assert.ok(indexHtml.includes('id="downloadReportBtn"'), "Must contain #downloadReportBtn");
    assert.ok(indexHtml.includes('id="btnOpenLuckModal"'), "Must contain #btnOpenLuckModal");

    // Menu Week Selector & settings elements
    assert.ok(
      indexHtml.includes('id="weekSelectorComponent"'),
      "Must contain #weekSelectorComponent"
    );
    assert.ok(indexHtml.includes('id="weekInput"'), "Must contain #weekInput");
    assert.ok(indexHtml.includes('id="prevWeekBtn"'), "Must contain #prevWeekBtn");
    assert.ok(indexHtml.includes('id="nextWeekBtn"'), "Must contain #nextWeekBtn");
    assert.ok(indexHtml.includes('id="weekDisplayValue"'), "Must contain #weekDisplayValue");
    assert.ok(indexHtml.includes('id="weekStatusBadge"'), "Must contain #weekStatusBadge");

    // View Tabs (Desktop: Awards first, followed by Board, Visuals, LeagueGrid, Luck, Players)
    assert.ok(indexHtml.includes('id="tabAwards"'), "Must contain #tabAwards");
    assert.ok(indexHtml.includes('id="tabLeaderboard"'), "Must contain #tabLeaderboard");
    assert.ok(indexHtml.includes('id="tabVisuals"'), "Must contain #tabVisuals");
    assert.ok(indexHtml.includes('id="tabLeagueGrid"'), "Must contain #tabLeagueGrid");
    assert.ok(indexHtml.includes('id="tabLuck"'), "Must contain #tabLuck");
    assert.ok(indexHtml.includes('id="tabPlayers"'), "Must contain #tabPlayers");

    const tabAwardsIdx = indexHtml.indexOf('id="tabAwards"');
    const tabBoardIdx = indexHtml.indexOf('id="tabLeaderboard"');
    assert.ok(tabAwardsIdx < tabBoardIdx, "Awards tab should be positioned first before Board tab");

    // Mobile Bottom Navigation Dock & Buttons
    assert.ok(indexHtml.includes('id="mobileBottomNav"'), "Must contain #mobileBottomNav");
    assert.ok(indexHtml.includes('id="mobileTabAwards"'), "Must contain #mobileTabAwards");
    assert.ok(
      indexHtml.includes('id="mobileTabLeaderboard"'),
      "Must contain #mobileTabLeaderboard"
    );
    assert.ok(indexHtml.includes('id="mobileTabVisuals"'), "Must contain #mobileTabVisuals");
    assert.ok(indexHtml.includes('id="mobileTabLeagueGrid"'), "Must contain #mobileTabLeagueGrid");
    assert.ok(indexHtml.includes('id="mobileTabLuck"'), "Must contain #mobileTabLuck");
    assert.ok(indexHtml.includes('id="mobileTabPlayers"'), "Must contain #mobileTabPlayers");
  });
});

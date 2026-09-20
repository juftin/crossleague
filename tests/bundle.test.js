import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as viteBuild } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

describe("Source & Bundle Integrity", () => {
  before(async () => {
    await viteBuild({ logLevel: "silent" });
  });

  const srcJsPath = path.join(rootDir, "src", "js", "index.js");
  const srcHtmlPath = path.join(rootDir, "src", "index.html");
  const distDir = path.join(rootDir, "dist");
  const distIndexHtmlPath = path.join(distDir, "index.html");

  it("should have bundled production assets in dist/assets", () => {
    const assetsDir = path.join(distDir, "assets");
    assert.ok(fs.existsSync(assetsDir), "dist/assets directory must exist");
    const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith(".js"));
    const cssFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith(".css"));
    assert.ok(jsFiles.length > 0, "dist/assets must contain bundled JS files");
    assert.ok(cssFiles.length > 0, "dist/assets must contain bundled CSS files");

    for (const jsFile of jsFiles) {
      const code = fs.readFileSync(path.join(assetsDir, jsFile), "utf8");
      assert.ok(code.length > 0, `${jsFile} must not be empty`);
    }
  });

  it("should persist dashboard preferences through the React store", () => {
    const code = fs.readFileSync(
      path.join(rootDir, "src", "js", "state", "useCrossLeagueStore.js"),
      "utf8"
    );
    assert.match(
      code,
      /setPreference\(STORAGE_KEYS\.PREF_USER_NAME,\s*userName\)/,
      "The username setter must persist the active dashboard preference"
    );
  });

  it("should initialize after the document has loaded", () => {
    const code = fs.readFileSync(srcJsPath, "utf8");
    assert.match(
      code,
      /document\.addEventListener\("DOMContentLoaded",\s*startApp\)/,
      "Saved preferences must be restored when the document finishes loading"
    );
  });

  it("should support report filters from URL query parameters", () => {
    const code = fs.readFileSync(path.join(rootDir, "src", "js", "state", "urlParams.js"), "utf8");
    assert.match(code, /new URLSearchParams\(window\.location\.search\)/);
    assert.match(code, /export function getUrlParams/);
  });

  it("should produce production distribution in dist/index.html and dist/assets", () => {
    const distHtml = fs.readFileSync(distIndexHtmlPath, "utf8");
    assert.ok(distHtml.includes('<div id="root"></div>'), "dist/index.html must contain #root");
    assert.ok(
      distHtml.includes('<script type="module"'),
      "dist/index.html must contain module script tag"
    );
    assert.equal(
      (distHtml.match(/<!doctype html>/gi) || []).length,
      1,
      "HTML document must not be duplicated"
    );
  });

  it("should contain settings modal and standalone week selector in src/index.html", () => {
    const srcHtml = fs.readFileSync(srcHtmlPath, "utf8");

    // Settings Dropdown & Modal trigger elements
    assert.ok(
      srcHtml.includes('id="settingsDropdownContainer"'),
      "Must contain #settingsDropdownContainer"
    );
    assert.ok(srcHtml.includes('id="settingsModal"'), "Must contain #settingsModal");
    assert.ok(srcHtml.includes('id="settingsBackdrop"'), "Must contain #settingsBackdrop");
    assert.ok(srcHtml.includes('id="btnOpenSettingsModal"'), "Must contain #btnOpenSettingsModal");
    assert.ok(
      srcHtml.includes('id="btnCloseSettingsModal"'),
      "Must contain #btnCloseSettingsModal"
    );
    assert.ok(srcHtml.includes('id="btnSaveSettingsModal"'), "Must contain #btnSaveSettingsModal");
    assert.ok(
      srcHtml.includes('id="btnCancelSettingsModal"'),
      "Must contain #btnCancelSettingsModal"
    );
    assert.ok(srcHtml.includes('id="userIdInput"'), "Must contain #userIdInput");
    assert.ok(srcHtml.includes('id="syncTypeUserBtn"'), "Must contain #syncTypeUserBtn");
    assert.ok(srcHtml.includes('id="syncTypeLeaguesBtn"'), "Must contain #syncTypeLeaguesBtn");
    assert.ok(srcHtml.includes('id="userSyncPanel"'), "Must contain #userSyncPanel");
    assert.ok(srcHtml.includes('id="leaguesSyncPanel"'), "Must contain #leaguesSyncPanel");
    assert.ok(srcHtml.includes('id="customLeagueIdInput"'), "Must contain #customLeagueIdInput");
    assert.ok(srcHtml.includes('id="btnAddCustomLeagueId"'), "Must contain #btnAddCustomLeagueId");
    assert.ok(
      srcHtml.includes('id="customLeaguesDropdownBtn"'),
      "Must contain #customLeaguesDropdownBtn"
    );
    assert.ok(
      srcHtml.includes('id="customLeaguesDropdownLabel"'),
      "Must contain #customLeaguesDropdownLabel"
    );
    assert.ok(
      srcHtml.includes('id="customLeaguesDropdownMenu"'),
      "Must contain #customLeaguesDropdownMenu"
    );
    assert.ok(srcHtml.includes('id="customLeagueIdsChips"'), "Must contain #customLeagueIdsChips");
    assert.ok(srcHtml.includes('id="modeSelect"'), "Must contain #modeSelect");
    assert.ok(srcHtml.includes('id="seasonInput"'), "Must contain #seasonInput");

    // Standalone League Filter Dropdown in Header
    assert.ok(
      srcHtml.includes('id="leagueDropdownContainer"'),
      "Must contain #leagueDropdownContainer"
    );
    assert.ok(srcHtml.includes('id="leagueDropdownBtn"'), "Must contain #leagueDropdownBtn");
    assert.ok(srcHtml.includes('id="leagueDropdownLabel"'), "Must contain #leagueDropdownLabel");
    assert.ok(srcHtml.includes('id="leagueDropdownBadge"'), "Must contain #leagueDropdownBadge");
    assert.ok(srcHtml.includes('id="leagueDropdownMenu"'), "Must contain #leagueDropdownMenu");
    assert.ok(srcHtml.includes('id="leagueDropdownList"'), "Must contain #leagueDropdownList");
    assert.ok(srcHtml.includes('id="selectAllLeaguesBtn"'), "Must contain #selectAllLeaguesBtn");
    assert.ok(srcHtml.includes('id="clearAllLeaguesBtn"'), "Must contain #clearAllLeaguesBtn");

    // Menu Action Buttons (Copy Recap, Share, Clear Data)
    assert.ok(srcHtml.includes('id="copyRecapBtn"'), "Must contain #copyRecapBtn");
    assert.ok(srcHtml.includes('id="shareUrlBtn"'), "Must contain #shareUrlBtn");
    assert.ok(srcHtml.includes('id="clearDataBtn"'), "Must contain #clearDataBtn");
    assert.ok(srcHtml.includes('id="btnOpenLuckModal"'), "Must contain #btnOpenLuckModal");

    // Menu Week Selector & settings elements
    assert.ok(
      srcHtml.includes('id="weekSelectorComponent"'),
      "Must contain #weekSelectorComponent"
    );
    assert.ok(srcHtml.includes('id="weekInput"'), "Must contain #weekInput");
    assert.ok(srcHtml.includes('id="prevWeekBtn"'), "Must contain #prevWeekBtn");
    assert.ok(srcHtml.includes('id="nextWeekBtn"'), "Must contain #nextWeekBtn");
    assert.ok(srcHtml.includes('id="weekDisplayValue"'), "Must contain #weekDisplayValue");
    assert.ok(srcHtml.includes('id="weekStatusBadge"'), "Must contain #weekStatusBadge");

    // View Tabs (Desktop: Awards first, followed by Board, Visuals, LeagueGrid, Luck, Players)
    assert.ok(srcHtml.includes('id="tabAwards"'), "Must contain #tabAwards");
    assert.ok(srcHtml.includes('id="tabLeaderboard"'), "Must contain #tabLeaderboard");
    assert.ok(srcHtml.includes('id="tabVisuals"'), "Must contain #tabVisuals");
    assert.ok(srcHtml.includes('id="tabLeagueGrid"'), "Must contain #tabLeagueGrid");
    assert.ok(srcHtml.includes('id="tabLuck"'), "Must contain #tabLuck");
    assert.ok(srcHtml.includes('id="tabPlayers"'), "Must contain #tabPlayers");

    const tabAwardsIdx = srcHtml.indexOf('id="tabAwards"');
    const tabBoardIdx = srcHtml.indexOf('id="tabLeaderboard"');
    assert.ok(tabAwardsIdx < tabBoardIdx, "Awards tab should be positioned first before Board tab");

    // Mobile Bottom Navigation Dock & Buttons
    assert.ok(srcHtml.includes('id="mobileBottomNav"'), "Must contain #mobileBottomNav");
    assert.ok(srcHtml.includes('id="mobileTabAwards"'), "Must contain #mobileTabAwards");
    assert.ok(srcHtml.includes('id="mobileTabLeaderboard"'), "Must contain #mobileTabLeaderboard");
    assert.ok(srcHtml.includes('id="mobileTabVisuals"'), "Must contain #mobileTabVisuals");
    assert.ok(srcHtml.includes('id="mobileTabLeagueGrid"'), "Must contain #mobileTabLeagueGrid");
    assert.ok(srcHtml.includes('id="btnOpenSettingsModal"'), "Must contain #btnOpenSettingsModal");
    assert.ok(
      srcHtml.includes('id="btnCloseSettingsModal"'),
      "Must contain #btnCloseSettingsModal"
    );
    assert.ok(srcHtml.includes('id="settingsBackdrop"'), "Must contain #settingsBackdrop");
  });

  it("should leave the React menu trigger as the sole click handler", () => {
    const code = fs.readFileSync(srcJsPath, "utf8");
    assert.doesNotMatch(
      code,
      /btnOpenSettingsModal\.addEventListener\("click",\s*toggleSettingsDropdown\)/,
      "React must own the menu button click handler without a legacy DOM listener"
    );
  });
});

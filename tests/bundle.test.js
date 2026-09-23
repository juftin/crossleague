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
  const rootHtmlPath = path.join(rootDir, "index.html");
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

  it("should contain settings modal and standalone week selector in index.html", () => {
    const rootHtml = fs.readFileSync(rootHtmlPath, "utf8");

    // Settings Dropdown & Modal trigger elements
    assert.ok(
      rootHtml.includes('id="settingsDropdownContainer"'),
      "Must contain #settingsDropdownContainer"
    );
    assert.ok(rootHtml.includes('id="settingsModal"'), "Must contain #settingsModal");
    assert.ok(rootHtml.includes('id="settingsBackdrop"'), "Must contain #settingsBackdrop");
    assert.ok(rootHtml.includes('id="btnOpenSettingsModal"'), "Must contain #btnOpenSettingsModal");
    assert.ok(
      rootHtml.includes('id="btnCloseSettingsModal"'),
      "Must contain #btnCloseSettingsModal"
    );
    assert.ok(rootHtml.includes('id="btnSaveSettingsModal"'), "Must contain #btnSaveSettingsModal");
    assert.ok(
      rootHtml.includes('id="btnCancelSettingsModal"'),
      "Must contain #btnCancelSettingsModal"
    );
    assert.ok(rootHtml.includes('id="userIdInput"'), "Must contain #userIdInput");
    assert.ok(rootHtml.includes('id="syncTypeUserBtn"'), "Must contain #syncTypeUserBtn");
    assert.ok(rootHtml.includes('id="syncTypeLeaguesBtn"'), "Must contain #syncTypeLeaguesBtn");
    assert.ok(rootHtml.includes('id="userSyncPanel"'), "Must contain #userSyncPanel");
    assert.ok(rootHtml.includes('id="leaguesSyncPanel"'), "Must contain #leaguesSyncPanel");
    assert.ok(rootHtml.includes('id="customLeagueIdInput"'), "Must contain #customLeagueIdInput");
    assert.ok(rootHtml.includes('id="btnAddCustomLeagueId"'), "Must contain #btnAddCustomLeagueId");
    assert.ok(
      rootHtml.includes('id="customLeaguesDropdownBtn"'),
      "Must contain #customLeaguesDropdownBtn"
    );
    assert.ok(
      rootHtml.includes('id="customLeaguesDropdownLabel"'),
      "Must contain #customLeaguesDropdownLabel"
    );
    assert.ok(
      rootHtml.includes('id="customLeaguesDropdownMenu"'),
      "Must contain #customLeaguesDropdownMenu"
    );
    assert.ok(rootHtml.includes('id="customLeagueIdsChips"'), "Must contain #customLeagueIdsChips");
    assert.ok(rootHtml.includes('id="modeSelect"'), "Must contain #modeSelect");
    assert.ok(rootHtml.includes('id="seasonInput"'), "Must contain #seasonInput");

    // Standalone League Filter Dropdown in Header
    assert.ok(
      rootHtml.includes('id="leagueDropdownContainer"'),
      "Must contain #leagueDropdownContainer"
    );
    assert.ok(rootHtml.includes('id="leagueDropdownBtn"'), "Must contain #leagueDropdownBtn");
    assert.ok(rootHtml.includes('id="leagueDropdownLabel"'), "Must contain #leagueDropdownLabel");
    assert.ok(rootHtml.includes('id="leagueDropdownBadge"'), "Must contain #leagueDropdownBadge");
    assert.ok(rootHtml.includes('id="leagueDropdownMenu"'), "Must contain #leagueDropdownMenu");
    assert.ok(rootHtml.includes('id="leagueDropdownList"'), "Must contain #leagueDropdownList");
    assert.ok(rootHtml.includes('id="selectAllLeaguesBtn"'), "Must contain #selectAllLeaguesBtn");
    assert.ok(rootHtml.includes('id="clearAllLeaguesBtn"'), "Must contain #clearAllLeaguesBtn");

    // Menu Action Buttons (Theme, Copy Recap, Share, Clear Data)
    assert.ok(rootHtml.includes('id="themeToggleBtn"'), "Must contain #themeToggleBtn");
    assert.ok(rootHtml.includes('id="copyRecapBtn"'), "Must contain #copyRecapBtn");
    assert.ok(rootHtml.includes('id="shareUrlBtn"'), "Must contain #shareUrlBtn");
    assert.ok(rootHtml.includes('id="clearDataBtn"'), "Must contain #clearDataBtn");
    assert.ok(rootHtml.includes('id="btnOpenLuckModal"'), "Must contain #btnOpenLuckModal");

    // Menu Week Selector & settings elements
    assert.ok(
      rootHtml.includes('id="weekSelectorComponent"'),
      "Must contain #weekSelectorComponent"
    );
    assert.ok(rootHtml.includes('id="weekInput"'), "Must contain #weekInput");
    assert.ok(rootHtml.includes('id="prevWeekBtn"'), "Must contain #prevWeekBtn");
    assert.ok(rootHtml.includes('id="nextWeekBtn"'), "Must contain #nextWeekBtn");
    assert.ok(rootHtml.includes('id="weekDisplayValue"'), "Must contain #weekDisplayValue");
    assert.ok(rootHtml.includes('id="weekStatusBadge"'), "Must contain #weekStatusBadge");

    // View Tabs (Desktop: Awards first, followed by Board, Visuals, LeagueGrid, Luck, Players)
    assert.ok(rootHtml.includes('id="tabAwards"'), "Must contain #tabAwards");
    assert.ok(rootHtml.includes('id="tabLeaderboard"'), "Must contain #tabLeaderboard");
    assert.ok(rootHtml.includes('id="tabVisuals"'), "Must contain #tabVisuals");
    assert.ok(rootHtml.includes('id="tabLeagueGrid"'), "Must contain #tabLeagueGrid");
    assert.ok(rootHtml.includes('id="tabLuck"'), "Must contain #tabLuck");
    assert.ok(rootHtml.includes('id="tabPlayers"'), "Must contain #tabPlayers");

    const tabAwardsIdx = rootHtml.indexOf('id="tabAwards"');
    const tabBoardIdx = rootHtml.indexOf('id="tabLeaderboard"');
    assert.ok(tabAwardsIdx < tabBoardIdx, "Awards tab should be positioned first before Board tab");

    // Mobile Bottom Navigation Dock & Buttons
    assert.ok(rootHtml.includes('id="mobileBottomNav"'), "Must contain #mobileBottomNav");
    assert.ok(rootHtml.includes('id="mobileTabAwards"'), "Must contain #mobileTabAwards");
    assert.ok(rootHtml.includes('id="mobileTabLeaderboard"'), "Must contain #mobileTabLeaderboard");
    assert.ok(rootHtml.includes('id="mobileTabVisuals"'), "Must contain #mobileTabVisuals");
    assert.ok(rootHtml.includes('id="mobileTabLeagueGrid"'), "Must contain #mobileTabLeagueGrid");
    assert.ok(rootHtml.includes('id="btnOpenSettingsModal"'), "Must contain #btnOpenSettingsModal");
    assert.ok(
      rootHtml.includes('id="btnCloseSettingsModal"'),
      "Must contain #btnCloseSettingsModal"
    );
    assert.ok(rootHtml.includes('id="settingsBackdrop"'), "Must contain #settingsBackdrop");
  });

  it("should leave the React menu trigger as the sole click handler", () => {
    const code = fs.readFileSync(srcJsPath, "utf8");
    assert.doesNotMatch(
      code,
      /btnOpenSettingsModal\.addEventListener\("click",\s*toggleSettingsDropdown\)/,
      "React must own the menu button click handler without a legacy DOM listener"
    );
  });

  it("should let Tailwind responsive display utilities override hidden", () => {
    const styles = fs.readFileSync(path.join(rootDir, "src", "css", "styles.css"), "utf8");
    assert.doesNotMatch(
      styles,
      /\.hidden\s*\{\s*display:\s*none/,
      "A custom .hidden rule would override responsive utilities such as md:block"
    );
  });

  it("should apply sticky table headers to all tabs containing tables", () => {
    const tableTabs = ["LeaderboardTab.tsx", "LuckTab.tsx", "PlayersTab.tsx"];
    const cssCode = fs.readFileSync(path.join(rootDir, "src", "css", "styles.css"), "utf8");
    const hookCode = fs.readFileSync(
      path.join(rootDir, "src", "js", "components", "common", "useStickyTableHeader.ts"),
      "utf8"
    );

    for (const tab of tableTabs) {
      const tabCode = fs.readFileSync(
        path.join(rootDir, "src", "js", "components", "tabs", tab),
        "utf8"
      );
      assert.ok(tabCode.includes("useStickyTableHeader"), `${tab} must use the sticky header hook`);
    }

    assert.ok(cssCode.includes(".table-scroll-container"));
    assert.ok(cssCode.includes("overflow-x: auto"));
    assert.ok(cssCode.includes("position: fixed"));
    assert.ok(hookCode.includes("document.body.append(overlay)"));
    assert.ok(hookCode.includes("scrollContainer.scrollLeft"));
    assert.ok(hookCode.includes("forwardSort"));
    assert.ok(hookCode.includes("--app-header-height"));
  });
});

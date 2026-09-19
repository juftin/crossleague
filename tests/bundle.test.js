import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { build } from "../scripts/build.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

describe("Source & Bundle Integrity", () => {
  before(async () => {
    await build({ isCheckMode: false, silent: true });
  });

  const srcJsPath = path.join(rootDir, "src", "js", "index.js");
  const srcHtmlPath = path.join(rootDir, "src", "index.html");
  const distAppMinJsPath = path.join(rootDir, "dist", "app.min.js");
  const distIndexHtmlPath = path.join(rootDir, "dist", "index.html");

  it("should have valid JavaScript syntax in src/js/index.js and dist/app.min.js", () => {
    const minCode = fs.readFileSync(distAppMinJsPath, "utf8");
    assert.doesNotThrow(() => {
      new vm.Script(minCode, { filename: "dist/app.min.js" });
    }, "dist/app.min.js should compile without syntax errors");
  });

  it("should save preferences before a page refresh or navigation", () => {
    const code = fs.readFileSync(
      path.join(rootDir, "src", "js", "state", "preferences.js"),
      "utf8"
    );
    assert.match(
      code,
      /window\.addEventListener\("pagehide",\s*savePreferences\)/,
      "The current username and settings must be saved when leaving the page"
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

  it("should have valid JavaScript syntax in scripts/build.js", () => {
    const buildScriptPath = path.join(rootDir, "scripts", "build.js");
    assert.doesNotThrow(() => {
      execFileSync(process.execPath, ["--check", buildScriptPath]);
    }, "scripts/build.js should compile without syntax errors");
  });

  it("should produce standalone inlined distribution in dist/index.html", () => {
    const distHtml = fs.readFileSync(distIndexHtmlPath, "utf8");
    assert.ok(distHtml.includes("<style>"), "dist/index.html must contain inlined <style>");
    assert.ok(
      distHtml.includes("<!-- Application Logic -->"),
      "dist/index.html must contain Application Logic marker"
    );
    assert.equal(
      (distHtml.match(/<!doctype html>/gi) || []).length,
      1,
      "Inline application code must not duplicate the HTML document"
    );

    const appMarker = distHtml.indexOf("<!-- Application Logic -->");
    const scriptClose = distHtml.indexOf("</script>", appMarker);
    const bodyClose = distHtml.indexOf("</body>", appMarker);
    assert.ok(
      scriptClose > appMarker && bodyClose - scriptClose < 64,
      "The inlined application script must remain intact through the closing body tag"
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

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

describe("Modern JS Package Structure & Module Exports", () => {
  it("should export all main public APIs from package root (src/js/index.js)", async () => {
    const mainPkg = await import("../src/js/index.js");
    assert.ok(typeof mainPkg.calculateAllPlay === "function", "Must export calculateAllPlay");
    assert.ok(typeof mainPkg.calculateLuckIndex === "function", "Must export calculateLuckIndex");
    assert.ok(
      typeof mainPkg.calculateLineupEfficiency === "function",
      "Must export calculateLineupEfficiency"
    );
    assert.ok(typeof mainPkg.calculateStdDev === "function", "Must export calculateStdDev");
    assert.ok(
      typeof mainPkg.calculateSuperlatives === "function",
      "Must export calculateSuperlatives"
    );
    assert.ok(typeof mainPkg.aggregatePlayers === "function", "Must export aggregatePlayers");
    assert.ok(typeof mainPkg.fetchEspnLeague === "function", "Must export fetchEspnLeague");
    assert.ok(typeof mainPkg.resolveUser === "function", "Must export resolveUser");
    assert.ok(typeof mainPkg.downloadReport === "function", "Must export downloadReport");
    assert.ok(typeof mainPkg.shareReport === "function", "Must export shareReport");
    assert.ok(typeof mainPkg.copyChatRecap === "function", "Must export copyChatRecap");
    assert.ok(typeof mainPkg.exportCsv === "function", "Must export exportCsv");
  });

  it("should export analytics calculators from ./analytics subpath (src/js/analytics/index.js)", async () => {
    const analytics = await import("../src/js/analytics/index.js");
    assert.ok(typeof analytics.calculateAllPlay === "function");
    assert.ok(typeof analytics.calculateLuckIndex === "function");
    assert.ok(typeof analytics.calculateLineupEfficiency === "function");
    assert.ok(typeof analytics.calculateStdDev === "function");
    assert.ok(typeof analytics.calculateSuperlatives === "function");
    assert.ok(typeof analytics.aggregatePlayers === "function");
  });

  it("should export API adapters from ./api subpath (src/js/api/index.js)", async () => {
    const api = await import("../src/js/api/index.js");
    assert.ok(typeof api.apiFetch === "function");
    assert.ok(typeof api.resolveUser === "function");
    assert.ok(typeof api.fetchEspnLeague === "function");
    assert.ok(typeof api.initPlayersDb === "function");
    assert.ok(typeof api.getPlayerInfo === "function");
  });

  it("should export export utilities from ./src/js/export/index.js", async () => {
    const exportTools = await import("../src/js/export/index.js");
    assert.ok(typeof exportTools.formatRecapText === "function");
    assert.ok(typeof exportTools.copyChatRecap === "function");
    assert.ok(typeof exportTools.exportCsv === "function");
    assert.ok(typeof exportTools.shareUrl === "function");
    assert.ok(typeof exportTools.buildShareableUrl === "function");
    assert.ok(typeof exportTools.downloadReport === "function");
    assert.ok(typeof exportTools.shareReport === "function");
    assert.ok(typeof exportTools.loadEmbeddedReport === "function");
  });

  it("should contain properly formatted package.json exports map", () => {
    const pkgJsonPath = path.join(rootDir, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
    assert.ok(pkg.exports, "package.json must contain 'exports'");
    assert.equal(pkg.exports["."], "./src/js/index.js");
    assert.equal(pkg.exports["./analytics"], "./src/js/analytics/index.js");
    assert.equal(pkg.exports["./api"], "./src/js/api/index.js");
    assert.equal(pkg.exports["./styles.css"], "./src/css/styles.css");
    assert.equal(pkg.exports["./dist/app.min.js"], "./dist/app.min.js");
    assert.equal(pkg.exports["./dist/styles.min.css"], "./dist/styles.min.css");
  });
});

describe("Minified Production Builds & Distribution", () => {
  const distAppMinJsPath = path.join(rootDir, "dist", "app.min.js");
  const distStylesMinCssPath = path.join(rootDir, "dist", "styles.min.css");
  const distIndexHtmlPath = path.join(rootDir, "dist", "index.html");
  const appJsPath = path.join(rootDir, "app.js");
  const stylesCssPath = path.join(rootDir, "styles.css");

  it("should produce valid, syntactically sound minified JavaScript in dist/app.min.js", () => {
    assert.ok(fs.existsSync(distAppMinJsPath), "dist/app.min.js must exist");
    const minJs = fs.readFileSync(distAppMinJsPath, "utf8");
    assert.ok(minJs.length > 0, "dist/app.min.js should not be empty");
    assert.doesNotThrow(() => {
      new vm.Script(minJs, { filename: "dist/app.min.js" });
    }, "dist/app.min.js should execute cleanly without syntax errors");

    const unminJs = fs.readFileSync(appJsPath, "utf8");
    assert.ok(
      minJs.length < unminJs.length,
      `Minified JS (${minJs.length} bytes) must be smaller than unminified bundle (${unminJs.length} bytes)`
    );
  });

  it("should produce valid minified CSS in dist/styles.min.css", () => {
    assert.ok(fs.existsSync(distStylesMinCssPath), "dist/styles.min.css must exist");
    const minCss = fs.readFileSync(distStylesMinCssPath, "utf8");
    const srcCss = fs.readFileSync(stylesCssPath, "utf8");
    assert.ok(
      minCss.length < srcCss.length,
      `Minified CSS (${minCss.length} bytes) must be smaller than source CSS (${srcCss.length} bytes)`
    );
  });

  it("should produce standalone production HTML in dist/index.html with inlined minified assets", () => {
    assert.ok(fs.existsSync(distIndexHtmlPath), "dist/index.html must exist");
    const distHtml = fs.readFileSync(distIndexHtmlPath, "utf8");
    assert.ok(distHtml.includes("<style>"), "dist/index.html must contain <style>");
    assert.ok(
      distHtml.includes("<!-- Application Logic -->"),
      "dist/index.html must contain Application Logic marker"
    );

    const rootHtml = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
    assert.ok(
      distHtml.length < rootHtml.length,
      `Minified HTML (${distHtml.length} bytes) must be smaller than unminified HTML (${rootHtml.length} bytes)`
    );
  });
});

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

  it("should have valid JavaScript syntax in scripts/bundle.js", () => {
    const bundleScriptPath = path.join(rootDir, "scripts", "bundle.js");
    assert.doesNotThrow(() => {
      execFileSync(process.execPath, ["--check", bundleScriptPath]);
    }, "scripts/bundle.js should compile without syntax errors");
  });

  it("should have index.html with inlined app.js matching the standalone file", () => {
    const appJs = fs.readFileSync(appJsPath, "utf8").trim();
    const indexHtml = fs.readFileSync(indexHtmlPath, "utf8");

    const startRegex = /<!--\s*Application Logic\s*-->\s*<script>/i;
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
});

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const indexHtmlPath = path.join(rootDir, "index.html");
const appJsPath = path.join(rootDir, "app.js");
const stylesCssPath = path.join(rootDir, "styles.css");

let indexHtml = fs.readFileSync(indexHtmlPath, "utf8");
const appJs = fs.readFileSync(appJsPath, "utf8");
const stylesCss = fs.readFileSync(stylesCssPath, "utf8");

// Validate JavaScript syntax
try {
  new vm.Script(appJs, { filename: "app.js" });
} catch (err) {
  console.error("❌ Syntax error in app.js:", err.message);
  process.exit(1);
}

// CSS bundle injection markers
const styleStartRegex = /<style>/i;
const styleEndRegex = /<\/style>/i;
const styleStartMatch = indexHtml.match(styleStartRegex);
const styleEndMatch = indexHtml.match(styleEndRegex);

if (!styleStartMatch || !styleEndMatch) {
  console.error("❌ Could not find <style> injection markers in index.html");
  process.exit(1);
}

const currentInlinedCss = indexHtml
  .substring(styleStartMatch.index + styleStartMatch[0].length, styleEndMatch.index)
  .trim();

// JS bundle injection markers
const startRegex = /<!--\s*Application Logic\s*-->\s*<script[^>]*>/i;
const endRegex = /<\/script>\s*<\/body>/i;

const startMatch = indexHtml.match(startRegex);
const endMatch = indexHtml.match(endRegex);

if (!startMatch || !endMatch) {
  console.error("❌ Could not find single-bundle injection markers in index.html");
  process.exit(1);
}

const currentInlinedJs = indexHtml
  .substring(startMatch.index + startMatch[0].length, endMatch.index)
  .trim();

const isCheckMode = process.argv.includes("--check");

if (isCheckMode) {
  let hasError = false;
  if (currentInlinedCss !== stylesCss.trim()) {
    console.error(
      "❌ index.html CSS bundle is out of sync with styles.css. Run 'task build' to update."
    );
    hasError = true;
  }
  if (currentInlinedJs !== appJs.trim()) {
    console.error(
      "❌ index.html JS bundle is out of sync with app.js. Run 'task build' to update."
    );
    hasError = true;
  }
  if (hasError) {
    process.exit(1);
  }
  console.log("✅ index.html single-bundle is synchronized with styles.css and app.js.");
} else {
  // 1. Replace CSS
  const beforeStyle = indexHtml.substring(0, styleStartMatch.index + styleStartMatch[0].length);
  const afterStyle = indexHtml.substring(styleEndMatch.index);
  indexHtml = `${beforeStyle}\n${stylesCss.trim()}\n    ${afterStyle}`;

  // 2. Replace JS (re-calculate markers in updated HTML)
  const updatedStartMatch = indexHtml.match(startRegex);
  const updatedEndMatch = indexHtml.match(endRegex);
  const beforeJs = indexHtml.substring(0, updatedStartMatch.index + updatedStartMatch[0].length);
  const afterJs = indexHtml.substring(updatedEndMatch.index);

  const finalHtml = `${beforeJs}\n${appJs.trim()}\n  ${afterJs}`;

  fs.writeFileSync(indexHtmlPath, finalHtml, "utf8");
  console.log("✅ index.html successfully bundled and synchronized with styles.css and app.js.");
}

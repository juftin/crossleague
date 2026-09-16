import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const indexHtmlPath = path.join(rootDir, "index.html");
const appJsPath = path.join(rootDir, "app.js");

const indexHtml = fs.readFileSync(indexHtmlPath, "utf8");
const appJs = fs.readFileSync(appJsPath, "utf8");

// Validate JavaScript syntax
try {
  new vm.Script(appJs, { filename: "app.js" });
} catch (err) {
  console.error("❌ Syntax error in app.js:", err.message);
  process.exit(1);
}

const startRegex = /<!--\s*Application Logic\s*-->\s*<script>/i;
const endRegex = /<\/script>\s*<\/body>/i;

const startMatch = indexHtml.match(startRegex);
const endMatch = indexHtml.match(endRegex);

if (!startMatch || !endMatch) {
  console.error("❌ Could not find single-bundle injection markers in index.html");
  process.exit(1);
}

const before = indexHtml.substring(0, startMatch.index + startMatch[0].length);
const currentInlined = indexHtml
  .substring(startMatch.index + startMatch[0].length, endMatch.index)
  .trim();
const after = indexHtml.substring(endMatch.index);

const expectedHtml = `${before}\n${appJs}\n  ${after}`;

const isCheckMode = process.argv.includes("--check");

if (isCheckMode) {
  if (currentInlined !== appJs.trim()) {
    console.error("❌ index.html bundle is out of sync with app.js. Run 'task build' to update.");
    process.exit(1);
  }
  console.log("✅ index.html single-bundle is synchronized with app.js.");
} else {
  fs.writeFileSync(indexHtmlPath, expectedHtml, "utf8");
  console.log("✅ index.html successfully bundled and synchronized with app.js.");
}

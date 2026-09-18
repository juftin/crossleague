import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const srcJsPath = path.join(rootDir, "src", "js", "index.js");
const srcCssPath = path.join(rootDir, "src", "css", "styles.css");
const srcHtmlPath = path.join(rootDir, "src", "index.html");

const distDir = path.join(rootDir, "dist");
const distAppMinJsPath = path.join(distDir, "app.min.js");
const distStylesMinCssPath = path.join(distDir, "styles.min.css");
const distIndexHtmlPath = path.join(distDir, "index.html");

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

export async function build({
  isCheckMode = process.argv.includes("--check"),
  silent = false
} = {}) {
  // 1. Build minified JS bundle
  const minJsResult = await esbuild.build({
    entryPoints: [srcJsPath],
    bundle: true,
    minify: true,
    sourcemap: true,
    target: ["es2020"],
    format: "iife",
    globalName: "CrossLeague",
    outfile: distAppMinJsPath,
    write: false
  });
  const minJsCode = minJsResult.outputFiles.find(f => f.path.endsWith("app.min.js"))?.text || "";
  const minJsMap = minJsResult.outputFiles.find(f => f.path.endsWith(".map"))?.text || "";

  // Validate JS syntax
  try {
    new vm.Script(minJsCode, { filename: "app.min.js" });
  } catch (err) {
    console.error("❌ Syntax error in generated JS bundle:", err.message);
    process.exit(1);
  }

  // 2. Build minified CSS
  const minCssResult = await esbuild.build({
    entryPoints: [srcCssPath],
    bundle: true,
    minify: true,
    write: false
  });
  const minCssCode = minCssResult.outputFiles[0]?.text || "";

  // 3. Build standalone HTML bundle
  const templateHtml = fs.readFileSync(srcHtmlPath, "utf8");

  function injectAssets(html, cssCode, jsCode) {
    let result = html;
    if (/<style>[\s\S]*?<\/style>/i.test(result)) {
      result = result.replace(
        /<style>[\s\S]*?<\/style>/i,
        `<style>\n${cssCode.trim()}\n    </style>`
      );
    } else {
      result = result.replace(
        /<link[^>]*href=["'][^"']*styles(\.min)?\.css["'][^>]*\s*\/?>/i,
        `<style>\n${cssCode.trim()}\n    </style>`
      );
    }

    if (
      /<!--\s*Application Logic\s*-->[\s\S]*?<script[\s\S]*?<\/script>\s*<\/body>/i.test(result)
    ) {
      result = result.replace(
        /<!--\s*Application Logic\s*-->[\s\S]*?<script[\s\S]*?<\/script>\s*<\/body>/i,
        `<!-- Application Logic -->\n    <script>\n${jsCode.trim()}\n    </script>\n  </body>`
      );
    } else if (/<script[\s\S]*?<\/script>\s*<\/body>/i.test(result)) {
      result = result.replace(
        /<script[\s\S]*?<\/script>\s*<\/body>/i,
        `<script>\n${jsCode.trim()}\n    </script>\n  </body>`
      );
    }
    return result;
  }

  // Inlined standalone HTML for distribution (minified)
  const distInlinedHtml = injectAssets(templateHtml, minCssCode, minJsCode);

  if (isCheckMode) {
    let hasError = false;

    const checkFile = (filePath, expectedContent, label) => {
      if (!fs.existsSync(filePath)) {
        console.error(`❌ Missing ${label} at ${path.relative(rootDir, filePath)}`);
        hasError = true;
        return;
      }
      const existing = fs.readFileSync(filePath, "utf8");
      if (existing.trim() !== expectedContent.trim()) {
        console.error(
          `❌ ${label} (${path.relative(rootDir, filePath)}) is out of sync with source. Run 'task build' to update.`
        );
        hasError = true;
      }
    };

    checkFile(distAppMinJsPath, minJsCode, "dist/app.min.js");
    checkFile(distStylesMinCssPath, minCssCode, "dist/styles.min.css");
    checkFile(distIndexHtmlPath, distInlinedHtml, "dist/index.html");

    if (hasError) {
      process.exit(1);
    }
    if (!silent)
      console.log("✅ All production bundles and standalone HTML distributions are in sync.");
  } else {
    // Write dist files
    fs.writeFileSync(distAppMinJsPath, minJsCode, "utf8");
    if (minJsMap) {
      fs.writeFileSync(`${distAppMinJsPath}.map`, minJsMap, "utf8");
    }
    fs.writeFileSync(distStylesMinCssPath, minCssCode, "utf8");
    fs.writeFileSync(distIndexHtmlPath, distInlinedHtml, "utf8");

    if (!silent) {
      console.log("✅ Successfully built and synchronized distribution packages:");
      console.log("   - dist/app.min.js (minified JS + sourcemap)");
      console.log("   - dist/styles.min.css (minified CSS)");
      console.log("   - dist/index.html (minified standalone HTML)");
    }
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  build().catch(err => {
    console.error("❌ Build failed:", err);
    process.exit(1);
  });
}

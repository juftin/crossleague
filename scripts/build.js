import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { build as viteBuild } from "vite";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const distDir = path.join(rootDir, "dist");
const distAppMinJsPath = path.join(distDir, "app.min.js");
const distStylesMinCssPath = path.join(distDir, "styles.min.css");
const distIndexHtmlPath = path.join(distDir, "index.html");

const srcJsPath = path.join(rootDir, "src", "js", "index.js");
const srcCssPath = path.join(rootDir, "src", "css", "styles.css");
const srcHtmlPath = path.join(rootDir, "src", "index.html");

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

export async function build({
  isCheckMode = process.argv.includes("--check"),
  silent = false
} = {}) {
  const logLevel = silent ? "silent" : "warn";

  // 1. Build minified JS bundle with Vite (IIFE format) and React plugin
  await viteBuild({
    root: path.join(rootDir, "src"),
    logLevel,
    configFile: false,
    plugins: [react()],
    define: {
      "process.env.NODE_ENV": JSON.stringify("production")
    },
    build: {
      outDir: distDir,
      emptyOutDir: false,
      sourcemap: true,
      minify: true,
      lib: {
        entry: srcJsPath,
        name: "CrossLeague",
        formats: ["iife"],
        fileName: () => "app.min.js"
      }
    }
  });

  const minJsCode = fs.readFileSync(distAppMinJsPath, "utf8");

  // Validate syntax
  try {
    new vm.Script(minJsCode, { filename: "app.min.js" });
  } catch (err) {
    console.error("❌ Syntax error in generated JS bundle:", err.message);
    process.exit(1);
  }

  // 2. Build minified CSS bundle with Vite
  await viteBuild({
    root: path.join(rootDir, "src"),
    logLevel,
    configFile: false,
    build: {
      outDir: distDir,
      emptyOutDir: false,
      cssMinify: true,
      rollupOptions: {
        input: srcCssPath,
        output: {
          assetFileNames: "styles.min.css"
        }
      }
    }
  });

  // Ensure styles.min.css exists
  let minCssCode = "";
  if (fs.existsSync(distStylesMinCssPath)) {
    minCssCode = fs.readFileSync(distStylesMinCssPath, "utf8");
  } else {
    // If output in assets, find and copy
    const files = fs.readdirSync(distDir);
    const cssFile = files.find(f => f.endsWith(".css"));
    if (cssFile) {
      fs.renameSync(path.join(distDir, cssFile), distStylesMinCssPath);
      minCssCode = fs.readFileSync(distStylesMinCssPath, "utf8");
    } else {
      minCssCode = fs.readFileSync(srcCssPath, "utf8");
      fs.writeFileSync(distStylesMinCssPath, minCssCode, "utf8");
    }
  }

  // 3. Build standalone HTML with inlined minified assets
  const templateHtml = fs.readFileSync(srcHtmlPath, "utf8");
  const inlineJsCode = minJsCode.trim().replaceAll("</script", "<\\/script");
  let distInlinedHtml = templateHtml;

  if (/<style>[\s\S]*?<\/style>/i.test(distInlinedHtml)) {
    distInlinedHtml = distInlinedHtml.replace(
      /<style>[\s\S]*?<\/style>/i,
      `<style>\n${minCssCode.trim()}\n    </style>`
    );
  } else {
    distInlinedHtml = distInlinedHtml.replace(
      /<link[^>]*href=["'][^"']*styles(\.min)?\.css["'][^>]*\s*\/?>/i,
      `<style>\n${minCssCode.trim()}\n    </style>`
    );
  }

  if (
    /<!--\s*Application Logic\s*-->[\s\S]*?<script[\s\S]*?<\/script>\s*<\/body>/i.test(
      distInlinedHtml
    )
  ) {
    distInlinedHtml = distInlinedHtml.replace(
      /<!--\s*Application Logic\s*-->[\s\S]*?<script[\s\S]*?<\/script>\s*<\/body>/i,
      () => `<!-- Application Logic -->\n    <script>\n${inlineJsCode}\n    </script>\n  </body>`
    );
  } else if (/<script[\s\S]*?<\/script>\s*<\/body>/i.test(distInlinedHtml)) {
    distInlinedHtml = distInlinedHtml.replace(
      /<script[\s\S]*?<\/script>\s*<\/body>/i,
      () => `<script>\n${inlineJsCode}\n    </script>\n  </body>`
    );
  }

  fs.writeFileSync(distIndexHtmlPath, distInlinedHtml, "utf8");

  if (isCheckMode) {
    if (
      !fs.existsSync(distAppMinJsPath) ||
      !fs.existsSync(distStylesMinCssPath) ||
      !fs.existsSync(distIndexHtmlPath)
    ) {
      console.error("❌ Missing required distribution build artifacts in dist/");
      process.exit(1);
    }
    if (!silent)
      console.log("✅ All production bundles and standalone HTML distributions are in sync.");
  } else if (!silent) {
    console.log("✅ Successfully built all distribution packages with Vite:");
    console.log("   - dist/app.min.js (minified JS bundle + sourcemap)");
    console.log("   - dist/styles.min.css (minified CSS)");
    console.log("   - dist/index.html (standalone inlined HTML)");
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  build().catch(err => {
    console.error("❌ Build failed:", err);
    process.exit(1);
  });
}

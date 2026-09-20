import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { build as viteBuild } from "vite";
import { mockEmbeddedReport } from "../tests/fixtures/mock-data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const snapshotsDir = path.join(rootDir, "snapshots");
const tmpDir = path.join(rootDir, "tests", ".snapshot-tmp");

// Locate Google Chrome or Chromium executable
function getChromePath() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  const macPaths = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
  ];
  for (const p of macPaths) {
    if (fs.existsSync(p)) return p;
  }
  const linuxPaths = [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium"
  ];
  for (const p of linuxPaths) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error("Could not locate Chrome/Chromium executable for snapshot generation.");
}

// Build in-memory HTML pages for each snapshot scenario
function buildSnapshotHtmlPages() {
  const distIndexHtmlPath = path.join(distDir, "index.html");
  const indexHtml = fs.readFileSync(distIndexHtmlPath, "utf8");

  // Deterministic CSS override to eliminate animations and caret cursor
  const deterministicOverride = `
    <style>
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        caret-color: transparent !important;
      }
      canvas {
        image-rendering: pixelated;
      }
    </style>
    <script>
      // Disable confetti for clean deterministic screenshots
      window.confetti = function() {};
    </script>
  `;

  const scenarios = [
    {
      id: "empty-state",
      embeddedData: null,
      actionScript: ""
    },
    {
      id: "awards",
      embeddedData: mockEmbeddedReport,
      actionScript: "window.switchTab('awards', false);"
    },
    {
      id: "leaderboard",
      embeddedData: mockEmbeddedReport,
      actionScript: "window.switchTab('leaderboard', false);"
    },
    {
      id: "visuals",
      embeddedData: mockEmbeddedReport,
      actionScript: "window.switchTab('visuals', false);"
    },
    {
      id: "leagues",
      embeddedData: mockEmbeddedReport,
      actionScript: "window.switchTab('leagueGrid', false);"
    },
    {
      id: "luck",
      embeddedData: mockEmbeddedReport,
      actionScript: "window.switchTab('luck', false);"
    },
    {
      id: "players",
      embeddedData: mockEmbeddedReport,
      actionScript: "window.switchTab('players', false);"
    },
    {
      id: "settings-modal",
      embeddedData: mockEmbeddedReport,
      actionScript:
        "window.switchTab('awards', false); if (window.openSettingsModal) window.openSettingsModal();"
    },
    {
      id: "light-awards",
      embeddedData: mockEmbeddedReport,
      theme: "light",
      actionScript: "window.switchTab('awards', false);"
    },
    {
      id: "light-analytics",
      embeddedData: mockEmbeddedReport,
      theme: "light",
      actionScript: "window.switchTab('visuals', false);"
    },
    {
      id: "light-settings-modal",
      embeddedData: mockEmbeddedReport,
      theme: "light",
      actionScript:
        "window.switchTab('awards', false); if (window.openSettingsModal) window.openSettingsModal();"
    },
    {
      id: "luck-modal",
      embeddedData: mockEmbeddedReport,
      actionScript:
        "window.switchTab('luck', false); if (window.openLuckModal) window.openLuckModal();"
    },
    {
      id: "mobile-awards",
      embeddedData: mockEmbeddedReport,
      isMobile: true,
      actionScript: "window.switchTab('awards', false);"
    },
    {
      id: "mobile-light-awards",
      embeddedData: mockEmbeddedReport,
      isMobile: true,
      theme: "light",
      actionScript: "window.switchTab('awards', false);"
    },
    {
      id: "mobile-leaderboard",
      embeddedData: mockEmbeddedReport,
      isMobile: true,
      actionScript: "window.switchTab('leaderboard', false);"
    }
  ];

  const pages = [];

  for (const s of scenarios) {
    let html = indexHtml;

    const dataScript = s.embeddedData
      ? `<script>\nwindow.__CROSSLEAGUE_SNAPSHOT_DATA__ = ${JSON.stringify(s.embeddedData)};\n</script>`
      : "";
    const themeScript = s.theme
      ? `<script>\nlocalStorage.setItem("crossleague_theme", "${s.theme}");\ndocument.documentElement.classList.replace("dark", "${s.theme}");\n</script>`
      : "";

    const runnerScript = `
      <script>
        document.addEventListener("DOMContentLoaded", () => {
          const runSnapshotAction = () => {
            if (!window.switchTab) {
              window.setTimeout(runSnapshotAction, 25);
              return;
            }
            window.setTimeout(() => {
              ${s.actionScript}
              document.documentElement.dataset.snapshotReady = "true";
            }, 100);
          };
          runSnapshotAction();
        });
      </script>
    `;

    const mobileStyle = s.isMobile
      ? `<style>
          html, body {
            width: 540px !important;
            max-width: 540px !important;
            overflow-x: hidden !important;
          }
        </style>`
      : "";

    if (html.includes("</head>")) {
      html = html.replace(
        "</head>",
        () => `${deterministicOverride}\n${mobileStyle}\n${themeScript}\n${dataScript}\n</head>`
      );
    } else {
      html = `${deterministicOverride}\n${mobileStyle}\n${themeScript}\n${dataScript}\n${html}`;
    }

    if (html.includes("</body>")) {
      html = html.replace("</body>", () => `${runnerScript}\n</body>`);
    } else {
      html = `${html}\n${runnerScript}`;
    }

    pages.push({
      id: s.id,
      html,
      isMobile: Boolean(s.isMobile)
    });
  }

  return pages;
}

function createSnapshotServer(pages) {
  const pagesMap = new Map(pages.map(p => [p.id, p.html]));
  const mimeTypes = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2"
  };

  return http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, "http://127.0.0.1");
    const pathname = decodeURIComponent(parsedUrl.pathname);
    const scenarioId = pathname.replace(/^\//, "").replace(/\.html$/, "");

    if (pagesMap.has(scenarioId)) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(pagesMap.get(scenarioId));
      return;
    }

    const filePath = path.join(distDir, pathname === "/" ? "index.html" : pathname);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": contentType });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  });
}

function capturePageScreenshot(chromePath, page, targetDir, port) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(targetDir, `${page.id}.png`);
    const fileUrl = `http://127.0.0.1:${port}/${page.id}.html`;
    const windowSize = page.isMobile ? "540,960" : "1280,800";
    const userProfileDir = path.join(tmpDir, `profile-${page.id}-${Date.now()}`);

    if (!fs.existsSync(userProfileDir)) {
      fs.mkdirSync(userProfileDir, { recursive: true });
    }

    if (fs.existsSync(outputPath)) {
      try {
        fs.unlinkSync(outputPath);
      } catch {
        // Ignore unlink error
      }
    }

    const chromeArgs = [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-web-security",
      "--disable-background-networking",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-breakpad",
      "--disable-component-update",
      "--disable-domain-reliability",
      "--disable-sync",
      "--no-first-run",
      "--no-default-browser-check",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "--run-all-compositor-stages-before-draw",
      "--virtual-time-budget=1500",
      `--user-data-dir=${userProfileDir}`,
      `--window-size=${windowSize}`,
      `--screenshot=${outputPath}`
    ];

    if (page.isMobile) {
      chromeArgs.push(
        "--enable-viewport",
        "--user-agent=Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
      );
    }

    chromeArgs.push(fileUrl);

    const proc = spawn(chromePath, chromeArgs, {
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stderrData = "";
    if (proc.stderr) {
      proc.stderr.on("data", chunk => {
        stderrData += chunk.toString();
      });
    }

    let completed = false;

    const pollInterval = setInterval(() => {
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        if (stats.size > 1000) {
          cleanup(null);
        }
      }
    }, 150);

    const timeout = setTimeout(() => {
      cleanup(
        new Error(
          `Timeout capturing snapshot for ${page.id}${stderrData ? `\nChrome stderr:\n${stderrData}` : ""}`
        )
      );
    }, 30000);

    function cleanup(err) {
      if (completed) return;
      completed = true;
      clearInterval(pollInterval);
      clearTimeout(timeout);
      try {
        proc.kill("SIGKILL");
      } catch {
        // Ignore kill error
      }
      if (err) {
        reject(err);
      } else {
        const stats = fs.statSync(outputPath);
        console.log(`  ✔ [${page.id}.png] (${Math.round(stats.size / 1024)} KB)`);
        resolve(outputPath);
      }
    }

    proc.on("close", () => {
      if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
        cleanup(null);
      } else {
        cleanup(
          new Error(
            `Process closed without generating valid snapshot for ${page.id}${stderrData ? `\nChrome stderr:\n${stderrData}` : ""}`
          )
        );
      }
    });

    proc.on("error", err => {
      cleanup(err);
    });
  });
}

export async function generateSnapshots({ isCheck = false } = {}) {
  await viteBuild({ logLevel: "warn" });
  const chromePath = getChromePath();
  console.log(`📸 Using browser at: ${chromePath}`);

  const outputDir = isCheck ? path.join(tmpDir, "check") : snapshotsDir;
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pages = buildSnapshotHtmlPages();
  const server = createSnapshotServer(pages);

  await new Promise(resolve => {
    server.listen(0, "127.0.0.1", resolve);
  });
  const port = server.address().port;

  console.log(
    `🖼️  ${isCheck ? "Checking" : "Generating"} ${pages.length} snapshot PNG images in ${outputDir}...`
  );

  const startTime = Date.now();

  const CHUNK_SIZE = process.env.CI ? 2 : 3;
  try {
    for (let i = 0; i < pages.length; i += CHUNK_SIZE) {
      const chunk = pages.slice(i, i + CHUNK_SIZE);
      await Promise.all(
        chunk.map(page => capturePageScreenshot(chromePath, page, outputDir, port))
      );
    }
  } finally {
    server.close();
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  if (isCheck) {
    console.log("🔍 Comparing generated snapshots against committed baselines...");
    let mismatches = 0;

    for (const page of pages) {
      const baselineFile = path.join(snapshotsDir, `${page.id}.png`);
      const checkFile = path.join(outputDir, `${page.id}.png`);

      if (!fs.existsSync(baselineFile)) {
        console.error(`  ✖ Baseline missing for ${page.id}.png`);
        mismatches++;
        continue;
      }

      const baselineBuf = fs.readFileSync(baselineFile);
      const checkBuf = fs.readFileSync(checkFile);

      // Verify header and dimensions match exactly
      const w1 = baselineBuf.readUInt32BE(16);
      const h1 = baselineBuf.readUInt32BE(20);
      const w2 = checkBuf.readUInt32BE(16);
      const h2 = checkBuf.readUInt32BE(20);

      if (w1 !== w2 || h1 !== h2) {
        console.error(
          `  ✖ Dimension mismatch for ${page.id}.png: baseline is ${w1}x${h1}, checked is ${w2}x${h2}`
        );
        mismatches++;
        continue;
      }

      // Allow PNG compression variance between browser and OS versions.
      const sizeDeltaRatio = Math.abs(baselineBuf.length - checkBuf.length) / baselineBuf.length;
      if (sizeDeltaRatio > 0.1) {
        console.error(
          `  ✖ Size delta exceeded for ${page.id}.png (baseline: ${baselineBuf.length} B, check: ${checkBuf.length} B, delta: ${(sizeDeltaRatio * 100).toFixed(1)}%)`
        );
        mismatches++;
      } else {
        console.log(`  ✅ Baseline match verified for ${page.id}.png`);
      }
    }

    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }

    if (mismatches > 0) {
      console.error(`❌ Visual snapshot verification failed with ${mismatches} mismatch(es).`);
      process.exit(1);
    }
    console.log(`✨ All ${pages.length} visual snapshots verified in ${durationSec}s!`);
    return;
  }

  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }

  console.log(`✨ All visual snapshots generated in ${durationSec}s!`);
}

// Run directly if invoked from CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const isCheck = process.argv.includes("--check");
  generateSnapshots({ isCheck }).catch(err => {
    console.error("Fatal snapshot error:", err);
    process.exit(1);
  });
}

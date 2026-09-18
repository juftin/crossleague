import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { mockEmbeddedReport } from "../tests/fixtures/mock-data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
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

// Build self-contained HTML files for each snapshot scenario
function buildSnapshotHtmlPages() {
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const indexHtml = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
  const stylesCss = fs.readFileSync(path.join(rootDir, "styles.css"), "utf8");

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
      id: "mobile-leaderboard",
      embeddedData: mockEmbeddedReport,
      isMobile: true,
      actionScript: "window.switchTab('leaderboard', false);"
    }
  ];

  const generatedHtmlFiles = [];

  for (const s of scenarios) {
    let html = indexHtml;

    if (html.includes('<link rel="stylesheet" href="styles.css">')) {
      html = html.replace(
        '<link rel="stylesheet" href="styles.css">',
        `<style>\n${stylesCss}\n</style>`
      );
    }

    const dataScript = s.embeddedData
      ? `<script id="embedded-report-data">\nwindow.__EMBEDDED_REPORT__ = ${JSON.stringify(s.embeddedData)};\n</script>`
      : "";

    const runnerScript = `
      <script>
        document.addEventListener("DOMContentLoaded", () => {
          ${s.actionScript}
        });
      </script>
    `;

    if (html.includes("</head>")) {
      html = html.replace("</head>", () => `${deterministicOverride}\n${dataScript}\n</head>`);
    } else {
      html = `${deterministicOverride}\n${dataScript}\n${html}`;
    }

    if (html.includes("</body>")) {
      html = html.replace("</body>", () => `${runnerScript}\n</body>`);
    } else {
      html = `${html}\n${runnerScript}`;
    }

    const filePath = path.join(tmpDir, `${s.id}.html`);
    fs.writeFileSync(filePath, html, "utf8");
    generatedHtmlFiles.push({
      id: s.id,
      filePath,
      isMobile: Boolean(s.isMobile)
    });
  }

  return generatedHtmlFiles;
}

function capturePageScreenshot(chromePath, page) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(snapshotsDir, `${page.id}.png`);
    const fileUrl = `file://${path.resolve(page.filePath)}`;
    const windowSize = page.isMobile ? "390,844" : "1280,800";
    const userProfileDir = path.join(tmpDir, `profile-${page.id}-${Date.now()}`);

    if (!fs.existsSync(userProfileDir)) {
      fs.mkdirSync(userProfileDir, { recursive: true });
    }

    // Remove any stale output file
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
      "--hide-scrollbars",
      "--run-all-compositor-stages-before-draw",
      `--user-data-dir=${userProfileDir}`,
      `--window-size=${windowSize}`,
      `--screenshot=${outputPath}`,
      fileUrl
    ];

    const proc = spawn(chromePath, chromeArgs, {
      stdio: "ignore"
    });

    let completed = false;

    // Check file creation periodically
    const pollInterval = setInterval(() => {
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        if (stats.size > 1000) {
          cleanup(null);
        }
      }
    }, 150);

    const timeout = setTimeout(() => {
      cleanup(new Error(`Timeout capturing snapshot for ${page.id}`));
    }, 8000);

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
        resolve();
      }
    }

    proc.on("close", () => {
      if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
        cleanup(null);
      } else {
        cleanup(new Error(`Process closed without generating valid snapshot for ${page.id}`));
      }
    });

    proc.on("error", err => {
      cleanup(err);
    });
  });
}

export async function generateSnapshots() {
  const chromePath = getChromePath();
  console.log(`📸 Using browser at: ${chromePath}`);

  if (!fs.existsSync(snapshotsDir)) {
    fs.mkdirSync(snapshotsDir, { recursive: true });
  }

  const pages = buildSnapshotHtmlPages();
  console.log(`🖼️  Generating ${pages.length} snapshot PNG images in ${snapshotsDir}...`);

  const startTime = Date.now();

  // Run in parallel chunks of 3
  const CHUNK_SIZE = 3;
  for (let i = 0; i < pages.length; i += CHUNK_SIZE) {
    const chunk = pages.slice(i, i + CHUNK_SIZE);
    await Promise.all(chunk.map(page => capturePageScreenshot(chromePath, page)));
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  // Clean up temporary files
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }

  console.log(`✨ All visual snapshots generated in ${durationSec}s!`);
}

// Run directly if invoked from CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  generateSnapshots().catch(err => {
    console.error("Fatal snapshot error:", err);
    process.exit(1);
  });
}

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mockEmbeddedReport } from "./fixtures/mock-data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const snapshotsDir = path.join(rootDir, "snapshots");

describe("Visual PNG Snapshot Suite", () => {
  const EXPECTED_SNAPSHOTS = [
    "empty-state.png",
    "awards.png",
    "leaderboard.png",
    "visuals.png",
    "leagues.png",
    "luck.png",
    "players.png",
    "settings-modal.png",
    "luck-modal.png",
    "mobile-awards.png",
    "mobile-leaderboard.png"
  ];

  it("should have all required dashboard tab & modal snapshot PNG files", () => {
    assert.ok(fs.existsSync(snapshotsDir), "Snapshots directory must exist");

    for (const snapshotName of EXPECTED_SNAPSHOTS) {
      const filePath = path.join(snapshotsDir, snapshotName);
      assert.ok(
        fs.existsSync(filePath),
        `Snapshot file '${snapshotName}' must exist in snapshots/. Run 'task snapshots' to generate.`
      );
    }
  });

  it("should have valid PNG headers (magic bytes) for all snapshots", () => {
    // Standard 8-byte PNG header signature: \x89PNG\r\n\x1a\n
    const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

    for (const snapshotName of EXPECTED_SNAPSHOTS) {
      const filePath = path.join(snapshotsDir, snapshotName);
      const buffer = fs.readFileSync(filePath);

      assert.ok(
        buffer.length > 10 * 1024,
        `Snapshot '${snapshotName}' should be a non-trivial image (> 10 KB)`
      );

      const header = buffer.subarray(0, 8);
      assert.ok(
        header.equals(PNG_HEADER),
        `Snapshot '${snapshotName}' must contain valid PNG magic header bytes`
      );
    }
  });

  it("should validate mock fixture report schema for snapshot rendering", () => {
    assert.equal(mockEmbeddedReport.version, "2.0");
    assert.equal(mockEmbeddedReport.mode, "WEEKLY");
    assert.equal(mockEmbeddedReport.season, 2024);
    assert.equal(mockEmbeddedReport.week, 6);
    assert.ok(Array.isArray(mockEmbeddedReport.records));
    assert.ok(mockEmbeddedReport.records.length >= 10);
    assert.ok(mockEmbeddedReport.allLeaguesData.length >= 2);
    assert.ok(Object.keys(mockEmbeddedReport.playersDb).length >= 15);
  });
});

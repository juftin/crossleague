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

/**
 * Helper to parse PNG IHDR header chunk
 * Structure:
 * - Bytes 0..7: PNG signature (\x89PNG\r\n\x1a\n)
 * - Bytes 8..11: Chunk length (usually 13 for IHDR)
 * - Bytes 12..15: Chunk type ("IHDR")
 * - Bytes 16..19: Width (uint32 big-endian)
 * - Bytes 20..23: Height (uint32 big-endian)
 * - Byte 24: Bit depth
 * - Byte 25: Color type (6 = RGBA)
 */
function parsePngMetadata(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.length < 26) {
    throw new Error(`File ${filePath} is too small to be a valid PNG.`);
  }

  const signature = buffer.subarray(0, 8);
  const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const isValidHeader = signature.equals(PNG_HEADER);

  const chunkType = buffer.subarray(12, 16).toString("ascii");
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const bitDepth = buffer.readUInt8(24);
  const colorType = buffer.readUInt8(25);

  return {
    isValidHeader,
    chunkType,
    width,
    height,
    bitDepth,
    colorType,
    fileSize: buffer.length
  };
}

describe("Visual PNG Snapshot Suite", () => {
  const DESKTOP_SNAPSHOTS = [
    "empty-state.png",
    "awards.png",
    "single-league-awards.png",
    "leaderboard.png",
    "visuals.png",
    "single-league-visuals.png",
    "leagues.png",
    "luck.png",
    "players.png",
    "settings-modal.png",
    "light-awards.png",
    "light-analytics.png",
    "light-analytics-tooltip.png",
    "light-settings-modal.png",
    "luck-modal.png"
  ];

  const MOBILE_SNAPSHOTS = [
    "mobile-awards.png",
    "mobile-light-awards.png",
    "mobile-leaderboard.png"
  ];

  const ALL_SNAPSHOTS = [...DESKTOP_SNAPSHOTS, ...MOBILE_SNAPSHOTS];

  it("should have all 18 required dashboard tab & modal snapshot PNG files", () => {
    assert.ok(fs.existsSync(snapshotsDir), "Snapshots directory must exist");

    for (const snapshotName of ALL_SNAPSHOTS) {
      const filePath = path.join(snapshotsDir, snapshotName);
      assert.ok(
        fs.existsSync(filePath),
        `Snapshot file '${snapshotName}' must exist in snapshots/. Run 'task snapshots' to generate.`
      );
    }
  });

  it("should validate PNG signatures and exact 1280x800 dimensions for desktop snapshots", () => {
    for (const snapshotName of DESKTOP_SNAPSHOTS) {
      const filePath = path.join(snapshotsDir, snapshotName);
      const meta = parsePngMetadata(filePath);

      assert.ok(
        meta.isValidHeader,
        `Snapshot '${snapshotName}' must have a valid PNG magic header`
      );
      assert.equal(meta.chunkType, "IHDR", `Snapshot '${snapshotName}' must have IHDR first chunk`);
      assert.equal(meta.width, 1280, `Desktop snapshot '${snapshotName}' width must be 1280px`);
      assert.equal(meta.height, 800, `Desktop snapshot '${snapshotName}' height must be 800px`);
      assert.equal(meta.bitDepth, 8, `Snapshot '${snapshotName}' bit depth must be 8`);
      assert.ok(
        meta.fileSize > 25 * 1024,
        `Snapshot '${snapshotName}' (${meta.fileSize} bytes) should be a fully rendered image (> 25 KB)`
      );
    }
  });

  it("should validate PNG signatures and exact 540x960 dimensions for mobile snapshots", () => {
    for (const snapshotName of MOBILE_SNAPSHOTS) {
      const filePath = path.join(snapshotsDir, snapshotName);
      const meta = parsePngMetadata(filePath);

      assert.ok(
        meta.isValidHeader,
        `Mobile snapshot '${snapshotName}' must have a valid PNG magic header`
      );
      assert.equal(meta.chunkType, "IHDR", `Snapshot '${snapshotName}' must have IHDR first chunk`);
      assert.equal(meta.width, 540, `Mobile snapshot '${snapshotName}' width must be 540px`);
      assert.equal(meta.height, 960, `Mobile snapshot '${snapshotName}' height must be 960px`);
      assert.equal(meta.bitDepth, 8, `Snapshot '${snapshotName}' bit depth must be 8`);
      assert.ok(
        meta.fileSize > 20 * 1024,
        `Snapshot '${snapshotName}' (${meta.fileSize} bytes) should be a fully rendered mobile image (> 20 KB)`
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

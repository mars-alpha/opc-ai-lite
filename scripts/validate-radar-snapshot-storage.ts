import assert from "node:assert/strict";
import { compactRadarSnapshot, expandRadarSnapshot } from "../lib/content/radar-snapshot-storage";

const detail = "long report ".repeat(200);
const items = Array.from({ length: 392 }, (_, index) => ({
  eventId: `event-${index}`,
  category: "模型",
  curation: { curated: index < 48, score: 80 - index },
  story: { reportTimeline: [{ text: detail }] }
}));
const snapshot = {
  schemaVersion: "radar-snapshot-v17-compact-storage",
  generatedAt: "2026-10-16T04:00:00.000Z",
  items,
  featured: items.slice(0, 48).map((item, index) => ({ ...item, curation: { ...item.curation, featuredRank: index + 1, rerankAuthority: "PRESENTATION_ONLY" } })),
  currentHot: [items[0], items[3]]
};

const compact = compactRadarSnapshot(snapshot);
assert.equal(compact.featured.length, 48);
assert.deepEqual(compact.featured[0], { eventId: "event-0", featuredRank: 1 });
assert.deepEqual(compact.currentHot, ["event-0", "event-3"]);
assert.deepEqual(expandRadarSnapshot(compact), snapshot);
const fullBytes = Buffer.byteLength(JSON.stringify(snapshot));
const storedBytes = Buffer.byteLength(JSON.stringify(compact));
assert.ok(storedBytes < fullBytes * 0.9, "duplicate event bodies should not be persisted");
assert.throws(() => expandRadarSnapshot({ ...compact, currentHot: ["missing"] }), /RADAR_SNAPSHOT_ORPHAN_REFERENCE/);

console.log(`RADAR_SNAPSHOT_STORAGE=PASS fullBytes=${fullBytes} storedBytes=${storedBytes}`);

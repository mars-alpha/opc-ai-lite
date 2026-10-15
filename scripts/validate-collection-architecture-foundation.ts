import fs from "node:fs";
import {
  COLLECTION_PURPOSES,
  normalizeCollectionProvenance,
  provenanceMetadata
} from "../lib/content/collection-provenance-contract";

function assert(condition: unknown, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED:" + label);
  console.log(label + "=PASS");
}

function expectError(fn: () => unknown, code: string, label: string) {
  try {
    fn();
  } catch (error) {
    assert(error instanceof Error && error.message === code, label);
    return;
  }
  throw new Error("ASSERTION_FAILED:" + label);
}

const system = normalizeCollectionProvenance({ origin: "system", collectionPurpose: "trend", runKind: "DOMESTIC_TREND" });
assert(system.origin === "SYSTEM" && system.collectionPurpose === "TREND" && !system.taskId, "SYSTEM_PROVENANCE_NORMALIZATION");
assert(COLLECTION_PURPOSES.includes("TREND") && COLLECTION_PURPOSES.includes("EXPANSION"), "CURRENT_COLLECTION_PURPOSES");

const metadata = provenanceMetadata(system);
assert(metadata.collectionOrigin === "SYSTEM" && metadata.manualTaskId === null, "SYSTEM_PROVENANCE_METADATA");
expectError(
  () => normalizeCollectionProvenance({ origin: "SYSTEM", collectionPurpose: "TREND", taskId: "unexpected" }),
  "SYSTEM_COLLECTION_TASK_ID_FORBIDDEN",
  "SYSTEM_TASK_ID_FORBIDDEN"
);

const runner = fs.readFileSync("lib/server/content/collection-runner.ts", "utf8");
const manualApi = fs.readFileSync("app/api/admin/manual-collection/route.ts", "utf8");
const owner = fs.readFileSync("docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md", "utf8");
assert(runner.includes("SYSTEM_COLLECTION_RUNTIME_ONLY"), "SINGLE_SYSTEM_RUNTIME");
assert(manualApi.includes("MANUAL_COLLECTION_PRODUCT_RETIRED"), "MANUAL_PRODUCT_TOMBSTONE");
assert(owner.includes("旧 Event 决策写入与忽略后退出列表已退役") && owner.includes("新采集质量标签只写独立样本"), "QUALITY_FEEDBACK_CURRENT_OWNER");
assert(!owner.includes(">=2逐篇合格实践证据"), "NO_SUPERSEDED_PRACTICE_COUNT_GATE");

console.log("COLLECTION_ARCHITECTURE_FOUNDATION=PASS");

import {
  COLLECTION_ORIGINS,
  COLLECTION_PURPOSES,
  MANUAL_COLLECTION_RUN_MODES,
  MANUAL_COLLECTION_TASK_STATUSES,
  MANUAL_COLLECTION_TASK_TYPES,
  normalizeCollectionProvenance,
  normalizeManualRunMode,
  normalizeManualTaskStatus,
  normalizeManualTaskType,
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

assert(JSON.stringify(COLLECTION_ORIGINS) === JSON.stringify(["SYSTEM", "MANUAL"]), "COLLECTION_ORIGIN_CONTRACT");
assert(COLLECTION_PURPOSES.includes("TREND") && COLLECTION_PURPOSES.includes("EXPANSION"), "COLLECTION_PURPOSE_CONTRACT");
assert(JSON.stringify(MANUAL_COLLECTION_TASK_TYPES) === JSON.stringify(["COMPETITOR", "TEMPORARY"]), "MANUAL_TASK_MVP_SCOPE");
assert(JSON.stringify(MANUAL_COLLECTION_RUN_MODES) === JSON.stringify(["ONCE", "CONTINUOUS"]), "MANUAL_RUN_MODE_CONTRACT");
assert(MANUAL_COLLECTION_TASK_STATUSES.includes("ACTIVE") && MANUAL_COLLECTION_TASK_STATUSES.includes("ARCHIVED"), "MANUAL_TASK_STATUS_CONTRACT");

const system = normalizeCollectionProvenance({ origin: "system", collectionPurpose: "trend", runKind: "DOMESTIC_TREND" });
assert(system.origin === "SYSTEM" && system.collectionPurpose === "TREND" && !system.taskId, "SYSTEM_PROVENANCE_NORMALIZATION");

const manual = normalizeCollectionProvenance({
  origin: "manual",
  collectionPurpose: "competitor",
  taskId: "manual_task_001",
  runKind: "COMPETITOR_ONCE"
});
assert(manual.origin === "MANUAL" && manual.taskId === "manual_task_001", "MANUAL_PROVENANCE_NORMALIZATION");
const metadata = provenanceMetadata(manual);
assert(metadata.collectionOrigin === "MANUAL" && metadata.manualTaskId === "manual_task_001", "PROVENANCE_METADATA_CONTRACT");

expectError(
  () => normalizeCollectionProvenance({ origin: "MANUAL", collectionPurpose: "COMPETITOR" }),
  "MANUAL_COLLECTION_TASK_ID_REQUIRED",
  "MANUAL_TASK_ID_REQUIRED"
);
expectError(
  () => normalizeCollectionProvenance({ origin: "SYSTEM", collectionPurpose: "TREND", taskId: "bad" }),
  "SYSTEM_COLLECTION_TASK_ID_FORBIDDEN",
  "SYSTEM_TASK_ID_FORBIDDEN"
);

assert(normalizeManualTaskType("competitor") === "COMPETITOR", "MANUAL_TASK_TYPE_NORMALIZATION");
assert(normalizeManualRunMode("continuous") === "CONTINUOUS", "MANUAL_RUN_MODE_NORMALIZATION");
assert(normalizeManualTaskStatus("paused") === "PAUSED", "MANUAL_TASK_STATUS_NORMALIZATION");

console.log("COLLECTION_ARCHITECTURE_FOUNDATION=PASS");

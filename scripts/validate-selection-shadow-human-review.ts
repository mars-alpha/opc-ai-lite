import fs from "node:fs";
import path from "node:path";

const source = path.resolve(process.cwd(), ".data/selection-shadow/gold-sample.jsonl");
const temp = path.resolve(process.cwd(), ".data/selection-shadow/human-review-test.jsonl");
if (!fs.existsSync(source)) throw new Error("SELECTION_SHADOW_SAMPLE_MISSING");

const rows = fs.readFileSync(source, "utf8").trim().split(/\r?\n/).slice(0, 2);
fs.writeFileSync(temp, rows.join("\n") + "\n", "utf8");
process.env.OPC_SELECTION_SHADOW_GOLD_PATH = ".data/selection-shadow/human-review-test.jsonl";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error(code);
}

async function main() {
  const {
    listSelectionShadowHumanReview,
    saveSelectionShadowHumanReview
  } = await import("../lib/server/content/selection-shadow-human-review");

  try {
    const before = listSelectionShadowHumanReview();
    assert(before.counts.total === 2, "HUMAN_REVIEW_FIXTURE_TOTAL");
    assert(before.counts.reviewed === 0, "HUMAN_REVIEW_FIXTURE_REVIEWED");
    const item = before.items[0];
    assert(!("currentCuration" in item), "BLIND_REVIEW_CURRENT_CURATION_EXPOSED");
    assert(!("sourceTier" in item), "BLIND_REVIEW_SOURCE_TIER_EXPOSED");

    saveSelectionShadowHumanReview({
      caseId: item.caseId,
      decision: "select",
      contentType: "MODEL_RELEASE",
      reason: "测试：该事件具有明确的信息增量和广泛决策价值。",
      reviewerEmail: "calibration-test@local.invalid"
    });

    const after = listSelectionShadowHumanReview();
    assert(after.counts.reviewed === 1, "HUMAN_REVIEW_SAVE_REVIEWED");
    assert(after.counts.select === 1, "HUMAN_REVIEW_SAVE_SELECT");
    assert(after.items[0].reviewStatus === "HUMAN_APPROVED", "HUMAN_REVIEW_APPROVAL");
    assert(after.items[0].reviewerId === "calibration-test@local.invalid", "HUMAN_REVIEW_REVIEWER");
    assert(Boolean(after.items[0].reviewedAt), "HUMAN_REVIEW_REVIEWED_AT");

    console.log(JSON.stringify({
      task: "AIHOT-SELECTION-CALIBRATION-001-A",
      blindReview: true,
      saveRestore: true,
      originalGoldFileUntouched: true,
      status: "PASS"
    }, null, 2));
  } finally {
    fs.rmSync(temp, { force: true });
  }
}

main().catch((error) => {
  fs.rmSync(temp, { force: true });
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

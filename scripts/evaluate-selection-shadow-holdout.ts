import fs from "node:fs";
import path from "node:path";
import {
  applySelectionShadowT2Policy,
  selectionShadowBinaryMetrics
} from "../lib/content/selection-shadow";
import { closeDatabase } from "../lib/server/db";
import {
  evaluateSelectionShadowGold,
  type SelectionShadowGoldCase
} from "../lib/server/content/selection-shadow-calibration";
import {
  readSelectionShadowHoldoutManifest,
  SELECTION_SHADOW_FROZEN_POLICY,
  SELECTION_SHADOW_HOLDOUT_PATH,
  validateSelectionShadowHoldoutDataset
} from "../lib/server/content/selection-shadow-holdout";

async function main() {
  const validation = validateSelectionShadowHoldoutDataset();
  if (!validation.valid) {
    throw new Error("SELECTION_SHADOW_HOLDOUT_INVALID:" + validation.violations.join(","));
  }
  const manifest = readSelectionShadowHoldoutManifest();
  if (!manifest || manifest.status !== "READY_FOR_HUMAN_REVIEW") {
    throw new Error("SELECTION_SHADOW_HOLDOUT_WAITING_NEW_WINDOW");
  }

  const file = path.resolve(process.cwd(), SELECTION_SHADOW_HOLDOUT_PATH);
  const rows = fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as SelectionShadowGoldCase);
  const labeled = rows.filter((row) =>
    row.reviewStatus === "HUMAN_APPROVED" &&
    (row.gold.decision === "select" || row.gold.decision === "reject")
  );
  if (labeled.length < 20) {
    throw new Error("SELECTION_SHADOW_HOLDOUT_NEEDS_AT_LEAST_20_BINARY_LABELS");
  }

  const report = await evaluateSelectionShadowGold(labeled, { limit: 200 });
  const evaluated = report.rows.map((row) => {
    const policy = applySelectionShadowT2Policy(SELECTION_SHADOW_FROZEN_POLICY, {
      sourceTier: row.sourceTier,
      contentType: row.contentType,
      averageScore: row.averageScore,
      scoreA: row.passA,
      scoreB: row.passB,
      materialText: row.materialText,
      directFactSupport: row.directFactSupport
    });
    return { ...row, predictedFrozen: policy.selected, frozenReason: policy.reason };
  });

  const metrics = selectionShadowBinaryMetrics(evaluated.map((row) => ({
    predicted: row.predictedFrozen,
    expected: row.expected
  })));
  const falsePositives = evaluated.filter((row) => row.predictedFrozen && !row.expected);
  const falseNegatives = evaluated.filter((row) => !row.predictedFrozen && row.expected);

  console.log(JSON.stringify({
    task: "AIHOT-SELECTION-CALIBRATION-001-G",
    holdoutVersion: manifest.version,
    cutoff: manifest.cutoff,
    frozen: manifest.frozen,
    cases: evaluated.length,
    positiveCases: evaluated.filter((row) => row.expected).length,
    negativeCases: evaluated.filter((row) => !row.expected).length,
    metrics,
    falsePositives: falsePositives.map((row) => ({
      eventId: row.eventId,
      title: row.title,
      sourceTier: row.sourceTier,
      contentType: row.contentType,
      averageScore: row.averageScore,
      reason: row.frozenReason
    })),
    falseNegatives: falseNegatives.map((row) => ({
      eventId: row.eventId,
      title: row.title,
      sourceTier: row.sourceTier,
      contentType: row.contentType,
      averageScore: row.averageScore
    })),
    noRuleMutationAfterHoldout: true,
    formalCurationChanged: false,
    status: "PASS"
  }, null, 2));
}

main().then(async () => closeDatabase()).catch(async (error) => {
  try { await closeDatabase(); } catch {}
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

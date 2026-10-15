import fs from "node:fs";
import path from "node:path";
import {
  SELECTION_SHADOW_CONTENT_TYPES,
  SELECTION_SHADOW_SOURCE_TIERS,
  type SelectionShadowContentType,
  type SelectionShadowSourceTier
} from "../lib/content/selection-shadow";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { closeDatabase } from "../lib/server/db";
import {
  evaluateSelectionShadowGold,
  type SelectionShadowGoldCase
} from "../lib/server/content/selection-shadow-calibration";

function arg(name: string, fallback: string) {
  const prefix = "--" + name + "=";
  return process.argv.find((item) => item.startsWith(prefix))?.slice(prefix.length) || fallback;
}

function numberArg(name: string, fallback: number) {
  const value = Number(arg(name, String(fallback)));
  return Number.isFinite(value) ? Math.round(value) : fallback;
}

function parseGold(file: string): SelectionShadowGoldCase[] {
  const rows = fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as SelectionShadowGoldCase);
  if (!rows.length) throw new Error("SELECTION_SHADOW_GOLD_EMPTY");
  for (const row of rows) {
    if (!row.caseId || !row.eventId || !row.titleSnapshot) throw new Error("SELECTION_SHADOW_GOLD_IDENTITY_REQUIRED");
    if (!SELECTION_SHADOW_SOURCE_TIERS.includes(row.sourceTier as SelectionShadowSourceTier)) {
      throw new Error("SELECTION_SHADOW_GOLD_SOURCE_TIER_INVALID:" + row.caseId);
    }
    if (!["select", "reject", "either"].includes(row.gold?.decision)) {
      throw new Error("SELECTION_SHADOW_GOLD_DECISION_INVALID:" + row.caseId);
    }
    if (
      row.gold.contentType &&
      !SELECTION_SHADOW_CONTENT_TYPES.includes(row.gold.contentType as SelectionShadowContentType)
    ) {
      throw new Error("SELECTION_SHADOW_GOLD_CONTENT_TYPE_INVALID:" + row.caseId);
    }
    if (row.gold.decision !== "either") {
      if (row.reviewStatus !== "HUMAN_APPROVED") throw new Error("SELECTION_SHADOW_GOLD_HUMAN_APPROVAL_REQUIRED:" + row.caseId);
      if (!row.reviewerId.trim() || !row.reviewedAt.trim() || !row.reason.trim()) {
        throw new Error("SELECTION_SHADOW_GOLD_AUDIT_METADATA_REQUIRED:" + row.caseId);
      }
    }
  }
  return rows;
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  if (target.environment !== "development" || target.databaseName !== "opc_ai_dev") {
    throw new Error("DEVELOPMENT_DATABASE_REQUIRED");
  }
  const goldPath = path.resolve(process.cwd(), arg("gold", ".data/selection-shadow/gold-sample.jsonl"));
  const gold = parseGold(goldPath);
  const labeled = gold.filter((item) => item.gold.decision !== "either");
  if (labeled.length < 20) {
    throw new Error("SELECTION_SHADOW_GOLD_NEEDS_AT_LEAST_20_LABELED_CASES");
  }
  const report = await evaluateSelectionShadowGold(gold, {
    force: process.argv.includes("--force"),
    limit: numberArg("limit", 200)
  });
  console.log(JSON.stringify({
    task: "AIHOT-SELECTION-CALIBRATION-001",
    goldFile: path.relative(process.cwd(), goldPath),
    labeledCases: labeled.length,
    ...report
  }, null, 2));
}

main().then(async () => closeDatabase()).catch(async (error) => {
  try { await closeDatabase(); } catch {}
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

import fs from "node:fs";
import path from "node:path";
import { closeDatabase } from "../lib/server/db";
import {
  evaluateSelectionShadowGold,
  type SelectionShadowGoldCase
} from "../lib/server/content/selection-shadow-calibration";

function arg(name: string, fallback: string) {
  const prefix = "--" + name + "=";
  return process.argv.find((item) => item.startsWith(prefix))?.slice(prefix.length) || fallback;
}

async function main() {
  const goldPath = path.resolve(process.cwd(), arg("gold", ".data/selection-shadow/gold-sample.jsonl"));
  const limit = Math.max(1, Math.min(200, Number(arg("limit", "20")) || 20));
  const rows = fs.readFileSync(goldPath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as SelectionShadowGoldCase);
  const report = await evaluateSelectionShadowGold(rows, { limit });
  const fp = report.rows.filter((row) => row.predicted && !row.expected);
  const fn = report.rows.filter((row) => !row.predicted && row.expected);
  const disagreements = report.rows.filter((row) => row.typeDisagreement);
  console.log(JSON.stringify({
    task: "AIHOT-SELECTION-CALIBRATION-001-B",
    evaluatedCases: report.cases,
    metrics: report.metrics,
    bySourceTier: report.bySourceTier,
    byContentType: report.byContentType,
    typeDisagreementCount: report.typeDisagreementCount,
    falsePositives: fp.map((row) => ({
      title: row.title,
      sourceTier: row.sourceTier,
      contentType: row.contentType,
      averageScore: row.averageScore,
      threshold: row.threshold
    })),
    falseNegatives: fn.map((row) => ({
      title: row.title,
      sourceTier: row.sourceTier,
      contentType: row.contentType,
      averageScore: row.averageScore,
      threshold: row.threshold
    })),
    typeDisagreements: disagreements.map((row) => ({
      title: row.title,
      sourceTier: row.sourceTier,
      averageScore: row.averageScore
    })),
    formalCurationChanged: false
  }, null, 2));
}

main().then(async () => closeDatabase()).catch(async (error) => {
  try { await closeDatabase(); } catch {}
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

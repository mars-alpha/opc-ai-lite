import fs from "node:fs";
import path from "node:path";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { closeDatabase } from "../lib/server/db";
import { buildSelectionShadowCalibrationSample } from "../lib/server/content/selection-shadow-calibration";

function numberArg(name: string, fallback: number) {
  const prefix = "--" + name + "=";
  const raw = process.argv.find((item) => item.startsWith(prefix))?.slice(prefix.length);
  const value = raw ? Number(raw) : fallback;
  return Number.isFinite(value) ? Math.round(value) : fallback;
}

function stringArg(name: string, fallback: string) {
  const prefix = "--" + name + "=";
  return process.argv.find((item) => item.startsWith(prefix))?.slice(prefix.length) || fallback;
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  if (target.environment !== "development" || target.databaseName !== "opc_ai_dev") {
    throw new Error("DEVELOPMENT_DATABASE_REQUIRED");
  }
  const limit = numberArg("limit", 160);
  const windowDays = numberArg("window-days", 7);
  const output = stringArg("output", ".data/selection-shadow/gold-sample.jsonl");
  const sample = await buildSelectionShadowCalibrationSample({ limit, windowDays });
  const rows = sample.cases.map((item) => ({
    ...item,
    gold: { decision: "either", contentType: null },
    reviewStatus: "PROVISIONAL",
    reviewerId: "HUMAN_REVIEW_REQUIRED",
    reviewedAt: "",
    reason: ""
  }));
  const destination = path.resolve(process.cwd(), output);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, rows.map((row) => JSON.stringify(row)).join("\n") + "\n", "utf8");
  console.log(JSON.stringify({
    task: "AIHOT-SELECTION-CALIBRATION-001",
    output,
    generatedAt: sample.generatedAt,
    windowDays: sample.windowDays,
    poolSize: sample.poolSize,
    exportedCases: rows.length,
    labelingInstruction: "将 gold.decision 改为 select/reject/either；人工确认后填写 reviewerId/reviewedAt/reason，并把 reviewStatus 改为 HUMAN_APPROVED。",
    status: "PASS"
  }, null, 2));
}

main().then(async () => closeDatabase()).catch(async (error) => {
  try { await closeDatabase(); } catch {}
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

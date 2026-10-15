import { closeDatabase } from "../lib/server/db";
import {
  refreshSelectionShadowHoldout,
  validateSelectionShadowHoldoutDataset
} from "../lib/server/content/selection-shadow-holdout";

function numberArg(name: string, fallback: number) {
  const prefix = "--" + name + "=";
  const raw = process.argv.find((item) => item.startsWith(prefix))?.slice(prefix.length);
  const value = raw ? Number(raw) : fallback;
  return Number.isFinite(value) ? Math.round(value) : fallback;
}

async function main() {
  const manifest = await refreshSelectionShadowHoldout({
    windowDays: numberArg("window-days", 7),
    maxCases: numberArg("max-cases", 120)
  });
  const validation = validateSelectionShadowHoldoutDataset();
  if (!validation.valid) {
    throw new Error("SELECTION_SHADOW_HOLDOUT_INVALID:" + validation.violations.join(","));
  }
  console.log(JSON.stringify({
    task: "AIHOT-SELECTION-CALIBRATION-001-G",
    manifest,
    validation,
    nextAction: manifest.status === "WAITING_NEW_WINDOW"
      ? "WAIT_FOR_NEW_EVENTS_AND_RERUN_EXPORTER"
      : "BLIND_HUMAN_REVIEW",
    formalCurationChanged: false,
    status: "PASS"
  }, null, 2));
}

main().then(async () => closeDatabase()).catch(async (error) => {
  try { await closeDatabase(); } catch {}
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

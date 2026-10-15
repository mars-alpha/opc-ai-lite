import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { closeDatabase } from "../lib/server/db";
import { buildSelectionShadowCalibrationSample } from "../lib/server/content/selection-shadow-calibration";
import {
  runSelectionShadowPair,
  selectionShadowModelConfigured
} from "../lib/server/content/selection-shadow-skill";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error(code);
}

function numberArg(name: string, fallback: number) {
  const prefix = "--" + name + "=";
  const raw = process.argv.find((item) => item.startsWith(prefix))?.slice(prefix.length);
  const value = raw ? Number(raw) : fallback;
  return Number.isFinite(value) ? Math.round(value) : fallback;
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(target.environment === "development" && target.databaseName === "opc_ai_dev", "DEVELOPMENT_DATABASE_REQUIRED");
  assert(selectionShadowModelConfigured(), "SELECTION_SHADOW_MODEL_NOT_CONFIGURED");

  const limit = Math.max(1, Math.min(8, numberArg("limit", 4)));
  const sample = await buildSelectionShadowCalibrationSample({ limit: 20, windowDays: 7 });
  const cases = sample.cases.slice(0, limit);
  assert(cases.length === limit, "SELECTION_SHADOW_REAL_CASES_MISSING");

  const results = [];
  for (const item of cases) {
    const result = await runSelectionShadowPair({
      eventId: item.eventId,
      currentTime: new Date().toISOString(),
      sourceTier: item.sourceTier,
      material: item.material
    });
    assert(result.authority === "SHADOW_ONLY", "SELECTION_SHADOW_AUTHORITY_DRIFT");
    assert(result.formalCurationChanged === false, "FORMAL_CURATION_MUST_NOT_CHANGE");
    assert(result.combined.averageScore >= 0 && result.combined.averageScore <= 100, "SELECTION_SHADOW_SCORE_RANGE");
    results.push({
      eventId: item.eventId,
      title: item.titleSnapshot,
      sourceTier: item.sourceTier,
      currentCuration: item.currentCuration,
      scoreA: result.combined.scoreA,
      scoreB: result.combined.scoreB,
      averageScore: result.combined.averageScore,
      threshold: result.combined.threshold,
      selectedShadow: result.combined.selectedShadow,
      contentType: result.combined.contentType,
      typeDisagreement: result.combined.typeDisagreement,
      reusedA: result.passA.reused,
      reusedB: result.passB.reused
    });
  }

  console.log(JSON.stringify({
    task: "AIHOT-SELECTION-CALIBRATION-001",
    database: target.databaseName,
    realCases: results.length,
    poolSize7d: sample.poolSize,
    formalCurationChanged: false,
    results,
    status: "PASS"
  }, null, 2));
}

main().then(async () => closeDatabase()).catch(async (error) => {
  try { await closeDatabase(); } catch {}
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

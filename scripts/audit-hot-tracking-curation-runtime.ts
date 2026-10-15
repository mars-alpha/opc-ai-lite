import { loadEnvConfig } from "@next/env";
import { closeDatabase } from "../lib/server/db";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { listRadarTimelineWindow } from "../lib/server/content/intelligence-read-model";

loadEnvConfig(process.cwd());

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("HOT_TRACKING_CURATION_RUNTIME_FAILED:" + code);
  console.log(code + "=PASS");
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(
    target.environment === "development" && target.databaseName === "opc_ai_dev",
    "DEVELOPMENT_DATABASE_ONLY"
  );
  const items = await listRadarTimelineWindow(7);
  const curated = items
    .filter((item) => item.curation.curated)
    .sort((left, right) =>
      right.curation.score - left.curation.score ||
      new Date(right.publishedAt || right.collectedAt).getTime() -
        new Date(left.publishedAt || left.collectedAt).getTime()
    );
  const rankedCandidates = [...items].sort((left, right) =>
    right.curation.score - left.curation.score ||
    new Date(right.publishedAt || right.collectedAt).getTime() -
      new Date(left.publishedAt || left.collectedAt).getTime()
  );

  console.log("SEVEN_DAY_EVENT_COUNT=" + items.length);
  console.log("CURATED_EVENT_COUNT=" + curated.length);
  console.log("CURATION_THRESHOLD=" + (items[0]?.curation.threshold ?? "N/A"));
  console.log("TOP_CANDIDATES_BEGIN");
  for (const item of rankedCandidates.slice(0, 20)) {
    console.log(JSON.stringify({
      eventId: item.eventId,
      title: item.title,
      verificationStatus: item.verificationStatus,
      changeMagnitude: item.changeMagnitude,
      score: item.curation.score,
      tier: item.curation.tier,
      gatePassed: item.curation.gatePassed,
      gate: item.boleCuration.gate,
      components: item.curation.components,
      reasons: item.curation.reasons,
      publishedAt: item.publishedAt,
      collectedAt: item.collectedAt
    }));
  }
  console.log("TOP_CANDIDATES_END");
  for (const item of curated.slice(0, 20)) {
    console.log(JSON.stringify({
      eventId: item.eventId,
      title: item.title,
      verificationStatus: item.verificationStatus,
      changeMagnitude: item.changeMagnitude,
      score: item.curation.score,
      tier: item.curation.tier,
      components: item.curation.components,
      reasons: item.curation.reasons
    }));
  }

  assert(
    curated.every((item) => item.curation.gatePassed),
    "CURATED_ITEMS_PASS_HARD_GATE"
  );
  assert(
    curated.every((item) =>
      item.verificationStatus === "CONFIRMED_OFFICIAL" ||
      item.verificationStatus === "CONFIRMED_MEDIA"
    ),
    "CURATED_ITEMS_ARE_FACT_VERIFIED"
  );
  assert(
    curated.every((item) => item.changeMagnitude !== "MINOR"),
    "CURATED_ITEMS_EXCLUDE_MINOR_CHANGES"
  );
  assert(
    curated.every((item) => item.boleCuration.editorialValueGatePassed === true),
    "CURATED_ITEMS_HAVE_KNOWN_EDITORIAL_MATERIALITY"
  );
  const normalWithoutPractical = curated.filter((item) =>
    item.changeMagnitude === "NORMAL" && item.coverage.practicalEvidenceCount === 0
  );
  console.log("NORMAL_WITHOUT_PRACTICAL_CURATED_COUNT=" + normalWithoutPractical.length);
  assert(
    curated.every((item) =>
      item.changeMagnitude === "MAJOR" ||
      item.changeMagnitude === "NORMAL"
    ),
    "CURATED_ITEMS_HAVE_KNOWN_MATERIALITY"
  );
  assert(
    curated.every((item) => item.curation.score >= item.curation.threshold),
    "CURATED_ITEMS_MEET_SCORE_THRESHOLD"
  );
  const topPicks = curated.filter((item) => item.curation.tier === "TOP_PICK");
  assert(
    topPicks.every((item) => item.boleCuration.topPickEligible === true),
    "TOP_PICK_REQUIRES_VALUE_AND_EVIDENCE_GATE"
  );
  assert(
    topPicks.every((item) =>
      (
        item.changeMagnitude === "MAJOR" &&
        (
          item.coverage.practicalEvidenceCount > 0 ||
          item.curation.components.independence >= 75 ||
          item.curation.components.corroboration >= 75
        )
      ) ||
      item.coverage.practicalEvidenceCount >= 2
    ),
    "TOP_PICK_HAS_STRONG_VALUE_SIGNAL"
  );
  console.log("TOP_PICK_COUNT=" + topPicks.length);
  console.log("HOT_TRACKING_CURATION_RUNTIME_AUDIT=PASS");
}

main()
  .then(async () => closeDatabase())
  .catch(async (error) => {
    try { await closeDatabase(); } catch {}
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });

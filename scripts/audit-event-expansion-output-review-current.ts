import { loadEnvConfig } from "@next/env";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { closeDatabase } from "../lib/server/db";
import { getEventExpansionDailyOutput } from "../lib/server/content/event-expansion-output";
import {
  listOfficialNewsCandidates,
  listCurrentHotTodayIntelligence,
  listUnverifiedEventCandidates
} from "../lib/server/content/intelligence-read-model";

loadEnvConfig(process.cwd());

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("OUTPUT_REVIEW_014_CURRENT_AUDIT_FAILED:" + code);
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(
    target.environment === "development" && target.databaseName === "opc_ai_dev",
    "DEVELOPMENT_DATABASE_REQUIRED"
  );

  const [official, hotspots, unverified] = await Promise.all([
    listOfficialNewsCandidates(6),
    listCurrentHotTodayIntelligence(4),
    listUnverifiedEventCandidates(6)
  ]);

  const candidates = [
    ...official.map((item) => ({ ...item, view: "OFFICIAL" as const })),
    ...hotspots.map((item) => ({ ...item, view: "CURRENT_HOT" as const })),
    ...unverified.map((item) => ({ ...item, view: "UNVERIFIED" as const }))
  ];
  const unique = [...new Map(candidates.map((item) => [item.eventId, item])).values()].slice(0, 12);

  let eventsWithReference = 0;
  let totalReferenceItems = 0;
  const supportedSectionCounts = new Map<string, number>();

  for (const item of unique) {
    const output = await getEventExpansionDailyOutput(item.eventId);
    const seen = new Set<string>();
    let eventReferenceItems = 0;

    for (const section of output.sections) {
      for (const evidence of section.items) {
        assert(!seen.has(evidence.rawItemId), "CROSS_SECTION_DUPLICATE:" + item.eventId);
        seen.add(evidence.rawItemId);
        if (section.key === "WHAT_HAPPENED") {
          assert(evidence.authority === "FACT", "FACT_AUTHORITY:" + item.eventId);
        } else {
          assert(evidence.authority === "REFERENCE_ONLY", "REFERENCE_AUTHORITY:" + item.eventId);
          eventReferenceItems += 1;
          totalReferenceItems += 1;
        }
      }
      if (section.status === "SUPPORTED") {
        supportedSectionCounts.set(
          section.key,
          (supportedSectionCounts.get(section.key) ?? 0) + 1
        );
      }
    }

    if (eventReferenceItems > 0) eventsWithReference += 1;
  }

  console.log("OUTPUT_REVIEW_014_CURRENT_EVENTS=" + unique.length);
  console.log("OUTPUT_REVIEW_014_CURRENT_OFFICIAL=" + official.length);
  console.log("OUTPUT_REVIEW_014_CURRENT_HOTSPOT=" + hotspots.length);
  console.log("OUTPUT_REVIEW_014_CURRENT_UNVERIFIED=" + unverified.length);
  console.log("OUTPUT_REVIEW_014_EVENTS_WITH_REFERENCE=" + eventsWithReference);
  console.log("OUTPUT_REVIEW_014_REFERENCE_ITEMS=" + totalReferenceItems);
  console.log(
    "OUTPUT_REVIEW_014_SUPPORTED_SECTIONS=" +
    [...supportedSectionCounts.entries()].map(([key, count]) => key + ":" + count).join(",")
  );
  console.log("OUTPUT_REVIEW_014_AUTHORITY_BOUNDARY=PASS");
  console.log("OUTPUT_REVIEW_014_CROSS_SECTION_DEDUPE=PASS");
  console.log("OUTPUT_REVIEW_014_CURRENT_DB_AUDIT=PASS");
}

const keepAlive = setInterval(() => {}, 1000);
main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabase().catch(() => {});
    clearInterval(keepAlive);
  });

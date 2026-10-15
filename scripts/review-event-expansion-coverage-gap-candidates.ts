import { loadEnvConfig } from "@next/env";
import { inArray } from "drizzle-orm";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { contentRawItems } from "../lib/server/db/schema";
import {
  getEventExpansionPlan,
  listEventExpansionRuns
} from "../lib/server/content/collection-expansion";
import {
  listOfficialNewsCandidates,
  listCurrentHotTodayIntelligence,
  listUnverifiedEventCandidates
} from "../lib/server/content/intelligence-read-model";

loadEnvConfig(process.cwd());

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function stringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  if (target.environment !== "development" || target.databaseName !== "opc_ai_dev") {
    throw new Error("COVERAGE_GAP_017_CANDIDATE_REVIEW_DEVELOPMENT_REQUIRED");
  }

  const [official, hotspots, unverified] = await Promise.all([
    listOfficialNewsCandidates(6),
    listCurrentHotTodayIntelligence(4),
    listUnverifiedEventCandidates(6)
  ]);
  const unique = [...new Map(
    [...official, ...hotspots, ...unverified].map((item) => [item.eventId, item])
  ).values()];

  for (const item of unique) {
    const plan = await getEventExpansionPlan(item.eventId);
    if (!plan.creatorSearchEligible) continue;

    const runs = (await listEventExpansionRuns(item.eventId, 20))
      .filter((run) => run.provider === "BILIBILI_SEARCH")
      .slice(0, 3);

    const rawIds = [...new Set(runs.flatMap((run) => stringList(record(run.metadata).rawItemIds)))];
    const raws = rawIds.length
      ? await getDatabase().select({
          id: contentRawItems.id,
          title: contentRawItems.title,
          excerpt: contentRawItems.excerpt,
          originalUrl: contentRawItems.originalUrl
        }).from(contentRawItems).where(inArray(contentRawItems.id, rawIds))
      : [];
    const rawById = new Map(raws.map((raw) => [raw.id, raw]));

    console.log("COVERAGE_GAP_017_TARGET=" + item.title);
    for (const run of runs) {
      const meta = record(run.metadata);
      const ids = stringList(meta.rawItemIds);
      console.log(
        "  QUERY=" + run.query +
        " | status=" + run.status +
        " received=" + run.receivedCount
      );
      for (const id of ids) {
        const raw = rawById.get(id);
        if (!raw) continue;
        console.log("    CANDIDATE=" + raw.title + " | excerpt=" + (raw.excerpt ?? "") + " | " + (raw.originalUrl ?? ""));
      }
    }
  }

  console.log("EVENT_EXPANSION_COVERAGE_GAP_017_CANDIDATE_REVIEW=PASS");
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

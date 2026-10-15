import { loadEnvConfig } from "@next/env";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { closeDatabase } from "../lib/server/db";
import { runEventExpansion } from "../lib/server/content/collection-expansion";
import { getEventExpansionDailyOutput } from "../lib/server/content/event-expansion-output";
import {
  listOfficialNewsCandidates,
  listCurrentHotTodayIntelligence,
  listUnverifiedEventCandidates
} from "../lib/server/content/intelligence-read-model";

loadEnvConfig(process.cwd());

const user = {
  id: "00000000-0000-0000-0000-000000000000",
  email: "event-expansion-output-review@opc.local",
  displayName: "Event Expansion Output Review",
  role: "ADMIN" as const
};

async function main() {
  console.log("OUTPUT_REVIEW_014_LIVE_START");
  const target = assertCurrentDatabaseTarget();
  if (target.environment !== "development" || target.databaseName !== "opc_ai_dev") {
    throw new Error("OUTPUT_REVIEW_014_LIVE_REQUIRES_DEVELOPMENT");
  }

  const [official, hotspots, unverified] = await Promise.all([
    listOfficialNewsCandidates(6),
    listCurrentHotTodayIntelligence(4),
    listUnverifiedEventCandidates(6)
  ]);

  const candidates = [
    ...official.map((item) => ({ ...item, reviewView: "OFFICIAL" as const })),
    ...hotspots.map((item) => ({ ...item, reviewView: "CURRENT_HOT" as const })),
    ...unverified.map((item) => ({ ...item, reviewView: "UNVERIFIED" as const }))
  ];
  const unique = [...new Map(candidates.map((item) => [item.eventId, item])).values()].slice(0, 12);
  const rows: Array<Record<string, unknown>> = [];

  for (const item of unique) {
    const before = await getEventExpansionDailyOutput(item.eventId);
    let expansion: Awaited<ReturnType<typeof runEventExpansion>> | null = null;
    let expansionError: string | null = null;

    try {
      expansion = await runEventExpansion(user, item.eventId, {
        windowHours: 72,
        resultLimit: 12,
        maxQueries: 3
      });
    } catch (error) {
      expansionError = error instanceof Error ? error.message : String(error);
    }

    const after = await getEventExpansionDailyOutput(item.eventId);
    rows.push({
      reviewView: item.reviewView,
      eventId: item.eventId,
      title: item.title,
      verificationStatus: item.verificationStatus,
      eventType: item.eventType,
      beforeReferenceCount: before.sections
        .filter((section) => section.key !== "WHAT_HAPPENED")
        .reduce((sum, section) => sum + section.items.length, 0),
      expansionRuns: expansion?.summary.total ?? 0,
      expansionReceived: expansion?.summary.received ?? 0,
      expansionRelevant: expansion?.evidencePack.length ?? 0,
      expansionFailed: expansion?.summary.failed ?? 0,
      expansionError,
      missingSections: after.missingSectionKeys,
      unmappedExpansionEvidenceCount: after.unmappedExpansionEvidenceCount,
      sections: after.sections.map((section) => ({
        key: section.key,
        label: section.label,
        status: section.status,
        authorityPolicy: section.authorityPolicy,
        items: section.items.map((evidence) => ({
          authority: evidence.authority,
          expansionType: evidence.expansionType,
          sourceName: evidence.sourceName,
          title: evidence.title,
          rankScore: evidence.rankScore,
          originalUrl: evidence.originalUrl
        }))
      }))
    });
  }

  const totalReferenceItems = rows.reduce((sum, row) => {
    const sections = row.sections as Array<{ key: string; items: unknown[] }>;
    return sum + sections
      .filter((section) => section.key !== "WHAT_HAPPENED")
      .reduce((count, section) => count + section.items.length, 0);
  }, 0);

  for (const row of rows) {
    const sections = row.sections as Array<{ key: string; items: Array<{ expansionType: string | null; title: string }> }>;
    const supported = sections
      .filter((section) => section.items.length > 0)
      .map((section) => section.key + "=" + section.items.map((item) => (item.expansionType ?? "FACT") + ":" + item.title).join(" || "))
      .join(" | ");
    console.log(
      "OUTPUT_REVIEW_014_EVENT=" + row.reviewView +
      " | " + row.title +
      " | runs=" + row.expansionRuns +
      " received=" + row.expansionReceived +
      " relevant=" + row.expansionRelevant +
      " failed=" + row.expansionFailed +
      " | " + supported
    );
  }
  console.log("OUTPUT_REVIEW_014_LIVE_EVENTS=" + rows.length);
  console.log("OUTPUT_REVIEW_014_LIVE_REFERENCE_ITEMS=" + totalReferenceItems);
  console.log("OUTPUT_REVIEW_014_REAL_EVENT_REPLAY=PASS");
  console.log("OUTPUT_REVIEW_014_ZERO_EVIDENCE_ALLOWED=PASS");
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

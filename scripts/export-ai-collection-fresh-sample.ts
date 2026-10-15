import { desc, inArray } from "drizzle-orm";
import { INTELLIGENCE_POLICY_VERSION } from "../lib/content/intelligence-policy";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { contentCollectionRuns, contentEvents, contentRawItems } from "../lib/server/db/schema";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  if (target.environment !== "development" || target.databaseName !== "opc_ai_dev") throw new Error("DEVELOPMENT_DATABASE_REQUIRED");
  const db = getDatabase();
  const events = (await db.select().from(contentEvents).orderBy(desc(contentEvents.lastSeenAt)).limit(500))
    .filter((event) => {
      const policy = record(record(event.metadata).eventPolicy);
      return event.policyVersion === INTELLIGENCE_POLICY_VERSION && policy.version === INTELLIGENCE_POLICY_VERSION;
    });

  const buckets = {
    official: events.filter((event) => record(record(event.metadata).eventPolicy).officialNewsEligible === true).slice(0, 8),
    unverified: events.filter((event) => event.verificationStatus === "UNVERIFIED").slice(0, 16),
    archived: events.filter((event) => event.verificationStatus === "ARCHIVED_UNVERIFIED").slice(0, 8),
    notAi: events.filter((event) => record(record(event.metadata).eventPolicy).aiRelevant === false).slice(0, 8)
  };
  const sample = [...new Map(Object.values(buckets).flat().map((event) => [event.id, event])).values()];

  const recentRuns = (await db.select().from(contentCollectionRuns).orderBy(desc(contentCollectionRuns.startedAt)).limit(50))
    .filter((run) => {
      const capture = record(record(run.metadata).rejectedSampleCapture);
      return capture.version === "ai-rejected-sample-capture-v1";
    })
    .slice(0, 10);

  const keptRawIds = [...new Set(recentRuns.flatMap((run) => {
    const rawItemIds = record(run.metadata).rawItemIds;
    return Array.isArray(rawItemIds)
      ? rawItemIds.filter((value): value is string => typeof value === "string").slice(0, 8)
      : [];
  }))];
  const keptRawItems = keptRawIds.length
    ? await db.select().from(contentRawItems).where(inArray(contentRawItems.id, keptRawIds))
    : [];
  const rawById = new Map(keptRawItems.map((item) => [item.id, item]));

  const discoveryCases = recentRuns.flatMap((run) => {
    const metadata = record(run.metadata);
    const rawItemIds = Array.isArray(metadata.rawItemIds)
      ? metadata.rawItemIds.filter((value): value is string => typeof value === "string").slice(0, 8)
      : [];
    const capture = record(metadata.rejectedSampleCapture);
    const rejected = Array.isArray(capture.samples)
      ? capture.samples.filter((value): value is Record<string, unknown> => Boolean(value && typeof value === "object")).slice(0, 8)
      : [];
    const kept = rawItemIds.flatMap((rawItemId) => {
      const item = rawById.get(rawItemId);
      return item ? [{
        collectionRunId: run.id,
        sourceId: run.sourceId,
        sourceName: run.sourceName,
        collectionMethod: run.collectionMethod,
        actualDecision: "KEEP",
        rawItemId: item.id,
        externalId: item.externalId,
        originalUrl: item.originalUrl,
        title: item.title,
        excerpt: item.excerpt,
        publishedAt: item.publishedAt?.toISOString() ?? null,
        suggestedFields: {
          expectedDecision: null,
          reason: null,
          reviewerId: null,
          reviewedAt: null
        }
      }] : [];
    });
    const dropped = rejected.map((item) => ({
      collectionRunId: run.id,
      sourceId: typeof item.sourceId === "string" ? item.sourceId : run.sourceId,
      sourceName: typeof item.sourceName === "string" ? item.sourceName : run.sourceName,
      collectionMethod: typeof item.collectionMethod === "string" ? item.collectionMethod : run.collectionMethod,
      actualDecision: "REJECT",
      rejectionStage: item.stage ?? null,
      rejectionReason: item.reason ?? null,
      relationType: item.relationType ?? null,
      externalId: item.externalId ?? null,
      originalUrl: item.originalUrl ?? null,
      title: item.title ?? null,
      excerpt: item.excerpt ?? null,
      publishedAt: item.publishedAt ?? null,
      suggestedFields: {
        expectedDecision: null,
        reason: null,
        reviewerId: null,
        reviewedAt: null
      }
    }));
    return [...kept, ...dropped];
  });
  console.log(JSON.stringify({
    version: "ai-collection-fresh-sample-v1",
    generatedAt: new Date().toISOString(),
    database: target.databaseName,
    policyVersion: INTELLIGENCE_POLICY_VERSION,
    sampling: {
      events: { official: 8, unverified: 16, archived: 8, notAi: 8 },
      discovery: { recentRuns: 10, keptPerRun: 8, rejectedPerRun: 8 }
    },
    discoveryCases,
    cases: sample.map((event) => {
      const policy = record(record(event.metadata).eventPolicy);
      return {
        eventId: event.id,
        title: event.title,
        eventType: event.eventType,
        verificationStatus: event.verificationStatus,
        aiRelevant: policy.aiRelevant === true,
        officialNewsEligible: policy.officialNewsEligible === true,
        hotspotEligible: policy.hotspotEligible === true,
        suggestedFields: {
          contentLabel: null,
          expectedDisposition: null,
          reason: null,
          reviewerId: null,
          reviewedAt: null
        }
      };
    })
  }, null, 2));
}

main().then(async () => closeDatabase()).catch(async (error) => {
  try { await closeDatabase(); } catch {}
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

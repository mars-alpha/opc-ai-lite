import { and, eq, inArray } from "drizzle-orm";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { EVENT_POLICIES, type IntelligenceEventType } from "../lib/content/intelligence-policy";
import { closeDatabase, getDatabase } from "../lib/server/db";
import {
  contentCollectionRuns,
  contentEventClusterMembers,
  contentEventRawItems,
  contentEvents,
  contentRawItems,
  contentSources,
  userIdentities,
  users
} from "../lib/server/db/schema";
import type { AuthUser } from "../lib/server/auth/service";
import { runSourceCollection } from "../lib/server/content/collection-runner";
import { evaluateEventPolicy } from "../lib/server/content/event-policy";
import { syncCoreEntityRegistry } from "../lib/server/content/entity-registry";
import { syncInitialSourcePolicies } from "../lib/server/content/source-policy";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("AI_EVENT_LIFECYCLE_ACCEPT_FAILED:" + code);
}
function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
async function adminUser(): Promise<AuthUser> {
  const [row] = await getDatabase()
    .select({ id: users.id, displayName: users.displayName, email: userIdentities.providerUserId })
    .from(users)
    .innerJoin(userIdentities, eq(userIdentities.userId, users.id))
    .where(and(eq(users.role, "ADMIN"), eq(userIdentities.provider, "EMAIL")))
    .limit(1);
  if (!row) throw new Error("ADMIN_USER_REQUIRED");
  return { id: row.id, displayName: row.displayName, email: row.email, role: "ADMIN" };
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(target.environment === "development" && target.databaseName === "opc_ai_dev", "DEV_DATABASE_ONLY");
  const db = getDatabase();
  const user = await adminUser();
  await syncInitialSourcePolicies();
  await syncCoreEntityRegistry();

  const suffix = crypto.randomUUID();
  const xSourceId = "source_accept_x_" + suffix;
  const hnSourceId = "source_accept_hn_" + suffix;
  const sourceIds = [xSourceId, hnSourceId];
  const urls = [
    "https://x.com/opc_accept/status/" + suffix,
    "https://news.ycombinator.com/item?id=" + suffix.replace(/-/g, "").slice(0, 10),
    "https://openai.com/lifecycle-acceptance/" + suffix
  ];
  // Keep the acceptance title Chinese-first so review localization cannot produce
  // two different translations for the same cross-platform event. The unique
  // marker also prevents failed historical acceptance runs from clustering into
  // the current test event.
  const title = "验收标识 " + suffix.slice(0, 8) + "：OpenAI 智能体工作流信号同步验证";
  const now = new Date();
  const samples = [
    { observedAt: new Date(now.getTime() - 30 * 60_000).toISOString(), trendRank: 20, hotValue: 100 },
    { observedAt: new Date(now.getTime() - 15 * 60_000).toISOString(), trendRank: 12, hotValue: 140 },
    { observedAt: now.toISOString(), trendRank: 5, hotValue: 190 }
  ];
  let eventId: string | null = null;

  try {
    await db.insert(contentSources).values([
      {
        id: xSourceId,
        name: "Acceptance X AI Signal",
        sourceType: "SOCIAL",
        canonicalUrl: "https://x.com/opc_accept",
        providerRef: "X_BROWSER_COLLECTOR",
        platform: "X",
        collectionMethod: "HTTP",
        enabled: true,
        authorityScore: 70,
        metadata: { acceptance: true }
      },
      {
        id: hnSourceId,
        name: "Acceptance HN AI Signal",
        sourceType: "DEVELOPER",
        canonicalUrl: "https://news.ycombinator.com/",
        providerRef: "RUNTIME_TREND_HN_TOP",
        platform: "HACKER_NEWS",
        collectionMethod: "HTTP",
        enabled: true,
        authorityScore: 70,
        metadata: { acceptance: true }
      }
    ]);

    const collectSignal = async (url: string, platform: string) => [{
      externalId: platform + "-" + suffix,
      originalUrl: url,
      title,
      excerpt: "AI agent workflow adoption and OpenAI model usage are rising across developer discussion.",
      author: "Acceptance",
      publishedAt: now.toISOString(),
      platformMetrics: {},
      metadata: {
        trendSamples: samples,
        discoveryFilter: {
          relationType: "CORE_AI",
          industry: "AI",
          impactTypes: ["AI_WORKFLOW_CHANGE"]
        }
      }
    }];

    await runSourceCollection(user, xSourceId, { provenance: { origin: "SYSTEM", collectionPurpose: "TREND" } },
      async () => collectSignal(urls[0], "X"));
    await runSourceCollection(user, hnSourceId, { provenance: { origin: "SYSTEM", collectionPurpose: "TREND" } },
      async () => collectSignal(urls[1], "HN"));

    const raws = await db.select().from(contentRawItems).where(inArray(contentRawItems.canonicalUrl, urls.slice(0, 2)));
    assert(raws.length === 2, "TWO_SIGNAL_RAWS");
    const links = await db.select().from(contentEventRawItems).where(inArray(contentEventRawItems.rawItemId, raws.map((row) => row.id)));
    const eventIds = [...new Set(links.map((row) => row.eventId))];
    assert(eventIds.length >= 1, "SIGNAL_EVENTS_CREATED");
    const memberships = await db.select().from(contentEventClusterMembers)
      .where(inArray(contentEventClusterMembers.eventId, eventIds));
    const clusterIds = [...new Set(memberships.map((row) => row.clusterId))];
    assert(clusterIds.length === 1, "SIGNALS_CLUSTER_TO_ONE_CANONICAL_EVENT");
    eventId = eventIds[0];

    const [hotEvent] = await db.select().from(contentEvents).where(eq(contentEvents.id, eventId)).limit(1);
    const hotPolicy = record(record(hotEvent.metadata).eventPolicy);
    assert(hotPolicy.hotspotEligible === true, "TWO_SIGNAL_HOTSPOT_ELIGIBLE");
    assert(Number(hotPolicy.signalSourceCount) >= 2, "TWO_SIGNAL_SOURCE_COUNT");
    console.log("TWO_SIGNAL_HOTSPOT=PASS");

    const eventType = hotEvent.eventType as IntelligenceEventType;
    const lifecyclePolicy = EVENT_POLICIES[eventType] ?? EVENT_POLICIES.INDUSTRY_HOTSPOT;
    const archiveAgeHours = Math.min(
      lifecyclePolicy.resurrectionWindowHours - 1,
      lifecyclePolicy.verificationTimeoutHours + 1
    );
    const oldAt = new Date(now.getTime() - archiveAgeHours * 60 * 60 * 1000);
    await db.update(contentEvents).set({ eventAt: oldAt, firstSeenAt: oldAt }).where(eq(contentEvents.id, eventId));
    await evaluateEventPolicy(eventId, now);
    const [archived] = await db.select().from(contentEvents).where(eq(contentEvents.id, eventId)).limit(1);
    assert(archived.verificationStatus === "ARCHIVED_UNVERIFIED", "UNVERIFIED_TIMEOUT_ARCHIVES");
    assert(archived.archivedAt instanceof Date, "ARCHIVE_TIMESTAMP");
    console.log("UNVERIFIED_ARCHIVE=PASS");

    const [officialSource] = await db.select().from(contentSources)
      .where(eq(contentSources.id, "source_official_openai_news")).limit(1);
    assert(Boolean(officialSource), "OFFICIAL_SOURCE_PRESENT");
    await runSourceCollection(
      user,
      officialSource.id,
      { provenance: { origin: "SYSTEM", collectionPurpose: "LATEST" } },
      async () => [{
        externalId: "official-" + suffix,
        originalUrl: urls[2],
        title,
        excerpt: "OpenAI confirms the AI agent workflow update in an official announcement.",
        author: "OpenAI",
        publishedAt: now.toISOString(),
        platformMetrics: {},
        metadata: {
          contentType: "OFFICIAL_ANNOUNCEMENT",
          discoveryFilter: {
            relationType: "CORE_AI",
            industry: "AI",
            impactTypes: ["AI_WORKFLOW_CHANGE"]
          }
        }
      }]
    );

    const officialRaw = await db.select().from(contentRawItems).where(eq(contentRawItems.canonicalUrl, urls[2]));
    const officialLinks = officialRaw.length
      ? await db.select().from(contentEventRawItems).where(eq(contentEventRawItems.rawItemId, officialRaw[0].id))
      : [];
    const officialEventIds = [...new Set(officialLinks.map((link) => link.eventId))];
    const officialMemberships = officialEventIds.length
      ? await db.select().from(contentEventClusterMembers).where(inArray(contentEventClusterMembers.eventId, officialEventIds))
      : [];
    const anchorMemberships = await db.select().from(contentEventClusterMembers).where(eq(contentEventClusterMembers.eventId, eventId));
    assert(
      officialMemberships.some((member) => anchorMemberships.some((anchor) => anchor.clusterId === member.clusterId)),
      "OFFICIAL_FACT_JOINS_EXISTING_CANONICAL_EVENT"
    );

    await evaluateEventPolicy(eventId, now);
    const [resurrected] = await db.select().from(contentEvents).where(eq(contentEvents.id, eventId)).limit(1);
    assert(resurrected.verificationStatus === "CONFIRMED_OFFICIAL", "OFFICIAL_CONFIRMATION_RESURRECTS");
    assert(resurrected.resurrectedAt instanceof Date, "RESURRECTION_TIMESTAMP");
    assert(resurrected.archivedAt === null, "RESURRECTION_CLEARS_ARCHIVE");
    assert(resurrected.id === eventId, "RESURRECTION_PRESERVES_EVENT_ID");
    console.log("ARCHIVED_EVENT_RESURRECTION=PASS");
    console.log("AI_EVENT_POLICY_LIFECYCLE_ACCEPTANCE=PASS");
  } finally {
    const raws = await db.select({ id: contentRawItems.id }).from(contentRawItems)
      .where(inArray(contentRawItems.canonicalUrl, urls));
    const cleanupLinks = raws.length
      ? await db.select({ eventId: contentEventRawItems.eventId }).from(contentEventRawItems)
          .where(inArray(contentEventRawItems.rawItemId, raws.map((row) => row.id)))
      : [];
    const cleanupEventIds = [...new Set([
      ...cleanupLinks.map((row) => row.eventId),
      ...(eventId ? [eventId] : [])
    ])];
    if (cleanupEventIds.length) await db.delete(contentEvents).where(inArray(contentEvents.id, cleanupEventIds));
    if (raws.length) await db.delete(contentRawItems).where(inArray(contentRawItems.id, raws.map((row) => row.id)));
    await db.delete(contentCollectionRuns).where(inArray(contentCollectionRuns.sourceId, sourceIds));
    await db.delete(contentSources).where(inArray(contentSources.id, sourceIds));
    await closeDatabase();
    console.log("TEST_DATA_CLEANUP=PASS");
  }
}

main().catch(async (error) => {
  try { await closeDatabase(); } catch {}
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

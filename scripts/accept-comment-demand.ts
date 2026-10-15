import { eq } from "drizzle-orm";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { contentDemandSignals, contentEvents } from "../lib/server/db/schema";
import {
  COMMENT_DEMAND_RUNTIME_VERSION,
  DEMAND_TYPES,
  listDemandSignals,
  resolveCommentDemandTrigger
} from "../lib/server/content/comment-insight";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("COMMENT_DEMAND_DB_FAILED:" + code);
  console.log(code + "=PASS");
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(target.environment === "development" && target.databaseName === "opc_ai_dev", "COMMENT_DEMAND_DEV_DATABASE_ONLY");
  const db = getDatabase();
  const [event] = await db.select().from(contentEvents).limit(1);
  assert(Boolean(event), "COMMENT_DEMAND_EXISTING_EVENT_AVAILABLE");

  const trigger = await resolveCommentDemandTrigger(event.id, "ADMIN_EXPLICIT");
  assert(trigger.triggerReasons.includes("ADMIN_EXPLICIT"), "COMMENT_DEMAND_ADMIN_EXPLICIT_TRIGGER");
  assert(DEMAND_TYPES.length === 4, "COMMENT_DEMAND_FOUR_TYPES_DB_ACCEPTANCE");

  const demandClusterKey = "comment-demand-acceptance-" + Date.now();
  let insertedId: string | null = null;
  try {
    const [row] = await db.insert(contentDemandSignals).values({
      eventId: event.id,
      clusterId: trigger.context.cluster?.id ?? null,
      demandType: "QUESTION",
      titleZh: "评论需求验收信号",
      summaryZh: "仅用于 Development DB 验收，完成后删除。",
      sampleCount: 3,
      uniqueAuthorCount: 3,
      representativeComments: [{ text: "如何使用这个功能？", platform: "ACCEPTANCE", author: null }],
      sourcePlatforms: ["ACCEPTANCE"],
      confidence: 100,
      provenance: {
        runtimeVersion: COMMENT_DEMAND_RUNTIME_VERSION,
        signalKind: "DEMAND_SIGNAL",
        factEvidence: false,
        verificationAuthority: false,
        hotspotAuthority: false,
        triggerReasons: ["ADMIN_EXPLICIT"],
        requestedTrigger: "ADMIN_EXPLICIT",
        demandClusterKey,
        commentFingerprint: demandClusterKey,
        commentIds: ["acceptance-comment-1"],
        commentSourceRefs: ["acceptance-raw"],
        commentSourceUrls: [],
        collectedAt: new Date().toISOString(),
        publicMetrics: [],
        downstreamCandidates: ["FAQ", "TUTORIAL"],
        budget: { maxTargetRaws: 8, maxCommentsPerTarget: 40, maxCleanedComments: 80, maxDemandClusters: 12 }
      },
      generatedMode: "CORE",
      modelRef: null
    }).returning();
    insertedId = row.id;

    const rows = await listDemandSignals(event.id);
    const persisted = rows.find((item) => item.id === insertedId);
    assert(Boolean(persisted), "COMMENT_DEMAND_SIGNAL_PERSISTED");
    assert(persisted?.demandType === "QUESTION", "COMMENT_DEMAND_SIGNAL_CLASSIFICATION");
    const provenance = persisted?.provenance as Record<string, unknown> | undefined;
    assert(provenance?.runtimeVersion === COMMENT_DEMAND_RUNTIME_VERSION, "COMMENT_DEMAND_RUNTIME_VERSION_PERSISTED");
    assert(provenance?.factEvidence === false, "COMMENT_DEMAND_NOT_FACT_EVIDENCE");
    assert(provenance?.verificationAuthority === false, "COMMENT_DEMAND_NO_VERIFICATION_AUTHORITY");
    assert(provenance?.hotspotAuthority === false, "COMMENT_DEMAND_NO_HOTSPOT_AUTHORITY");
    assert(provenance?.demandClusterKey === demandClusterKey, "COMMENT_DEMAND_DEMAND_CLUSTER_KEY");
    assert(provenance?.commentFingerprint === demandClusterKey, "COMMENT_DEMAND_COMMENT_FINGERPRINT");
    assert(Array.isArray(provenance?.triggerReasons), "COMMENT_DEMAND_TRIGGER_PROVENANCE");
    assert(Array.isArray(provenance?.downstreamCandidates), "COMMENT_DEMAND_DOWNSTREAM_CANDIDATES_PERSISTED");
  } finally {
    if (insertedId) await db.delete(contentDemandSignals).where(eq(contentDemandSignals.id, insertedId));
    const leaked = insertedId
      ? await db.select().from(contentDemandSignals).where(eq(contentDemandSignals.id, insertedId))
      : [];
    assert(leaked.length === 0, "COMMENT_DEMAND_TEST_DATA_CLEANUP");
  }
  console.log("COMMENT_DEMAND_DB=PASS");
}

main().then(closeDatabase).catch(async (error) => {
  try { await closeDatabase(); } catch {}
  console.error(error);
  process.exitCode = 1;
});

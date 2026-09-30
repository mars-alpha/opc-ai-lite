import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";
import { closeDatabase, getDatabase } from "../lib/server/db";
import {
  contentAuditRecords,
  contentEvidence,
  contentItemEvidence,
  contentItems,
  contentPublishRecords,
  contentReviews,
  contentSources
} from "../lib/server/db/schema";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("CONTENT_WORKBENCH_DB_ACCEPT_FAILED:" + code);
}

loadEnvConfig(process.cwd());

async function main() {
const db = getDatabase();
const suffix = process.pid + "_" + Date.now();
const sourceId = "source_cw_accept_" + suffix;
const contentId = "content_cw_accept_" + suffix;
const rollbackSignal = "__CONTENT_WORKBENCH_ACCEPT_ROLLBACK__";
let chainPassed = false;

try {
  await db.transaction(async (tx) => {
    const [source] = await tx
      .insert(contentSources)
      .values({
        id: sourceId,
        name: "Content Workbench Acceptance Source",
        sourceType: "ACCEPTANCE",
        status: "ACTIVE"
      })
      .returning();
    assert(source.id === sourceId, "SOURCE_INSERT");

    const [evidence] = await tx
      .insert(contentEvidence)
      .values({
        sourceId,
        title: "Acceptance Evidence",
        excerpt: "This row exists only inside the rollback acceptance transaction.",
        contentHash: "acceptance-" + suffix,
        verificationStatus: "VERIFIED",
        verifiedBy: "acceptance@local.invalid",
        verifiedAt: new Date()
      })
      .returning();

    const [content] = await tx
      .insert(contentItems)
      .values({
        id: contentId,
        title: "Acceptance Candidate",
        summary: "Content Workbench rollback-only acceptance candidate.",
        category: "ACCEPTANCE",
        destination: "DAILY_ITEM",
        sourceType: "WORKBENCH",
        status: "REVIEW",
        version: 1,
        reviewer: "acceptance@local.invalid",
        reviewedAt: new Date()
      })
      .returning();

    await tx.insert(contentItemEvidence).values({
      contentId,
      evidenceId: evidence.id,
      role: "PRIMARY"
    });

    await tx.insert(contentReviews).values({
      contentId,
      contentVersion: content.version,
      decision: "APPROVED",
      reviewerEmail: "acceptance@local.invalid"
    });

    await tx.insert(contentPublishRecords).values({
      entityType: "CONTENT",
      entityId: contentId,
      entityVersion: content.version,
      channel: "AI_DAILY",
      publishedByEmail: "acceptance@local.invalid"
    });

    await tx.insert(contentAuditRecords).values({
      actorEmail: "acceptance@local.invalid",
      action: "CONTENT_WORKBENCH_ACCEPTANCE",
      entityType: "CONTENT",
      entityId: contentId,
      entityVersion: content.version,
      metadata: { rollbackOnly: true }
    });

    const [joined] = await tx
      .select({
        contentId: contentItems.id,
        evidenceId: contentEvidence.id,
        sourceId: contentSources.id,
        decision: contentReviews.decision
      })
      .from(contentItems)
      .innerJoin(contentItemEvidence, eq(contentItemEvidence.contentId, contentItems.id))
      .innerJoin(contentEvidence, eq(contentItemEvidence.evidenceId, contentEvidence.id))
      .innerJoin(contentSources, eq(contentEvidence.sourceId, contentSources.id))
      .innerJoin(contentReviews, eq(contentReviews.contentId, contentItems.id))
      .where(eq(contentItems.id, contentId))
      .limit(1);

    assert(joined?.contentId === contentId, "JOIN_CONTENT");
    assert(joined?.sourceId === sourceId, "JOIN_SOURCE");
    assert(Boolean(joined?.evidenceId), "JOIN_EVIDENCE");
    assert(joined?.decision === "APPROVED", "JOIN_REVIEW");
    chainPassed = true;

    throw new Error(rollbackSignal);
  });
} catch (error) {
  if (!(error instanceof Error) || error.message !== rollbackSignal) throw error;
}

assert(chainPassed, "TRANSACTION_CHAIN_NOT_REACHED");

const [persistedSource] = await db
  .select({ id: contentSources.id })
  .from(contentSources)
  .where(eq(contentSources.id, sourceId))
  .limit(1);
const [persistedContent] = await db
  .select({ id: contentItems.id })
  .from(contentItems)
  .where(eq(contentItems.id, contentId))
  .limit(1);

assert(!persistedSource && !persistedContent, "ROLLBACK_LEAK");

console.log("CONTENT_WORKBENCH_DB_SCHEMA=PASS");
console.log("CONTENT_WORKBENCH_DB_RELATIONS=PASS");
console.log("CONTENT_WORKBENCH_DB_ROLLBACK_CLEAN=PASS");
}

main()
  .then(async () => {
    await closeDatabase();
  })
  .catch(async (error) => {
    try {
      await closeDatabase();
    } catch {}
    console.error(error);
    process.exit(1);
  });

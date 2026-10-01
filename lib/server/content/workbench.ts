import "server-only";

import { createHash } from "node:crypto";
import { and, asc, desc, eq } from "drizzle-orm";
import type { AuthUser } from "../auth/service";
import { getDatabase } from "../db";
import {
  contentAuditRecords,
  contentEvidence,
  contentItemEvidence,
  contentItems,
  contentPublishRecords,
  contentReviews,
  contentSources
} from "../db/schema";
import {
  CONTENT_REVIEW_DECISIONS,
  CONTENT_SOURCE_STATUSES,
  EVIDENCE_VERIFICATION_STATUSES,
  assertPublishableContent,
  nextContentStatusForReview,
  type ContentReviewDecision,
  type ContentSourceStatus,
  type EvidenceVerificationStatus
} from "./workbench-contract";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function requiredText(value: unknown, code: string, max: number) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text || text.length > max) throw new Error(code);
  return text;
}

function optionalText(value: unknown, code: string, max: number) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") throw new Error(code);
  const text = value.trim();
  if (!text) return null;
  if (text.length > max) throw new Error(code);
  return text;
}

function parseOptionalDate(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") throw new Error("INVALID_DATE");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("INVALID_DATE");
  return date;
}

function sourceId(value: unknown) {
  const id = requiredText(value, "INVALID_SOURCE_ID", 160);
  if (!id.startsWith("source_") || !/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error("INVALID_SOURCE_ID");
  return id;
}

function actorSnapshot(user: AuthUser) {
  return { actorId: user.id, actorEmail: user.email };
}

export async function recordContentAudit(
  user: AuthUser,
  input: {
    action: string;
    entityType: string;
    entityId: string;
    entityVersion?: number | null;
    before?: unknown;
    after?: unknown;
    metadata?: Record<string, unknown>;
  }
) {
  await getDatabase().insert(contentAuditRecords).values({
    ...actorSnapshot(user),
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    entityVersion: input.entityVersion ?? null,
    before: input.before ?? null,
    after: input.after ?? null,
    metadata: input.metadata ?? {}
  });
}

export async function listContentSources() {
  return getDatabase().select().from(contentSources).orderBy(asc(contentSources.createdAt));
}

export async function listEvidenceForSource(sourceId: string) {
  return getDatabase()
    .select()
    .from(contentEvidence)
    .where(eq(contentEvidence.sourceId, sourceId))
    .orderBy(desc(contentEvidence.collectedAt));
}

export async function createContentSource(user: AuthUser, input: unknown) {
  if (!isRecord(input)) throw new Error("INVALID_INPUT");
  const status = typeof input.status === "string" ? input.status : "ACTIVE";
  if (!CONTENT_SOURCE_STATUSES.includes(status as ContentSourceStatus)) throw new Error("INVALID_SOURCE_STATUS");

  const values = {
    id: sourceId(input.id),
    name: requiredText(input.name, "INVALID_SOURCE_NAME", 180),
    sourceType: requiredText(input.sourceType, "INVALID_SOURCE_TYPE", 120),
    canonicalUrl: optionalText(input.canonicalUrl, "INVALID_SOURCE_URL", 2000),
    providerRef: optionalText(input.providerRef, "INVALID_SOURCE_REF", 500),
    status: status as ContentSourceStatus,
    metadata: isRecord(input.metadata) ? input.metadata : {},
    updatedAt: new Date()
  };

  const [created] = await getDatabase().insert(contentSources).values(values).returning();
  await recordContentAudit(user, { action: "SOURCE_CREATED", entityType: "SOURCE", entityId: created.id, after: created });
  return created;
}

export async function createEvidence(user: AuthUser, sourceIdInput: string, input: unknown) {
  if (!isRecord(input)) throw new Error("INVALID_INPUT");
  const [source] = await getDatabase()
    .select({ id: contentSources.id })
    .from(contentSources)
    .where(eq(contentSources.id, sourceIdInput))
    .limit(1);
  if (!source) throw new Error("SOURCE_NOT_FOUND");

  const originalUrl = optionalText(input.originalUrl, "INVALID_EVIDENCE_URL", 2000);
  const providerRef = optionalText(input.providerRef, "INVALID_EVIDENCE_REF", 500);
  const title = optionalText(input.title, "INVALID_EVIDENCE_TITLE", 300);
  const excerpt = optionalText(input.excerpt, "INVALID_EVIDENCE_EXCERPT", 8000);
  const snapshotKey = optionalText(input.snapshotKey, "INVALID_SNAPSHOT_KEY", 1000);
  const rawForHash = [sourceIdInput, originalUrl, providerRef, title, excerpt, snapshotKey].join("\n");
  const contentHash =
    optionalText(input.contentHash, "INVALID_CONTENT_HASH", 128) ??
    createHash("sha256").update(rawForHash).digest("hex");

  const status = typeof input.verificationStatus === "string" ? input.verificationStatus : "UNVERIFIED";
  if (!EVIDENCE_VERIFICATION_STATUSES.includes(status as EvidenceVerificationStatus)) {
    throw new Error("INVALID_EVIDENCE_STATUS");
  }
  const verificationStatus = status as EvidenceVerificationStatus;
  const now = new Date();

  const [created] = await getDatabase()
    .insert(contentEvidence)
    .values({
      sourceId: sourceIdInput,
      originalUrl,
      providerRef,
      title,
      excerpt,
      publishedAt: parseOptionalDate(input.publishedAt),
      contentHash,
      snapshotKey,
      verificationStatus,
      verifiedBy: verificationStatus === "VERIFIED" ? user.email : null,
      verifiedAt: verificationStatus === "VERIFIED" ? now : null,
      metadata: isRecord(input.metadata) ? input.metadata : {},
      updatedAt: now
    })
    .returning();

  await recordContentAudit(user, { action: "EVIDENCE_CREATED", entityType: "EVIDENCE", entityId: created.id, after: created });
  return created;
}

export async function verifyEvidence(user: AuthUser, evidenceId: string, input: unknown) {
  if (!isRecord(input)) throw new Error("INVALID_INPUT");
  const status = typeof input.verificationStatus === "string" ? input.verificationStatus : "";
  if (!EVIDENCE_VERIFICATION_STATUSES.includes(status as EvidenceVerificationStatus)) {
    throw new Error("INVALID_EVIDENCE_STATUS");
  }
  const [existing] = await getDatabase()
    .select()
    .from(contentEvidence)
    .where(eq(contentEvidence.id, evidenceId))
    .limit(1);
  if (!existing) throw new Error("EVIDENCE_NOT_FOUND");

  const verificationStatus = status as EvidenceVerificationStatus;
  const [updated] = await getDatabase()
    .update(contentEvidence)
    .set({
      verificationStatus,
      verifiedBy: verificationStatus === "VERIFIED" ? user.email : null,
      verifiedAt: verificationStatus === "VERIFIED" ? new Date() : null,
      updatedAt: new Date()
    })
    .where(eq(contentEvidence.id, evidenceId))
    .returning();

  await recordContentAudit(user, {
    action: "EVIDENCE_VERIFIED",
    entityType: "EVIDENCE",
    entityId: evidenceId,
    before: existing,
    after: updated
  });
  return updated;
}

export async function listEvidenceForContent(contentId: string) {
  return getDatabase()
    .select({
      linkId: contentItemEvidence.id,
      role: contentItemEvidence.role,
      evidence: contentEvidence,
      source: contentSources
    })
    .from(contentItemEvidence)
    .innerJoin(contentEvidence, eq(contentItemEvidence.evidenceId, contentEvidence.id))
    .innerJoin(contentSources, eq(contentEvidence.sourceId, contentSources.id))
    .where(eq(contentItemEvidence.contentId, contentId))
    .orderBy(asc(contentItemEvidence.createdAt));
}

function isAcceptedContentEvidence(item: Awaited<ReturnType<typeof listEvidenceForContent>>[number]) {
  if (item.evidence.verificationStatus === "VERIFIED") return true;
  const metadata =
    item.evidence.metadata && typeof item.evidence.metadata === "object" && !Array.isArray(item.evidence.metadata)
      ? item.evidence.metadata as Record<string, unknown>
      : {};
  return metadata.autoLinked === true;
}

export async function linkEvidenceToContent(user: AuthUser, contentId: string, evidenceId: string, role = "SUPPORTING") {
  const db = getDatabase();
  const [[content], [evidence]] = await Promise.all([
    db.select({ id: contentItems.id }).from(contentItems).where(eq(contentItems.id, contentId)).limit(1),
    db.select({ id: contentEvidence.id }).from(contentEvidence).where(eq(contentEvidence.id, evidenceId)).limit(1)
  ]);
  if (!content) throw new Error("CONTENT_NOT_FOUND");
  if (!evidence) throw new Error("EVIDENCE_NOT_FOUND");

  const [existing] = await db
    .select()
    .from(contentItemEvidence)
    .where(and(eq(contentItemEvidence.contentId, contentId), eq(contentItemEvidence.evidenceId, evidenceId)))
    .limit(1);
  if (existing) return { item: existing, created: false };

  const [created] = await db
    .insert(contentItemEvidence)
    .values({ contentId, evidenceId, role: requiredText(role, "INVALID_EVIDENCE_ROLE", 80) })
    .returning();
  await recordContentAudit(user, {
    action: "EVIDENCE_LINKED",
    entityType: "CONTENT",
    entityId: contentId,
    after: { evidenceId, role: created.role }
  });
  return { item: created, created: true };
}

async function latestReview(contentId: string) {
  const [review] = await getDatabase()
    .select()
    .from(contentReviews)
    .where(eq(contentReviews.contentId, contentId))
    .orderBy(desc(contentReviews.createdAt))
    .limit(1);
  return review ?? null;
}

export async function reviewContentItem(user: AuthUser, contentId: string, input: unknown) {
  if (!isRecord(input)) throw new Error("INVALID_INPUT");
  const decision = typeof input.decision === "string" ? input.decision : "";
  if (!CONTENT_REVIEW_DECISIONS.includes(decision as ContentReviewDecision)) throw new Error("INVALID_REVIEW_DECISION");

  const [content] = await getDatabase()
    .select()
    .from(contentItems)
    .where(eq(contentItems.id, contentId))
    .limit(1);
  if (!content) throw new Error("CONTENT_NOT_FOUND");
  if (content.status === "PUBLISHED") throw new Error("CONTENT_ALREADY_PUBLISHED");

  const evidence = await listEvidenceForContent(contentId);
  if (decision === "APPROVED") {
    if (evidence.length < 1) throw new Error("CONTENT_EVIDENCE_REQUIRED");
    if (!evidence.some(isAcceptedContentEvidence)) {
      throw new Error("CONTENT_VERIFIED_EVIDENCE_REQUIRED");
    }
  }

  const nextStatus = nextContentStatusForReview(decision as ContentReviewDecision);
  const note = optionalText(input.note, "INVALID_REVIEW_NOTE", 4000);
  const db = getDatabase();

  const result = await db.transaction(async (tx) => {
    const [review] = await tx
      .insert(contentReviews)
      .values({
        contentId,
        contentVersion: content.version,
        decision,
        note,
        reviewerId: user.id,
        reviewerEmail: user.email
      })
      .returning();

    const [updated] = await tx
      .update(contentItems)
      .set({
        status: nextStatus,
        reviewer: user.email,
        reviewedAt: new Date(),
        publishedAt: null,
        updatedAt: new Date()
      })
      .where(eq(contentItems.id, contentId))
      .returning();

    return { review, item: updated };
  });

  await recordContentAudit(user, {
    action: "CONTENT_REVIEWED",
    entityType: "CONTENT",
    entityId: contentId,
    entityVersion: content.version,
    before: content,
    after: result.item,
    metadata: { decision, reviewId: result.review.id }
  });
  return result;
}

export async function publishContentItem(user: AuthUser, contentId: string) {
  const db = getDatabase();
  const [content] = await db.select().from(contentItems).where(eq(contentItems.id, contentId)).limit(1);
  if (!content) throw new Error("CONTENT_NOT_FOUND");

  const evidence = await listEvidenceForContent(contentId);
  const review = await latestReview(contentId);
  assertPublishableContent({
    status: content.status,
    evidenceCount: evidence.length,
    verifiedEvidenceCount: evidence.filter(isAcceptedContentEvidence).length,
    latestReviewDecision: review?.decision ?? null,
    latestReviewVersion: review?.contentVersion ?? null,
    version: content.version
  });

  const now = new Date();
  const result = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(contentItems)
      .set({ status: "PUBLISHED", publishedAt: now, updatedAt: now })
      .where(eq(contentItems.id, contentId))
      .returning();

    const [publishRecord] = await tx
      .insert(contentPublishRecords)
      .values({
        entityType: "CONTENT",
        entityId: contentId,
        entityVersion: content.version,
        channel: content.destination === "DAILY_ITEM" ? "AI_DAILY" : content.destination,
        publishedBy: user.id,
        publishedByEmail: user.email,
        publishedAt: now,
        metadata: { destination: content.destination }
      })
      .returning();

    return { item: updated, publishRecord };
  });

  await recordContentAudit(user, {
    action: "CONTENT_PUBLISHED",
    entityType: "CONTENT",
    entityId: contentId,
    entityVersion: content.version,
    before: content,
    after: result.item,
    metadata: { publishRecordId: result.publishRecord.id }
  });
  return result;
}

export async function listContentAudit(contentId: string) {
  return getDatabase()
    .select()
    .from(contentAuditRecords)
    .where(and(eq(contentAuditRecords.entityType, "CONTENT"), eq(contentAuditRecords.entityId, contentId)))
    .orderBy(desc(contentAuditRecords.createdAt));
}

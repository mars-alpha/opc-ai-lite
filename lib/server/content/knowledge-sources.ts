import "server-only";

import type { AuthUser } from "../auth/service";

import { and, asc, eq } from "drizzle-orm";

import { getDatabase } from "../db";
import {
  contentAuditRecords,
  contentEvidence,
  contentItemEvidence,
  contentItems,
  contentSources,
  knowledgeItems,
  knowledgeSourceLinks
} from "../db/schema";

export async function listKnowledgeSources(knowledgeId: string) {
  const db = getDatabase();
  const [knowledge] = await db
    .select({ id: knowledgeItems.id, sourceContentId: knowledgeItems.sourceContentId })
    .from(knowledgeItems)
    .where(eq(knowledgeItems.id, knowledgeId))
    .limit(1);

  if (!knowledge) throw new Error("KNOWLEDGE_NOT_FOUND");

  const links = await db
    .select({
      id: knowledgeSourceLinks.id,
      knowledgeId: knowledgeSourceLinks.knowledgeId,
      contentId: knowledgeSourceLinks.contentId,
      role: knowledgeSourceLinks.role,
      createdAt: knowledgeSourceLinks.createdAt,
      contentTitle: contentItems.title,
      contentStatus: contentItems.status
    })
    .from(knowledgeSourceLinks)
    .innerJoin(contentItems, eq(knowledgeSourceLinks.contentId, contentItems.id))
    .where(eq(knowledgeSourceLinks.knowledgeId, knowledgeId))
    .orderBy(asc(knowledgeSourceLinks.createdAt));

  return Promise.all(
    links.map(async (link) => {
      const evidence = await db
        .select({
          id: contentEvidence.id,
          title: contentEvidence.title,
          originalUrl: contentEvidence.originalUrl,
          verificationStatus: contentEvidence.verificationStatus,
          sourceId: contentSources.id,
          sourceName: contentSources.name,
          sourceType: contentSources.sourceType
        })
        .from(contentItemEvidence)
        .innerJoin(contentEvidence, eq(contentItemEvidence.evidenceId, contentEvidence.id))
        .innerJoin(contentSources, eq(contentEvidence.sourceId, contentSources.id))
        .where(eq(contentItemEvidence.contentId, link.contentId))
        .orderBy(asc(contentItemEvidence.createdAt));

      return { ...link, evidence };
    })
  );
}

export async function syncPrimaryKnowledgeSource(
  knowledgeId: string,
  contentId: string | null
) {
  const db = getDatabase();

  if (!contentId) {
    await db
      .update(knowledgeSourceLinks)
      .set({ role: "SUPPORTING" })
      .where(
        and(
          eq(knowledgeSourceLinks.knowledgeId, knowledgeId),
          eq(knowledgeSourceLinks.role, "PRIMARY")
        )
      );
    return;
  }

  await db.transaction(async (tx) => {
    await tx
      .update(knowledgeSourceLinks)
      .set({ role: "SUPPORTING" })
      .where(
        and(
          eq(knowledgeSourceLinks.knowledgeId, knowledgeId),
          eq(knowledgeSourceLinks.role, "PRIMARY")
        )
      );

    const [existing] = await tx
      .select({ id: knowledgeSourceLinks.id })
      .from(knowledgeSourceLinks)
      .where(
        and(
          eq(knowledgeSourceLinks.knowledgeId, knowledgeId),
          eq(knowledgeSourceLinks.contentId, contentId)
        )
      )
      .limit(1);

    if (existing) {
      await tx
        .update(knowledgeSourceLinks)
        .set({ role: "PRIMARY" })
        .where(eq(knowledgeSourceLinks.id, existing.id));
    } else {
      await tx.insert(knowledgeSourceLinks).values({
        knowledgeId,
        contentId,
        role: "PRIMARY"
      });
    }
  });
}

export async function addSupportingKnowledgeSource(
  user: AuthUser,
  knowledgeId: string,
  contentIdInput: unknown
) {
  const contentId =
    typeof contentIdInput === "string" ? contentIdInput.trim() : "";
  if (!contentId || contentId.length > 160) throw new Error("INVALID_CONTENT_ID");

  const db = getDatabase();
  const [[knowledge], [content]] = await Promise.all([
    db
      .select({ id: knowledgeItems.id, sourceContentId: knowledgeItems.sourceContentId })
      .from(knowledgeItems)
      .where(eq(knowledgeItems.id, knowledgeId))
      .limit(1),
    db
      .select({ id: contentItems.id, status: contentItems.status })
      .from(contentItems)
      .where(eq(contentItems.id, contentId))
      .limit(1)
  ]);

  if (!knowledge) throw new Error("KNOWLEDGE_NOT_FOUND");
  if (!content) throw new Error("CONTENT_NOT_FOUND");
  if (content.status !== "PUBLISHED") throw new Error("CONTENT_NOT_PUBLISHED");

  const [verifiedEvidence] = await db
    .select({ id: contentEvidence.id })
    .from(contentItemEvidence)
    .innerJoin(contentEvidence, eq(contentItemEvidence.evidenceId, contentEvidence.id))
    .where(
      and(
        eq(contentItemEvidence.contentId, contentId),
        eq(contentEvidence.verificationStatus, "VERIFIED")
      )
    )
    .limit(1);
  if (!verifiedEvidence) throw new Error("CONTENT_VERIFIED_EVIDENCE_REQUIRED");

  if (knowledge.sourceContentId === contentId) {
    await syncPrimaryKnowledgeSource(knowledgeId, contentId);
    const items = await listKnowledgeSources(knowledgeId);
    return { item: items.find((item) => item.contentId === contentId) ?? null, created: false };
  }

  const [existing] = await db
    .select({ id: knowledgeSourceLinks.id })
    .from(knowledgeSourceLinks)
    .where(
      and(
        eq(knowledgeSourceLinks.knowledgeId, knowledgeId),
        eq(knowledgeSourceLinks.contentId, contentId)
      )
    )
    .limit(1);

  if (existing) {
    const items = await listKnowledgeSources(knowledgeId);
    return { item: items.find((item) => item.contentId === contentId) ?? null, created: false };
  }

  await db.insert(knowledgeSourceLinks).values({
    knowledgeId,
    contentId,
    role: "SUPPORTING"
  });

  await db.insert(contentAuditRecords).values({
    actorId: user.id,
    actorEmail: user.email,
    action: "KNOWLEDGE_SUPPORTING_SOURCE_LINKED",
    entityType: "KNOWLEDGE",
    entityId: knowledgeId,
    after: { contentId, role: "SUPPORTING" },
    metadata: { contentId }
  });

  const items = await listKnowledgeSources(knowledgeId);
  return { item: items.find((item) => item.contentId === contentId) ?? null, created: true };
}

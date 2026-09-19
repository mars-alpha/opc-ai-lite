import "server-only";

import { and, asc, eq } from "drizzle-orm";

import { getDatabase } from "../db";
import { contentItems, knowledgeItems, knowledgeSourceLinks } from "../db/schema";

export async function listKnowledgeSources(knowledgeId: string) {
  const db = getDatabase();
  const [knowledge] = await db
    .select({ id: knowledgeItems.id, sourceContentId: knowledgeItems.sourceContentId })
    .from(knowledgeItems)
    .where(eq(knowledgeItems.id, knowledgeId))
    .limit(1);

  if (!knowledge) throw new Error("KNOWLEDGE_NOT_FOUND");

  return db
    .select({
      id: knowledgeSourceLinks.id,
      knowledgeId: knowledgeSourceLinks.knowledgeId,
      contentId: knowledgeSourceLinks.contentId,
      role: knowledgeSourceLinks.role,
      createdAt: knowledgeSourceLinks.createdAt,
      contentTitle: contentItems.title,
      sourceType: contentItems.sourceType,
      sourceRef: contentItems.sourceRef,
      sourceUrl: contentItems.sourceUrl,
      contentStatus: contentItems.status
    })
    .from(knowledgeSourceLinks)
    .innerJoin(contentItems, eq(knowledgeSourceLinks.contentId, contentItems.id))
    .where(eq(knowledgeSourceLinks.knowledgeId, knowledgeId))
    .orderBy(asc(knowledgeSourceLinks.createdAt));
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
      .select({ id: contentItems.id })
      .from(contentItems)
      .where(eq(contentItems.id, contentId))
      .limit(1)
  ]);

  if (!knowledge) throw new Error("KNOWLEDGE_NOT_FOUND");
  if (!content) throw new Error("CONTENT_NOT_FOUND");

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

  const items = await listKnowledgeSources(knowledgeId);
  return { item: items.find((item) => item.contentId === contentId) ?? null, created: true };
}

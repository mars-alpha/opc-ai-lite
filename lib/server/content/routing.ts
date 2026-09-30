import "server-only";

import type { AuthUser } from "../auth/service";

import { eq } from "drizzle-orm";
import { getDatabase } from "../db";
import { contentAuditRecords, contentItems, contentPublishRecords, knowledgeItems, knowledgeSourceLinks } from "../db/schema";
import { syncPrimaryKnowledgeSource } from "./knowledge-sources";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function optionalText(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") throw new Error("INVALID_TEXT");
  return value.trim() || null;
}

function knowledgeIdForContent(contentId: string) {
  const suffix = contentId.replace(/^content_/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
  return ("knowledge_" + suffix).slice(0, 160);
}

export async function getKnowledgeForContent(contentId: string) {
  const db = getDatabase();
  const [primary] = await db
    .select()
    .from(knowledgeItems)
    .where(eq(knowledgeItems.sourceContentId, contentId))
    .limit(1);

  if (primary) return primary;

  const [linked] = await db
    .select({ knowledge: knowledgeItems })
    .from(knowledgeSourceLinks)
    .innerJoin(knowledgeItems, eq(knowledgeSourceLinks.knowledgeId, knowledgeItems.id))
    .where(eq(knowledgeSourceLinks.contentId, contentId))
    .limit(1);

  return linked?.knowledge ?? null;
}

export async function routeContentToKnowledge(user: AuthUser, contentId: string, input: unknown) {
  const [content] = await getDatabase()
    .select()
    .from(contentItems)
    .where(eq(contentItems.id, contentId))
    .limit(1);

  if (!content) throw new Error("CONTENT_NOT_FOUND");
  if (content.destination !== "KNOWLEDGE_CAPSULE") throw new Error("CONTENT_NOT_KNOWLEDGE_CAPSULE");
  if (content.status !== "PUBLISHED") throw new Error("CONTENT_NOT_PUBLISHED");

  const existing = await getKnowledgeForContent(contentId);
  if (existing) return { item: existing, created: false };

  const overrides = isRecord(input) ? input : {};

  const id = knowledgeIdForContent(contentId);
  const validity =
    typeof overrides.validity === "string" &&
    ["NEW", "ACTIVE", "WATCH", "OUTDATED", "DEPRECATED"].includes(overrides.validity)
      ? overrides.validity
      : "NEW";
  const stageId = optionalText(overrides.stageId);
  const lessonId = optionalText(overrides.lessonId);
  const now = new Date();

  const db = getDatabase();
  const item = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(knowledgeItems)
      .values({
        id,
        sourceContentId: contentId,
        title: content.title,
        summary: content.summary,
        body: null,
        category: content.category,
        validity: validity as "NEW" | "ACTIVE" | "WATCH" | "OUTDATED" | "DEPRECATED",
        stageId,
        lessonId,
        readingMinutes: content.readingMinutes,
        status: "PUBLISHED",
        version: 1,
        publishedAt: now,
        updatedAt: now
      })
      .returning();

    await tx.insert(contentPublishRecords).values({
      entityType: "KNOWLEDGE",
      entityId: created.id,
      entityVersion: created.version,
      channel: "KNOWLEDGE",
      publishedBy: user.id,
      publishedByEmail: user.email,
      publishedAt: now,
      metadata: { sourceContentId: contentId }
    });

    await tx.insert(contentAuditRecords).values({
      actorId: user.id,
      actorEmail: user.email,
      action: "KNOWLEDGE_DERIVED",
      entityType: "KNOWLEDGE",
      entityId: created.id,
      entityVersion: created.version,
      after: created,
      metadata: { sourceContentId: contentId }
    });

    return created;
  });

  await syncPrimaryKnowledgeSource(item.id, contentId);
  return { item, created: true };
}
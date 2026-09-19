import "server-only";

import { eq } from "drizzle-orm";
import { getDatabase } from "../db";
import { contentItems, knowledgeItems } from "../db/schema";
import { createAdminKnowledgeItem } from "./admin";

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
  const [item] = await getDatabase()
    .select()
    .from(knowledgeItems)
    .where(eq(knowledgeItems.sourceContentId, contentId))
    .limit(1);

  return item ?? null;
}

export async function routeContentToKnowledge(contentId: string, input: unknown) {
  const [content] = await getDatabase()
    .select()
    .from(contentItems)
    .where(eq(contentItems.id, contentId))
    .limit(1);

  if (!content) throw new Error("CONTENT_NOT_FOUND");
  if (content.destination !== "KNOWLEDGE_CAPSULE") throw new Error("CONTENT_NOT_KNOWLEDGE_CAPSULE");

  const existing = await getKnowledgeForContent(contentId);
  if (existing) return { item: existing, created: false };

  const overrides = isRecord(input) ? input : {};

  const item = await createAdminKnowledgeItem({
    id: knowledgeIdForContent(contentId),
    sourceContentId: contentId,
    title: typeof overrides.title === "string" && overrides.title.trim() ? overrides.title : content.title,
    summary: typeof overrides.summary === "string" && overrides.summary.trim() ? overrides.summary : content.summary,
    body: optionalText(overrides.body),
    category: typeof overrides.category === "string" && overrides.category.trim() ? overrides.category : content.category,
    validity: typeof overrides.validity === "string" ? overrides.validity : "NEW",
    stageId: optionalText(overrides.stageId),
    lessonId: optionalText(overrides.lessonId),
    readingMinutes:
      typeof overrides.readingMinutes === "number"
        ? overrides.readingMinutes
        : content.readingMinutes,
    status: typeof overrides.status === "string" ? overrides.status : "DRAFT",
    publishedAt: overrides.publishedAt ?? null
  });

  return { item, created: true };
}

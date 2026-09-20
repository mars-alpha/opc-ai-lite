import "server-only";

import { asc, and, eq } from "drizzle-orm";

import { resolveResourceAccess } from "../access/service";
import { getDatabase } from "../db";
import {
  knowledgeDeepResources,
  knowledgeItems,
  lessons,
  practices
} from "../db/schema";

const STATUSES = ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"] as const;
type PublicationStatus = (typeof STATUSES)[number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function requiredText(value: unknown, code: string, maxLength: number) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text || text.length > maxLength) throw new Error(code);
  return text;
}

function optionalText(value: unknown, maxLength: number, code: string) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") throw new Error(code);
  const text = value.trim();
  if (!text) return null;
  if (text.length > maxLength) throw new Error(code);
  return text;
}

function parseStatus(value: unknown): PublicationStatus {
  if (typeof value !== "string" || !STATUSES.includes(value as PublicationStatus)) {
    throw new Error("INVALID_DEEP_RESOURCE_STATUS");
  }
  return value as PublicationStatus;
}

function parseFeishuUrl(value: unknown) {
  const url = requiredText(value, "INVALID_DEEP_RESOURCE_URL", 2000);
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("INVALID_DEEP_RESOURCE_URL");
  }
  const hostname = parsed.hostname.toLowerCase();
  const isFeishuHost =
    hostname === "feishu.cn" ||
    hostname.endsWith(".feishu.cn") ||
    hostname === "larksuite.com" ||
    hostname.endsWith(".larksuite.com");
  if (parsed.protocol !== "https:" || !isFeishuHost) {
    throw new Error("INVALID_DEEP_RESOURCE_URL");
  }
  return url;
}

async function getKnowledge(knowledgeId: string) {
  const [knowledge] = await getDatabase()
    .select()
    .from(knowledgeItems)
    .where(eq(knowledgeItems.id, knowledgeId))
    .limit(1);
  return knowledge ?? null;
}

async function validateOptionalRelations(lessonId: string | null, practiceId: string | null) {
  const db = getDatabase();

  if (lessonId) {
    const [lesson] = await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1);
    if (!lesson) throw new Error("LESSON_NOT_FOUND");
  }

  if (practiceId) {
    const [practice] = await db
      .select({ id: practices.id })
      .from(practices)
      .where(eq(practices.id, practiceId))
      .limit(1);
    if (!practice) throw new Error("PRACTICE_NOT_FOUND");
  }
}

async function validateInput(input: unknown, knowledgeStatus: PublicationStatus) {
  if (!isRecord(input)) throw new Error("INVALID_INPUT");

  const status = parseStatus(input.status);
  if (status === "PUBLISHED" && knowledgeStatus !== "PUBLISHED") {
    throw new Error("KNOWLEDGE_NOT_PUBLISHED");
  }

  const lessonId = optionalText(input.lessonId, 160, "INVALID_LESSON_ID");
  const practiceId = optionalText(input.practiceId, 160, "INVALID_PRACTICE_ID");
  await validateOptionalRelations(lessonId, practiceId);

  return {
    lessonId,
    practiceId,
    provider: "FEISHU" as const,
    title: requiredText(input.title, "INVALID_DEEP_RESOURCE_TITLE", 180),
    summary: optionalText(input.summary, 1200, "INVALID_DEEP_RESOURCE_SUMMARY"),
    resourceRef: optionalText(input.resourceRef, 500, "INVALID_DEEP_RESOURCE_REF"),
    url: parseFeishuUrl(input.url),
    status
  };
}

export async function listDeepResourcesForKnowledge(knowledgeId: string) {
  if (!(await getKnowledge(knowledgeId))) throw new Error("KNOWLEDGE_NOT_FOUND");

  return getDatabase()
    .select()
    .from(knowledgeDeepResources)
    .where(eq(knowledgeDeepResources.knowledgeId, knowledgeId))
    .orderBy(asc(knowledgeDeepResources.createdAt));
}

export async function listPublishedDeepResourcesForKnowledge(
  userId: string | null,
  knowledgeId: string
) {
  const access = await resolveResourceAccess(userId, "DEEP_RESOURCE");
  if (!access.allowed) return { access, items: [] };

  const knowledge = await getKnowledge(knowledgeId);
  if (!knowledge || knowledge.status !== "PUBLISHED") {
    return { access, items: [] };
  }

  const items = await getDatabase()
    .select({
      id: knowledgeDeepResources.id,
      title: knowledgeDeepResources.title,
      summary: knowledgeDeepResources.summary,
      provider: knowledgeDeepResources.provider,
      resourceRef: knowledgeDeepResources.resourceRef,
      url: knowledgeDeepResources.url
    })
    .from(knowledgeDeepResources)
    .where(
      and(
        eq(knowledgeDeepResources.knowledgeId, knowledgeId),
        eq(knowledgeDeepResources.status, "PUBLISHED")
      )
    )
    .orderBy(asc(knowledgeDeepResources.createdAt));

  return { access, items };
}

export async function createDeepResourceForKnowledge(knowledgeId: string, input: unknown) {
  const knowledge = await getKnowledge(knowledgeId);
  if (!knowledge) throw new Error("KNOWLEDGE_NOT_FOUND");

  const values = await validateInput(input, knowledge.status);
  const [existing] = await getDatabase()
    .select()
    .from(knowledgeDeepResources)
    .where(
      and(
        eq(knowledgeDeepResources.knowledgeId, knowledgeId),
        eq(knowledgeDeepResources.url, values.url)
      )
    )
    .limit(1);

  if (existing) return { item: existing, created: false };

  const [created] = await getDatabase()
    .insert(knowledgeDeepResources)
    .values({
      knowledgeId,
      ...values,
      updatedAt: new Date()
    })
    .returning();

  return { item: created, created: true };
}

export async function updateDeepResourceForKnowledge(
  knowledgeId: string,
  resourceId: string,
  input: unknown
) {
  const knowledge = await getKnowledge(knowledgeId);
  if (!knowledge) throw new Error("KNOWLEDGE_NOT_FOUND");

  const [existing] = await getDatabase()
    .select()
    .from(knowledgeDeepResources)
    .where(
      and(
        eq(knowledgeDeepResources.id, resourceId),
        eq(knowledgeDeepResources.knowledgeId, knowledgeId)
      )
    )
    .limit(1);
  if (!existing) throw new Error("DEEP_RESOURCE_NOT_FOUND");

  const values = await validateInput(input, knowledge.status);

  const [duplicate] = await getDatabase()
    .select({ id: knowledgeDeepResources.id })
    .from(knowledgeDeepResources)
    .where(
      and(
        eq(knowledgeDeepResources.knowledgeId, knowledgeId),
        eq(knowledgeDeepResources.url, values.url)
      )
    )
    .limit(1);

  if (duplicate && duplicate.id !== resourceId) throw new Error("DEEP_RESOURCE_URL_EXISTS");

  const [updated] = await getDatabase()
    .update(knowledgeDeepResources)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(knowledgeDeepResources.id, resourceId))
    .returning();

  return updated;
}
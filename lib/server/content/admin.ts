import "server-only";

import { asc, eq } from "drizzle-orm";
import type { AuthUser } from "../auth/service";
import { getDatabase } from "../db";
import { contentItems, knowledgeItems } from "../db/schema";
import { recordContentAudit } from "./workbench";

const DESTINATIONS = [
  "IGNORE",
  "DAILY_ITEM",
  "KNOWLEDGE_CAPSULE",
  "PRACTICE_CANDIDATE",
  "COURSE_UPDATE_CANDIDATE"
] as const;

type Destination = (typeof DESTINATIONS)[number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function optionalText(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") throw new Error("INVALID_TEXT");
  return value.trim() || null;
}

function stringArray(value: unknown, max = 30) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
    .map((item) => item.trim())
    .slice(0, max);
}

function parseOptionalDate(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") throw new Error("INVALID_DATE");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("INVALID_DATE");
  return date;
}

function parseReadingMinutes(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 120) {
    throw new Error("INVALID_READING_MINUTES");
  }
  return value;
}

function requiredId(value: unknown, prefix: string) {
  const id = typeof value === "string" ? value.trim() : "";
  if (!id || id.length > 160 || !id.startsWith(prefix) || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    throw new Error("INVALID_ID");
  }
  return id;
}

function requiredText(value: unknown, code: string, max: number) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text || text.length > max) throw new Error(code);
  return text;
}

export async function listAdminContentItems() {
  return getDatabase()
    .select()
    .from(contentItems)
    .orderBy(asc(contentItems.createdAt));
}

export async function getAdminContentItem(itemId: string) {
  const [item] = await getDatabase().select().from(contentItems).where(eq(contentItems.id, itemId)).limit(1);
  return item ?? null;
}

export function validateContentItemUpdate(input: unknown) {
  if (!isRecord(input)) throw new Error("INVALID_INPUT");

  const destination = typeof input.destination === "string" ? input.destination : "";
  if (!DESTINATIONS.includes(destination as Destination)) throw new Error("INVALID_DESTINATION");

  return {
    title: requiredText(input.title, "INVALID_TITLE", 180),
    summary: requiredText(input.summary, "INVALID_SUMMARY", 1200),
    audience: optionalText(input.audience),
    purpose: optionalText(input.purpose),
    tags: stringArray(input.tags, 30),
    category: requiredText(input.category, "INVALID_CATEGORY", 120),
    destination: destination as Destination,
    sourceType: requiredText(input.sourceType, "INVALID_SOURCE_TYPE", 120),
    sourceRef: optionalText(input.sourceRef),
    sourceUrl: optionalText(input.sourceUrl),
    sourcePublishedAt: parseOptionalDate(input.sourcePublishedAt),
    readingMinutes: parseReadingMinutes(input.readingMinutes)
  };
}

export async function createAdminContentItem(user: AuthUser, input: unknown) {
  if (!isRecord(input)) throw new Error("INVALID_INPUT");
  const id = requiredId(input.id, "content_");
  const values = validateContentItemUpdate(input);
  const [created] = await getDatabase()
    .insert(contentItems)
    .values({
      id,
      ...values,
      status: "DRAFT",
      version: 1,
      reviewedAt: null,
      reviewer: null,
      publishedAt: null,
      collectedAt: new Date(),
      updatedAt: new Date()
    })
    .returning();
  await recordContentAudit(user, {
    action: "CONTENT_CREATED",
    entityType: "CONTENT",
    entityId: created.id,
    entityVersion: created.version,
    after: created
  });
  return created;
}

export async function updateAdminContentItem(user: AuthUser, itemId: string, input: unknown) {
  const existing = await getAdminContentItem(itemId);
  if (!existing) throw new Error("CONTENT_NOT_FOUND");
  if (existing.status === "PUBLISHED") throw new Error("CONTENT_PUBLISHED_IMMUTABLE");
  if (existing.status === "ARCHIVED") throw new Error("CONTENT_ARCHIVED_IMMUTABLE");

  const values = validateContentItemUpdate(input);
  const [updated] = await getDatabase()
    .update(contentItems)
    .set({
      ...values,
      status: "DRAFT",
      version: existing.version + 1,
      reviewedAt: null,
      reviewer: null,
      publishedAt: null,
      updatedAt: new Date()
    })
    .where(eq(contentItems.id, itemId))
    .returning();

  await recordContentAudit(user, {
    action: "CONTENT_UPDATED",
    entityType: "CONTENT",
    entityId: itemId,
    entityVersion: updated.version,
    before: existing,
    after: updated
  });
  return updated;
}

export async function listAdminKnowledgeItems() {
  return getDatabase()
    .select()
    .from(knowledgeItems)
    .orderBy(asc(knowledgeItems.createdAt));
}

export async function getAdminKnowledgeItem(itemId: string) {
  const [item] = await getDatabase().select().from(knowledgeItems).where(eq(knowledgeItems.id, itemId)).limit(1);
  return item ?? null;
}


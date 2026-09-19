import "server-only";

import { asc, eq } from "drizzle-orm";
import { getDatabase } from "../db";
import { contentItems, knowledgeItems } from "../db/schema";

const PUBLICATION_STATUSES = ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"] as const;
const DESTINATIONS = [
  "IGNORE",
  "DAILY_ITEM",
  "KNOWLEDGE_CAPSULE",
  "PRACTICE_CANDIDATE",
  "COURSE_UPDATE_CANDIDATE"
] as const;
const VALIDITIES = ["NEW", "ACTIVE", "WATCH", "OUTDATED", "DEPRECATED"] as const;

type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];
type Destination = (typeof DESTINATIONS)[number];
type Validity = (typeof VALIDITIES)[number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function optionalText(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") throw new Error("INVALID_TEXT");
  return value.trim() || null;
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

  const status = typeof input.status === "string" ? input.status : "";
  const destination = typeof input.destination === "string" ? input.destination : "";
  if (!PUBLICATION_STATUSES.includes(status as PublicationStatus)) throw new Error("INVALID_STATUS");
  if (!DESTINATIONS.includes(destination as Destination)) throw new Error("INVALID_DESTINATION");

  return {
    title: requiredText(input.title, "INVALID_TITLE", 180),
    summary: requiredText(input.summary, "INVALID_SUMMARY", 1200),
    category: requiredText(input.category, "INVALID_CATEGORY", 120),
    destination: destination as Destination,
    sourceType: requiredText(input.sourceType, "INVALID_SOURCE_TYPE", 120),
    sourceRef: optionalText(input.sourceRef),
    sourceUrl: optionalText(input.sourceUrl),
    sourcePublishedAt: parseOptionalDate(input.sourcePublishedAt),
    reviewedAt: parseOptionalDate(input.reviewedAt),
    reviewer: optionalText(input.reviewer),
    readingMinutes: parseReadingMinutes(input.readingMinutes),
    status: status as PublicationStatus,
    publishedAt: status === "PUBLISHED" ? parseOptionalDate(input.publishedAt) ?? new Date() : null
  };
}

export async function createAdminContentItem(input: unknown) {
  if (!isRecord(input)) throw new Error("INVALID_INPUT");
  const id = requiredId(input.id, "content_");
  const values = validateContentItemUpdate(input);
  const [created] = await getDatabase()
    .insert(contentItems)
    .values({
      id,
      ...values,
      collectedAt: new Date(),
      updatedAt: new Date()
    })
    .returning();
  return created;
}

export async function updateAdminContentItem(itemId: string, input: unknown) {
  if (!(await getAdminContentItem(itemId))) throw new Error("CONTENT_NOT_FOUND");
  const values = validateContentItemUpdate(input);
  const [updated] = await getDatabase()
    .update(contentItems)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(contentItems.id, itemId))
    .returning();
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

export function validateKnowledgeItemUpdate(input: unknown) {
  if (!isRecord(input)) throw new Error("INVALID_INPUT");

  const status = typeof input.status === "string" ? input.status : "";
  const validity = typeof input.validity === "string" ? input.validity : "";
  if (!PUBLICATION_STATUSES.includes(status as PublicationStatus)) throw new Error("INVALID_STATUS");
  if (!VALIDITIES.includes(validity as Validity)) throw new Error("INVALID_VALIDITY");

  return {
    sourceContentId: optionalText(input.sourceContentId),
    title: requiredText(input.title, "INVALID_TITLE", 180),
    summary: requiredText(input.summary, "INVALID_SUMMARY", 1200),
    body: optionalText(input.body),
    category: requiredText(input.category, "INVALID_CATEGORY", 120),
    validity: validity as Validity,
    stageId: optionalText(input.stageId),
    lessonId: optionalText(input.lessonId),
    readingMinutes: parseReadingMinutes(input.readingMinutes),
    status: status as PublicationStatus,
    publishedAt: status === "PUBLISHED" ? parseOptionalDate(input.publishedAt) ?? new Date() : null
  };
}

export async function createAdminKnowledgeItem(input: unknown) {
  if (!isRecord(input)) throw new Error("INVALID_INPUT");
  const id = requiredId(input.id, "knowledge_");
  const values = validateKnowledgeItemUpdate(input);
  const [created] = await getDatabase()
    .insert(knowledgeItems)
    .values({
      id,
      ...values,
      updatedAt: new Date()
    })
    .returning();
  return created;
}

export async function updateAdminKnowledgeItem(itemId: string, input: unknown) {
  if (!(await getAdminKnowledgeItem(itemId))) throw new Error("KNOWLEDGE_NOT_FOUND");
  const values = validateKnowledgeItemUpdate(input);
  const [updated] = await getDatabase()
    .update(knowledgeItems)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(knowledgeItems.id, itemId))
    .returning();
  return updated;
}



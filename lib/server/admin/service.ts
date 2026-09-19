import "server-only";

import { asc, eq } from "drizzle-orm";
import type { AuthUser } from "../auth/service";
import { getDatabase } from "../db";
import { lessons, modules, stages } from "../db/schema";

const LESSON_STATUSES = ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"] as const;
type LessonStatus = (typeof LESSON_STATUSES)[number];

function adminEmails() {
  return new Set(
    (process.env.OPC_ADMIN_EMAILS ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isAdminUser(user: AuthUser | null) {
  return Boolean(user && adminEmails().has(user.email.toLowerCase()));
}

export function requireAdminUser(user: AuthUser | null) {
  if (!user) throw new Error("UNAUTHENTICATED");
  if (!isAdminUser(user)) throw new Error("FORBIDDEN");
  return user;
}

export async function listAdminCourseTree() {
  return getDatabase()
    .select({
      stageId: stages.id,
      stageSlug: stages.slug,
      stageTitle: stages.title,
      stageOrder: stages.order,
      moduleId: modules.id,
      moduleSlug: modules.slug,
      moduleTitle: modules.title,
      moduleOrder: modules.order,
      lessonId: lessons.id,
      lessonSlug: lessons.slug,
      lessonTitle: lessons.title,
      lessonOrder: lessons.order,
      lessonStatus: lessons.status,
      lessonVersion: lessons.version
    })
    .from(stages)
    .innerJoin(modules, eq(modules.stageId, stages.id))
    .innerJoin(lessons, eq(lessons.moduleId, modules.id))
    .orderBy(asc(stages.order), asc(modules.order), asc(lessons.order));
}

export async function getAdminLesson(lessonId: string) {
  const [row] = await getDatabase()
    .select({
      id: lessons.id,
      slug: lessons.slug,
      title: lessons.title,
      summary: lessons.summary,
      durationMinutes: lessons.durationMinutes,
      content: lessons.content,
      order: lessons.order,
      status: lessons.status,
      version: lessons.version,
      updatedAt: lessons.updatedAt,
      moduleId: modules.id,
      moduleTitle: modules.title,
      stageId: stages.id,
      stageTitle: stages.title,
      stageSlug: stages.slug
    })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(stages, eq(modules.stageId, stages.id))
    .where(eq(lessons.id, lessonId))
    .limit(1);

  return row ?? null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function validateContent(value: unknown) {
  if (!isRecord(value)) throw new Error("INVALID_CONTENT");

  for (const key of ["plainExplanation", "whyItMatters"]) {
    if (typeof value[key] !== "string" || !String(value[key]).trim()) {
      throw new Error("INVALID_CONTENT");
    }
  }

  for (const key of ["points", "content", "guides", "mistakes", "related"]) {
    if (!Array.isArray(value[key])) throw new Error("INVALID_CONTENT");
  }

  if (!isRecord(value.example) || !isRecord(value.practice)) {
    throw new Error("INVALID_CONTENT");
  }

  return value;
}

export function validateLessonUpdate(input: unknown) {
  if (!isRecord(input)) throw new Error("INVALID_INPUT");

  const title = typeof input.title === "string" ? input.title.trim() : "";
  const summary = typeof input.summary === "string" ? input.summary.trim() : "";
  const durationMinutes =
    typeof input.durationMinutes === "number" && Number.isInteger(input.durationMinutes)
      ? input.durationMinutes
      : null;
  const status = typeof input.status === "string" ? input.status : "";
  const content = validateContent(input.content);

  if (!title || title.length > 180) throw new Error("INVALID_TITLE");
  if (!summary || summary.length > 500) throw new Error("INVALID_SUMMARY");
  if (durationMinutes !== null && (durationMinutes < 1 || durationMinutes > 600)) {
    throw new Error("INVALID_DURATION");
  }
  if (!LESSON_STATUSES.includes(status as LessonStatus)) {
    throw new Error("INVALID_STATUS");
  }

  return { title, summary, durationMinutes, status: status as LessonStatus, content };
}

export async function updateAdminLesson(lessonId: string, input: unknown) {
  const values = validateLessonUpdate(input);
  const existing = await getAdminLesson(lessonId);
  if (!existing) throw new Error("LESSON_NOT_FOUND");

  const [updated] = await getDatabase()
    .update(lessons)
    .set({
      ...values,
      version: existing.version + 1,
      updatedAt: new Date()
    })
    .where(eq(lessons.id, lessonId))
    .returning({
      id: lessons.id,
      status: lessons.status,
      version: lessons.version,
      updatedAt: lessons.updatedAt
    });

  return updated;
}


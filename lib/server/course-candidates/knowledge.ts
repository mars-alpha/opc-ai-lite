import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { getDatabase } from "../db";
import { courseUpdateCandidates, knowledgeItems, lessons } from "../db/schema";

const dispositions = [
  "CONTENT_CLARIFICATION",
  "CONTENT_UPDATE",
  "NEW_CONTENT_CANDIDATE",
  "PRACTICE_IMPROVEMENT",
  "EVALUATION_REVIEW"
] as const;

type KnowledgeDisposition = (typeof dispositions)[number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function requiredText(value: unknown, code: string, maxLength = 3000) {
  if (typeof value !== "string") throw new Error(code);
  const text = value.trim();
  if (!text || text.length > maxLength) throw new Error(code);
  return text;
}

function parseDisposition(value: unknown): KnowledgeDisposition {
  if (typeof value !== "string" || !dispositions.includes(value as KnowledgeDisposition)) {
    throw new Error("INVALID_CANDIDATE_DISPOSITION");
  }
  return value as KnowledgeDisposition;
}

export async function listCourseUpdateCandidatesForKnowledge(knowledgeId: string) {
  return getDatabase()
    .select({
      id: courseUpdateCandidates.id,
      lessonId: courseUpdateCandidates.lessonId,
      lessonTitle: lessons.title,
      sourceType: courseUpdateCandidates.sourceType,
      disposition: courseUpdateCandidates.disposition,
      proposal: courseUpdateCandidates.proposal,
      status: courseUpdateCandidates.status,
      reviewedBy: courseUpdateCandidates.reviewedBy,
      reviewedAt: courseUpdateCandidates.reviewedAt,
      createdAt: courseUpdateCandidates.createdAt,
      updatedAt: courseUpdateCandidates.updatedAt
    })
    .from(courseUpdateCandidates)
    .innerJoin(lessons, eq(courseUpdateCandidates.lessonId, lessons.id))
    .where(
      and(
        eq(courseUpdateCandidates.sourceType, "KNOWLEDGE"),
        eq(courseUpdateCandidates.sourceKnowledgeId, knowledgeId)
      )
    )
    .orderBy(desc(courseUpdateCandidates.createdAt));
}

export async function createCourseUpdateCandidateFromKnowledge(
  knowledgeId: string,
  input: unknown
) {
  if (!isRecord(input)) throw new Error("INVALID_INPUT");

  const db = getDatabase();
  const [knowledge] = await db
    .select({
      id: knowledgeItems.id,
      title: knowledgeItems.title,
      summary: knowledgeItems.summary,
      body: knowledgeItems.body,
      status: knowledgeItems.status,
      validity: knowledgeItems.validity,
      lessonId: knowledgeItems.lessonId
    })
    .from(knowledgeItems)
    .where(eq(knowledgeItems.id, knowledgeId))
    .limit(1);

  if (!knowledge) throw new Error("KNOWLEDGE_NOT_FOUND");
  if (knowledge.status !== "PUBLISHED") throw new Error("KNOWLEDGE_NOT_PUBLISHED");
  if (knowledge.validity === "OUTDATED" || knowledge.validity === "DEPRECATED") {
    throw new Error("KNOWLEDGE_NOT_ACTIVE");
  }

  const lessonId =
    typeof input.lessonId === "string" && input.lessonId.trim()
      ? input.lessonId.trim()
      : knowledge.lessonId;
  if (!lessonId) throw new Error("LESSON_REQUIRED");

  const [lesson] = await db
    .select({ id: lessons.id, title: lessons.title })
    .from(lessons)
    .where(eq(lessons.id, lessonId))
    .limit(1);
  if (!lesson) throw new Error("LESSON_NOT_FOUND");

  const [existing] = await db
    .select()
    .from(courseUpdateCandidates)
    .where(
      and(
        eq(courseUpdateCandidates.sourceType, "KNOWLEDGE"),
        eq(courseUpdateCandidates.sourceKnowledgeId, knowledgeId),
        eq(courseUpdateCandidates.lessonId, lessonId)
      )
    )
    .limit(1);
  if (existing) return { item: existing, created: false };

  const disposition = parseDisposition(input.disposition);
  const proposal = {
    source: "KNOWLEDGE",
    knowledgeTitle: knowledge.title,
    knowledgeSummary: knowledge.summary,
    proposedChange: requiredText(input.proposedChange, "INVALID_PROPOSED_CHANGE", 4000),
    rationale: requiredText(input.rationale, "INVALID_RATIONALE", 3000),
    affectedArea: requiredText(input.affectedArea, "INVALID_AFFECTED_AREA", 500),
    requiresHumanReview: true
  };

  const [created] = await db
    .insert(courseUpdateCandidates)
    .values({
      lessonId,
      sourceType: "KNOWLEDGE",
      insightId: null,
      sourceKnowledgeId: knowledgeId,
      disposition,
      proposal,
      status: "PENDING_REVIEW"
    })
    .returning();

  return { item: created, created: true, lesson };
}

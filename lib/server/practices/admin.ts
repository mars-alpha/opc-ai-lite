import "server-only";

import { and, eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { getDatabase } from "../db";
import { knowledgeItems, practices } from "../db/schema";
import { parsePracticeSubmissionSchema } from "./submission-schema";

type PublicationStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
type PracticeAccessTier = "INHERIT" | "FREE" | "MEMBER";
type PracticeKey = "goal" | "context" | "input" | "constraint" | "output";

const publicationStatuses: PublicationStatus[] = ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"];
const accessTiers: PracticeAccessTier[] = ["INHERIT", "FREE", "MEMBER"];
const practiceKeys: PracticeKey[] = ["goal", "context", "input", "constraint", "output"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function requiredText(value: unknown, code: string, maxLength = 3000) {
  if (typeof value !== "string") throw new Error(code);
  const text = value.trim();
  if (!text || text.length > maxLength) throw new Error(code);
  return text;
}

function parseStatus(value: unknown): PublicationStatus {
  if (typeof value !== "string" || !publicationStatuses.includes(value as PublicationStatus)) {
    throw new Error("INVALID_PRACTICE_STATUS");
  }
  return value as PublicationStatus;
}

function parseAccessTier(value: unknown): PracticeAccessTier {
  if (typeof value !== "string" || !accessTiers.includes(value as PracticeAccessTier)) {
    throw new Error("INVALID_PRACTICE_ACCESS_TIER");
  }
  return value as PracticeAccessTier;
}

function parseInstructions(value: unknown) {
  if (!Array.isArray(value) || value.length !== practiceKeys.length) {
    throw new Error("INVALID_PRACTICE_INSTRUCTIONS");
  }

  const items = value.map((item) => {
    if (!isRecord(item)) throw new Error("INVALID_PRACTICE_INSTRUCTIONS");
    const key = typeof item.key === "string" ? item.key : "";
    if (!practiceKeys.includes(key as PracticeKey)) throw new Error("INVALID_PRACTICE_INSTRUCTIONS");
    return {
      key: key as PracticeKey,
      label: requiredText(item.label, "INVALID_PRACTICE_INSTRUCTIONS", 80),
      prompt: requiredText(item.prompt, "INVALID_PRACTICE_INSTRUCTIONS", 600)
    };
  });

  if (new Set(items.map((item) => item.key)).size !== practiceKeys.length) {
    throw new Error("INVALID_PRACTICE_INSTRUCTIONS");
  }
  return items;
}

function parseHints(value: unknown) {
  if (!Array.isArray(value) || value.length === 0 || value.length > 12) {
    throw new Error("INVALID_PRACTICE_HINTS");
  }
  return value.map((item) => requiredText(item, "INVALID_PRACTICE_HINTS", 500));
}

function parseRubric(value: unknown) {
  if (!Array.isArray(value) || value.length !== practiceKeys.length) {
    throw new Error("INVALID_PRACTICE_RUBRIC");
  }

  const items = value.map((item) => {
    if (!isRecord(item)) throw new Error("INVALID_PRACTICE_RUBRIC");
    const key = typeof item.key === "string" ? item.key : "";
    const maxScore = typeof item.maxScore === "number" ? item.maxScore : NaN;
    const minScore = typeof item.minScore === "number" ? item.minScore : NaN;
    if (!practiceKeys.includes(key as PracticeKey)) throw new Error("INVALID_PRACTICE_RUBRIC");
    if (!Number.isInteger(maxScore) || maxScore <= 0 || maxScore > 100) throw new Error("INVALID_PRACTICE_RUBRIC");
    if (!Number.isInteger(minScore) || minScore < 0 || minScore > maxScore) throw new Error("INVALID_PRACTICE_RUBRIC");
    return {
      key: key as PracticeKey,
      label: requiredText(item.label, "INVALID_PRACTICE_RUBRIC", 80),
      maxScore,
      minScore,
      example: requiredText(item.example, "INVALID_PRACTICE_RUBRIC", 800)
    };
  });

  if (new Set(items.map((item) => item.key)).size !== practiceKeys.length) {
    throw new Error("INVALID_PRACTICE_RUBRIC");
  }
  if (items.reduce((sum, item) => sum + item.maxScore, 0) !== 100) {
    throw new Error("INVALID_PRACTICE_RUBRIC_TOTAL");
  }
  return items;
}

function parsePassScore(value: unknown) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 100) {
    throw new Error("INVALID_PRACTICE_PASS_SCORE");
  }
  return value;
}

function practiceIdForKnowledge(knowledgeId: string) {
  const suffix = knowledgeId.replace(/^knowledge_/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
  return ("practice_latest_" + suffix).slice(0, 160);
}

async function getKnowledge(knowledgeId: string) {
  const [knowledge] = await getDatabase()
    .select()
    .from(knowledgeItems)
    .where(eq(knowledgeItems.id, knowledgeId))
    .limit(1);
  return knowledge ?? null;
}

export async function getLatestPracticeForKnowledge(knowledgeId: string) {
  const [practice] = await getDatabase()
    .select()
    .from(practices)
    .where(
      and(
        eq(practices.sourceKnowledgeId, knowledgeId),
        eq(practices.type, "LATEST_PRACTICE")
      )
    )
    .limit(1);
  return practice ?? null;
}

export function validatePracticeInput(input: unknown, knowledgeStatus: PublicationStatus) {
  if (!isRecord(input)) throw new Error("INVALID_INPUT");

  const status = parseStatus(input.status);
  if (status === "PUBLISHED" && knowledgeStatus !== "PUBLISHED") {
    throw new Error("KNOWLEDGE_NOT_PUBLISHED");
  }

  const submissionSchema = parsePracticeSubmissionSchema(input.submissionSchema);
  const rubric = parseRubric(input.rubric);
  const passScore = parsePassScore(input.passScore);

  return {
    title: requiredText(input.title, "INVALID_PRACTICE_TITLE", 180),
    goal: requiredText(input.goal, "INVALID_PRACTICE_GOAL", 1200),
    instructions: parseInstructions(input.instructions),
    hints: parseHints(input.hints),
    rubric,
    submissionSchema,
    passScore,
    accessTier: parseAccessTier(input.accessTier),
    status
  };
}

export async function routeKnowledgeToLatestPractice(knowledgeId: string, input: unknown) {
  const knowledge = await getKnowledge(knowledgeId);
  if (!knowledge) throw new Error("KNOWLEDGE_NOT_FOUND");

  const existing = await getLatestPracticeForKnowledge(knowledgeId);
  if (existing) return { item: existing, created: false };

  const values = validatePracticeInput(input, knowledge.status);
  const [created] = await getDatabase()
    .insert(practices)
    .values({
      id: practiceIdForKnowledge(knowledge.id),
      type: "LATEST_PRACTICE",
      accessTier: values.accessTier,
      lessonId: knowledge.lessonId,
      stageId: knowledge.stageId,
      sourceContentId: knowledge.sourceContentId,
      sourceKnowledgeId: knowledge.id,
      title: values.title,
      goal: values.goal,
      instructions: values.instructions,
      hints: values.hints,
      rubric: values.rubric,
      submissionSchema: values.submissionSchema,
      passScore: values.passScore,
      required: false,
      status: values.status,
      updatedAt: new Date()
    })
    .returning();

  revalidateTag("opc-latest-practice");
  return { item: created, created: true };
}

export async function updateLatestPracticeForKnowledge(knowledgeId: string, input: unknown) {
  const knowledge = await getKnowledge(knowledgeId);
  if (!knowledge) throw new Error("KNOWLEDGE_NOT_FOUND");

  const existing = await getLatestPracticeForKnowledge(knowledgeId);
  if (!existing) throw new Error("LATEST_PRACTICE_NOT_FOUND");

  const values = validatePracticeInput(input, knowledge.status);
  const [updated] = await getDatabase()
    .update(practices)
    .set({
      accessTier: values.accessTier,
      lessonId: knowledge.lessonId,
      stageId: knowledge.stageId,
      sourceContentId: knowledge.sourceContentId,
      title: values.title,
      goal: values.goal,
      instructions: values.instructions,
      hints: values.hints,
      rubric: values.rubric,
      submissionSchema: values.submissionSchema,
      passScore: values.passScore,
      status: values.status,
      updatedAt: new Date()
    })
    .where(eq(practices.id, existing.id))
    .returning();

  revalidateTag("opc-latest-practice");
  return updated;
}
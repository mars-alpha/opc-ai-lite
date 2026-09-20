import "server-only";

import { and, eq } from "drizzle-orm";

import { PRACTICE_DRAFT_SKILL_V0_1 } from "../../../skills/practice-draft/v0.1";
import { getDatabase } from "../db";
import {
  knowledgeDeepResources,
  knowledgeItems,
  practiceDrafts
} from "../db/schema";
import {
  getLatestPracticeForKnowledge,
  routeKnowledgeToLatestPractice,
  validatePracticeInput
} from "./admin";

type DraftReviewStatus =
  | "PENDING_REVIEW"
  | "NEEDS_REVISION"
  | "APPROVED"
  | "DISMISSED";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function extractJson(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^\`\`\`(?:json)?\s*([\s\S]*?)\s*\`\`\`$/i);
  const candidate = fenced ? fenced[1] : trimmed;
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("AI_PRACTICE_DRAFT_INVALID_JSON");
    return JSON.parse(candidate.slice(start, end + 1));
  }
}

async function getKnowledge(knowledgeId: string) {
  const [knowledge] = await getDatabase()
    .select()
    .from(knowledgeItems)
    .where(eq(knowledgeItems.id, knowledgeId))
    .limit(1);
  return knowledge ?? null;
}

async function getDeepResource(knowledgeId: string, resourceId: string | null) {
  if (!resourceId) return null;
  const [resource] = await getDatabase()
    .select()
    .from(knowledgeDeepResources)
    .where(
      and(
        eq(knowledgeDeepResources.id, resourceId),
        eq(knowledgeDeepResources.knowledgeId, knowledgeId)
      )
    )
    .limit(1);
  if (!resource) throw new Error("DEEP_RESOURCE_NOT_FOUND");
  if (resource.status !== "PUBLISHED") throw new Error("DEEP_RESOURCE_NOT_PUBLISHED");
  return resource;
}

function ruleDraft(knowledge: Awaited<ReturnType<typeof getKnowledge>>) {
  if (!knowledge) throw new Error("KNOWLEDGE_NOT_FOUND");
  const context = knowledge.body?.trim() || knowledge.summary;
  return {
    title: knowledge.title.replace(/^示例：/, "") + " · 进阶实操",
    goal: "把这条已审核知识转成一个真实场景中的可验证结果，并明确失败条件与人工复核点。",
    instructions: [
      { key: "goal", label: "Goal", prompt: "基于这条 Knowledge，定义这次实操最终要验证的真实结果。" },
      { key: "context", label: "Context", prompt: "说明谁会使用、在哪个真实业务或学习场景中使用。" },
      { key: "input", label: "Input", prompt: "列出完成任务所需的真实输入、样本或资料，并说明如何使用当前 Knowledge。" },
      { key: "constraint", label: "Constraint", prompt: "写出至少一个失败条件、边界限制或必须保留的人工检查点。" },
      { key: "output", label: "Output", prompt: "定义最终要提交的可检查结果，并给出可判断是否完成的证据。" }
    ],
    hints: [
      "不要从工具功能开始，先定义真实结果。",
      "把 Knowledge 当作依据，不要机械复述原文。",
      "参考材料摘要：" + context.slice(0, 220)
    ],
    rubric: [
      { key: "goal", label: "Goal", maxScore: 20, minScore: 12, example: "目标具体，并能判断是否达成。" },
      { key: "context", label: "Context", maxScore: 20, minScore: 12, example: "真实使用者与场景明确。" },
      { key: "input", label: "Input", maxScore: 20, minScore: 12, example: "输入真实、完整，并能追溯到知识依据。" },
      { key: "constraint", label: "Constraint", maxScore: 20, minScore: 12, example: "至少保留一个失败条件或人工复核点。" },
      { key: "output", label: "Output", maxScore: 20, minScore: 12, example: "输出可提交、可检查、可复现。" }
    ],
    submissionSchema: { kind: "TASK_BRIEF_V1" },
    passScore: 80,
    accessTier: "MEMBER"
  };
}

async function callConfiguredAi(context: unknown) {
  const baseUrl = (process.env.OPC_AI_ANALYSIS_BASE_URL ?? "").trim().replace(/\/$/, "");
  const apiKey = (process.env.OPC_AI_ANALYSIS_API_KEY ?? "").trim();
  const model = (process.env.OPC_AI_ANALYSIS_MODEL ?? "").trim();
  if (!baseUrl || !apiKey || !model) return null;

  const response = await fetch(baseUrl + "/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer " + apiKey
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: PRACTICE_DRAFT_SKILL_V0_1.systemPrompt },
        { role: "user", content: JSON.stringify(context) }
      ]
    }),
    signal: AbortSignal.timeout(30000)
  });

  if (!response.ok) throw new Error("AI_PRACTICE_DRAFT_PROVIDER_FAILED");
  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI_PRACTICE_DRAFT_EMPTY");
  return extractJson(content);
}

function validateDraftPayload(input: unknown, knowledgeStatus: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED") {
  if (!isRecord(input)) throw new Error("INVALID_PRACTICE_DRAFT");
  const { status: _status, ...draft } = validatePracticeInput(
    { ...input, status: "DRAFT" },
    knowledgeStatus
  );
  return draft;
}

export async function getPracticeDraftForKnowledge(knowledgeId: string) {
  const [draft] = await getDatabase()
    .select()
    .from(practiceDrafts)
    .where(eq(practiceDrafts.sourceKnowledgeId, knowledgeId))
    .limit(1);
  return draft ?? null;
}

export async function generatePracticeDraft(
  knowledgeId: string,
  input: { sourceDeepResourceId?: unknown }
) {
  const knowledge = await getKnowledge(knowledgeId);
  if (!knowledge) throw new Error("KNOWLEDGE_NOT_FOUND");
  if (knowledge.status !== "PUBLISHED") throw new Error("KNOWLEDGE_NOT_PUBLISHED");
  if (knowledge.validity === "OUTDATED" || knowledge.validity === "DEPRECATED") {
    throw new Error("KNOWLEDGE_NOT_ACTIVE");
  }

  const resourceId =
    typeof input?.sourceDeepResourceId === "string" && input.sourceDeepResourceId.trim()
      ? input.sourceDeepResourceId.trim()
      : null;
  const deepResource = await getDeepResource(knowledgeId, resourceId);

  const context = {
    skill: { id: PRACTICE_DRAFT_SKILL_V0_1.id, version: PRACTICE_DRAFT_SKILL_V0_1.version },
    knowledge: {
      id: knowledge.id,
      title: knowledge.title,
      summary: knowledge.summary,
      body: knowledge.body,
      category: knowledge.category,
      stageId: knowledge.stageId,
      lessonId: knowledge.lessonId
    },
    deepResource: deepResource
      ? {
          id: deepResource.id,
          title: deepResource.title,
          summary: deepResource.summary,
          resourceRef: deepResource.resourceRef,
          url: deepResource.url
        }
      : null
  };

  let generationMode = "RULE";
  let generationError: string | null = null;
  let candidate: unknown;

  try {
    const ai = await callConfiguredAi(context);
    if (ai) {
      candidate = ai;
      generationMode = "AI";
    } else {
      candidate = ruleDraft(knowledge);
      generationError = "AI_PROVIDER_NOT_CONFIGURED";
    }
  } catch (error) {
    candidate = ruleDraft(knowledge);
    generationError = error instanceof Error ? error.message : "AI_PRACTICE_DRAFT_FAILED";
  }

  const draftPayload = validateDraftPayload(candidate, knowledge.status);
  const db = getDatabase();
  const [existing] = await db
    .select({ id: practiceDrafts.id })
    .from(practiceDrafts)
    .where(eq(practiceDrafts.sourceKnowledgeId, knowledgeId))
    .limit(1);

  if (existing) {
    const [current] = await db
      .select({ status: practiceDrafts.status })
      .from(practiceDrafts)
      .where(eq(practiceDrafts.id, existing.id))
      .limit(1);
    if (current?.status === "APPROVED" || current?.status === "DISMISSED") {
      throw new Error("PRACTICE_DRAFT_FINAL");
    }

    const [updated] = await db
      .update(practiceDrafts)
      .set({
        sourceDeepResourceId: deepResource?.id ?? null,
        generationMode,
        generationError,
        draft: draftPayload,
        status: "PENDING_REVIEW",
        reviewNote: null,
        reviewedBy: null,
        reviewedAt: null,
        resultPracticeId: null,
        updatedAt: new Date()
      })
      .where(eq(practiceDrafts.id, existing.id))
      .returning();
    return { item: updated, created: false };
  }

  const [created] = await db
    .insert(practiceDrafts)
    .values({
      sourceKnowledgeId: knowledgeId,
      sourceDeepResourceId: deepResource?.id ?? null,
      generationMode,
      generationError,
      draft: draftPayload,
      status: "PENDING_REVIEW"
    })
    .returning();

  return { item: created, created: true };
}

export async function updatePracticeDraft(
  knowledgeId: string,
  input: { draft?: unknown; sourceDeepResourceId?: unknown }
) {
  const knowledge = await getKnowledge(knowledgeId);
  if (!knowledge) throw new Error("KNOWLEDGE_NOT_FOUND");
  const existing = await getPracticeDraftForKnowledge(knowledgeId);
  if (!existing) throw new Error("PRACTICE_DRAFT_NOT_FOUND");
  if (existing.status === "APPROVED" || existing.status === "DISMISSED") {
    throw new Error("PRACTICE_DRAFT_FINAL");
  }

  const resourceId =
    typeof input?.sourceDeepResourceId === "string" && input.sourceDeepResourceId.trim()
      ? input.sourceDeepResourceId.trim()
      : null;
  await getDeepResource(knowledgeId, resourceId);
  const draftPayload = validateDraftPayload(input?.draft, knowledge.status);

  const [updated] = await getDatabase()
    .update(practiceDrafts)
    .set({
      sourceDeepResourceId: resourceId,
      draft: draftPayload,
      status: "PENDING_REVIEW",
      reviewNote: null,
      reviewedBy: null,
      reviewedAt: null,
      updatedAt: new Date()
    })
    .where(eq(practiceDrafts.id, existing.id))
    .returning();

  return updated;
}

export async function reviewPracticeDraft(
  knowledgeId: string,
  input: {
    status: "APPROVED" | "NEEDS_REVISION" | "DISMISSED";
    reviewedBy: string;
    reviewNote?: string | null;
  }
) {
  const knowledge = await getKnowledge(knowledgeId);
  if (!knowledge) throw new Error("KNOWLEDGE_NOT_FOUND");
  const existing = await getPracticeDraftForKnowledge(knowledgeId);
  if (!existing) throw new Error("PRACTICE_DRAFT_NOT_FOUND");
  if (existing.status === "APPROVED" || existing.status === "DISMISSED") {
    throw new Error("PRACTICE_DRAFT_FINAL");
  }

  const note = input.reviewNote?.trim().slice(0, 1200) || null;
  let resultPracticeId: string | null = null;

  if (input.status === "APPROVED") {
    if (await getLatestPracticeForKnowledge(knowledgeId)) {
      throw new Error("LATEST_PRACTICE_EXISTS");
    }
    const payload = validateDraftPayload(existing.draft, knowledge.status);
    const result = await routeKnowledgeToLatestPractice(knowledgeId, {
      ...payload,
      status: "DRAFT"
    });
    if (!result.created) throw new Error("LATEST_PRACTICE_EXISTS");
    resultPracticeId = result.item.id;
  }

  const [updated] = await getDatabase()
    .update(practiceDrafts)
    .set({
      status: input.status,
      reviewNote: note,
      reviewedBy: input.reviewedBy,
      reviewedAt: new Date(),
      resultPracticeId,
      updatedAt: new Date()
    })
    .where(eq(practiceDrafts.id, existing.id))
    .returning();

  return updated;
}
import "server-only";

import { createHash } from "crypto";
import { inArray } from "drizzle-orm";
import { CONTENT_ANALYSIS_SKILL_V0_1 } from "../../../skills/content-analysis/v0.1";
import { CONTENT_CANDIDATE_SKILL_V0_1 } from "../../../skills/content-candidate/v0.1";
import { getDatabase } from "../db";
import { aiRuns, contentEvidence } from "../db/schema";

type AiMode = "AI" | "UNAVAILABLE";

type AnalysisResult = {
  title: string;
  summary: string;
  facts: string[];
  doubts: string[];
  evidenceQuotes: string[];
  worthFollowing: boolean;
  reason: string;
};

type CandidateResult = {
  title: string;
  summary: string;
  category: string;
  destination:
    | "DAILY_ITEM"
    | "KNOWLEDGE_CAPSULE"
    | "PRACTICE_CANDIDATE"
    | "COURSE_UPDATE_CANDIDATE"
    | "IGNORE";
  angle: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function extractJson(text: string) {
  const candidate = text.replace(/^\s*```(?:json)?/i, "").replace(/```\s*$/i, "").trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("AI_CONTENT_INVALID_JSON");
  return JSON.parse(candidate.slice(start, end + 1)) as unknown;
}

function configuredProvider() {
  const baseUrl = (process.env.OPC_AI_ANALYSIS_BASE_URL ?? "").trim().replace(/\/$/, "");
  const apiKey = (process.env.OPC_AI_ANALYSIS_API_KEY ?? "").trim();
  const model = (process.env.OPC_AI_ANALYSIS_MODEL ?? "").trim();
  return baseUrl && apiKey && model ? { baseUrl, apiKey, model } : null;
}

async function callAi(systemPrompt: string, input: unknown) {
  const provider = configuredProvider();
  if (!provider) return null;

  const response = await fetch(provider.baseUrl + "/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer " + provider.apiKey
    },
    body: JSON.stringify({
      model: provider.model,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(input) }
      ]
    }),
    signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) throw new Error("AI_CONTENT_PROVIDER_FAILED");
  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI_CONTENT_EMPTY");
  return { provider, raw: extractJson(content) };
}

function stringArray(value: unknown, max = 8) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).slice(0, max);
}

function validateAnalysis(value: unknown): AnalysisResult {
  if (!isRecord(value) || typeof value.title !== "string" || typeof value.summary !== "string" || typeof value.reason !== "string" || typeof value.worthFollowing !== "boolean") {
    throw new Error("AI_CONTENT_INVALID_RESULT");
  }
  return {
    title: value.title.trim(),
    summary: value.summary.trim(),
    facts: stringArray(value.facts),
    doubts: stringArray(value.doubts),
    evidenceQuotes: stringArray(value.evidenceQuotes, 5),
    worthFollowing: value.worthFollowing,
    reason: value.reason.trim()
  };
}

const destinations = new Set([
  "DAILY_ITEM",
  "KNOWLEDGE_CAPSULE",
  "PRACTICE_CANDIDATE",
  "COURSE_UPDATE_CANDIDATE",
  "IGNORE"
]);

function validateCandidates(value: unknown): CandidateResult[] {
  if (!isRecord(value) || !Array.isArray(value.candidates)) throw new Error("AI_CONTENT_INVALID_RESULT");
  return value.candidates.slice(0, 3).map((item) => {
    if (!isRecord(item) || typeof item.title !== "string" || typeof item.summary !== "string" || typeof item.category !== "string" || typeof item.destination !== "string" || typeof item.angle !== "string" || !destinations.has(item.destination)) {
      throw new Error("AI_CONTENT_INVALID_RESULT");
    }
    return item as CandidateResult;
  });
}

async function recordRun(taskType: string, skill: { id: string; version: string }, input: unknown, evidenceIds: string[], provider: { model: string }, rawOutput: unknown) {
  await getDatabase().insert(aiRuns).values({
    taskType,
    modelProvider: "OPENAI_COMPATIBLE",
    model: provider.model,
    skillVersion: skill.version,
    promptVersion: skill.id + "@" + skill.version,
    evidenceIds,
    inputHash: createHash("sha256").update(JSON.stringify(input)).digest("hex"),
    rawOutput,
    validatorResult: { ok: true }
  });
}

export async function analyzeOfficialContent(input: unknown): Promise<{ mode: AiMode; error: string | null; analysis: AnalysisResult | null }> {
  if (!isRecord(input)) throw new Error("INVALID_INPUT");
  const rawText = typeof input.rawText === "string" ? input.rawText.trim() : "";
  if (rawText.length < 20 || rawText.length > 30000) throw new Error("INVALID_RAW_TEXT");
  const context = {
    title: typeof input.title === "string" ? input.title.slice(0, 300) : "",
    originalUrl: typeof input.originalUrl === "string" ? input.originalUrl.slice(0, 2000) : "",
    rawText
  };
  const result = await callAi(CONTENT_ANALYSIS_SKILL_V0_1.systemPrompt, context);
  if (!result) return { mode: "UNAVAILABLE", error: "AI_PROVIDER_NOT_CONFIGURED", analysis: null };
  const analysis = validateAnalysis(result.raw);
  await recordRun("CONTENT_ANALYSIS", CONTENT_ANALYSIS_SKILL_V0_1, context, [], result.provider, analysis);
  return { mode: "AI", error: null, analysis };
}

export async function generateOfficialContentCandidates(input: unknown): Promise<{ mode: AiMode; error: string | null; candidates: CandidateResult[] }> {
  if (!isRecord(input) || !Array.isArray(input.evidenceIds)) throw new Error("INVALID_INPUT");
  const evidenceIds = input.evidenceIds.filter((item): item is string => typeof item === "string").slice(0, 10);
  if (evidenceIds.length === 0) throw new Error("EVIDENCE_REQUIRED");
  const rows = await getDatabase().select().from(contentEvidence).where(inArray(contentEvidence.id, evidenceIds));
  if (rows.length !== evidenceIds.length) throw new Error("EVIDENCE_REQUIRED");
  const context = {
    evidence: rows.map((row) => ({
      id: row.id,
      title: row.title,
      originalUrl: row.originalUrl,
      excerpt: row.excerpt
    }))
  };
  const result = await callAi(CONTENT_CANDIDATE_SKILL_V0_1.systemPrompt, context);
  if (!result) return { mode: "UNAVAILABLE", error: "AI_PROVIDER_NOT_CONFIGURED", candidates: [] };
  const candidates = validateCandidates(result.raw);
  await recordRun("CONTENT_CANDIDATE_GENERATION", CONTENT_CANDIDATE_SKILL_V0_1, context, evidenceIds, result.provider, candidates);
  return { mode: "AI", error: null, candidates };
}

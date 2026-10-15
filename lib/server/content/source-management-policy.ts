import "server-only";

import { eq } from "drizzle-orm";
import { getDatabase } from "../db";
import { contentRadarSnapshots } from "../db/schema";

export const SOURCE_AI_RELEVANCE_POLICY_KEY = "source-ai-relevance-policy-v1";
export const SOURCE_AI_RELEVANCE_POLICY_VERSION = "source-ai-relevance-policy-v2";

export type AiRelevanceTermKind = "INCLUDE" | "EXCLUDE";

export type AiRelevanceTerm = {
  id: string;
  value: string;
  kind: AiRelevanceTermKind;
};

const DEFAULT_TERMS: AiRelevanceTerm[] = [
  ["ai","AI","INCLUDE"],
  ["artificial-intelligence","人工智能","INCLUDE"],
  ["large-model","大模型","INCLUDE"],
  ["agent-cn","智能体","INCLUDE"],
  ["agent","Agent","INCLUDE"],
  ["llm","LLM","INCLUDE"],
  ["mcp","MCP","INCLUDE"],
  ["openai","OpenAI","INCLUDE"],
  ["anthropic","Anthropic","INCLUDE"],
  ["claude","Claude","INCLUDE"],
  ["chatgpt","ChatGPT","INCLUDE"],
  ["gpt","GPT","INCLUDE"],
  ["gemini","Gemini","INCLUDE"],
  ["deepseek","DeepSeek","INCLUDE"],
  ["zhipu","智谱","INCLUDE"],
  ["kimi","Kimi","INCLUDE"],
  ["doubao","豆包","INCLUDE"],
  ["copilot","Copilot","INCLUDE"],
  ["embodied-ai","具身智能","INCLUDE"],
  ["robot","机器人","INCLUDE"],
  ["exclude-air","Air","EXCLUDE"],
  ["exclude-aijing","aijing","EXCLUDE"]
].map(([id,value,kind]) => ({
  id, value, kind: kind as AiRelevanceTermKind
}));

function normalizePolicy(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  if (!Array.isArray(row.terms)) return null;
  const seen = new Set<string>();
  const terms = row.terms.flatMap((item): AiRelevanceTerm[] => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const term = item as Record<string, unknown>;
    const value = typeof term.value === "string" ? term.value.trim() : "";
    if (!value) return [];
    const kind: AiRelevanceTermKind = String(term.kind) === "EXCLUDE" ? "EXCLUDE" : "INCLUDE";
    const dedupeKey = kind + ":" + value.toLowerCase();
    if (seen.has(dedupeKey)) return [];
    seen.add(dedupeKey);
    return [{
      id: typeof term.id === "string" && term.id ? term.id : value.toLowerCase().replace(/\s+/g,"-"),
      value,
      kind
    }];
  });
  return {
    version: SOURCE_AI_RELEVANCE_POLICY_VERSION,
    terms,
    updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : null
  };
}

export async function readSourceAiRelevancePolicy() {
  const [row] = await getDatabase().select().from(contentRadarSnapshots)
    .where(eq(contentRadarSnapshots.key, SOURCE_AI_RELEVANCE_POLICY_KEY)).limit(1);
  return normalizePolicy(row?.payload) ?? {
    version: SOURCE_AI_RELEVANCE_POLICY_VERSION, terms: DEFAULT_TERMS, updatedAt: null
  };
}

export async function saveSourceAiRelevancePolicy(termsInput: unknown) {
  const normalized = normalizePolicy({ terms: termsInput, updatedAt: new Date().toISOString() });
  if (!normalized || normalized.terms.length < 1 || normalized.terms.length > 200) {
    throw new Error("SOURCE_AI_RELEVANCE_POLICY_INVALID");
  }
  const payload = { ...normalized, updatedAt: new Date().toISOString() };
  const db = getDatabase();
  const [existing] = await db.select({ key: contentRadarSnapshots.key }).from(contentRadarSnapshots)
    .where(eq(contentRadarSnapshots.key, SOURCE_AI_RELEVANCE_POLICY_KEY)).limit(1);
  if (existing) {
    await db.update(contentRadarSnapshots).set({ payload, generatedAt: new Date(), updatedAt: new Date() })
      .where(eq(contentRadarSnapshots.key, SOURCE_AI_RELEVANCE_POLICY_KEY));
  } else {
    await db.insert(contentRadarSnapshots).values({
      key: SOURCE_AI_RELEVANCE_POLICY_KEY, payload, generatedAt: new Date(), updatedAt: new Date()
    });
  }
  return payload;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^$()|[\]\\{}]/g, "\\$&");
}

function termMatches(text: string, term: AiRelevanceTerm) {
  if (/^[a-z0-9][a-z0-9+.#-]*$/i.test(term.value)) {
    return new RegExp("(^|[^a-z0-9])" + escapeRegex(term.value) + "([^a-z0-9]|$)", "i").test(text);
  }
  return text.toLowerCase().includes(term.value.toLowerCase());
}

export function testSourceAiRelevance(text: string, terms: AiRelevanceTerm[]) {
  const excluded = terms.filter((term) => term.kind === "EXCLUDE" && termMatches(text, term));
  const matched = terms.filter((term) => term.kind === "INCLUDE" && termMatches(text, term));
  return {
    relevant: matched.length > 0 && excluded.length === 0,
    matched: matched.map((term) => ({ id: term.id, value: term.value, kind: term.kind })),
    excluded: excluded.map((term) => ({ id: term.id, value: term.value }))
  };
}

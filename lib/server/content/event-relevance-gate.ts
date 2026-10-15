import "server-only";

import { eq } from "drizzle-orm";
import {
  callConfiguredChatJson,
  getConfiguredChatModelConfig
} from "../ai/configured-chat";
import { getDatabase } from "../db";
import { contentEventClusters } from "../db/schema";
import type { AiRelationType } from "./discovery-filter";
import { getEventClusterResearchPack } from "./event-clustering";

export type EventRelevanceGate = {
  version: "event-relevance-gate-v1";
  aiRelevant: boolean;
  relationType: AiRelationType;
  reason: string;
  mode: "DETERMINISTIC" | "AI" | "FAIL_SAFE";
  sourceCount: number;
  rawItemCount: number;
  industry: string | null;
  impactTypes: string[];
  evaluatedAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function readClassification(metadata: unknown) {
  if (!isRecord(metadata) || !isRecord(metadata.discoveryFilter)) return null;
  const filter = metadata.discoveryFilter;
  const relationType = typeof filter.relationType === "string" ? filter.relationType as AiRelationType : "UNKNOWN";
  const industry = typeof filter.industry === "string" ? filter.industry : null;
  const impactTypes = Array.isArray(filter.impactTypes)
    ? filter.impactTypes.filter((item): item is string => typeof item === "string")
    : [];
  return { relationType, industry, impactTypes };
}

function validateAiGate(value: unknown) {
  if (!isRecord(value)) throw new Error("EVENT_RELEVANCE_GATE_AI_INVALID");
  const aiRelevant = value.aiRelevant === true;
  const relationType = typeof value.relationType === "string" ? value.relationType : "UNKNOWN";
  const reason = typeof value.reason === "string" ? value.reason.trim() : "";
  const industry = typeof value.industry === "string" && value.industry.trim() ? value.industry.trim() : null;
  const impactTypes = Array.isArray(value.impactTypes)
    ? value.impactTypes.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).slice(0, 8)
    : [];
  const allowed = new Set([
    "CORE_AI", "AI_PRODUCT_APPLICATION", "AI_WORKFLOW_CHANGE", "AI_LABOR_IMPACT",
    "AI_BUSINESS_MODEL_CHANGE", "AI_INDUSTRY_STRUCTURE_CHANGE", "AI_REGULATION", "UNKNOWN", "NONE"
  ]);
  if (!allowed.has(relationType)) throw new Error("EVENT_RELEVANCE_GATE_AI_RELATION_INVALID");
  if (!reason || reason.length > 800) throw new Error("EVENT_RELEVANCE_GATE_AI_REASON_INVALID");
  return { aiRelevant, relationType: relationType as AiRelationType, reason, industry, impactTypes };
}

export async function evaluateEventRelevance(
  eventId: string,
  options: { allowAi?: boolean } = {}
): Promise<EventRelevanceGate | null> {
  const pack = await getEventClusterResearchPack(eventId);
  if (!pack) return null;

  const classifications = pack.rawItems.map((item) => readClassification(item.metadata)).filter(Boolean);
  const explicit = classifications.find((item) => item && item.relationType !== "UNKNOWN" && item.relationType !== "NONE");
  const now = new Date();
  let gate: EventRelevanceGate;

  if (explicit) {
    gate = {
      version: "event-relevance-gate-v1",
      aiRelevant: true,
      relationType: explicit.relationType,
      reason: "EVENT_HAS_EXPLICIT_AI_RELATION",
      mode: "DETERMINISTIC",
      sourceCount: pack.researchPack.sourceCount,
      rawItemCount: pack.researchPack.rawItemCount,
      industry: classifications.find((item) => item?.industry)?.industry ?? null,
      impactTypes: [...new Set(classifications.flatMap((item) => item?.impactTypes ?? []))],
      evaluatedAt: now.toISOString()
    };
  } else {
    const allowAi = options.allowAi !== false;
    const config = allowAi ? getConfiguredChatModelConfig() : null;
    if (!config) {
      gate = {
        version: "event-relevance-gate-v1",
        aiRelevant: false,
        relationType: "UNKNOWN",
        reason: allowAi ? "AI_MODEL_UNAVAILABLE_EVENT_RETAINED" : "AI_RELEVANCE_DEFERRED_FROM_COLLECTION",
        mode: "FAIL_SAFE",
        sourceCount: pack.researchPack.sourceCount,
        rawItemCount: pack.researchPack.rawItemCount,
        industry: null,
        impactTypes: [],
        evaluatedAt: now.toISOString()
      };
    } else {
      try {
        const result = await callConfiguredChatJson(
          {
            systemPrompt:
              "你是 OPC AI Event Relevance Skill。输入是已经机械聚类的事件证据。" +
              "只判断事件本身是否属于 AI 模型、AI 产品/API/开源/研究/政策，或 AI 对业务、岗位、工作流的直接影响。" +
              "泛科技、娱乐、普通商业新闻、仅因为热度高但没有明确 AI 关系的事件应判 false。" +
              "热点指标只能作为 Signal，不能证明事实。不要判断是否值得写文章。" +
              "只返回 JSON：{aiRelevant:boolean,relationType:string,reason:string,industry:string|null,impactTypes:string[]}。",
            userPayload: {
              canonicalTitle: pack.researchPack.canonicalTitle,
              items: pack.rawItems.slice(0, 30).map((item) => ({
                title: item.title,
                excerpt: item.excerpt,
                publishedAt: item.publishedAt,
                sourceId: item.sourceId
              }))
            },
            temperature: 0,
            timeoutMs: 45000
          },
          { config }
        );
        const ai = validateAiGate(result.data);
        gate = {
          version: "event-relevance-gate-v1",
          ...ai,
          sourceCount: pack.researchPack.sourceCount,
          rawItemCount: pack.researchPack.rawItemCount,
          mode: "AI",
          evaluatedAt: now.toISOString()
        };
      } catch {
        gate = {
          version: "event-relevance-gate-v1",
          aiRelevant: false,
          relationType: "UNKNOWN",
          reason: "AI_RELEVANCE_FAILED_EVENT_RETAINED",
          mode: "FAIL_SAFE",
          sourceCount: pack.researchPack.sourceCount,
          rawItemCount: pack.researchPack.rawItemCount,
          industry: null,
          impactTypes: [],
          evaluatedAt: now.toISOString()
        };
      }
    }
  }

  const db = getDatabase();
  const metadata = isRecord(pack.cluster.metadata) ? pack.cluster.metadata : {};
  await db.update(contentEventClusters).set({
    metadata: { ...metadata, relevanceGate: gate },
    updatedAt: now
  }).where(eq(contentEventClusters.id, pack.cluster.id));

  return gate;
}

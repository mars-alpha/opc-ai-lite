import "server-only";

import {
  ENTITY_TYPES,
  type EntityType
} from "../../content/intelligence-policy";
import {
  callConfiguredChatJson,
  getConfiguredChatModelConfig
} from "../ai/configured-chat";
import {
  createTemporaryEntity,
  refreshEntityCoverage,
  resolveKnownEntities
} from "./entity-registry";

type EntityResolutionInput = {
  title: string;
  excerpt?: string | null;
  publishedAt?: string | null;
};

type EntityResolutionCandidate = {
  canonicalName: string;
  entityType: EntityType;
  confidence: number;
  evidenceText: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function validateAiResolution(value: unknown): EntityResolutionCandidate[] {
  if (!isRecord(value) || !Array.isArray(value.entities)) throw new Error("ENTITY_RESOLUTION_INVALID");
  const allowed = new Set<string>(ENTITY_TYPES);
  return value.entities.flatMap((raw) => {
    if (!isRecord(raw)) return [];
    const canonicalName = typeof raw.canonicalName === "string" ? raw.canonicalName.trim() : "";
    const entityType = typeof raw.entityType === "string" ? raw.entityType.trim().toUpperCase() : "";
    const confidence = Number(raw.confidence);
    const evidenceText = typeof raw.evidenceText === "string" ? raw.evidenceText.trim() : "";
    if (
      !canonicalName ||
      canonicalName.length > 160 ||
      !allowed.has(entityType) ||
      !Number.isFinite(confidence) ||
      confidence < 0 ||
      confidence > 100 ||
      !evidenceText
    ) return [];
    return [{
      canonicalName,
      entityType: entityType as EntityType,
      confidence: Math.round(confidence),
      evidenceText: evidenceText.slice(0, 300)
    }];
  }).slice(0, 5);
}

export async function resolveEntitiesForContent(
  input: EntityResolutionInput,
  options: { allowAi?: boolean } = {}
) {
  const known = await resolveKnownEntities(input);
  if (known.length || options.allowAi === false) {
    return {
      mode: "REGISTRY" as const,
      entities: known,
      createdTemporaryEntityIds: [] as string[]
    };
  }

  const config = getConfiguredChatModelConfig();
  if (!config) {
    return {
      mode: "REGISTRY_ONLY" as const,
      entities: known,
      createdTemporaryEntityIds: [] as string[]
    };
  }

  try {
    const response = await callConfiguredChatJson(
      {
        systemPrompt:
          "你是 OPC AI Entity Resolution Skill。只抽取输入文本中明确出现或能由同一句上下文明确解析的 AI 公司、模型、产品、API、研究机构、人物、项目。" +
          "不要把 latest model、new model、the model 之类上下文不足的指代猜成具体实体；无法确定时不要输出。" +
          "不得创造不存在的实体。entityType 只能是 COMPANY|MODEL|PRODUCT|API|RESEARCH_ORG|PERSON|PROJECT。" +
          "只返回 JSON：{entities:[{canonicalName:string,entityType:string,confidence:0-100,evidenceText:string}]}。",
        userPayload: {
          title: input.title,
          excerpt: input.excerpt ?? null,
          publishedAt: input.publishedAt ?? null
        },
        temperature: 0,
        timeoutMs: 45000
      },
      { config }
    );

    const candidates = validateAiResolution(response.data).filter((item) => item.confidence >= 90);
    const createdTemporaryEntityIds: string[] = [];
    for (const candidate of candidates) {
      const temporary = await createTemporaryEntity({
        canonicalName: candidate.canonicalName,
        entityType: candidate.entityType,
        firstSeenAt: input.publishedAt ? new Date(input.publishedAt) : undefined
      });
      createdTemporaryEntityIds.push(temporary.id);
      await refreshEntityCoverage(temporary.id);
    }

    const resolved = await resolveKnownEntities(input);
    return {
      mode: candidates.length ? "AI_RESOLUTION" as const : "AI_NO_MATCH" as const,
      entities: resolved,
      createdTemporaryEntityIds
    };
  } catch {
    return {
      mode: "FAIL_SAFE" as const,
      entities: known,
      createdTemporaryEntityIds: [] as string[]
    };
  }
}

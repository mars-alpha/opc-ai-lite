import "server-only";

import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import {
  callConfiguredChatJson,
  getConfiguredChatModelConfig
} from "../ai/configured-chat";
import { getDatabase } from "../db";
import { aiRuns } from "../db/schema";
import {
  AI_DAILY_EXPANSION_OUTPUT_SECTION_KEYS,
  type AiDailyExpansionOutputSectionKey,
  type EventExpansionDailyOutput
} from "./event-expansion-output";

export const AI_DAILY_EXPANSION_SYNTHESIS_SCHEMA_VERSION = "event-expansion-synthesis-v1";
export const EVENT_EXPANSION_OUTPUT_SKILL_VERSION = "event-expansion-output-synthesis-skill-v1";
export const EVENT_EXPANSION_OUTPUT_PROMPT_VERSION = "event-expansion-output-synthesis-prompt-v2";

export type EventExpansionSynthesisItem = {
  text: string;
  evidenceRawItemIds: string[];
};

export type EventExpansionSynthesisSection = {
  key: AiDailyExpansionOutputSectionKey;
  items: EventExpansionSynthesisItem[];
};

export type EventExpansionSynthesis = {
  schemaVersion: typeof AI_DAILY_EXPANSION_SYNTHESIS_SCHEMA_VERSION;
  eventId: string;
  sections: EventExpansionSynthesisSection[];
  warnings: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function requiredText(value: unknown, code: string, max: number) {
  if (typeof value !== "string") throw new Error("EVENT_EXPANSION_SYNTHESIS_INVALID:" + code);
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized || normalized.length > max) {
    throw new Error("EVENT_EXPANSION_SYNTHESIS_INVALID:" + code);
  }
  return normalized;
}

function stringList(value: unknown, code: string, maxItems: number, maxLength: number) {
  if (!Array.isArray(value)) throw new Error("EVENT_EXPANSION_SYNTHESIS_INVALID:" + code);
  const items = value.map((item) => requiredText(item, code, maxLength));
  const unique = [...new Set(items)];
  if (unique.length > maxItems) throw new Error("EVENT_EXPANSION_SYNTHESIS_INVALID:" + code);
  return unique;
}

function protectedNumericTokens(value: string) {
  const matches = value.normalize("NFKC").match(/[A-Za-z\u3400-\u9fff]*\d+(?:[._:/-]\d+)*(?:%|％)?/g) ?? [];
  return [...new Set(matches.map((item) => item.toLocaleLowerCase()))];
}

function sourceSupportText(
  section: EventExpansionDailyOutput["sections"][number],
  evidenceRawItemIds: string[],
  output: EventExpansionDailyOutput
) {
  const byId = new Map(section.items.map((item) => [item.rawItemId, item]));
  const evidenceText = evidenceRawItemIds.flatMap((rawItemId) => {
    const item = byId.get(rawItemId);
    if (!item) return [];
    return [item.title, item.excerpt ?? ""];
  });
  if (section.key === "WHAT_HAPPENED") {
    evidenceText.unshift(output.eventTitle, output.eventSummary ?? "");
  }
  return evidenceText.join(" ").normalize("NFKC").toLocaleLowerCase();
}

function assertNoUnsupportedNumbers(
  text: string,
  evidenceRawItemIds: string[],
  section: EventExpansionDailyOutput["sections"][number],
  output: EventExpansionDailyOutput
) {
  const support = sourceSupportText(section, evidenceRawItemIds, output);
  for (const token of protectedNumericTokens(text)) {
    if (!support.includes(token)) {
      throw new Error("EVENT_EXPANSION_SYNTHESIS_UNSUPPORTED_NUMBER:" + token);
    }
  }
}

function assertPresentationSafe(text: string) {
  if (/https?:\/\//i.test(text)) throw new Error("EVENT_EXPANSION_SYNTHESIS_FREEFORM_URL_FORBIDDEN");
  if (/rawItemId|rankScore|referenceOnly|deterministic|validator|authorityPolicy|expansionType/i.test(text)) {
    throw new Error("EVENT_EXPANSION_SYNTHESIS_INTERNAL_FIELD_LEAK");
  }
}

export function validateEventExpansionSynthesis(
  value: unknown,
  output: EventExpansionDailyOutput
): EventExpansionSynthesis {
  if (!isRecord(value)) throw new Error("EVENT_EXPANSION_SYNTHESIS_INVALID");
  if (value.schemaVersion !== AI_DAILY_EXPANSION_SYNTHESIS_SCHEMA_VERSION) {
    throw new Error("EVENT_EXPANSION_SYNTHESIS_SCHEMA_VERSION_MISMATCH");
  }
  if (value.eventId !== output.eventId) {
    throw new Error("EVENT_EXPANSION_SYNTHESIS_EVENT_MISMATCH");
  }
  if (!Array.isArray(value.sections) || value.sections.length !== output.sections.length) {
    throw new Error("EVENT_EXPANSION_SYNTHESIS_SECTION_COUNT");
  }

  const globallyUsedEvidence = new Set<string>();
  const sections = value.sections.map((sectionValue, index) => {
    if (!isRecord(sectionValue)) throw new Error("EVENT_EXPANSION_SYNTHESIS_INVALID:SECTION");
    const sourceSection = output.sections[index]!;
    const expectedKey = AI_DAILY_EXPANSION_OUTPUT_SECTION_KEYS[index]!;
    if (sectionValue.key !== expectedKey || sourceSection.key !== expectedKey) {
      throw new Error("EVENT_EXPANSION_SYNTHESIS_SECTION_ORDER");
    }
    if (!Array.isArray(sectionValue.items) || sectionValue.items.length > 1) {
      throw new Error("EVENT_EXPANSION_SYNTHESIS_SECTION_ITEM_LIMIT:" + expectedKey);
    }
    if (sourceSection.status === "EMPTY" && sectionValue.items.length > 0) {
      throw new Error("EVENT_EXPANSION_SYNTHESIS_EMPTY_SECTION_MUST_STAY_EMPTY:" + expectedKey);
    }

    const allowed = new Set(sourceSection.items.map((item) => item.rawItemId));
    const items = sectionValue.items.map((itemValue) => {
      if (!isRecord(itemValue)) throw new Error("EVENT_EXPANSION_SYNTHESIS_INVALID:ITEM");
      const text = requiredText(itemValue.text, "ITEM_TEXT", 600);
      assertPresentationSafe(text);
      const evidenceRawItemIds = stringList(
        itemValue.evidenceRawItemIds,
        "ITEM_EVIDENCE_IDS",
        2,
        160
      );
      if (evidenceRawItemIds.length === 0) {
        throw new Error("EVENT_EXPANSION_SYNTHESIS_EVIDENCE_REQUIRED");
      }
      for (const rawItemId of evidenceRawItemIds) {
        if (!allowed.has(rawItemId)) {
          throw new Error("EVENT_EXPANSION_SYNTHESIS_UNKNOWN_EVIDENCE:" + rawItemId);
        }
        if (globallyUsedEvidence.has(rawItemId)) {
          throw new Error("EVENT_EXPANSION_SYNTHESIS_DUPLICATE_EVIDENCE:" + rawItemId);
        }
      }
      assertNoUnsupportedNumbers(text, evidenceRawItemIds, sourceSection, output);
      evidenceRawItemIds.forEach((rawItemId) => globallyUsedEvidence.add(rawItemId));
      return { text, evidenceRawItemIds };
    });

    return { key: expectedKey, items };
  });

  const warnings = stringList(value.warnings, "WARNINGS", 12, 300);
  return {
    schemaVersion: AI_DAILY_EXPANSION_SYNTHESIS_SCHEMA_VERSION,
    eventId: output.eventId,
    sections,
    warnings
  };
}

export function buildEventExpansionSynthesisPrompt(output: EventExpansionDailyOutput) {
  return {
    systemPrompt:
      "你是 OPC AI 日报的 Event Expansion Output Synthesis Skill。你的唯一职责是把系统已经分栏的证据压缩成简洁中文，不得改变事实层，不得补充模型常识，不得联网，不得新增数字、版本号、价格、比例或结论。" +
      "WHAT_HAPPENED 只能使用 FACT 证据；其余栏目只能使用本栏目 REFERENCE_ONLY 证据。空栏目必须返回空数组，宁可为空也不能凑数。" +
      "每个栏目最多输出 1 条简洁表达，可在这一条中引用本栏最多 2 条 Evidence；不要把同一证据拆成多条重复表达。每条输出都必须提供 evidenceRawItemIds，且只能引用该栏目输入中真实存在的 rawItemId。不要在 text 中输出 URL、rawItemId、rankScore、referenceOnly、deterministic、validator、authorityPolicy、expansionType 等内部字段。" +
      "只返回 JSON，不要 Markdown，不要额外字段。结构：" +
      "{schemaVersion:'event-expansion-synthesis-v1',eventId:string,sections:[{key:'WHAT_HAPPENED'|'HOW_TO_EXPERIENCE'|'HOW_TO_LEARN'|'HOW_TO_USE'|'WORK_IMPACT'|'WHY_SHARE',items:[{text:string,evidenceRawItemIds:string[]}]}],warnings:string[]}。",
    userPayload: {
      eventId: output.eventId,
      eventTitle: output.eventTitle,
      eventSummary: output.eventSummary,
      sections: output.sections.map((section) => ({
        key: section.key,
        label: section.label,
        status: section.status,
        authorityPolicy: section.authorityPolicy,
        evidence: section.items.map((item) => ({
          rawItemId: item.rawItemId,
          sourceName: item.sourceName,
          title: item.title,
          excerpt: item.excerpt,
          publishedAt: item.publishedAt,
          expansionType: item.expansionType,
          mediaType: item.mediaType,
          language: item.language
        }))
      }))
    }
  };
}

function hashInput(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 1200) : "UNKNOWN_ERROR";
}

export function eventExpansionOutputModelConfigured() {
  return Boolean(getConfiguredChatModelConfig());
}

export async function runEventExpansionOutputSynthesis(output: EventExpansionDailyOutput) {
  const config = getConfiguredChatModelConfig();
  if (!config) throw new Error("AI_ANALYSIS_NOT_CONFIGURED");

  const prompt = buildEventExpansionSynthesisPrompt(output);
  const evidenceIds = output.sections.flatMap((section) =>
    section.items.map((item) => item.rawItemId)
  );
  const db = getDatabase();
  const [run] = await db
    .insert(aiRuns)
    .values({
      taskType: "EVENT_EXPANSION_OUTPUT_SYNTHESIS",
      modelProvider: config.provider,
      model: config.model,
      skillVersion: EVENT_EXPANSION_OUTPUT_SKILL_VERSION,
      promptVersion: EVENT_EXPANSION_OUTPUT_PROMPT_VERSION,
      rulePackVersions: ["event-expansion-output-v1"],
      contextIds: [output.eventId],
      evidenceIds,
      inputHash: hashInput({
        skillVersion: EVENT_EXPANSION_OUTPUT_SKILL_VERSION,
        promptVersion: EVENT_EXPANSION_OUTPUT_PROMPT_VERSION,
        output
      }),
      status: "RUNNING"
    })
    .returning();

  try {
    const result = await callConfiguredChatJson(
      {
        systemPrompt: prompt.systemPrompt,
        userPayload: prompt.userPayload,
        temperature: 0.1,
        timeoutMs: 45000
      },
      { config }
    );
    const validated = validateEventExpansionSynthesis(result.data, output);
    await db
      .update(aiRuns)
      .set({
        status: "SUCCEEDED",
        rawOutput: result.data,
        validatorResult: {
          valid: true,
          schemaVersion: AI_DAILY_EXPANSION_SYNTHESIS_SCHEMA_VERSION,
          skillVersion: EVENT_EXPANSION_OUTPUT_SKILL_VERSION,
          promptVersion: EVENT_EXPANSION_OUTPUT_PROMPT_VERSION
        },
        completedAt: new Date()
      })
      .where(eq(aiRuns.id, run.id));
    return { output: validated, aiRunId: run.id, config };
  } catch (error) {
    await db
      .update(aiRuns)
      .set({
        status: "FAILED",
        errorCode: "EVENT_EXPANSION_OUTPUT_SYNTHESIS_FAILED",
        errorMessage: errorMessage(error),
        validatorResult: { valid: false },
        completedAt: new Date()
      })
      .where(eq(aiRuns.id, run.id));
    throw error;
  }
}

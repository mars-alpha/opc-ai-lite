import "server-only";

import {
  callConfiguredChatJson,
  getConfiguredChatModelConfig
} from "../ai/configured-chat";
import { CORE_ENTITY_SEEDS } from "../../content/intelligence-policy";

type ReviewLocalizationItem = {
  title: string;
  excerpt?: string | null;
  metadata?: Record<string, unknown>;
};

type ReviewLocalizationDependencies = {
  translateBatch?: (items: Array<{ index: number; title: string; excerpt: string | null }>) => Promise<unknown>;
  disableAi?: boolean;
};

type ReviewTranslation = {
  originalTitle: string;
  originalExcerpt: string | null;
  displayTitleZh: string | null;
  displayExcerptZh: string | null;
  originalLanguage: "ZH" | "EN_OR_OTHER";
  translationStatus: "SOURCE_ZH" | "TRANSLATED" | "UNAVAILABLE";
};

const PROTECTED_TOKEN_PATTERN =
  /https?:\/\/[^\s]+|\b(?:v?\d+(?:\.\d+){1,4}|\d+(?:\.\d+)?%|\d{4}-\d{1,2}-\d{1,2})\b/gi;

export function protectedLocalizationTokens(value: string) {
  return [...new Set((value.match(PROTECTED_TOKEN_PATTERN) ?? []).map((item) => item.toLocaleLowerCase()))].sort();
}

export function localizationPreservesProtectedTokens(source: string, localized: string) {
  const expected = protectedLocalizationTokens(source);
  const actual = new Set(protectedLocalizationTokens(localized));
  return expected.every((token) => actual.has(token));
}

function normalizedEntityTerms(seed: (typeof CORE_ENTITY_SEEDS)[number]) {
  return [seed.canonicalName, seed.displayNameZh, ...seed.aliases]
    .filter((value): value is string => typeof value === "string" && value.trim().length >= 2)
    .map((value) => value.normalize("NFKC").trim().toLocaleLowerCase());
}

export function knownEntityIdsInText(value: string) {
  const text = value.normalize("NFKC").toLocaleLowerCase();
  return CORE_ENTITY_SEEDS.flatMap((seed) => normalizedEntityTerms(seed).some((term) => {
    if (/^[a-z0-9_.+\- ]+$/i.test(term)) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp("(^|[^a-z0-9])" + escaped + "([^a-z0-9]|$)", "i").test(text);
    }
    return text.includes(term);
  }) ? [seed.entityId] : []);
}

export function localizationIdentityGuard(input: { sourceTitle: string; sourceExcerpt: string | null; titleZh: string; excerptZh: string | null }) {
  const allowed = new Set(knownEntityIdsInText([input.sourceTitle, input.sourceExcerpt ?? ""].join("\n")));
  const titleEntities = knownEntityIdsInText(input.titleZh);
  const excerptEntities = knownEntityIdsInText(input.excerptZh ?? "");
  const unsupportedTitleEntityIds = titleEntities.filter((id) => !allowed.has(id));
  const unsupportedExcerptEntityIds = excerptEntities.filter((id) => !allowed.has(id));
  return {
    pass: unsupportedTitleEntityIds.length === 0 && unsupportedExcerptEntityIds.length === 0,
    unsupportedTitleEntityIds,
    unsupportedExcerptEntityIds
  };
}

export function compactAnswerFirstSummary(value: string, maxChars = 180) {
  const text = value.trim().replace(/\s*\n+\s*/g, " ");
  if (text.length <= maxChars) return text;
  const sentences = text.match(/[^。！？!?]+[。！？!?]?/gu) ?? [text];
  let result = "";
  for (const sentence of sentences) {
    if ((result + sentence).length > maxChars) break;
    result += sentence;
    if (result.length >= 70) break;
  }
  if (result.length >= 45) return result.trim();
  return text.slice(0, maxChars - 1).replace(/[，；：、,;:\s]+$/u, "") + "…";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function looksChinese(value: string) {
  const chinese = (value.match(/[㐀-鿿]/g) ?? []).length;
  const letters = (value.match(/[A-Za-z㐀-鿿]/g) ?? []).length;
  return letters > 0 && chinese / letters >= 0.35;
}

function baseTranslation(item: ReviewLocalizationItem): ReviewTranslation {
  const sourceZh = looksChinese([item.title, item.excerpt ?? ""].join(" "));
  return {
    originalTitle: item.title,
    originalExcerpt: item.excerpt ?? null,
    displayTitleZh: sourceZh ? item.title : null,
    displayExcerptZh: sourceZh ? item.excerpt ?? null : null,
    originalLanguage: sourceZh ? "ZH" : "EN_OR_OTHER",
    translationStatus: sourceZh ? "SOURCE_ZH" : "UNAVAILABLE"
  };
}

function validateTranslationResponse(value: unknown) {
  if (!isRecord(value) || !Array.isArray(value.items)) throw new Error("REVIEW_LOCALIZATION_INVALID");
  return value.items.flatMap((raw) => {
    if (!isRecord(raw)) return [];
    const index = Number(raw.index);
    const titleZh = typeof raw.titleZh === "string" ? raw.titleZh.trim() : "";
    const excerptZh = typeof raw.excerptZh === "string" ? raw.excerptZh.trim() : "";
    if (!Number.isInteger(index) || index < 0 || !titleZh) return [];
    return [{ index, titleZh: titleZh.slice(0, 500), excerptZh: excerptZh ? excerptZh.slice(0, 12000) : null }];
  });
}

export async function localizeCollectedItemsForChineseReview<T extends ReviewLocalizationItem>(
  items: T[],
  dependencies: ReviewLocalizationDependencies = {}
): Promise<T[]> {
  const prepared = items.map((item) => ({
    ...item,
    metadata: {
      ...(item.metadata ?? {}),
      reviewLocalization: baseTranslation(item)
    }
  }));

  const pending = prepared.flatMap((item, index) => {
    const review = (item.metadata?.reviewLocalization ?? {}) as ReviewTranslation;
    return review.translationStatus === "SOURCE_ZH"
      ? []
      : [{ index, title: item.title, excerpt: item.excerpt ?? null }];
  });
  const config = dependencies.disableAi ? null : getConfiguredChatModelConfig();
  if (!pending.length || (!config && !dependencies.translateBatch)) return prepared;

  const translated = new Map<number, { titleZh: string; excerptZh: string | null }>();
  try {
    for (let offset = 0; offset < pending.length; offset += 30) {
      const batch = pending.slice(offset, offset + 30);
      const data = dependencies.translateBatch
        ? await dependencies.translateBatch(batch)
        : (await callConfiguredChatJson(
            {
              systemPrompt:
                "你是 OPC AI 的中文资讯写作层。只基于输入的标题和摘要生成：1）准确、自然的简体中文标题；2）答案先行的简体中文摘要。" +
                "摘要第一句先说明发生了什么/结论是什么，再补充关键数字、限制或影响；最多3句，不写‘本文介绍’‘报道称’等空话。" +
                "不得增加原文没有的公司、模型、人物、产品、数字、日期、版本或结论；不得用来源网站所属公司替代新闻主体。" +
                "必须保留产品名、模型名、公司名和常用专业缩写，例如 ChatGPT、Claude、Gemini、Llama、MCP、RAG、API、Agent。" +
                "数字、日期、版本号、专有名词必须与原文一致。只返回 JSON：{items:[{index:number,titleZh:string,excerptZh:string|null}]}。",
              userPayload: { items: batch },
              temperature: 0,
              timeoutMs: 45000
            },
            { config: config! }
          )).data;
      for (const item of validateTranslationResponse(data)) {
        const source = batch.find((candidate) => candidate.index === item.index);
        if (!source) continue;
        if (!localizationPreservesProtectedTokens(source.title, item.titleZh)) continue;
        if (
          source.excerpt &&
          item.excerptZh &&
          !localizationPreservesProtectedTokens(source.excerpt, item.excerptZh)
        ) continue;
        const excerptZh = item.excerptZh ? compactAnswerFirstSummary(item.excerptZh) : null;
        const identity = localizationIdentityGuard({ sourceTitle: source.title, sourceExcerpt: source.excerpt, titleZh: item.titleZh, excerptZh });
        if (!identity.pass) continue;
        translated.set(item.index, { titleZh: item.titleZh, excerptZh });
      }
    }
  } catch {
    return prepared;
  }

  return prepared.map((item, index) => {
    const current = (item.metadata?.reviewLocalization ?? {}) as ReviewTranslation;
    const localized = translated.get(index);
    if (!localized) return item;
    return {
      ...item,
      metadata: {
        ...(item.metadata ?? {}),
        reviewLocalization: {
          ...current,
          displayTitleZh: localized.titleZh,
          displayExcerptZh: localized.excerptZh,
          translationStatus: "TRANSLATED"
        } satisfies ReviewTranslation
      }
    };
  });
}

export function readReviewLocalization(metadata: unknown): ReviewTranslation | null {
  if (!isRecord(metadata) || !isRecord(metadata.reviewLocalization)) return null;
  const value = metadata.reviewLocalization;
  const originalTitle = typeof value.originalTitle === "string" ? value.originalTitle : "";
  if (!originalTitle) return null;
  return {
    originalTitle,
    originalExcerpt: typeof value.originalExcerpt === "string" ? value.originalExcerpt : null,
    displayTitleZh: typeof value.displayTitleZh === "string" ? value.displayTitleZh : null,
    displayExcerptZh: typeof value.displayExcerptZh === "string" ? value.displayExcerptZh : null,
    originalLanguage: value.originalLanguage === "ZH" ? "ZH" : "EN_OR_OTHER",
    translationStatus:
      value.translationStatus === "SOURCE_ZH" || value.translationStatus === "TRANSLATED"
        ? value.translationStatus
        : "UNAVAILABLE"
  };
}

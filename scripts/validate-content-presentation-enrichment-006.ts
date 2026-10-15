import fs from "node:fs";
import {
  buildContentPresentationEnrichment,
  CONTENT_PRESENTATION_ENRICHMENT_VERSION
} from "../lib/server/content/presentation-enrichment";
import {
  localizationPreservesProtectedTokens,
  protectedLocalizationTokens
} from "../lib/server/content/review-localization";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("CONTENT_PRESENTATION_ENRICHMENT_006_FAILED:" + code);
  console.log(code + "=PASS");
}

assert(CONTENT_PRESENTATION_ENRICHMENT_VERSION === "content-presentation-enrichment-v3-content-understanding", "VERSION");

const originalUrl = "https://github.com/openai/example/releases/tag/v5.6";
const translated = buildContentPresentationEnrichment({
  eventTitle: "OpenAI releases GPT-5.6 API",
  eventSummary: "Developers can use the new API.",
  representativeRaw: {
    title: "OpenAI releases GPT-5.6 API",
    excerpt: "Developers can use the new API.",
    originalUrl,
    metadata: {
      reviewLocalization: {
        originalTitle: "OpenAI releases GPT-5.6 API",
        originalExcerpt: "Developers can use the new API.",
        displayTitleZh: "OpenAI 发布 GPT-5.6 API",
        displayExcerptZh: "开发者现在可以使用新的 API。",
        originalLanguage: "EN_OR_OTHER",
        translationStatus: "TRANSLATED"
      }
    }
  },
  whyItMatters: "这会影响开发者接入方式。"
});

assert(translated.originalTitle === "OpenAI releases GPT-5.6 API", "ORIGINAL_TITLE_PRESERVED");
assert(translated.originalUrl === originalUrl, "ORIGINAL_URL_PRESERVED");
assert(translated.displayTitleZh === "OpenAI 发布 GPT-5.6 API", "DISPLAY_TITLE_ZH");
assert(translated.displaySummaryZh === "开发者现在可以使用新的 API。", "DISPLAY_SUMMARY_ZH");
assert(translated.whyItMattersZh === "这会影响开发者接入方式。", "WHY_IT_MATTERS_REUSED");
assert(translated.authority === "PRESENTATION_ONLY", "PRESENTATION_AUTHORITY");

const fallback = buildContentPresentationEnrichment({
  eventTitle: "Original English event",
  eventSummary: "Original summary",
  representativeRaw: {
    title: "Original English event",
    excerpt: "Original summary",
    originalUrl: "https://example.com/original",
    metadata: {}
  },
  whyItMatters: null
});
assert(fallback.displayTitleZh === fallback.originalTitle, "TITLE_FAIL_SOFT");
assert(fallback.displaySummaryZh === fallback.originalSummary, "SUMMARY_FAIL_SOFT");
assert(fallback.whyItMattersZh === null, "WHY_FAIL_SOFT");

assert(
  protectedLocalizationTokens("GPT-5.6 ships on 2026-10-12 with 25% uplift").includes("5.6"),
  "PROTECTED_VERSION_EXTRACTED"
);
assert(
  localizationPreservesProtectedTokens(
    "GPT-5.6 improves 25% on 2026-10-12",
    "GPT-5.6 在 2026-10-12 提升 25%"
  ),
  "PROTECTED_TOKENS_ACCEPTED"
);
assert(
  !localizationPreservesProtectedTokens(
    "GPT-5.6 improves 25%",
    "GPT-5.7 提升 30%"
  ),
  "PROTECTED_TOKENS_REJECT_CHANGED"
);

const discovery = fs.readFileSync("lib/server/content/discovery.ts", "utf8");
assert(
  discovery.includes("title: result.item.title") &&
  discovery.includes("summary: result.item.excerpt"),
  "EVENT_SEED_USES_ORIGINAL_RAW"
);
assert(
  !discovery.includes("title: displayTitleZh") &&
  !discovery.includes("summary: displayExcerptZh"),
  "PRESENTATION_NOT_EVENT_IDENTITY"
);

const readModel = fs.readFileSync("lib/server/content/intelligence-read-model.ts", "utf8");
assert(readModel.includes("buildContentPresentationEnrichment"), "RADAR_READ_MODEL_INTEGRATED");
assert(readModel.includes("presentation,"), "RADAR_PRESENTATION_FIELD");
assert(readModel.includes("originalUrl: representative.originalUrl"), "RADAR_ORIGINAL_URL_UNCHANGED");

const analysis = fs.readFileSync("lib/server/content/event-ai-analysis.ts", "utf8");
assert(!analysis.includes("CONTENT_PRESENTATION_ENRICHMENT_VERSION"), "DEEP_ANALYSIS_SEPARATE_OWNER");

console.log("CONTENT_PRESENTATION_ENRICHMENT_006=PASS");

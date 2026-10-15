import {
  evaluateDiscoveryKeywordPolicy,
  normalizeDiscoveryKeywordPolicy
} from "../lib/server/content/discovery-keyword-policy";
import {
  buildDeepReadRequest,
  preferredDeepReadBackend,
  validateDeepReadResult
} from "../lib/server/content/deep-read-contract";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("DISCOVERY_REFERENCE_GAPS_FAILED:" + code);
  console.log(code + "=PASS");
}

const policy = normalizeDiscoveryKeywordPolicy({
  mustIncludeAny: ["AI", "大模型"],
  mustIncludeAll: ["OpenAI"],
  excludeAny: ["招聘", "门票"]
});
assert(Boolean(policy), "KEYWORD_POLICY_NORMALIZES");

const pass = evaluateDiscoveryKeywordPolicy(
  ["OpenAI 发布新的 AI 模型能力", "面向开发者的大模型更新"],
  policy
);
assert(pass.passed && pass.reason === "KEYWORD_POLICY_PASS", "KEYWORD_POLICY_PASS");

const excluded = evaluateDiscoveryKeywordPolicy(
  ["OpenAI AI 峰会门票开售"],
  policy
);
assert(!excluded.passed && excluded.reason === "EXCLUDED_KEYWORD", "KEYWORD_POLICY_EXCLUDE_WINS");

const missingRequired = evaluateDiscoveryKeywordPolicy(
  ["Anthropic 发布新的 AI 模型"],
  policy
);
assert(!missingRequired.passed && missingRequired.reason === "MISSING_REQUIRED_ALL", "KEYWORD_POLICY_REQUIRED_ALL");

const request = buildDeepReadRequest({
  url: "https://example.com/ai/article",
  purpose: "RESEARCH_EVIDENCE",
  allowedHosts: ["example.com"],
  javascriptRequired: true
});
assert(request.maxResponseBytes <= 4 * 1024 * 1024, "DEEP_READ_RESPONSE_BOUNDED");
assert(request.maxMarkdownChars <= 200_000, "DEEP_READ_MARKDOWN_BOUNDED");
assert(preferredDeepReadBackend({
  acquisitionKind: "STATIC_PAGE",
  javascriptRequired: true,
  crawl4aiConfigured: true
}) === "CRAWL4AI_OPTIONAL", "DEEP_READ_CRAWL4AI_OPTIONAL_ONLY_WHEN_CONFIGURED");
assert(preferredDeepReadBackend({
  acquisitionKind: "RSS_ATOM",
  javascriptRequired: false,
  crawl4aiConfigured: false
}) === "SOURCE_ACQUISITION", "DEEP_READ_SOURCE_ACQUISITION");
assert(preferredDeepReadBackend({
  acquisitionKind: "JINA_READER",
  javascriptRequired: false,
  crawl4aiConfigured: false
}) === "JINA_READER", "DEEP_READ_JINA_EXPLICIT");
let javascriptBackendRequired = false;
try {
  preferredDeepReadBackend({
    acquisitionKind: "STATIC_PAGE",
    javascriptRequired: true,
    crawl4aiConfigured: false
  });
} catch (error) {
  javascriptBackendRequired =
    error instanceof Error && error.message === "DEEP_READ_JAVASCRIPT_BACKEND_REQUIRED";
}
assert(javascriptBackendRequired, "DEEP_READ_NO_HTTP_FALLBACK");

const result = validateDeepReadResult(request, {
  backend: "CRAWL4AI_OPTIONAL",
  originalUrl: request.url,
  canonicalUrl: request.url,
  title: "AI article",
  publishedAt: null,
  markdown: "# AI article\n\nEvidence.",
  extractedAt: new Date().toISOString(),
  metadata: {
    sourceAuthorityInherited: true,
    authorityUpgrade: false,
    longTermMediaStorage: false
  }
});
assert(result.metadata.authorityUpgrade === false, "DEEP_READ_NO_AUTHORITY_PROMOTION");
assert(result.metadata.longTermMediaStorage === false, "DEEP_READ_NO_MEDIA_STORAGE");

let blockedHost = false;
try {
  buildDeepReadRequest({
    url: "https://evil.example.net/article",
    purpose: "FACT_ENRICHMENT",
    allowedHosts: ["example.com"]
  });
} catch (error) {
  blockedHost = error instanceof Error && error.message === "DEEP_READ_HOST_NOT_ALLOWED";
}
assert(blockedHost, "DEEP_READ_HOST_FAIL_CLOSED");

console.log("DISCOVERY_REFERENCE_GAPS_CONTRACT=PASS");

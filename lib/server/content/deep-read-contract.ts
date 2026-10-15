import "server-only";

export const DEEP_READ_PURPOSES = [
  "FACT_ENRICHMENT",
  "RESEARCH_EVIDENCE",
  "PRACTICAL_REFERENCE"
] as const;
export type DeepReadPurpose = (typeof DEEP_READ_PURPOSES)[number];

export const DEEP_READ_BACKENDS = [
  "SOURCE_ACQUISITION",
  "JINA_READER",
  "CRAWL4AI_OPTIONAL"
] as const;
export type DeepReadBackend = (typeof DEEP_READ_BACKENDS)[number];

export type DeepReadRequest = {
  url: string;
  purpose: DeepReadPurpose;
  allowedHosts: string[];
  maxResponseBytes: number;
  maxMarkdownChars: number;
  javascriptRequired: boolean;
};

export type DeepReadResult = {
  backend: DeepReadBackend;
  originalUrl: string;
  canonicalUrl: string | null;
  title: string | null;
  publishedAt: string | null;
  markdown: string;
  extractedAt: string;
  metadata: {
    sourceAuthorityInherited: true;
    authorityUpgrade: false;
    longTermMediaStorage: false;
  };
};

const DEFAULT_MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const DEFAULT_MAX_MARKDOWN_CHARS = 120_000;

function safeHost(url: string) {
  try {
    return new URL(url).hostname.toLocaleLowerCase();
  } catch {
    return "";
  }
}

export function buildDeepReadRequest(input: {
  url: string;
  purpose: DeepReadPurpose;
  allowedHosts: string[];
  javascriptRequired?: boolean;
  maxResponseBytes?: number;
  maxMarkdownChars?: number;
}): DeepReadRequest {
  const host = safeHost(input.url);
  const allowedHosts = [...new Set(input.allowedHosts.map((item) => item.trim().toLocaleLowerCase()).filter(Boolean))];
  if (!host || !allowedHosts.some((allowed) => host === allowed || host.endsWith("." + allowed))) {
    throw new Error("DEEP_READ_HOST_NOT_ALLOWED");
  }
  return {
    url: input.url,
    purpose: input.purpose,
    allowedHosts,
    maxResponseBytes: Math.max(64 * 1024, Math.min(4 * 1024 * 1024, input.maxResponseBytes ?? DEFAULT_MAX_RESPONSE_BYTES)),
    maxMarkdownChars: Math.max(4_000, Math.min(200_000, input.maxMarkdownChars ?? DEFAULT_MAX_MARKDOWN_CHARS)),
    javascriptRequired: input.javascriptRequired === true
  };
}

export function preferredDeepReadBackend(input: {
  acquisitionKind: string;
  javascriptRequired: boolean;
  crawl4aiConfigured: boolean;
}): DeepReadBackend {
  if (input.acquisitionKind === "JINA_READER") return "JINA_READER";
  if (input.javascriptRequired) {
    if (input.crawl4aiConfigured) return "CRAWL4AI_OPTIONAL";
    throw new Error("DEEP_READ_JAVASCRIPT_BACKEND_REQUIRED");
  }
  if (
    [
      "RSS_ATOM",
      "PUBLIC_JSON_API",
      "PUBLIC_GENERATED_FEED",
      "STATIC_PAGE",
      "PLATFORM_API",
      "MEDIA_TRANSCRIPT"
    ].includes(input.acquisitionKind)
  ) {
    return "SOURCE_ACQUISITION";
  }
  throw new Error("DEEP_READ_ACQUISITION_ROUTE_REQUIRED");
}

export function validateDeepReadResult(
  request: DeepReadRequest,
  result: DeepReadResult
) {
  if (!DEEP_READ_BACKENDS.includes(result.backend)) throw new Error("DEEP_READ_BACKEND_INVALID");
  if (result.originalUrl !== request.url) throw new Error("DEEP_READ_ORIGINAL_URL_MISMATCH");
  if (!result.markdown.trim()) throw new Error("DEEP_READ_EMPTY_MARKDOWN");
  if (result.markdown.length > request.maxMarkdownChars) throw new Error("DEEP_READ_MARKDOWN_TOO_LARGE");
  if (result.metadata.sourceAuthorityInherited !== true) throw new Error("DEEP_READ_AUTHORITY_INHERITANCE_REQUIRED");
  if (result.metadata.authorityUpgrade !== false) throw new Error("DEEP_READ_AUTHORITY_UPGRADE_FORBIDDEN");
  if (result.metadata.longTermMediaStorage !== false) throw new Error("DEEP_READ_MEDIA_STORAGE_FORBIDDEN");
  const canonicalHost = result.canonicalUrl ? safeHost(result.canonicalUrl) : safeHost(result.originalUrl);
  if (!request.allowedHosts.some((allowed) => canonicalHost === allowed || canonicalHost.endsWith("." + allowed))) {
    throw new Error("DEEP_READ_CANONICAL_HOST_NOT_ALLOWED");
  }
  return result;
}

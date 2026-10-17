import "server-only";
import {publicSourceArticleAlias} from "../../../services/overseas-collector-relay/public-source-routes";
import {readSourceAiRelevancePolicy} from "./source-management-policy";
import { isPublicFeedRelayUrl, collectPublicSourceDocumentThroughRelay, isPublicSourceRelayEnabled, collectDeepMindFeedThroughRelay } from "./overseas-collector-relay-client";
import {readHttpValidators,documentHttpValidators} from "../../../services/overseas-collector-relay/conditional-http";
import {fixedWatchlistFeedUrl} from "../../../services/overseas-collector-relay/watchlist-feeds";
import {collectWatchlistFeedThroughRelay,collectGithubReleasePageThroughRelay} from "./overseas-collector-relay-client";
import { assessCollectionItemQuality, selectBackfillWindow } from "./collection-item-quality";

import { createHash } from "node:crypto";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import type { AuthUser } from "../auth/service";
import { getDatabase } from "../db";
import {
  contentCollectionRuns,
  contentEventRawItems,
  contentRawItems,
  contentSources
} from "../db/schema";
import { and, eq, inArray, lt, sql } from "drizzle-orm";
import { canonicalizeOriginalUrl, ingestRawItem, runFreshScan } from "./discovery";
import { assertCollectorReferenceOnly, COLLECTOR_MEDIA_POLICY } from "./discovery-contract";
import { buildSearchDiscoveryUrl, collectSearchDiscovery, resolveSearchDiscoveryConfig } from "./search-discovery";
import {
  filterCheapDiscoveryCandidates,
  filterDiscoveryCandidates
} from "./discovery-filter";
import { runEventClustering } from "./event-clustering";
import { evaluateEventRelevance } from "./event-relevance-gate";
import {
  buildTrendDiscoveryPrimaryUrl,
  collectTrendDiscovery,
  resolveTrendDiscoveryConfig
} from "./trend-discovery";
import { calculateEventClusterSignals } from "./event-signal";
import {
  normalizeCollectionProvenance,
  provenanceMetadata
} from "../../content/collection-provenance-contract";
import {
  inferCollectionContentType,
  resolveSourcePolicy,
  sourceContentRule,
  sourceFreshnessHours
} from "./source-policy";
import { resolveEntitiesForContent } from "./entity-resolution";
import { resolveKnownEntities, syncCoreEntityRegistry } from "./entity-registry";
import { classifyIntelligenceEvent, evaluateEventPolicy } from "./event-policy";
import {
  evaluateDeterministicQualityGate,
  evaluatePollutionGate
} from "./pollution-syndication-gate";
import {
  buildQualificationCheckpoint,
  qualificationPreviewPolicyForSource,
  refreshSourceRuntimeQualification,
  SOURCE_COLLECTION_RUNTIME_CONTRACT_VERSION,
  validateQualificationPreviewTarget
} from "./source-qualification-runtime";
import { normalizeDiscoveryKeywordPolicy } from "./discovery-keyword-policy";
import {
  resolveSourceAcquisitionPlan,
  type SourceAcquisitionRoute
} from "./source-acquisition-plan";
import {
  collectSourceRuntimeAdapter,
  collectAiHotDocument,
  collectGithubReleaseDocument,
  AIHOT_SNAPSHOT_URL,
  hasSourceRuntimeAdapter
} from "./source-acquisition-runtime-adapters";

export const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 12_000;
const MAX_REDIRECTS = 3;
const USER_AGENT = "OPC-AI-Collector/1.0 (+https://opcai.fun)";
const TRANSIENT_FETCH_RETRY_DELAYS_MS = [250, 750] as const;

export const STALE_COLLECTION_RUN_MINUTES = 15;

export async function recoverStaleCollectionRuns(now = new Date()) {
  const db = getDatabase();
  const cutoff = new Date(now.getTime() - STALE_COLLECTION_RUN_MINUTES * 60_000);
  const staleRuns = await db
    .select()
    .from(contentCollectionRuns)
    .where(and(
      eq(contentCollectionRuns.status, "RUNNING"),
      lt(contentCollectionRuns.startedAt, cutoff)
    ))
    .limit(200);

  if (!staleRuns.length) {
    return { recovered: 0, sourceIds: [] as string[] };
  }

  const recoveredAt = new Date();
  const productionSourceIds = new Set<string>();

  for (const run of staleRuns) {
    const metadata =
      run.metadata && typeof run.metadata === "object" && !Array.isArray(run.metadata)
        ? run.metadata as Record<string, unknown>
        : {};
    const qualificationOnly = metadata.qualificationOnly === true;

    await db.update(contentCollectionRuns).set({
      status: "FAILED",
      errorCode: "COLLECTION_STALE_RUN_RECOVERED",
      errorMessage: "RUNNING collection exceeded the stale-run threshold and was recovered by the next server-native cycle.",
      finishedAt: recoveredAt,
      metadata: {
        ...metadata,
        staleRunRecovery: {
          version: "collection-stale-run-recovery-v1",
          recoveredAt: recoveredAt.toISOString(),
          cutoffAt: cutoff.toISOString(),
          thresholdMinutes: STALE_COLLECTION_RUN_MINUTES,
          excludeFromRuntimeQualification: true
        }
      }
    }).where(eq(contentCollectionRuns.id, run.id));

    if (!qualificationOnly && run.sourceId) {
      productionSourceIds.add(run.sourceId);
    }
  }

  return {
    recovered: staleRuns.length,
    sourceIds: [...productionSourceIds]
  };
}

const REJECTED_SAMPLE_CAPTURE_VERSION = "ai-rejected-sample-capture-v1";
const MAX_REJECTED_SAMPLES_PER_RUN = 100;

type RejectedSampleAudit = {
  stage:
    | "DISCOVERY_FILTER"
    | "SOURCE_POLICY"
    | "DETERMINISTIC_QUALITY_GATE"
    | "POLLUTION_GATE";
  sourceId: string;
  sourceName: string;
  platform: string;
  collectionMethod: string;
  externalId: string | null;
  originalUrl: string | null;
  title: string;
  excerpt: string | null;
  publishedAt: string | null;
  relationType: string;
  reason: string;
  metadataSnapshot: Record<string, unknown>;
};

function boundedText(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

function safeRejectedMetadataSnapshot(metadata: Record<string, unknown> | undefined) {
  if (!metadata) return {};
  const allowed = [
    "collector",
    "trendProvider",
    "trendSignalType",
    "trendRank",
    "sourceRole",
    "rankingObservedNow",
    "contentType",
    "windowHours",
    "searchQuery",
    "proxyDefinition"
  ] as const;
  return Object.fromEntries(
    allowed.flatMap((key) => metadata[key] === undefined ? [] : [[key, metadata[key]]])
  );
}

function rejectedSampleAudit(input: {
  stage: RejectedSampleAudit["stage"];
  item: NormalizedCollectedItem;
  sourceId: string;
  sourceName: string;
  platform: string;
  collectionMethod: string;
  relationType: string;
  reason: string;
}): RejectedSampleAudit {
  return {
    stage: input.stage,
    sourceId: input.sourceId,
    sourceName: input.sourceName.slice(0, 240),
    platform: input.platform.slice(0, 80),
    collectionMethod: input.collectionMethod.slice(0, 80),
    externalId: boundedText(input.item.externalId, 240),
    originalUrl: boundedText(input.item.originalUrl, 1200),
    title: input.item.title.slice(0, 500),
    excerpt: boundedText(input.item.excerpt, 1000),
    publishedAt: boundedText(input.item.publishedAt, 80),
    relationType: input.relationType.slice(0, 80),
    reason: input.reason.slice(0, 240),
    metadataSnapshot: safeRejectedMetadataSnapshot(input.item.metadata)
  };
}

export type NormalizedCollectedItem = {
  externalId?: string | null;
  originalUrl?: string | null;
  title: string;
  author?: string | null;
  excerpt?: string | null;
  publishedAt?: string | null;
  platformMetrics?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

function errorCode(error: unknown) {
  if (error instanceof Error && /^[A-Z0-9_:-]+$/.test(error.message)) return error.message;
  return "COLLECTION_FAILED";
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 1500);
  return String(error).slice(0, 1500);
}

function isPrivateIpv4(ip: string) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isPrivateIpv6(ip: string) {
  const value = ip.toLowerCase();
  if (value === "::" || value === "::1") return true;
  if (value.startsWith("fc") || value.startsWith("fd")) return true;
  if (/^fe[89ab]/.test(value)) return true;
  if (value.startsWith("::ffff:")) {
    const mapped = value.slice("::ffff:".length);
    if (isIP(mapped) === 4) return isPrivateIpv4(mapped);
  }
  return false;
}

function configuredInternalServiceOrigins() {
  return new Set(
    (process.env.COLLECTION_INTERNAL_SERVICE_ORIGINS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .flatMap((value) => {
        try {
          const url = new URL(value);
          if (url.protocol !== "http:" && url.protocol !== "https:") return [];
          if (url.username || url.password) return [];
          return [url.origin.toLowerCase()];
        } catch {
          return [];
        }
      })
  );
}

function isConfiguredInternalService(url: URL) {
  return configuredInternalServiceOrigins().has(url.origin.toLowerCase());
}

export async function assertPublicHttpUrl(input: string) {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error("COLLECTION_URL_INVALID");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("COLLECTION_URL_PROTOCOL_BLOCKED");
  if (url.username || url.password) throw new Error("COLLECTION_URL_CREDENTIALS_BLOCKED");
  if (isConfiguredInternalService(url)) return url;

  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
    throw new Error("COLLECTION_URL_PRIVATE_BLOCKED");
  }

  const literalKind = isIP(hostname);
  if (literalKind === 4 && isPrivateIpv4(hostname)) throw new Error("COLLECTION_URL_PRIVATE_BLOCKED");
  if (literalKind === 6 && isPrivateIpv6(hostname)) throw new Error("COLLECTION_URL_PRIVATE_BLOCKED");

  if (literalKind === 0) {
    let records: Array<{ address: string; family: number }>;
    try {
      records = await lookup(hostname, { all: true, verbatim: true });
    } catch {
      throw new Error("COLLECTION_DNS_FAILED");
    }
    if (records.length === 0) throw new Error("COLLECTION_DNS_FAILED");
    for (const record of records) {
      if (
        (record.family === 4 && isPrivateIpv4(record.address)) ||
        (record.family === 6 && isPrivateIpv6(record.address))
      ) {
        throw new Error("COLLECTION_URL_PRIVATE_BLOCKED");
      }
    }
  }
  return url;
}

async function readLimitedBody(response: Response) {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new Error("COLLECTION_RESPONSE_TOO_LARGE");
    }
    chunks.push(value);
  }
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder("utf-8").decode(merged);
}

function transientFetchErrorCode(error: unknown) {
  const cause =
    error && typeof error === "object" && "cause" in error
      ? (error as { cause?: { code?: unknown } }).cause
      : undefined;
  const code = typeof cause?.code === "string" ? cause.code : "";
  if (
    code === "UND_ERR_CONNECT_TIMEOUT" ||
    code === "ETIMEDOUT" ||
    code === "ECONNREFUSED" ||
    code === "ENETUNREACH" ||
    code === "ECONNRESET" ||
    code === "UND_ERR_SOCKET" ||
    code === "EAI_AGAIN" ||
    (error instanceof Error && error.name === "TimeoutError")
  ) {
    return "COLLECTION_NETWORK_UNREACHABLE";
  }
  return null;
}

export type FeedValidators = { etag?: string | null; lastModified?: string | null };
type PublicTextDocument = { finalUrl: string; contentType: string; body: string; status: number; etag?: string | null; lastModified?: string | null };

async function fetchWithTransientRetry(current: URL, accept: string, signal?: AbortSignal, validators?: FeedValidators) {
  for (let attempt = 0; attempt <= TRANSIENT_FETCH_RETRY_DELAYS_MS.length; attempt += 1) {
    signal?.throwIfAborted();
    try {
      return await fetch(current, {
        redirect: "manual",
        headers: {
          "user-agent": USER_AGENT,
          accept,
          ...(validators?.etag ? { "if-none-match": validators.etag } : {}),
          ...(validators?.lastModified ? { "if-modified-since": validators.lastModified } : {})
        },
        signal: signal ? AbortSignal.any([signal,AbortSignal.timeout(FETCH_TIMEOUT_MS)]) : AbortSignal.timeout(FETCH_TIMEOUT_MS)
      });
    } catch (error) {
      signal?.throwIfAborted();
      const transientCode = transientFetchErrorCode(error);
      if (!transientCode) throw new Error("COLLECTION_NETWORK_FAILED");
      if (attempt >= TRANSIENT_FETCH_RETRY_DELAYS_MS.length) {
        throw new Error(transientCode);
      }
      await new Promise((resolve) => setTimeout(resolve, TRANSIENT_FETCH_RETRY_DELAYS_MS[attempt]));
    }
  }
  throw new Error("COLLECTION_NETWORK_UNREACHABLE");
}

export async function fetchPublicText(input: string, accept = "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html;q=0.9, */*;q=0.5", signal?: AbortSignal, validators?: FeedValidators): Promise<PublicTextDocument> {
  signal?.throwIfAborted();
  if(fixedWatchlistFeedUrl(input))return collectWatchlistFeedThroughRelay(input,signal,validators);
  if (isPublicFeedRelayUrl(input)) return collectPublicSourceDocumentThroughRelay(input,signal,validators);
  if (input === "https://deepmind.google/blog/rss.xml" && isPublicSourceRelayEnabled()) return collectDeepMindFeedThroughRelay(signal,validators);
  let current = await assertPublicHttpUrl(input);
  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const response = await fetchWithTransientRetry(current, accept, signal, redirectCount === 0 ? validators : undefined);

    if(response.status===304 && (redirectCount!==0 || !validators || !validators.etag && !validators.lastModified))throw new Error("COLLECTION_UNEXPECTED_NOT_MODIFIED");
    if (response.status === 304) {
      return { finalUrl: current.toString(), contentType: response.headers.get("content-type") ?? "", body: "", status: 304, etag: response.headers.get("etag"), lastModified: response.headers.get("last-modified") };
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("COLLECTION_REDIRECT_INVALID");
      if (redirectCount >= MAX_REDIRECTS) throw new Error("COLLECTION_REDIRECT_LIMIT");
      current = await assertPublicHttpUrl(new URL(location, current).toString());
      continue;
    }

    if (!response.ok) throw new Error("COLLECTION_HTTP_" + response.status);
    const length = Number(response.headers.get("content-length") ?? "0");
    if (Number.isFinite(length) && length > MAX_RESPONSE_BYTES) throw new Error("COLLECTION_RESPONSE_TOO_LARGE");

    return {
      finalUrl: current.toString(),
      contentType: response.headers.get("content-type") ?? "",
      body: await readLimitedBody(response),
      status: response.status,
      etag: response.headers.get("etag"),
      lastModified: response.headers.get("last-modified")
    };
  }
  throw new Error("COLLECTION_REDIRECT_LIMIT");
}

export async function fetchPublicJson(input: string) {
  const fetched = await fetchPublicText(input, "application/json, application/vnd.github+json, */*;q=0.5");
  try {
    return JSON.parse(fetched.body) as unknown;
  } catch {
    throw new Error("COLLECTION_JSON_INVALID");
  }
}

function decodeEntities(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

function cleanText(value: string, max = 12_000) {
  return decodeEntities(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function tagValue(block: string, tags: string[]) {
  for (const tag of tags) {
    const escaped = tag.replace(":", "\\:");
    const match = block.match(new RegExp("<" + escaped + "\\b[^>]*>([\\s\\S]*?)<\\/" + escaped + ">", "i"));
    if (match?.[1]) return cleanText(match[1]);
  }
  return "";
}

function atomLink(block: string) {
  const preferred =
    block.match(/<link\b[^>]*rel=["']?alternate["']?[^>]*href=["']([^"']+)["'][^>]*>/i) ??
    block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/i);
  return preferred?.[1]?.trim() ?? "";
}

function resolveUrl(value: string, base: string) {
  if (!value) return null;
  try {
    return new URL(value, base).toString();
  } catch {
    return null;
  }
}

function normalizeDate(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function feedStructure(body: string) {
  return body.replace(/<!\[CDATA\[[\s\S]*?\]\]>|<!--[\s\S]*?-->|<\?[\s\S]*?\?>/g, value => " ".repeat(value.length));
}

export function parseFeedDocument(body: string, feedUrl: string): NormalizedCollectedItem[] {
  // Locate real element boundaries in masked XML, then recover original content.
  const structure = feedStructure(body);
  const blocksFor = (pattern: RegExp) => [...structure.matchAll(pattern)].map(match => {
    const start = match.index! + match[0].indexOf(">") + 1;
    return body.slice(start, match.index! + match[0].lastIndexOf("</"));
  });
  const rssItems = blocksFor(/<item\b[^>]*>[\s\S]*?<\/item>/gi);
  const atomEntries = blocksFor(/<entry\b[^>]*>[\s\S]*?<\/entry>/gi);
  const blocks = rssItems.length > 0 ? rssItems : atomEntries;

  return blocks.slice(0, 100).flatMap((block) => {
    const title = tagValue(block, ["title"]);
    if (!title) return [];
    const rssLink = tagValue(block, ["link"]);
    const resolvedLink = resolveUrl(rssLink || atomLink(block), feedUrl);
    const link = resolvedLink ? publicSourceArticleAlias(resolvedLink)??resolvedLink : null;
    const externalId = tagValue(block, ["guid", "id"]) || link;
    const author = tagValue(block, ["dc:creator", "author", "name"]) || null;
    const publishedAt = normalizeDate(tagValue(block, ["pubDate", "published", "updated", "dc:date"]));
    const excerpt = tagValue(block, ["content:encoded", "content", "description", "summary"]) || null;
    return [{
      externalId,
      originalUrl: link,
      title,
      author,
      excerpt,
      publishedAt,
      platformMetrics: {},
      metadata: { collector: "feed", feedUrl, collectionQuality: assessCollectionItemQuality({ title, excerpt, author, originalUrl: link, publishedAt }) }
    }];
  });
}

function sitemapTitle(url: URL) {
  const segment = url.pathname.split("/").filter(Boolean).pop() ?? url.hostname;
  try {
    return decodeURIComponent(segment).replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim() || url.hostname;
  } catch {
    return segment.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim() || url.hostname;
  }
}

export function parseSitemapDocument(
  body: string,
  sitemapUrl: string,
  scopeUrl?: string | null
): NormalizedCollectedItem[] {
  const sitemap = new URL(sitemapUrl);
  const scope = scopeUrl ? new URL(scopeUrl) : sitemap;
  const scopePath = scope.pathname === "/" ? "/" : scope.pathname.replace(/\/+$/, "");
  const blocks = [...body.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/gi)].map((match) => match[1]);

  return blocks
    .flatMap((block) => {
      const loc = tagValue(block, ["loc"]);
      if (!loc) return [];
      let url: URL;
      try {
        url = new URL(loc, sitemapUrl);
      } catch {
        return [];
      }
      if (url.hostname.toLowerCase() !== scope.hostname.toLowerCase()) return [];
      if (scopePath !== "/" && !(url.pathname === scopePath || url.pathname.startsWith(scopePath + "/"))) return [];
      const publishedAt = normalizeDate(tagValue(block, ["lastmod"]));
      return [{
        externalId: url.toString(),
        originalUrl: url.toString(),
        title: sitemapTitle(url),
        author: null,
        excerpt: null,
        publishedAt,
        platformMetrics: {},
        metadata: {
          collector: "sitemap",
          sitemapUrl,
          discoveryOnly: true,
          factualSource: false,
          referenceOnly: true
        }
      }];
    })
    .sort((a, b) => (b.publishedAt ? Date.parse(b.publishedAt) : 0) - (a.publishedAt ? Date.parse(a.publishedAt) : 0))
    .slice(0, 100);
}

function parseSitemapIndexUrls(body: string, sitemapUrl: string) {
  const parent = new URL(sitemapUrl);
  return [...body.matchAll(/<sitemap\b[^>]*>([\s\S]*?)<\/sitemap>/gi)]
    .flatMap((match) => {
      const loc = tagValue(match[1], ["loc"]);
      if (!loc) return [];
      try {
        const url = new URL(loc, sitemapUrl);
        return url.hostname.toLowerCase() === parent.hostname.toLowerCase() ? [url.toString()] : [];
      } catch {
        return [];
      }
    })
    .slice(0, 5);
}

export async function collectSitemap(url: string, scopeUrl?: string | null, signal?: AbortSignal) {
  const fetched = await fetchPublicText(url, "application/xml, text/xml, */*;q=0.5",signal);
  const direct = parseSitemapDocument(fetched.body, fetched.finalUrl, scopeUrl);
  if (direct.length) return direct;

  const childUrls = parseSitemapIndexUrls(fetched.body, fetched.finalUrl);
  if (!childUrls.length) throw new Error("SITEMAP_NO_URLS");
  const batches = await Promise.all(childUrls.map(async (child) => {
    try {
      const nested = await fetchPublicText(child, "application/xml, text/xml, */*;q=0.5",signal);
      return parseSitemapDocument(nested.body, nested.finalUrl, scopeUrl);
    } catch {
      return [];
    }
  }));
  const byUrl = new Map<string, NormalizedCollectedItem>();
  for (const item of batches.flat()) {
    if (item.originalUrl && !byUrl.has(item.originalUrl)) byUrl.set(item.originalUrl, item);
  }
  const items = [...byUrl.values()]
    .sort((a, b) => (b.publishedAt ? Date.parse(b.publishedAt) : 0) - (a.publishedAt ? Date.parse(a.publishedAt) : 0))
    .slice(0, 100);
  if (!items.length) throw new Error("SITEMAP_NO_URLS");
  return items;
}

function metaContent(html: string, names: string[]) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const key =
      tag.match(/(?:name|property)=["']([^"']+)["']/i)?.[1]?.toLowerCase() ??
      tag.match(/(?:name|property)=([^\s>]+)/i)?.[1]?.toLowerCase();
    if (!key || !names.map((name) => name.toLowerCase()).includes(key)) continue;
    return decodeEntities(tag.match(/content=["']([\s\S]*?)["']/i)?.[1] ?? "").trim();
  }
  return "";
}

export function parseHtmlDocument(html: string, finalUrl: string, metadata: Record<string, unknown> = {}): NormalizedCollectedItem[] {
  const title =
    metaContent(html, ["og:title", "twitter:title"]) ||
    cleanText(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "", 500);
  if (!title) throw new Error("COLLECTION_PAGE_TITLE_MISSING");

  const excerpt =
    metaContent(html, ["description", "og:description", "twitter:description"]) ||
    cleanText(html.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? "", 4000) ||
    null;
  const author = metaContent(html, ["author", "article:author"]) || null;
  const publishedAt = normalizeDate(
    metaContent(html, ["article:published_time", "date", "datepublished"]) ||
      html.match(/<time\b[^>]*datetime=["']([^"']+)["']/i)?.[1] ||
      ""
  );
  const canonical = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)?.[1];
  const originalUrl = resolveUrl(canonical ?? finalUrl, finalUrl) ?? finalUrl;

  return [{
    externalId: originalUrl,
    originalUrl,
    title,
    author,
    excerpt,
    publishedAt,
    platformMetrics: {},
    metadata
  }];
}

export async function collectRssDocument(url: string, options: { signal?: AbortSignal; validators?: FeedValidators; fetchText?: (url: string, validators?: FeedValidators) => Promise<PublicTextDocument> } = {}) {
  const viaRelay = url === "https://deepmind.google/blog/rss.xml" && isPublicSourceRelayEnabled();
  const fetched: PublicTextDocument = options.fetchText ? await options.fetchText(url, options.validators) : await fetchPublicText(url,undefined,options.signal,options.validators);
  const validators=documentHttpValidators(fetched,url,options.validators);
  if (fetched.status === 304) {
    if (!options.validators?.etag && !options.validators?.lastModified) throw new Error("RSS_UNEXPECTED_NOT_MODIFIED");
    return { items: [] as NormalizedCollectedItem[], validators, disposition: "NOT_MODIFIED" as const };
  }
  // Inspect XML structure only. CDATA article examples and inert publisher PIs
  // are never executed, expanded or counted as feed items/declarations.
  const structure=feedStructure(fetched.body);
  if (/<!\[CDATA\[|\]\]>|<!--|<\?|<!DOCTYPE|<!ENTITY/i.test(structure) || !/^\s*<(?:rss|feed|rdf:RDF)\b/i.test(structure) || !/(?:<\/(?:rss|feed|rdf:RDF)>|<feed\b[^>]*\/>)\s*$/i.test(structure)) throw new Error("RSS_DOCUMENT_INVALID");
  const items = parseFeedDocument(fetched.body, fetched.finalUrl);
  // An empty valid feed is a successful poll, not a reason to invoke fallback.
  const blockCount = [...structure.matchAll(/<(?:item|entry)\b/gi)].length;
  const closedBlockCount = [...structure.matchAll(/<\/(?:item|entry)\s*>/gi)].length;
  if(blockCount !== closedBlockCount) throw new Error("RSS_DOCUMENT_INVALID");
  if (blockCount > 0 && items.length === 0) throw new Error("RSS_DOCUMENT_INVALID");
  return { validators, truncated: blockCount > 100 || items.length < Math.min(blockCount,100), disposition: items.length ? "FETCHED" as const : "NO_NEW_ITEMS" as const, items: items.map((item) => ({
    ...item,
    metadata: { ...(item.metadata ?? {}), contentType: fetched.contentType, statusCode: fetched.status, acquisitionTransport: viaRelay || isPublicFeedRelayUrl(url) || fixedWatchlistFeedUrl(url) ? "DENO_RELAY" : "DIRECT" }
  })) };
}

export async function collectRss(url: string, signal?: AbortSignal) {
  return (await collectRssDocument(url, { signal })).items;
}

export async function collectHttpPage(url: string) {
  const fetched = await fetchPublicText(url);
  const looksLikeFeed =
    /(?:application|text)\/(?:rss\+xml|atom\+xml|xml)/i.test(fetched.contentType) ||
    /^\s*<\?xml[\s\S]*<(?:rss|feed)\b/i.test(fetched.body) ||
    /^\s*<(?:rss|feed)\b/i.test(fetched.body);
  if (looksLikeFeed) {
    const items = parseFeedDocument(fetched.body, fetched.finalUrl);
    if (items.length > 0) return items;
  }
  return parseHtmlDocument(fetched.body, fetched.finalUrl, {
    collector: "http",
    contentType: fetched.contentType,
    statusCode: fetched.status
  });
}

export async function collectJinaReader(url: string) {
  const original = await assertPublicHttpUrl(url);
  const jinaUrl = "https://r.jina.ai/" + original.toString();
  const fetched = await fetchPublicText(
    jinaUrl,
    "text/markdown, text/plain;q=0.9, */*;q=0.5"
  );
  const body = fetched.body.trim();
  if (!body) throw new Error("COLLECTION_JINA_EMPTY");
  const title =
    body.match(/^#\s+(.+)$/m)?.[1]?.trim() ??
    body.match(/^Title:\s*(.+)$/mi)?.[1]?.trim() ??
    original.hostname;
  const excerpt =
    body
      .replace(/^Title:.*$/gmi, "")
      .replace(/^URL Source:.*$/gmi, "")
      .replace(/^Markdown Content:.*$/gmi, "")
      .replace(/^#+\s+/gm, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 4000) || null;
  return [{
    externalId: original.toString(),
    originalUrl: original.toString(),
    title,
    author: null,
    excerpt,
    publishedAt: null,
    platformMetrics: {},
    metadata: {
      collector: "jina_reader",
      jinaUrl,
      contentType: fetched.contentType,
      statusCode: fetched.status
    }
  }];
}

export async function runSourceCollection(
  user: AuthUser,
  sourceId: string,
  input: {
    provenance?: unknown;
    qualificationOnly?: boolean;
    backfillWindow?: { from: string; to: string };
  } = {},
  collectorOverride?: (method: string, url: string) => Promise<NormalizedCollectedItem[]>
) {
  if (input.backfillWindow) {
    const from = Date.parse(input.backfillWindow.from), to = Date.parse(input.backfillWindow.to);
    if (!Number.isFinite(from) || !Number.isFinite(to) || from >= to || to - from > 168 * 3_600_000 || to > Date.now())
      throw new Error("COLLECTION_BACKFILL_WINDOW_INVALID");
  }
  const db = getDatabase();
  const [source] = await db.select().from(contentSources).where(eq(contentSources.id, sourceId)).limit(1);
  if (!source) throw new Error("DISCOVERY_SOURCE_NOT_FOUND");
  if (!source.enabled || source.status !== "ACTIVE") throw new Error("DISCOVERY_SOURCE_INACTIVE");

  const method = source.collectionMethod.toUpperCase();
  const acquisition = resolveSourceAcquisitionPlan({
    collectionMethod: source.collectionMethod,
    platform: source.platform,
    providerRef: source.providerRef,
    canonicalUrl: source.canonicalUrl,
    metadata: source.metadata,
    collectionConfig: source.collectionConfig
  });
  if (acquisition.kind === "UNRESOLVED") {
    throw new Error("COLLECTION_ACQUISITION_ROUTE_REQUIRED");
  }
  const provenance = normalizeCollectionProvenance(input.provenance, {
    origin: "SYSTEM",
    collectionPurpose:
      acquisition.kind === "TREND_DISCOVERY"
        ? "TREND"
        : acquisition.kind === "SEARCH_DISCOVERY"
          ? "EXPANSION"
          : acquisition.kind === "RSS_ATOM" || acquisition.kind === "SITEMAP" || acquisition.kind === "STATIC_PAGE" || acquisition.kind === "PUBLIC_GENERATED_FEED"
            ? "LATEST"
            : "EXPANSION"
  });
  if (provenance.origin !== "SYSTEM") {
    throw new Error("SYSTEM_COLLECTION_RUNTIME_ONLY");
  }
  if (
    input.qualificationOnly === true &&
    (
      provenance.origin !== "SYSTEM" ||
      !provenance.runKind?.startsWith("SOURCE_QUALIFICATION:")
    )
  ) {
    throw new Error("ADAPTER_QUALIFICATION_RUN_KIND_REQUIRED");
  }
  const searchConfig =
    method === "SEARCH" ? resolveSearchDiscoveryConfig(source.collectionConfig) : null;
  const trendInput = input.backfillWindow ? { ...(source.collectionConfig as Record<string, unknown>), windowHours: 168 } : source.collectionConfig;
  const trendConfig =
    method === "TREND" ? resolveTrendDiscoveryConfig(trendInput) : null;
  function requestedUrlForRoute(route: SourceAcquisitionRoute) {
    if (route.kind === "SEARCH_DISCOVERY" && searchConfig) return buildSearchDiscoveryUrl(searchConfig);
    if (route.kind === "TREND_DISCOVERY" && trendConfig) return buildTrendDiscoveryPrimaryUrl(trendConfig);
    return route.targetUrl?.trim() || source.canonicalUrl?.trim() || "";
  }
  const runnableRoutes = acquisition.routes.filter((route) => route.enabled);
  const requestedUrl =
    requestedUrlForRoute(acquisition.primaryRoute) ||
    runnableRoutes.map(requestedUrlForRoute).find(Boolean) ||
    "";
  if (!requestedUrl) throw new Error("COLLECTION_SOURCE_URL_REQUIRED");
  if (input.qualificationOnly === true) {
    const previewPolicy = qualificationPreviewPolicyForSource({
      canonicalUrl: source.canonicalUrl,
      collectionConfig: source.collectionConfig,
      metadata: source.metadata
    });
    if (!previewPolicy.allowedHosts.length) {
      throw new Error("QUALIFICATION_TARGET_HOST_DECLARATION_REQUIRED");
    }
    validateQualificationPreviewTarget({
      canonicalUrl: source.canonicalUrl,
      targetUrl: requestedUrl,
      allowedHosts: previewPolicy.allowedHosts,
      allowedPathPrefixes: previewPolicy.allowedPathPrefixes
    });
  }

  const baseRunMetadata = searchConfig
    ? {
        platform: source.platform,
        searchProvider: searchConfig.provider,
        searchQuery: searchConfig.searchQuery,
        windowHours: searchConfig.windowHours,
        resultLimit: searchConfig.resultLimit
      }
    : trendConfig
      ? {
          platform: source.platform,
          trendProvider: trendConfig.provider,
          searchQuery: trendConfig.searchQuery,
          windowHours: trendConfig.windowHours,
          resultLimit: trendConfig.resultLimit,
          signalOnly: true
        }
      : { platform: source.platform };
  const runMetadata = {
    ...baseRunMetadata,
    ...(input.qualificationOnly === true ? { qualificationOnly: true } : {}),
    ...(input.backfillWindow ? { backfillWindow: { ...input.backfillWindow } } : {}),
    collectionRuntimeVersion: SOURCE_COLLECTION_RUNTIME_CONTRACT_VERSION,
    qualificationCheckpoint: buildQualificationCheckpoint({
      sourceId: source.id,
      platform: source.platform,
      collectionMethod: source.collectionMethod,
      canonicalUrl: source.canonicalUrl,
      providerRef: source.providerRef,
      collectionConfig: source.collectionConfig,
      metadata: source.metadata
    }).checkpoint,
    acquisitionKind: acquisition.kind,
    acquisitionReason: acquisition.reason,
    acquisitionFallbackKinds: acquisition.fallbackKinds,
    acquisitionRouteId: acquisition.primaryRoute.id,
    acquisitionRouteRole: acquisition.primaryRoute.role,
    acquisitionRouteCostLevel: acquisition.primaryRoute.costLevel,
    acquisitionRoutes: acquisition.routes.map((route) => ({
      id: route.id,
      role: route.role,
      kind: route.kind,
      costLevel: route.costLevel,
      enabled: route.enabled,
      serverRuntimeSupported: route.serverRuntimeSupported
    })),
    ...provenanceMetadata(provenance)
  };
  const acquisitionRouteAttempts: Array<{
    routeId: string;
    role: string;
    kind: string;
    costLevel: string;
    status: "SUCCEEDED" | "FAILED" | "SKIPPED";
    errorCode: string | null;
  }> = [];
  let selectedAcquisitionRoute: SourceAcquisitionRoute | null = null;
  type IncrementalReceipt={key:string;url:string;validators:FeedValidators;disposition:string;truncated:boolean;checkpointOwner?:"githubReleaseCheckpoints";checkpoint?:{version:string;nextPage:number};pagination?:Record<string,unknown>};
  let feedReceipt: IncrementalReceipt | null = null;
  let apiReceipt: IncrementalReceipt | null = null;
  const routeCheckpoint=(owner:"feedCheckpoints"|"apiCheckpoints"|"githubReleaseCheckpoints",routeId:string,url:string)=>{
    const key=createHash("sha256").update(routeId+"|"+url).digest("hex").slice(0,24);
    const metadata=source.metadata as Record<string,unknown>;
    const checkpoints=metadata?.[owner] as Record<string,unknown>|undefined;
    const checkpoint=checkpoints?.[key] as Record<string,unknown>|undefined;
    const current=!input.backfillWindow && !input.qualificationOnly && checkpoint?.url===url;
    return {key,validators:current?readHttpValidators(checkpoint):undefined,checkpoint:current?checkpoint:undefined};
  };

  const [run] = await db.insert(contentCollectionRuns).values({
    sourceId: source.id,
    sourceName: source.name,
    collectionMethod: method,
    requestedUrl,
    status: "RUNNING",
    triggeredByEmail: user.email,
    metadata: runMetadata
  }).returning();

  try {
    let items: NormalizedCollectedItem[];
    if (collectorOverride) {
      selectedAcquisitionRoute = acquisition.primaryRoute;
      items = await collectorOverride(method, requestedUrl);
      acquisitionRouteAttempts.push({
        routeId: selectedAcquisitionRoute.id,
        role: selectedAcquisitionRoute.role,
        kind: selectedAcquisitionRoute.kind,
        costLevel: selectedAcquisitionRoute.costLevel,
        status: "SUCCEEDED",
        errorCode: null
      });
    } else {
      let collected: NormalizedCollectedItem[] | null = null;
      let lastRouteError: unknown = null;
      for (const route of runnableRoutes) {
        const routeUrl = requestedUrlForRoute(route);
        if (!route.serverRuntimeSupported) {
          acquisitionRouteAttempts.push({
            routeId: route.id,
            role: route.role,
            kind: route.kind,
            costLevel: route.costLevel,
            status: "SKIPPED",
            errorCode: "COLLECTION_ADAPTER_RUNTIME_REQUIRED"
          });
          continue;
        }
        if (!routeUrl) {
          acquisitionRouteAttempts.push({
            routeId: route.id,
            role: route.role,
            kind: route.kind,
            costLevel: route.costLevel,
            status: "SKIPPED",
            errorCode: "COLLECTION_SOURCE_URL_REQUIRED"
          });
          continue;
        }
        if (input.qualificationOnly === true) {
          const previewPolicy = qualificationPreviewPolicyForSource({
            canonicalUrl: source.canonicalUrl,
            collectionConfig: source.collectionConfig,
            metadata: source.metadata
          });
          validateQualificationPreviewTarget({
            canonicalUrl: source.canonicalUrl,
            targetUrl: routeUrl,
            allowedHosts: previewPolicy.allowedHosts,
            allowedPathPrefixes: previewPolicy.allowedPathPrefixes
          });
        }
        try {
          if (route.runtimeOwner?.toUpperCase() === "GITHUB_RELEASES") {
            if(route.kind!=="PUBLIC_JSON_API")throw new Error("GITHUB_RELEASE_ROUTE_NOT_ALLOWED");
            const {key,checkpoint}=routeCheckpoint("githubReleaseCheckpoints",route.id,routeUrl);
            const document=await collectGithubReleaseDocument({url:routeUrl,checkpoint,fetchPage:collectGithubReleasePageThroughRelay});
            collected=document.items;
            apiReceipt={key,url:routeUrl,validators:{},disposition:document.disposition,truncated:false,checkpointOwner:"githubReleaseCheckpoints",checkpoint:document.checkpoint,pagination:document.pagination};
          } else if (route.runtimeOwner?.toUpperCase() === "RADAR_AI_HOT") {
            if(routeUrl!==AIHOT_SNAPSHOT_URL)throw new Error("API_SNAPSHOT_ROUTE_MISMATCH");
            const {key,validators}=routeCheckpoint("apiCheckpoints",route.id,routeUrl);
            const document=await collectAiHotDocument({validators,fetchText:(url,conditions)=>fetchPublicText(url,"application/json",undefined,conditions)});
            collected=document.items;
            apiReceipt={key,url:routeUrl,validators:document.validators,disposition:document.disposition,truncated:document.truncated};
          } else if (route.runtimeOwner && hasSourceRuntimeAdapter(route.runtimeOwner)) {
            collected = await collectSourceRuntimeAdapter({
              runtimeOwner: route.runtimeOwner,
              fetchJson: fetchPublicJson
            });
          } else if (route.kind === "RSS_ATOM") {
            const {key,validators}=routeCheckpoint("feedCheckpoints",route.id,routeUrl);
            const feed = await collectRssDocument(routeUrl, { validators });
            collected = feed.items;
            feedReceipt = { key, url: routeUrl, validators: feed.validators, disposition: feed.disposition, truncated: feed.truncated === true };
          } else if (route.kind === "SITEMAP") {
            collected = await collectSitemap(routeUrl, source.canonicalUrl);
          } else if (route.kind === "STATIC_PAGE") {
            collected = await collectHttpPage(routeUrl);
          } else if (route.kind === "JINA_READER") {
            collected = await collectJinaReader(routeUrl);
          } else if (route.kind === "SEARCH_DISCOVERY") {
            const search = await collectSearchDiscovery(source.collectionConfig, fetchPublicJson);
            collected = search.items;
          } else if (route.kind === "TREND_DISCOVERY") {
            const trend = await collectTrendDiscovery(trendInput, fetchPublicJson, {
              fetchText: async (url) => fetchPublicText(url),
              fetchImpl: fetch
            });
            collected = trend.items;
          } else {
            throw new Error("COLLECTION_ADAPTER_RUNTIME_REQUIRED:" + route.kind);
          }
          selectedAcquisitionRoute = route;
          acquisitionRouteAttempts.push({
            routeId: route.id,
            role: route.role,
            kind: route.kind,
            costLevel: route.costLevel,
            status: "SUCCEEDED",
            errorCode: null
          });
          break;
        } catch (routeError) {
          lastRouteError = routeError;
          acquisitionRouteAttempts.push({
            routeId: route.id,
            role: route.role,
            kind: route.kind,
            costLevel: route.costLevel,
            status: "FAILED",
            errorCode: errorCode(routeError)
          });
        }
      }
      if (!collected || !selectedAcquisitionRoute) {
        throw lastRouteError instanceof Error
          ? lastRouteError
          : new Error("COLLECTION_NO_RUNNABLE_ACQUISITION_ROUTE");
      }
      items = collected;
    }
    const acquisitionFallbackReason =
      selectedAcquisitionRoute?.role === "FALLBACK"
        ? acquisitionRouteAttempts.find((attempt) =>
            attempt.routeId !== selectedAcquisitionRoute?.id &&
            (attempt.status === "FAILED" || attempt.status === "SKIPPED")
          )?.errorCode ?? "PRIMARY_ROUTE_UNAVAILABLE"
        : null;

    items = items.map((item) => ({
      ...item,
      metadata: {
        ...(item.metadata ?? {}),
        originPublisher:
          typeof item.metadata?.originPublisher === "string" && item.metadata.originPublisher.trim()
            ? item.metadata.originPublisher
            : source.name
      }
    }));

    const backfill = input.backfillWindow ? selectBackfillWindow(items, new Date(input.backfillWindow.from), new Date(input.backfillWindow.to)) : null;
    if (backfill) items = backfill.items;
    items = items.map(item => ({ ...item, metadata: { ...item.metadata, collectionQuality: assessCollectionItemQuality(item),
      ...(backfill ? { backfillWindow: { from: backfill.from, to: backfill.to, historyCompleteness: backfill.historyCompleteness } } : {}) } }));
    if (backfill) Object.assign(runMetadata, { backfillWindow: { ...backfill, items: undefined } });
    assertCollectorReferenceOnly(items);
    if (input.qualificationOnly === true) {
      const candidateKeys = items.map((item) =>
        createHash("sha256")
          .update(
            [
              item.originalUrl?.trim() ?? "",
              item.externalId?.trim() ?? "",
              item.title.trim()
            ].join("\n")
          )
          .digest("hex")
      );
      const publishedCount = items.filter((item) => Boolean(item.publishedAt)).length;
      const [completed] = await db.update(contentCollectionRuns).set({
        status: "SUCCEEDED",
        receivedCount: items.length,
        createdCount: 0,
        duplicateCount: 0,
        finishedAt: new Date(),
        metadata: {
          ...runMetadata,
          mediaPolicy: COLLECTOR_MEDIA_POLICY,
          qualificationOnly: true,
          qualificationCandidateKeys: candidateKeys.slice(0, 200),
          qualificationPublishedCount: publishedCount,
          qualificationPublishedCoverage: items.length
            ? publishedCount / items.length
            : 0,
          acquisitionRouteId: selectedAcquisitionRoute?.id ?? acquisition.primaryRoute.id,
          acquisitionRouteRole: selectedAcquisitionRoute?.role ?? acquisition.primaryRoute.role,
          acquisitionRouteCostLevel: selectedAcquisitionRoute?.costLevel ?? acquisition.primaryRoute.costLevel,
          acquisitionRouteAttempts,
          acquisitionFallbackReason
        }
      }).where(eq(contentCollectionRuns.id, run.id)).returning();
      return completed;
    }
    const policy = resolveSourcePolicy(source);
    const configuredWindow = input.backfillWindow ? 168 : sourceFreshnessHours(source);
    const collectionConfig =
      source.collectionConfig && typeof source.collectionConfig === "object" && !Array.isArray(source.collectionConfig)
        ? source.collectionConfig as Record<string, unknown>
        : {};
    const keywordPolicy = normalizeDiscoveryKeywordPolicy(collectionConfig.keywordPolicy);
    const relevancePolicy = provenance.origin === "SYSTEM" ? await readSourceAiRelevancePolicy() : null;
    const relevanceTerms = relevancePolicy?.terms ?? [];
    const cheapFilterResult = filterCheapDiscoveryCandidates(items, {
      windowHours: configuredWindow,
      sourceName: source.name,
      sourcePlatform: source.platform,
      sourceMethod: method,
      sourceType: policy?.sourceType ?? source.sourceType,
      strategyTopics: Array.isArray(source.topics)
        ? source.topics.filter((item): item is string => typeof item === "string")
        : [],
      keywordPolicy,
      relevanceTerms
    });
    const knownEntitiesByIndex = new Map<number, Awaited<ReturnType<typeof resolveKnownEntities>>>();
    if (provenance.origin === "SYSTEM" && cheapFilterResult.items.length) {
      await syncCoreEntityRegistry();
      const resolvedKnownEntities = await Promise.all(cheapFilterResult.items.map((item) =>
        resolveKnownEntities({ title: item.title, excerpt: item.excerpt })
      ));
      resolvedKnownEntities.forEach((entities, index) => knownEntitiesByIndex.set(index, entities));
    }
    const filterResult = await filterDiscoveryCandidates(cheapFilterResult.items, {
      windowHours: configuredWindow,
      sourceName: source.name,
      sourcePlatform: source.platform,
      sourceMethod: method,
      sourceType: policy?.sourceType ?? source.sourceType,
      requireExplicitAiRelation:
        provenance.origin === "SYSTEM" &&
        (policy?.sourceType === "MEDIA" || policy?.sourceType === "SOCIAL" || policy?.sourceType === "DEVELOPER" || source.sourceType === "MANAGED_SOURCE" || source.sourceType === "CREATOR"),
      knownEntitiesByIndex,
      strategyTopics: Array.isArray(source.topics)
        ? source.topics.filter((item): item is string => typeof item === "string")
        : [],
      keywordPolicy,
      relevanceTerms
    });
    const policyItems = [];
    const rejectedSamples: RejectedSampleAudit[] = [];
    if (provenance.origin === "SYSTEM") {
      for (const decision of cheapFilterResult.decisions) {
        if (decision.keep) continue;
        const rejectedItem = items[decision.index];
        if (!rejectedItem) continue;
        rejectedSamples.push(rejectedSampleAudit({
          stage: "DISCOVERY_FILTER",
          item: rejectedItem,
          sourceId: source.id,
          sourceName: source.name,
          platform: source.platform,
          collectionMethod: method,
          relationType: decision.relationType,
          reason: decision.reason
        }));
      }
      for (const decision of filterResult.decisions) {
        if (decision.keep) continue;
        const rejectedItem = cheapFilterResult.items[decision.index];
        if (!rejectedItem) continue;
        rejectedSamples.push(rejectedSampleAudit({
          stage: "DISCOVERY_FILTER",
          item: rejectedItem,
          sourceId: source.id,
          sourceName: source.name,
          platform: source.platform,
          collectionMethod: method,
          relationType: decision.relationType,
          reason: decision.reason
        }));
      }
    }

    for (const item of filterResult.items) {
      const metadata = item.metadata && typeof item.metadata === "object" && !Array.isArray(item.metadata)
        ? item.metadata as Record<string, unknown>
        : {};
      const contentType = inferCollectionContentType({
        metadata,
        originalUrl: item.originalUrl,
        collectionMethod: method,
        platform: source.platform,
        source
      });
      const rule = sourceContentRule(source, contentType);
      const discoveryFilter = metadata.discoveryFilter && typeof metadata.discoveryFilter === "object" && !Array.isArray(metadata.discoveryFilter)
        ? metadata.discoveryFilter as Record<string, unknown>
        : {};
      const relationType = typeof discoveryFilter.relationType === "string" ? discoveryFilter.relationType : "UNKNOWN";
      const deterministicQuality = evaluateDeterministicQualityGate(item);
      if (!deterministicQuality.pass) {
        rejectedSamples.push(rejectedSampleAudit({
          stage: "DETERMINISTIC_QUALITY_GATE",
          item,
          sourceId: source.id,
          sourceName: source.name,
          platform: source.platform,
          collectionMethod: method,
          relationType,
          reason: deterministicQuality.reasons.join("|")
        }));
        continue;
      }
      const pollutionGate = evaluatePollutionGate(item);
      if (!pollutionGate.pass) {
        rejectedSamples.push(rejectedSampleAudit({
          stage: "POLLUTION_GATE",
          item,
          sourceId: source.id,
          sourceName: source.name,
          platform: source.platform,
          collectionMethod: method,
          relationType,
          reason: pollutionGate.reasons.join("|")
        }));
        continue;
      }
      const signalOnlyNoise = provenance.origin === "SYSTEM" && rule.role === "SIGNAL" && (relationType === "UNKNOWN" || relationType === "NONE");
      if (signalOnlyNoise) {
        rejectedSamples.push(rejectedSampleAudit({
          stage: "SOURCE_POLICY",
          item,
          sourceId: source.id,
          sourceName: source.name,
          platform: source.platform,
          collectionMethod: method,
          relationType,
          reason: "SIGNAL_WITHOUT_AI_RELATION"
        }));
        continue;
      }
      const entityResolution = await resolveEntitiesForContent({
        title: item.title,
        excerpt: item.excerpt,
        publishedAt: item.publishedAt
      }, { allowAi: false });
      const entities = entityResolution.entities;
      const eventType = classifyIntelligenceEvent({ title: item.title, excerpt: item.excerpt, contentType });
      policyItems.push({
        ...item,
        metadata: {
          ...metadata,
          contentType,
          intelligencePolicy: {
            version: "ai-intelligence-policy-v1",
            sourcePolicyKey: policy?.key ?? null,
            sourceRole: rule.role,
            confirmationScope: rule.confirmationScope,
            confirmationAuthority: rule.confirmationAuthority,
            canContributeHotness: rule.canContributeHotness,
            requiresFactConfirmation: rule.requiresFactConfirmation,
            operatorInterest: null
          },
          resolvedEntities: entities,
          entityResolution: {
            mode: entityResolution.mode,
            createdTemporaryEntityIds: entityResolution.createdTemporaryEntityIds
          },
          eventType
        }
      });
    }
    // Presentation/localization must not block source collection. Raw/Observation
    // is persisted first; Chinese presentation falls back to original text until
    // presentation enrichment is available.
    const result = await runFreshScan({ sourceId: source.id, collectionRunId: run.id, items: policyItems, provenance });
    // New and recovered facts refresh their Event. Unchanged observations only
    // need a refresh for TREND routes where rank/engagement can change.
    const eventRefreshRawItemIds = method === "TREND"
      ? result.rawItemIds
      : [...result.createdRawItemIds, ...result.recoveredRawItemIds];
    const affectedEventLinks = eventRefreshRawItemIds.length
      ? await db
          .select({ eventId: contentEventRawItems.eventId })
          .from(contentEventRawItems)
          .where(inArray(contentEventRawItems.rawItemId, eventRefreshRawItemIds))
      : [];
    const eventIds = [...new Set(affectedEventLinks.map((item) => item.eventId))];
    const relevanceGateResults: Array<{
      eventId: string;
      aiRelevant: boolean;
      mode: string;
      relationType: string;
      reason: string;
    }> = [];
    for (const eventId of eventIds) {
      await runEventClustering(eventId);
      const gate = await evaluateEventRelevance(eventId, { allowAi: false });
      await evaluateEventPolicy(eventId);
      await calculateEventClusterSignals(eventId);
      if (gate) {
        relevanceGateResults.push({
          eventId,
          aiRelevant: gate.aiRelevant,
          mode: gate.mode,
          relationType: gate.relationType,
          reason: gate.reason
        });
      }
    }
    const incrementalReceipt=feedReceipt??apiReceipt;
    const checkpointOwner=incrementalReceipt?.checkpointOwner??(apiReceipt?"apiCheckpoints":"feedCheckpoints");
    const checkpointCommitted=Boolean(incrementalReceipt && !input.backfillWindow && !incrementalReceipt.truncated && result.received>=policyItems.length);
    const completed = await db.transaction(async tx=>{
    const [finished] = await tx.update(contentCollectionRuns).set({
      status: "SUCCEEDED",
      receivedCount: items.length,
      createdCount: result.created,
      duplicateCount: result.duplicates,
      finishedAt: new Date(),
      metadata: {
        ...runMetadata,
        ...(incrementalReceipt ? { [apiReceipt?"apiIncremental":"feedIncremental"]: { disposition: incrementalReceipt.disposition, truncated: incrementalReceipt.truncated, checkpointCommitted,...(incrementalReceipt.pagination?{coverage:"BOUNDED_PAGES_NO_ARCHIVE_GUARANTEE",pagination:incrementalReceipt.pagination}:apiReceipt?{coverage:"BOUNDED_SNAPSHOT_NO_CURSOR"}:{}) } } : {}),
        mediaPolicy: COLLECTOR_MEDIA_POLICY,
        discoveryFilter: {
          version: "ai-discovery-filter-v2",
          sourcePolicy: relevancePolicy ? {version:relevancePolicy.version,updatedAt:relevancePolicy.updatedAt} : null,
          cheapGate: cheapFilterResult.stats,
          ...filterResult.stats,
          droppedReasons: filterResult.decisions
            .filter((item) => !item.keep)
            .reduce<Record<string, number>>((acc, item) => {
              acc[item.reason] = (acc[item.reason] ?? 0) + 1;
              return acc;
            }, {})
        },
        eventRelevanceGate: {
          version: "event-relevance-gate-v1",
          evaluatedEvents: relevanceGateResults.length,
          aiRelevantEvents: relevanceGateResults.filter((item) => item.aiRelevant).length,
          blockedEvents: relevanceGateResults.filter((item) => !item.aiRelevant).length,
          results: relevanceGateResults.slice(0, 100)
        },
        rejectedSampleCapture: {
          version: REJECTED_SAMPLE_CAPTURE_VERSION,
          captured: Math.min(rejectedSamples.length, MAX_REJECTED_SAMPLES_PER_RUN),
          totalRejected: rejectedSamples.length,
          truncated: rejectedSamples.length > MAX_REJECTED_SAMPLES_PER_RUN,
          samples: rejectedSamples.slice(0, MAX_REJECTED_SAMPLES_PER_RUN)
        },
        collectionFunnel: {
          version: 1,
          policyAccepted: policyItems.length,
          ingestCapacityExcluded: Math.max(0, policyItems.length - result.received),
          eventCreated: result.eventCreated,
          eventMerged: result.eventMerged,
          historicalWithoutEvent: result.historicalWithoutEvent,
          rawDuplicateReason: "EXISTING_CANONICAL_URL_EXTERNAL_ID_CONTENT_OR_TITLE_HASH",
          filterReasons: rejectedSamples.filter(item => item.stage === "DISCOVERY_FILTER").reduce<Record<string, number>>((acc, item) => { acc[item.reason] = (acc[item.reason] ?? 0) + 1; return acc; }, {}),
          policyReasons: rejectedSamples.filter(item => item.stage !== "DISCOVERY_FILTER").reduce<Record<string, number>>((acc, item) => { acc[item.reason] = (acc[item.reason] ?? 0) + 1; return acc; }, {})
        },
        storedCount: result.stored,
        rawItemIds: result.rawItemIds.slice(0, 200),
        createdRawItemIds: result.createdRawItemIds.slice(0, 200),
        recoveredRawItemIds: result.recoveredRawItemIds.slice(0, 200),
        acquisitionRouteId: selectedAcquisitionRoute?.id ?? acquisition.primaryRoute.id,
        acquisitionRouteRole: selectedAcquisitionRoute?.role ?? acquisition.primaryRoute.role,
        acquisitionRouteCostLevel: selectedAcquisitionRoute?.costLevel ?? acquisition.primaryRoute.costLevel,
        acquisitionRouteAttempts,
        acquisitionFallbackReason
      }
    }).where(eq(contentCollectionRuns.id, run.id)).returning();
    await tx.update(contentSources).set({
      lastCollectedAt: finished.finishedAt ?? new Date(),
      ...(incrementalReceipt && checkpointCommitted ? {
        metadata: sql`${contentSources.metadata} || jsonb_build_object(${checkpointOwner}::text, coalesce(${contentSources.metadata}->${checkpointOwner}::text, '{}'::jsonb) || ${JSON.stringify({ [incrementalReceipt.key]: { url: incrementalReceipt.url, ...incrementalReceipt.validators,...incrementalReceipt.checkpoint, committedAt: new Date().toISOString() } })}::jsonb)`
      } : {}),
      updatedAt: new Date()
    }).where(eq(contentSources.id, source.id));
    return finished;
    });
    if (provenance.origin === "SYSTEM") {
      await refreshSourceRuntimeQualification(source.id).catch(() => null);
    }
    return completed;
  } catch (error) {
    await db.update(contentCollectionRuns).set({
      status: "FAILED",
      errorCode: errorCode(error),
      errorMessage: errorMessage(error),
      finishedAt: new Date(),
      metadata: sql`${contentCollectionRuns.metadata} || ${JSON.stringify({ ...runMetadata, acquisitionRouteAttempts })}::jsonb`
    }).where(eq(contentCollectionRuns.id, run.id));
    if (provenance.origin === "SYSTEM" && input.qualificationOnly !== true) {
      await refreshSourceRuntimeQualification(source.id).catch(() => null);
    }
    throw error;
  }
}

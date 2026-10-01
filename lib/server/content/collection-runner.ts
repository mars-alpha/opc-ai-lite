import "server-only";

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import type { AuthUser } from "../auth/service";
import { getDatabase } from "../db";
import { contentCollectionRuns, contentSources } from "../db/schema";
import { eq } from "drizzle-orm";
import { runFreshScan } from "./discovery";
import { assertCollectorReferenceOnly, COLLECTOR_MEDIA_POLICY } from "./discovery-contract";
import { buildSearchDiscoveryUrl, collectSearchDiscovery, resolveSearchDiscoveryConfig } from "./search-discovery";

export const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 12_000;
const MAX_REDIRECTS = 3;
const USER_AGENT = "OPC-AI-Collector/1.0 (+https://opcai.fun)";

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

export async function assertPublicHttpUrl(input: string) {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error("COLLECTION_URL_INVALID");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("COLLECTION_URL_PROTOCOL_BLOCKED");
  if (url.username || url.password) throw new Error("COLLECTION_URL_CREDENTIALS_BLOCKED");

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

async function fetchPublicText(input: string, accept = "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html;q=0.9, */*;q=0.5") {
  let current = await assertPublicHttpUrl(input);
  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const response = await fetch(current, {
      redirect: "manual",
      headers: {
        "user-agent": USER_AGENT,
        accept
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    });

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
      status: response.status
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

export function parseFeedDocument(body: string, feedUrl: string): NormalizedCollectedItem[] {
  const rssItems = [...body.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map((match) => match[1]);
  const atomEntries = [...body.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi)].map((match) => match[1]);
  const blocks = rssItems.length > 0 ? rssItems : atomEntries;

  return blocks.slice(0, 100).flatMap((block) => {
    const title = tagValue(block, ["title"]);
    if (!title) return [];
    const rssLink = tagValue(block, ["link"]);
    const link = resolveUrl(rssLink || atomLink(block), feedUrl);
    const externalId = tagValue(block, ["guid", "id"]) || link;
    const author = tagValue(block, ["dc:creator", "author", "name"]) || null;
    const publishedAt = normalizeDate(tagValue(block, ["pubDate", "published", "updated", "dc:date"]));
    const excerpt = tagValue(block, ["description", "summary", "content:encoded", "content"]) || null;
    return [{
      externalId,
      originalUrl: link,
      title,
      author,
      excerpt,
      publishedAt,
      platformMetrics: {},
      metadata: { collector: "feed", feedUrl }
    }];
  });
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

export async function collectRss(url: string) {
  const fetched = await fetchPublicText(url);
  const items = parseFeedDocument(fetched.body, fetched.finalUrl);
  if (items.length === 0) throw new Error("RSS_NO_ITEMS");
  return items.map((item) => ({
    ...item,
    metadata: { ...(item.metadata ?? {}), contentType: fetched.contentType, statusCode: fetched.status }
  }));
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

export async function collectManualUrl(url: string) {
  const items = await collectHttpPage(url);
  return items.map((item) => ({
    ...item,
    metadata: { ...(item.metadata ?? {}), collector: "manual" }
  }));
}

export async function runSourceCollection(
  user: AuthUser,
  sourceId: string,
  input: { manualUrl?: string } = {},
  collectorOverride?: (method: string, url: string) => Promise<NormalizedCollectedItem[]>
) {
  const db = getDatabase();
  const [source] = await db.select().from(contentSources).where(eq(contentSources.id, sourceId)).limit(1);
  if (!source) throw new Error("DISCOVERY_SOURCE_NOT_FOUND");
  if (!source.enabled || source.status !== "ACTIVE") throw new Error("DISCOVERY_SOURCE_INACTIVE");

  const method = source.collectionMethod.toUpperCase();
  const searchConfig =
    method === "SEARCH" ? resolveSearchDiscoveryConfig(source.collectionConfig) : null;
  const requestedUrl =
    method === "MANUAL"
      ? input.manualUrl?.trim() || source.canonicalUrl?.trim() || ""
      : method === "SEARCH" && searchConfig
        ? buildSearchDiscoveryUrl(searchConfig)
        : source.canonicalUrl?.trim() || "";
  if (!requestedUrl) throw new Error("COLLECTION_SOURCE_URL_REQUIRED");

  const runMetadata = searchConfig
    ? {
        platform: source.platform,
        searchProvider: searchConfig.provider,
        searchQuery: searchConfig.searchQuery,
        windowHours: searchConfig.windowHours,
        resultLimit: searchConfig.resultLimit
      }
    : { platform: source.platform };

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
      items = await collectorOverride(method, requestedUrl);
    } else if (method === "MANUAL") {
      items = await collectManualUrl(requestedUrl);
    } else if (method === "RSS") {
      items = await collectRss(requestedUrl);
    } else if (method === "HTTP") {
      items = await collectHttpPage(requestedUrl);
    } else if (method === "SEARCH") {
      const search = await collectSearchDiscovery(source.collectionConfig, fetchPublicJson);
      items = search.items;
    } else {
      throw new Error("COLLECTION_METHOD_NOT_SUPPORTED");
    }

    assertCollectorReferenceOnly(items);
    const result = await runFreshScan({ sourceId: source.id, items });
    const [completed] = await db.update(contentCollectionRuns).set({
      status: "SUCCEEDED",
      receivedCount: result.received,
      createdCount: result.created,
      duplicateCount: result.duplicates,
      finishedAt: new Date(),
      metadata: {
        ...runMetadata,
        mediaPolicy: COLLECTOR_MEDIA_POLICY,
        storedCount: result.stored,
        rawItemIds: result.rawItemIds.slice(0, 200),
        createdRawItemIds: result.createdRawItemIds.slice(0, 200)
      }
    }).where(eq(contentCollectionRuns.id, run.id)).returning();
    return completed;
  } catch (error) {
    await db.update(contentCollectionRuns).set({
      status: "FAILED",
      errorCode: errorCode(error),
      errorMessage: errorMessage(error),
      finishedAt: new Date()
    }).where(eq(contentCollectionRuns.id, run.id));
    throw error;
  }
}

import "server-only";
import type { TrendDiscoveryConfig } from "./trend-discovery";

export function isOverseasRelayConfigured() {
  return Boolean(
    process.env.OVERSEAS_COLLECTOR_RELAY_URL?.trim() &&
    process.env.OVERSEAS_COLLECTOR_RELAY_SECRET?.trim()
  );
}

export async function collectThroughOverseasRelay(config: Omit<TrendDiscoveryConfig, "provider"> & { provider: TrendDiscoveryConfig["provider"] | "DEEPMIND_FEED" | "PIXAROMA_WORKFLOWS" | "PUBLIC_PRACTICE_DOCUMENT" | "PUBLIC_SOURCE_DOCUMENT" }, fetchImpl: typeof fetch = fetch, signal?: AbortSignal) {
  const base = process.env.OVERSEAS_COLLECTOR_RELAY_URL?.trim();
  const secret = process.env.OVERSEAS_COLLECTOR_RELAY_SECRET?.trim();
  if (!base || !secret) throw new Error("OVERSEAS_COLLECTOR_RELAY_UNCONFIGURED");
  const url = new URL("/v1/collect", base);
  if (url.protocol !== "https:" && url.hostname !== "127.0.0.1" && url.hostname !== "localhost") {
    throw new Error("OVERSEAS_COLLECTOR_RELAY_HTTPS_REQUIRED");
  }
  const response = await fetchImpl(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer " + secret
    },
    body: JSON.stringify({
      provider: config.provider,
      searchQuery: config.searchQuery,
      windowHours: config.windowHours,
      resultLimit: config.resultLimit,
      minStars: config.minStars
    }),
    signal: signal ? AbortSignal.any([signal,AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000)
  });
  const text = await response.text();
  if (text.length > 2_500_000) throw new Error("OVERSEAS_COLLECTOR_RELAY_RESPONSE_TOO_LARGE");
  if (!response.ok) {
    let code = "OVERSEAS_COLLECTOR_RELAY_FAILED_" + response.status;
    try {
      const body = JSON.parse(text) as { error?: unknown };
      if (typeof body.error === "string" && /^(RELAY_UPSTREAM_HTTP_[1-5][0-9]{2}|RELAY_UPSTREAM_TIMEOUT|RELAY_UPSTREAM_NETWORK_FAILED|RELAY_UPSTREAM_PAYLOAD_INVALID|RELAY_UPSTREAM_TOO_LARGE|RELAY_PROVIDER_NOT_ALLOWED|RELAY_YOUTUBE_KEY_REQUIRED|RELAY_GOOGLE_TRENDS_GEO_INVALID)$/.test(body.error)) code = body.error;
    } catch { /* Never echo untrusted response bodies or upstream URLs. */ }
    throw new Error(code);
  }
  return JSON.parse(text) as Record<string, unknown>;
}

// Enable only after the deployed /health advertises the new fixed providers.
export function isPublicSourceRelayEnabled() {
  return isOverseasRelayConfigured() && process.env.OVERSEAS_COLLECTOR_RELAY_PUBLIC_SOURCES === "v2";
}
export async function collectDeepMindFeedThroughRelay() {
  const result = await collectThroughOverseasRelay({ provider: "DEEPMIND_FEED", searchQuery: "", windowHours: 168, resultLimit: 30, minStars: 0 });
  if (typeof result.rssText !== "string") throw new Error("OVERSEAS_COLLECTOR_RELAY_FEED_INVALID");
  return { body: result.rssText, finalUrl: "https://deepmind.google/blog/rss.xml", contentType: "application/rss+xml", status: 200 };
}

export function isPublicFeedRelayUrl(input:string) {
  try {const url=new URL(input);return url.protocol==="https:" && !url.port && !url.username && !url.password && ["simonwillison.net","til.simonwillison.net","blog.comfy.org"].includes(url.hostname);}catch{return false;}
}
export async function collectPublicSourceDocumentThroughRelay(url:string, signal?:AbortSignal) {
  if(!isPublicFeedRelayUrl(url)) throw new Error("RELAY_PROVIDER_NOT_ALLOWED");
  const result=await collectThroughOverseasRelay({provider:"PUBLIC_SOURCE_DOCUMENT",searchQuery:url,windowHours:168,resultLimit:1,minStars:0},fetch,signal);
  if(typeof result.text!=="string" || typeof result.url!=="string" || !isPublicFeedRelayUrl(result.url) || result.status!==200 || typeof result.contentType!=="string") throw new Error("OVERSEAS_COLLECTOR_RELAY_FEED_INVALID");
  return {body:result.text,finalUrl:result.url,contentType:result.contentType,status:200};
}

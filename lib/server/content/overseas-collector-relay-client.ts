import "server-only";
import {publicSourceRoute,PUBLIC_SOURCE_ROUTE_PROTOCOL,LEGACY_PUBLIC_SOURCE_HOSTS,AUTHOR_FEED_HOSTS} from "../../../services/overseas-collector-relay/public-source-routes";
import type { TrendDiscoveryConfig } from "./trend-discovery";
import {CONDITIONAL_HTTP_PROTOCOL,readHttpValidators,documentHttpValidators,type HttpValidators} from "../../../services/overseas-collector-relay/conditional-http";
import {fixedWatchlistFeedUrl,watchlistFeedFetchUrl,WATCHLIST_FEED_POLICY_VERSION} from "../../../services/overseas-collector-relay/watchlist-feeds";
import {githubReleasePage,GITHUB_RELEASE_POLICY_VERSION} from "../../../services/overseas-collector-relay/github-releases";

export function isOverseasRelayConfigured() {
  return Boolean(
    process.env.OVERSEAS_COLLECTOR_RELAY_URL?.trim() &&
    process.env.OVERSEAS_COLLECTOR_RELAY_SECRET?.trim()
  );
}

function relayTransportFailure(error:unknown,phase:'HEADERS'|'BODY',signal?:AbortSignal):never {
  signal?.throwIfAborted();
  const timeout=error instanceof Error && ['TimeoutError','AbortError'].includes(error.name);
  throw new Error('OVERSEAS_COLLECTOR_RELAY_'+phase+(timeout?'_TIMEOUT':'_NETWORK_FAILED'));
}

export async function collectThroughOverseasRelay(config: Omit<TrendDiscoveryConfig, "provider"> & { provider: TrendDiscoveryConfig["provider"] | "DEEPMIND_FEED" | "PIXAROMA_WORKFLOWS" | "PUBLIC_PRACTICE_DOCUMENT" | "PUBLIC_SOURCE_DOCUMENT" | "WATCHLIST_FEED" | "GITHUB_RELEASES" | "BRAVE_SEARCH" }, fetchImpl: typeof fetch = fetch, signal?: AbortSignal, validators?:HttpValidators) {
  const authorPractice=config.provider==="PUBLIC_PRACTICE_DOCUMENT" && publicSourceRoute(config.searchQuery)?.authorFeed===true;
  if(authorPractice && process.env.OPC_COLLECTION_AUTHOR_FEEDS!=="v1")throw new Error("AUTHOR_FEED_RELAY_DISABLED");
  const base = process.env.OVERSEAS_COLLECTOR_RELAY_URL?.trim();
  const secret = process.env.OVERSEAS_COLLECTOR_RELAY_SECRET?.trim();
  if (!base || !secret) throw new Error("OVERSEAS_COLLECTOR_RELAY_UNCONFIGURED");
  const url = new URL("/v1/collect", base);
  if (url.protocol !== "https:" && url.hostname !== "127.0.0.1" && url.hostname !== "localhost") {
    throw new Error("OVERSEAS_COLLECTOR_RELAY_HTTPS_REQUIRED");
  }
  let response:Response;
  try { response = await fetchImpl(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-opc-relay-compact": "feed-v1",
      authorization: "Bearer " + secret
    },
    body: JSON.stringify({
      provider: config.provider,
      searchQuery: config.searchQuery,
      windowHours: config.windowHours,
      resultLimit: config.resultLimit,
      minStars: config.minStars,
      ...(validators?{validators:readHttpValidators(validators)}:{})
    }),
    signal: signal ? AbortSignal.any([signal,AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000)
  }); } catch(error) { return relayTransportFailure(error,'HEADERS',signal); }
  let text:string;
  try { text = await response.text(); } catch(error) { return relayTransportFailure(error,'BODY',signal); }
  if (text.length > 2_500_000) throw new Error("OVERSEAS_COLLECTOR_RELAY_RESPONSE_TOO_LARGE");
  if (!response.ok) {
    let code = "OVERSEAS_COLLECTOR_RELAY_FAILED_" + response.status;
    try {
      const body = JSON.parse(text) as { error?: unknown };
      if (typeof body.error === "string" && /^(RELAY_UPSTREAM_HTTP_[1-5][0-9]{2}|RELAY_UPSTREAM_TIMEOUT|RELAY_UPSTREAM_NETWORK_FAILED|RELAY_UPSTREAM_PAYLOAD_INVALID|RELAY_UPSTREAM_TOO_LARGE|RELAY_PROVIDER_NOT_ALLOWED|RELAY_YOUTUBE_KEY_REQUIRED|RELAY_BRAVE_KEY_REQUIRED|RELAY_GOOGLE_TRENDS_GEO_INVALID)$/.test(body.error)) code = body.error;
    } catch { /* Never echo untrusted response bodies or upstream URLs. */ }
    throw new Error(code);
  }
  const result=JSON.parse(text) as Record<string, unknown>;
  if(result.feedTextAlias==="text" && typeof result.text==="string" && result.rssText===undefined)result.rssText=result.text;
  if(authorPractice && result.publicSourceRouteProtocol!==PUBLIC_SOURCE_ROUTE_PROTOCOL)throw new Error("OVERSEAS_COLLECTOR_RELAY_FEED_INVALID");
  return result;
}

export function isBraveSearchRelayEnabled(){
 return isOverseasRelayConfigured() && process.env.OPC_COLLECTION_BRAVE_SEARCH==="v1";
}

// Enable only after the deployed /health advertises the new fixed providers.
export function isPublicSourceRelayEnabled() {
  return isOverseasRelayConfigured() && process.env.OVERSEAS_COLLECTOR_RELAY_PUBLIC_SOURCES === "v2";
}
export async function collectDeepMindFeedThroughRelay(signal?:AbortSignal,validators?:HttpValidators) {
  const result = await collectThroughOverseasRelay({ provider: "DEEPMIND_FEED", searchQuery: "", windowHours: 168, resultLimit: 30, minStars: 0 },fetch,signal,validators);
  if (typeof result.rssText !== "string") throw new Error("OVERSEAS_COLLECTOR_RELAY_FEED_INVALID");
  if(result.url!==undefined && result.url!=="https://deepmind.google/blog/rss.xml")throw new Error("OVERSEAS_COLLECTOR_RELAY_FEED_INVALID");
  return relayDocument({...result,status:result.status??200,text:result.rssText,url:result.url??"https://deepmind.google/blog/rss.xml",contentType:result.contentType??"application/rss+xml"},"https://deepmind.google/blog/rss.xml",validators);
}

export function isPublicFeedRelayUrl(input:string) {
  return publicSourceRoute(input)!==null;
}
export function publicSourceAdmissionHosts(){return [...LEGACY_PUBLIC_SOURCE_HOSTS,...(process.env.OPC_COLLECTION_AUTHOR_FEEDS==="v1"?AUTHOR_FEED_HOSTS:[])];}
export async function collectPublicSourceDocumentThroughRelay(url:string, signal?:AbortSignal,validators?:HttpValidators) {
  const route=publicSourceRoute(url);
  if(!route) throw new Error("RELAY_PROVIDER_NOT_ALLOWED");
  if(route.authorFeed && process.env.OPC_COLLECTION_AUTHOR_FEEDS!=="v1")throw new Error("AUTHOR_FEED_RELAY_DISABLED");
  const result=await collectThroughOverseasRelay({provider:"PUBLIC_SOURCE_DOCUMENT",searchQuery:url,windowHours:168,resultLimit:1,minStars:0},fetch,signal,route.url===new URL(url).href?validators:undefined);
  if(typeof result.url!=="string" || !isPublicFeedRelayUrl(result.url))throw new Error("OVERSEAS_COLLECTOR_RELAY_FEED_INVALID");
  if(route.authorFeed && (result.publicSourceRouteProtocol!==PUBLIC_SOURCE_ROUTE_PROTOCOL || new URL(result.url).origin!==new URL(url).origin))throw new Error("OVERSEAS_COLLECTOR_RELAY_FEED_INVALID");
  return relayDocument(result,url,validators);
}

function relayDocument(result:Record<string,unknown>,url:string,validators?:HttpValidators){
 const status=result.status;
 const sent=readHttpValidators(validators);
 if(typeof result.text!=="string" || typeof result.url!=="string" || typeof result.contentType!=="string" || typeof status!=="number" || ![200,304].includes(status))throw new Error("OVERSEAS_COLLECTOR_RELAY_FEED_INVALID");
 if(status===304 && (result.conditionalProtocol!==CONDITIONAL_HTTP_PROTOCOL || result.url!==new URL(url).href || result.text!=="" || !sent.etag && !sent.lastModified))throw new Error("OVERSEAS_COLLECTOR_RELAY_FEED_INVALID");
 return {body:result.text,finalUrl:result.url,contentType:result.contentType,status,...documentHttpValidators({...readHttpValidators(result),status,finalUrl:result.url},url,validators)};
}
export function isWatchlistFeedRelayEnabled(){return isOverseasRelayConfigured() && process.env.OPC_COLLECTION_WATCHLIST_FEEDS==="v1";}
export async function collectGithubReleasePageThroughRelay(input:string,signal?:AbortSignal){
 const page=githubReleasePage(input);if(!page)throw new Error("GITHUB_RELEASE_ROUTE_NOT_ALLOWED");
 if(!isOverseasRelayConfigured() || process.env.OPC_COLLECTION_GITHUB_RELEASES!=="v1")throw new Error("GITHUB_RELEASE_RELAY_UNAVAILABLE");
 const result=await collectThroughOverseasRelay({provider:"GITHUB_RELEASES",searchQuery:page.url,windowHours:168,resultLimit:30,minStars:0},fetch,signal);
 if(result.paginationProtocol!==GITHUB_RELEASE_POLICY_VERSION || result.url!==page.url || result.status!==200 || typeof result.body!=="string" || result.link!==null && typeof result.link!=="string" || typeof result.link==="string" && result.link.length>4096)throw new Error("GITHUB_RELEASE_RELAY_INVALID");
 return {url:page.url,status:200,body:result.body,link:result.link as string|null};
}
export async function collectWatchlistFeedThroughRelay(input:string,signal?:AbortSignal,validators?:HttpValidators){
 const url=fixedWatchlistFeedUrl(input);
 if(!url)throw new Error("RELAY_PROVIDER_NOT_ALLOWED");
 if(!isWatchlistFeedRelayEnabled())throw new Error("WATCHLIST_FEED_RELAY_UNAVAILABLE");
 const target=watchlistFeedFetchUrl(url);
 const result=await collectThroughOverseasRelay({provider:"WATCHLIST_FEED",searchQuery:url,windowHours:168,resultLimit:1,minStars:0},fetch,signal,url===target?validators:undefined);
 if(result.url!==target || target!==url && (result.watchlistFeedVersion!==WATCHLIST_FEED_POLICY_VERSION || result.requestedUrl!==url || result.status!==200))throw new Error("OVERSEAS_COLLECTOR_RELAY_FEED_INVALID");
 return relayDocument(result,url,validators);
}

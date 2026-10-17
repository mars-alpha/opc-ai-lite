import {publicPracticeRoute,PUBLIC_PRACTICE_ROUTE_PROTOCOL} from "./public-practice-routes.js";
import {publicSourceRoute,PUBLIC_SOURCE_ROUTE_PROTOCOL} from "./public-source-routes.js";
import {CONDITIONAL_HTTP_PROTOCOL,readHttpValidators,conditionalRequestHeaders} from "./conditional-http.js";
import {fixedWatchlistFeedUrl,watchlistFeedFetchUrl,WATCHLIST_FEED_POLICY_VERSION} from "./watchlist-feeds.js";
import {githubReleasePage,GITHUB_RELEASE_POLICY_VERSION} from "./github-releases.js";
import {BRAVE_SEARCH_ENDPOINT,BRAVE_SEARCH_PROTOCOL,parseBraveSearchResults} from "./brave-search.js";
const ALLOWED_PROVIDERS = new Set(["YOUTUBE_AI_TREND", "GOOGLE_TRENDS", "DEEPMIND_FEED", "GITHUB_TREND_PROXY", "PIXAROMA_WORKFLOWS", "PUBLIC_PRACTICE_DOCUMENT", "PUBLIC_SOURCE_DOCUMENT", "WATCHLIST_FEED", "GITHUB_RELEASES", "BRAVE_SEARCH"]);

async function collectPracticeDocument(request: ReturnType<typeof parseRequest>, deadline:number) {
  const route=publicPracticeRoute(request.searchQuery);
  if(!route)throw new Error("RELAY_PROVIDER_NOT_ALLOWED");
  const url=route.url;
  if(route.kind==="ARTIFACT") {
    const bytes=await boundedPixaromaFetch(url,deadline,1_500_000);
    const artifactText=new TextDecoder("utf-8",{fatal:true}).decode(bytes);
    const workflow=JSON.parse(artifactText);
    if(!Array.isArray(workflow.nodes) || !workflow.nodes.length || !Array.isArray(workflow.links))throw new SyntaxError("workflow structure invalid");
    return {provider:"PUBLIC_PRACTICE_DOCUMENT",url,status:200,artifactText,observedAt:new Date().toISOString()};
  }
  if(route.kind==="HTML") {
    const bytes=await boundedPixaromaFetch(url,deadline,1_500_000);
    const html=new TextDecoder("utf-8",{fatal:true}).decode(bytes);
    if(!/<(?:!doctype|html|article)\b/i.test(html))throw new SyntaxError("article document invalid");
    return {provider:"PUBLIC_PRACTICE_DOCUMENT",publicSourceRouteProtocol:PUBLIC_SOURCE_ROUTE_PROTOCOL,url,fetchedUrl:url,status:200,html,observedAt:new Date().toISOString()};
  }
  const bytes=await boundedPixaromaFetch(url+".md",deadline,250000);
  const text=new TextDecoder("utf-8",{fatal:true}).decode(bytes);
  if(!text.trim() || text.length>60000 || /^\s*<!doctype|^\s*<html/i.test(text))throw new SyntaxError("document not complete markdown");
  const observedAt=new Date().toISOString();
  const workflowUrl=text.match(/https:\/\/raw\.githubusercontent\.com\/Comfy-Org\/example_workflows\/(?:refs\/heads\/)?main\/[a-zA-Z0-9_/-]*workflow[a-zA-Z0-9_-]*\.png/)?.[0];
  const modelPath=text.match(/https:\/\/huggingface\.co\/Comfy-Org\/stable-diffusion-v1-5-archive\/blob\/main\/([a-zA-Z0-9_.-]+\.safetensors)/)?.[1];
  const requiredMaterials:Record<string,unknown>[]=[];
  const artifactResults=await Promise.allSettled([
    (async()=>{if(!workflowUrl)return;const image=await boundedPixaromaFetch(workflowUrl,deadline,1500000);const digest=await crypto.subtle.digest("SHA-256",image);requiredMaterials.push({url:workflowUrl,status:200,anonymous:true,serverFetched:true,observedAt,sha256:[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join(""),verification:"DOWNLOADED_COMPLETE",bytes:image.length});})(),
    (async()=>{if(!modelPath)return;const fetchedUrl="https://huggingface.co/api/models/Comfy-Org/stable-diffusion-v1-5-archive?blobs=true";const data=JSON.parse(new TextDecoder().decode(await boundedPixaromaFetch(fetchedUrl,deadline,250000)));const file=Array.isArray(data.siblings)?data.siblings.find((f:Record<string,unknown>)=>f.rfilename===modelPath):null;if(data.private!==false || data.gated!==false || !file?.lfs?.sha256 || !Number.isFinite(file.lfs.size))throw new SyntaxError("model dependency unavailable");requiredMaterials.push({url:"https://huggingface.co/Comfy-Org/stable-diffusion-v1-5-archive/blob/main/"+modelPath,fetchedUrl,status:200,anonymous:true,serverFetched:true,observedAt,sha256:file.lfs.sha256,bytes:file.lfs.size,verification:"PUBLIC_PUBLISHER_MANIFEST_ONLY"});})()
  ]);
  return {provider:"PUBLIC_PRACTICE_DOCUMENT",url,fetchedUrl:url+".md",status:200,text,observedAt,requiredMaterials,unverifiedMaterialCount:artifactResults.filter(x=>x.status==="rejected").length,requiresExternalMaterials:Boolean(workflowUrl||modelPath)};
}

// Parse data, never execute the author's JavaScript. URLs are derived from fixed paths.
export function parsePixaromaEpisodes(body: string) {
  const match = /^\s*window\.EPISODES\s*=\s*(\[[\s\S]*\])\s*;?\s*$/.exec(body);
  if (!match) throw new SyntaxError("episodes assignment");
  const rows: unknown = JSON.parse(match[1]);
  if (!Array.isArray(rows) || rows.length > 500) throw new SyntaxError("episodes array");
  const seen = new Set<number>();
  return rows.flatMap(raw => {
    if (!raw || typeof raw !== "object") return [];
    const r = raw as Record<string, unknown>;
    const n = Number(r.number);
    if (!Number.isInteger(n) || n < 1 || n > 9999 || seen.has(n) || r.comingSoon !== false) return [];
    if (typeof r.title !== "string" || !r.title.trim() || r.title.length > 450) return [];
    if (typeof r.downloadPath !== "string" || !/^workflows\/[A-Za-z0-9 _.-]+\.zip$/.test(r.downloadPath) || r.downloadPath.includes("..")) return [];
    let video: URL;
    try { video = new URL(String(r.youtube)); } catch { return []; }
    const id = video.searchParams.get("v");
    if (video.protocol !== "https:" || video.hostname !== "www.youtube.com" || video.pathname !== "/watch" || !id || !/^[\w-]{11}$/.test(id)) return [];
    seen.add(n);
    const names = Array.isArray(r.workflows) ? r.workflows.flatMap(w => w && typeof w === "object" && typeof w.name === "string" ? [w.name.slice(0, 300)] : []).slice(0, 100) : [];
    return [{episode:n,title:r.title.trim(),originalUrl:"https://www.youtube.com/watch?v="+id,
      materialUrl:`https://workflows.pixaroma.com/ep/${n}/`,
      downloadUrl:new URL(r.downloadPath,"https://workflows.pixaroma.com/").href,
      declaredBytes:Number(r.zipSizeBytes)||0,workflowNames:names,
      // This author's catalogue currently has no publication dates. Do not invent them.
      publishedAt:typeof r.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(r.date) && Number.isFinite(Date.parse(r.date)) ? new Date(r.date).toISOString() : null}];
  }).sort((a,b)=>b.episode-a.episode);
}

async function boundedPixaromaFetch(url: string, deadline: number, limit: number) {
  const response = await fetch(url,{redirect:"error",signal:upstreamSignal(deadline,8000)});
  if (!response.ok) throw new Error("RELAY_UPSTREAM_HTTP_"+response.status);
  if (Number(response.headers.get("content-length")||0)>limit) throw new Error("RELAY_UPSTREAM_TOO_LARGE");
  const reader=response.body?.getReader(); if (!reader) throw new SyntaxError("missing body");
  const chunks:Uint8Array[]=[];let size=0;
  try { while(true){ const next=await reader.read();if(next.done)break;size+=next.value.length;if(size>limit)throw new Error("RELAY_UPSTREAM_TOO_LARGE");chunks.push(next.value); } }
  finally { await reader.cancel().catch(()=>undefined); }
  const bytes=new Uint8Array(size);let pos=0;for(const c of chunks){bytes.set(c,pos);pos+=c.length;}return bytes;
}

async function collectPixaroma(request: ReturnType<typeof parseRequest>, deadline: number) {
  const decoder=new TextDecoder();
  const [catalogue,help]=await Promise.all([
    boundedPixaromaFetch("https://workflows.pixaroma.com/episodes.js",deadline,750000),
    boundedPixaromaFetch("https://workflows.pixaroma.com/help/open-workflow/",deadline,200000)
  ]);
  const all=parsePixaromaEpisodes(decoder.decode(catalogue));
  const selected=all.slice(0,request.resultLimit);
  const html=decoder.decode(help);
  const steps=[...html.matchAll(/<li class="step"[^>]*>([\s\S]*?)<\/li>/g)].map(m=>m[1]
    .replace(/<button\b[^>]*>[\s\S]*?<\/button>/g,"").replace(/<[^>]+>/g," ").replace(/&amp;/g,"&").replace(/&#39;|&apos;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g," ").trim());
  if (steps.length<3 || steps.length>20) throw new SyntaxError("public steps changed");
  const samples=selected.filter(r=>r.declaredBytes>0&&r.declaredBytes<=128000).slice(0,3);
  const artifacts=new Map(await Promise.all(samples.map(async row=>{
    const bytes=await boundedPixaromaFetch(row.downloadUrl,deadline,128000);
    if(bytes[0]!==80||bytes[1]!==75)throw new SyntaxError("zip signature");
    let binary="";for(const byte of bytes)binary+=String.fromCharCode(byte);
    return [row.episode,btoa(binary)] as const;
  })));
  return {provider:"PIXAROMA_WORKFLOWS",catalogueCount:all.length,backlog:Math.max(0,all.length-selected.length),
    helpUrl:"https://workflows.pixaroma.com/help/open-workflow/",steps,
    items:selected.map(row=>({...row,zipBase64:artifacts.get(row.episode)??null,
      materialStatus:artifacts.has(row.episode)?"ZIP_FETCHED_PENDING_JSON_VALIDATION":"NOT_FETCHED_BUDGET_LIMIT"}))};
}

type Env = Record<string, string | undefined>;

// Keep one bounded request comfortably inside the caller's 20s deadline.
const RELAY_TOTAL_BUDGET_MS = 16_000;
function safeRelayError(error: unknown) {
  if (error instanceof Error && /^(RELAY_UPSTREAM_HTTP_[1-5][0-9]{2}|RELAY_UPSTREAM_TOO_LARGE|RELAY_PROVIDER_NOT_ALLOWED|RELAY_YOUTUBE_KEY_REQUIRED|RELAY_BRAVE_KEY_REQUIRED|RELAY_GOOGLE_TRENDS_GEO_INVALID)$/.test(error.message)) return error.message;
  if (error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name)) return "RELAY_UPSTREAM_TIMEOUT";
  if (error instanceof SyntaxError) return "RELAY_UPSTREAM_PAYLOAD_INVALID";
  return "RELAY_UPSTREAM_NETWORK_FAILED";
}
function upstreamSignal(deadline: number, stageBudget: number) {
  const remaining = deadline - Date.now();
  if (remaining <= 0) throw new DOMException("deadline", "TimeoutError");
  return AbortSignal.timeout(Math.max(1, Math.min(stageBudget, remaining)));
}

async function equalSecret(a: string, b: string) {
  if (!a || !b) return false;
  const encoder = new TextEncoder();
  const [left, right] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b))
  ]);
  const l = new Uint8Array(left);
  const r = new Uint8Array(right);
  if (l.length !== r.length) return false;
  let diff = 0;
  for (let i = 0; i < l.length; i += 1) diff |= l[i] ^ r[i];
  return diff === 0;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function collectionJson(body: unknown, acceptEncoding: string | null) {
  const text = JSON.stringify(body);
  const gzip = (acceptEncoding ?? "").split(",").some(entry => {
    const [encoding, ...parameters] = entry.trim().toLowerCase().split(";");
    const quality = parameters.find(p => /^\s*q\s*=/.test(p));
    return encoding === "gzip" && (!quality || Number(quality.split("=")[1]) > 0);
  });
  const compressed = gzip && text.length >= 16_384;
  return new Response(compressed ? new Blob([text]).stream().pipeThrough(new CompressionStream("gzip")) : text, {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", vary: "Accept-Encoding", ...(compressed ? { "content-encoding": "gzip" } : {}) }
  });
}

function parseRequest(value: unknown) {
  const input = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  const provider = typeof input.provider === "string" ? input.provider.trim().toUpperCase() : "";
  if (!ALLOWED_PROVIDERS.has(provider)) throw new Error("RELAY_PROVIDER_NOT_ALLOWED");
  const searchQuery = typeof input.searchQuery === "string" ? input.searchQuery.trim().slice(0, 500) : "";
  const windowHours = Math.max(1, Math.min(168, Math.round(Number(input.windowHours) || 72)));
  const resultLimit = Math.max(1, Math.min(30, Math.round(Number(input.resultLimit) || 20)));
  const validators=["DEEPMIND_FEED","PUBLIC_SOURCE_DOCUMENT","WATCHLIST_FEED"].includes(provider)?readHttpValidators(input.validators):{};
  return { provider, searchQuery, windowHours, resultLimit, validators, minStars: Math.max(0, Math.min(1000000, Math.round(Number(input.minStars) || 0))) };
}

async function checkedJson(response: Response) {
  if (!response.ok) throw new Error("RELAY_UPSTREAM_HTTP_" + response.status);
  const contentLength = Number(response.headers.get("content-length") || "0");
  if (contentLength > 2_000_000) throw new Error("RELAY_UPSTREAM_TOO_LARGE");
  const text = await response.text();
  if (text.length > 2_000_000) throw new Error("RELAY_UPSTREAM_TOO_LARGE");
  return JSON.parse(text);
}

async function checkedText(response: Response) {
  if (!response.ok) throw new Error("RELAY_UPSTREAM_HTTP_" + response.status);
  const contentLength = Number(response.headers.get("content-length") || "0");
  if (contentLength > 2_000_000) throw new Error("RELAY_UPSTREAM_TOO_LARGE");
  const text = await response.text();
  if (text.length > 2_000_000) throw new Error("RELAY_UPSTREAM_TOO_LARGE");
  return text;
}

async function collectYouTube(request: ReturnType<typeof parseRequest>, env: Env, deadline: number) {
  const key = env.YOUTUBE_DATA_API_KEY?.trim();
  if (!key) throw new Error("RELAY_YOUTUBE_KEY_REQUIRED");
  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("order", "viewCount");
  searchUrl.searchParams.set("q", request.searchQuery || "AI artificial intelligence");
  searchUrl.searchParams.set("maxResults", String(request.resultLimit));
  searchUrl.searchParams.set("publishedAfter", new Date(Date.now() - request.windowHours * 3_600_000).toISOString());
  searchUrl.searchParams.set("key", key);
  const searchPayload = await checkedJson(await fetch(searchUrl, { signal: upstreamSignal(deadline, 10_000) }));

  const rows = searchPayload && typeof searchPayload === "object" && Array.isArray((searchPayload as { items?: unknown[] }).items)
    ? (searchPayload as { items: Array<{ id?: { videoId?: string } }> }).items
    : [];
  const ids = rows.map((row) => row?.id?.videoId).filter((id): id is string => Boolean(id)).slice(0, 30);

  let statsPayload: unknown = { items: [] };
  let metricsStatus = ids.length ? "AVAILABLE" : "EMPTY";
  let metricsError: string | null = null;
  if (ids.length) {
    const statsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    statsUrl.searchParams.set("part", "statistics");
    statsUrl.searchParams.set("id", ids.join(","));
    statsUrl.searchParams.set("key", key);
    try {
      statsPayload = await checkedJson(await fetch(statsUrl, { signal: upstreamSignal(deadline, 5_000) }));
    } catch (error) {
      metricsStatus = "UNAVAILABLE";
      metricsError = safeRelayError(error);
    }
  }
  return { provider: "YOUTUBE_AI_TREND", searchPayload, statsPayload, metricsStatus, metricsError };
}

async function collectGoogleTrends(_request: ReturnType<typeof parseRequest>, env: Env, deadline: number) {
  const geo = (env.GOOGLE_TRENDS_GEO ?? "US").trim().toUpperCase();
  if (!/^[A-Z]{2}(?:-[A-Z0-9]{2,3})?$/.test(geo)) throw new Error("RELAY_GOOGLE_TRENDS_GEO_INVALID");
  const url = new URL("https://trends.google.com/trending/rss");
  url.searchParams.set("geo", geo);
  const rssText = await checkedText(await fetch(url, {
    headers: { accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8" },
    signal: upstreamSignal(deadline, 12_000)
  }));
  return { provider: "GOOGLE_TRENDS", geo, rssText };
}

async function collectGithub(request: ReturnType<typeof parseRequest>, deadline: number) {
  const url = new URL("https://api.github.com/search/repositories");
  const cutoff = new Date(Date.now() - request.windowHours * 3_600_000).toISOString().slice(0, 10);
  url.searchParams.set("q", [request.searchQuery || "AI", "pushed:>=" + cutoff, "stars:>=" + request.minStars].join(" "));
  url.searchParams.set("sort", "stars"); url.searchParams.set("order", "desc"); url.searchParams.set("per_page", String(request.resultLimit));
  const payload = await checkedJson(await fetch(url, { headers: { accept: "application/vnd.github+json", "user-agent": "opc-collection-relay" }, redirect: "error", signal: upstreamSignal(deadline, 12000) }));
  return { provider: request.provider, payload };
}

export async function handleRelayRequest(request: Request, env: Env) {
  const url = new URL(request.url);
  if (request.method === "GET" && url.pathname === "/health") {
    return json({ ok: true, service: "opc-overseas-collector-relay", runtime: "deno-deploy", version: "relay-radar-materials-v17", responseCompression:"gzip-v1", conditionalProtocol:CONDITIONAL_HTTP_PROTOCOL, watchlistFeedVersion:WATCHLIST_FEED_POLICY_VERSION, githubReleaseVersion:GITHUB_RELEASE_POLICY_VERSION, braveSearchProtocol:BRAVE_SEARCH_PROTOCOL, publicPracticeRouteProtocol:PUBLIC_PRACTICE_ROUTE_PROTOCOL, publicSourceRouteProtocol:PUBLIC_SOURCE_ROUTE_PROTOCOL, capabilities: [...ALLOWED_PROVIDERS] });
  }
  if (request.method !== "POST" || url.pathname !== "/v1/collect") return json({ error: "NOT_FOUND" }, 404);

  const auth = request.headers.get("authorization") ?? "";
  const supplied = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!await equalSecret(supplied, env.OVERSEAS_COLLECTOR_RELAY_SECRET?.trim() ?? "")) {
    return json({ error: "UNAUTHORIZED" }, 401);
  }

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > 16_384) return json({ error: "REQUEST_TOO_LARGE" }, 413);

  let body = "";
  try { body = await request.text(); } catch { return json({ error: "REQUEST_READ_FAILED" }, 400); }
  if (body.length > 16_384) return json({ error: "REQUEST_TOO_LARGE" }, 413);

  try {
    const parsed = parseRequest(JSON.parse(body || "{}"));
    const started = Date.now();
    const deadline = started + RELAY_TOTAL_BUDGET_MS;
    const result = parsed.provider === "BRAVE_SEARCH" ? await collectBraveSearch(parsed,env,deadline)
      : parsed.provider === "GITHUB_RELEASES" ? await collectGithubReleasePage(parsed,deadline)
      : parsed.provider === "WATCHLIST_FEED" ? await collectWatchlistFeed(parsed,deadline)
      : parsed.provider === "PUBLIC_SOURCE_DOCUMENT" ? await collectSourceDocument(parsed,deadline)
      : parsed.provider === "PUBLIC_PRACTICE_DOCUMENT" ? await collectPracticeDocument(parsed,deadline)
      : parsed.provider === "PIXAROMA_WORKFLOWS" ? await collectPixaroma(parsed,deadline)
      : parsed.provider === "DEEPMIND_FEED"
      ? await collectDeepMindDocument(parsed,deadline)
      : parsed.provider === "GITHUB_TREND_PROXY" ? await collectGithub(parsed, deadline)
      : parsed.provider === "YOUTUBE_AI_TREND"
      ? await collectYouTube(parsed, env, deadline)
      : await collectGoogleTrends(parsed, env, deadline);
    console.log(JSON.stringify({ provider: parsed.provider, status: "SUCCEEDED", durationMs: Date.now() - started }));
    const payload = result as Record<string, unknown>;
    if(request.headers.get("x-opc-relay-compact")==="feed-v1" && typeof payload.text==="string" && payload.rssText===payload.text){
      const {rssText: _alias,...compact}=payload;
      return collectionJson({...compact,feedTextAlias:"text"},request.headers.get("accept-encoding"));
    }
    return collectionJson(result, request.headers.get("accept-encoding"));
  } catch (error) {
    const code = safeRelayError(error);
    console.error(JSON.stringify({ status: "FAILED", error: code }));
    return json({ error: code }, code.includes("NOT_ALLOWED") ? 400 : code.includes("REQUIRED") ? 503 : 502);
  }
}

async function collectBraveSearch(request:ReturnType<typeof parseRequest>,env:Env,deadline:number){
 const key=env.BRAVE_SEARCH_API_KEY?.trim();if(!key)throw new Error("RELAY_BRAVE_KEY_REQUIRED");
 if(!request.searchQuery)throw new Error("RELAY_PROVIDER_NOT_ALLOWED");
 const url=new URL(BRAVE_SEARCH_ENDPOINT);
 url.searchParams.set("q",request.searchQuery);url.searchParams.set("count",String(Math.min(5,request.resultLimit)));
 url.searchParams.set("offset","0");url.searchParams.set("freshness","pw");
 const response=await fetch(url,{redirect:"error",headers:{accept:"application/json","x-subscription-token":key},signal:upstreamSignal(deadline,12000)});
 if(response.status!==200)throw new Error("RELAY_UPSTREAM_HTTP_"+response.status);
 if(Number(response.headers.get("content-length")||0)>250000)throw new Error("RELAY_UPSTREAM_TOO_LARGE");
 const reader=response.body?.getReader();if(!reader)throw new SyntaxError("missing search body");
 let size=0;const chunks:Uint8Array[]=[];
 try{while(true){const next=await reader.read();if(next.done)break;size+=next.value.length;if(size>250000)throw new Error("RELAY_UPSTREAM_TOO_LARGE");chunks.push(next.value);}}
 finally{await reader.cancel().catch(()=>undefined);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 const payload=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes));
 let items;try{items=parseBraveSearchResults(payload,request.resultLimit);}catch{throw new SyntaxError("search response invalid");}
 // Return only validated public snippets; discard all other upstream fields.
 return {provider:"BRAVE_SEARCH",protocol:BRAVE_SEARCH_PROTOCOL,web:{results:items.map(item=>({url:item.originalUrl,title:item.title,description:item.excerpt??""}))}};
}

type DenoRuntime = {
  env: { toObject(): Record<string, string> };
  serve(handler: (request: Request) => Response | Promise<Response>): unknown;
};

const deno = (globalThis as typeof globalThis & { Deno?: DenoRuntime }).Deno;
if (deno) {
  const env = deno.env.toObject();
  deno.serve((request) => handleRelayRequest(request, env));
}

function allowedSourceDocument(value:string) {
 const route=publicSourceRoute(value);
 if(!route)throw new Error("RELAY_PROVIDER_NOT_ALLOWED");
 return route.url;
}
async function collectSourceDocument(request:ReturnType<typeof parseRequest>,deadline:number) {
 let url=allowedSourceDocument(request.searchQuery);
 for(let redirects=0;redirects<=3;redirects++){
  const validators=redirects===0 && url===new URL(request.searchQuery).href?request.validators:{};
  const response=await fetch(url,{redirect:"manual",headers:{accept:"text/html, application/rss+xml, application/atom+xml, application/xml;q=0.9",...conditionalRequestHeaders(validators)},signal:upstreamSignal(deadline,10000)});
  if(response.status===304)return {provider:"PUBLIC_SOURCE_DOCUMENT",publicSourceRouteProtocol:PUBLIC_SOURCE_ROUTE_PROTOCOL,...await conditionalDocument(response,url,validators)};
  if(response.status>=300 && response.status<400){
   const location=response.headers.get("location");
   if(!location || redirects===3)throw new Error("RELAY_PROVIDER_NOT_ALLOWED");
   const next=allowedSourceDocument(new URL(location,url).href);
   const original=publicSourceRoute(request.searchQuery),nextRoute=publicSourceRoute(next);
   if((original?.authorFeed || nextRoute?.authorFeed) && new URL(next).origin!==new URL(request.searchQuery).origin)throw new Error("RELAY_PROVIDER_NOT_ALLOWED");
   url=next;continue;
  }
  return {provider:"PUBLIC_SOURCE_DOCUMENT",publicSourceRouteProtocol:PUBLIC_SOURCE_ROUTE_PROTOCOL,...await conditionalDocument(response,url,validators)};
 }
 throw new Error("RELAY_PROVIDER_NOT_ALLOWED");
}

async function conditionalDocument(response:Response,url:string,validators:ReturnType<typeof readHttpValidators>){
 if(response.status===304 && !validators.etag && !validators.lastModified)throw new SyntaxError("unexpected not modified");
 if(![200,304].includes(response.status))throw new Error("RELAY_UPSTREAM_HTTP_"+response.status);
 const headers=readHttpValidators({etag:response.headers.get("etag"),lastModified:response.headers.get("last-modified")});
 return {url,text:response.status===304?"":await checkedText(response),status:response.status,contentType:response.headers.get("content-type")??"text/plain",...headers,conditionalProtocol:CONDITIONAL_HTTP_PROTOCOL,observedAt:new Date().toISOString()};
}
async function collectDeepMindDocument(request:ReturnType<typeof parseRequest>,deadline:number){
 const url="https://deepmind.google/blog/rss.xml";
 const response=await fetch(url,{redirect:"error",headers:conditionalRequestHeaders(request.validators),signal:upstreamSignal(deadline,12000)});
 const document=await conditionalDocument(response,url,request.validators);
 return {provider:request.provider,...document,rssText:document.text};
}
async function collectWatchlistFeed(request:ReturnType<typeof parseRequest>,deadline:number){
 const requestedUrl=fixedWatchlistFeedUrl(request.searchQuery),url=watchlistFeedFetchUrl(request.searchQuery);
 if(!requestedUrl || !url)throw new Error("RELAY_PROVIDER_NOT_ALLOWED");
 const validators=url===requestedUrl?request.validators:{};
 const response=await fetch(url,{redirect:"error",headers:{accept:"application/rss+xml,application/atom+xml,application/xml,text/xml",...conditionalRequestHeaders(validators)},signal:upstreamSignal(deadline,12000)});
 return {provider:request.provider,requestedUrl,watchlistFeedVersion:WATCHLIST_FEED_POLICY_VERSION,...await conditionalDocument(response,url,validators)};
}

async function collectGithubReleasePage(request:ReturnType<typeof parseRequest>,deadline:number){
 const page=githubReleasePage(request.searchQuery);if(!page)throw new Error("RELAY_PROVIDER_NOT_ALLOWED");
 const response=await fetch(page.url,{redirect:"error",headers:{accept:"application/vnd.github+json","x-github-api-version":"2022-11-28","user-agent":"opc-collection-relay"},signal:upstreamSignal(deadline,12000)});
 if(response.status!==200)throw new Error("RELAY_UPSTREAM_HTTP_"+response.status);
 const link=response.headers.get("link");if(link && link.length>4096)throw new SyntaxError("link too large");
 return {provider:"GITHUB_RELEASES",url:page.url,status:200,body:await checkedText(response),link,paginationProtocol:GITHUB_RELEASE_POLICY_VERSION};
}

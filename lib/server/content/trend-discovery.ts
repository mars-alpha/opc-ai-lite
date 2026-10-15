import "server-only";
import { collectThroughOverseasRelay, isPublicSourceRelayEnabled, isOverseasRelayConfigured } from "./overseas-collector-relay-client";
import { readSourceAiRelevancePolicy, testSourceAiRelevance } from "./source-management-policy";
import { reserveSourceApiQuota } from "./source-api-quota-ledger";

export const TREND_DISCOVERY_PROVIDERS = [
  "HN_TOP",
  "HN_BEST",
  "GITHUB_TREND_PROXY",
  "BILIBILI_POPULAR",
  "HUGGINGFACE_MODELS",
  "HUGGINGFACE_PAPERS",
  "REDDIT_AI_HOT",
  "ARXIV_AI_RECENT",
  "AIHOT_SELECTED",
  "DAILYHOT_WEIBO",
  "DAILYHOT_ZHIHU",
  "DAILYHOT_DOUYIN",
  "DAILYHOT_BILIBILI",
  "DAILYHOT_BAIDU",
  "DAILYHOT_36KR",
  "DAILYHOT_ITHOME",
  "DAILYHOT_JUEJIN",
  "DAILYHOT_HELLOGITHUB",
  "DAILYHOT_DOMESTIC",
  "RSSHUB_DOMESTIC_HOT",
  "TRENDRADAR_SIGNAL",
  "YOUTUBE_AI_TREND",
  "GOOGLE_TRENDS",
  "PRODUCT_HUNT"
] as const;

export type TrendDiscoveryProvider = (typeof TREND_DISCOVERY_PROVIDERS)[number];

export type TrendDiscoveryConfig = {
  provider: TrendDiscoveryProvider;
  searchQuery: string;
  windowHours: number;
  resultLimit: number;
  minStars: number;
};

export type TrendDiscoveryItem = {
  externalId?: string | null;
  originalUrl?: string | null;
  title: string;
  author?: string | null;
  excerpt?: string | null;
  publishedAt?: string | null;
  platformMetrics?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

type JsonFetcher = (url: string) => Promise<unknown>;
type TextFetcher = (url: string) => Promise<{ body: string; finalUrl?: string } | string>;
type FetchImpl = typeof fetch;

type TrendDiscoveryDependencies = {
  reserveQuota?: typeof reserveSourceApiQuota;
  fetchText?: TextFetcher;
  fetchImpl?: FetchImpl;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function number(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function metricNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && /^\d+(?:\.\d+)?$/.test(value.trim())) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function boundedInteger(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.round(parsed)));
}

function isoFromUnixSeconds(value: unknown) {
  const seconds = number(value);
  if (seconds === null) return null;
  return new Date(seconds * 1000).toISOString();
}

function isoFromUnixTimestamp(value: unknown) {
  const timestamp = number(value);
  if (timestamp === null || timestamp <= 0) return null;
  const milliseconds = timestamp >= 100_000_000_000 ? timestamp : timestamp * 1000;
  const date = new Date(milliseconds);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

const DAILYHOT_PROVIDER_ROUTE = {
  DAILYHOT_WEIBO: "weibo",
  DAILYHOT_ZHIHU: "zhihu",
  DAILYHOT_DOUYIN: "douyin",
  DAILYHOT_BILIBILI: "bilibili",
  DAILYHOT_BAIDU: "baidu",
  DAILYHOT_36KR: "36kr",
  DAILYHOT_ITHOME: "ithome",
  DAILYHOT_JUEJIN: "juejin",
  DAILYHOT_HELLOGITHUB: "hellogithub",
  DAILYHOT_DOMESTIC: null
} as const;

export const DAILYHOT_DOMESTIC_RUNTIME_ROUTES = [
  { route: "36kr", platform: "36KR", role: "TECH_MEDIA" },
  { route: "juejin", platform: "JUEJIN", role: "DEVELOPER_COMMUNITY" },
  { route: "huxiu", platform: "HUXIU", role: "TECH_MEDIA" },
  { route: "hellogithub", platform: "HELLOGITHUB", role: "DEVELOPER_COMMUNITY" },
  { route: "weibo", platform: "WEIBO", role: "SOCIAL_SIGNAL" },
  { route: "zhihu", platform: "ZHIHU", role: "SOCIAL_SIGNAL" }
] as const;

export const DAILYHOT_DOMESTIC_EXCLUDED_ROUTES = [
  { route: "kuaishou", reason: "LIVE_HTTP_500" },
  { route: "ifanr", reason: "DIRECT_RSS_DUPLICATE" },
  { route: "sspai", reason: "DIRECT_RSS_DUPLICATE" },
  { route: "douyin", reason: "LOW_AI_YIELD" },
  { route: "bilibili", reason: "LOW_SIGNAL_PRECISION_AND_EXISTING_PUBLIC_CAPABILITY" },
  { route: "baidu", reason: "LOW_AI_YIELD" },
  { route: "tieba", reason: "LOW_QUALITY_DISCUSSION_SIGNAL" },
  { route: "ithome", reason: "LOW_AI_YIELD" },
  { route: "thepaper", reason: "ZERO_AI_YIELD_IN_017_SAMPLE" },
  { route: "toutiao", reason: "LOW_AI_YIELD" },
  { route: "qq-news", reason: "LOW_AI_YIELD" },
  { route: "sina-news", reason: "LOW_AI_YIELD" },
  { route: "netease-news", reason: "BROAD_PORTAL_LOW_MARGINAL_VALUE" }
] as const;

type DailyHotProvider = keyof typeof DAILYHOT_PROVIDER_ROUTE;

function isDailyHotProvider(provider: TrendDiscoveryProvider): provider is DailyHotProvider {
  return Object.prototype.hasOwnProperty.call(DAILYHOT_PROVIDER_ROUTE, provider);
}

function dailyHotRoute(provider: DailyHotProvider) {
  const fixed = DAILYHOT_PROVIDER_ROUTE[provider];
  if (fixed) return fixed;
  const legacy = (process.env.DAILYHOT_API_ROUTE ?? "weibo").trim().replace(/^\/+|\/+$/g, "");
  if (!legacy) throw new Error("TREND_DAILYHOT_ROUTE_INVALID");
  return legacy;
}

export function isStrictDomesticAiSignal(value: string) {
  const lower = value.toLowerCase();
  return (
    /(^|[^a-z0-9])ai([^a-z0-9]|$)/i.test(value) ||
    /(^|[^a-z0-9])agents?([^a-z0-9]|$)/i.test(value) ||
    /(^|[^a-z0-9])llms?([^a-z0-9]|$)/i.test(value) ||
    /(^|[^a-z0-9])mcp([^a-z0-9]|$)/i.test(value) ||
    lower.includes("人工智能") ||
    lower.includes("大模型") ||
    lower.includes("智能体") ||
    lower.includes("openai") ||
    lower.includes("anthropic") ||
    lower.includes("claude") ||
    lower.includes("chatgpt") ||
    /(^|[^a-z0-9])gpt(?:[-\s]?\d+)?([^a-z0-9]|$)/i.test(value) ||
    lower.includes("gemini") ||
    lower.includes("deepseek") ||
    lower.includes("智谱") ||
    /(^|[^a-z0-9])kimi([^a-z0-9]|$)/i.test(value) ||
    lower.includes("豆包") ||
    lower.includes("copilot") ||
    lower.includes("具身智能") ||
    lower.includes("机器人")
  );
}

function normalizedDomesticTitle(value: string) {
  return value.toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, "");
}

export function resolveTrendDiscoveryConfig(input: unknown): TrendDiscoveryConfig {
  const config = record(input);
  const providerValue =
    typeof config.provider === "string" ? config.provider.trim().toUpperCase() : "";
  if (!TREND_DISCOVERY_PROVIDERS.includes(providerValue as TrendDiscoveryProvider)) {
    throw new Error("TREND_PROVIDER_NOT_SUPPORTED");
  }
  return {
    provider: providerValue as TrendDiscoveryProvider,
    searchQuery: typeof config.searchQuery === "string" ? config.searchQuery.trim().slice(0, 500) : "",
    windowHours: boundedInteger(config.windowHours, 72, 1, 24 * 7),
    resultLimit: boundedInteger(config.resultLimit, 20, 1, 30),
    minStars: boundedInteger(config.minStars, 20, 0, 1_000_000)
  };
}

export function buildTrendDiscoveryPrimaryUrl(config: TrendDiscoveryConfig, now = Date.now()) {
  if (config.provider === "HN_TOP") {
    return "https://hacker-news.firebaseio.com/v0/topstories.json";
  }
  if (config.provider === "HN_BEST") {
    return "https://hacker-news.firebaseio.com/v0/beststories.json";
  }
  if (config.provider === "BILIBILI_POPULAR") {
    const url = new URL("https://api.bilibili.com/x/web-interface/popular");
    url.searchParams.set("pn", "1");
    url.searchParams.set("ps", String(config.resultLimit));
    return url.toString();
  }
  if (config.provider === "HUGGINGFACE_MODELS") {
    const url = new URL("https://huggingface.co/api/models");
    url.searchParams.set("sort", "trendingScore");
    url.searchParams.set("direction", "-1");
    url.searchParams.set("limit", String(config.resultLimit));
    if (config.searchQuery) url.searchParams.set("search", config.searchQuery);
    return url.toString();
  }
  if (config.provider === "HUGGINGFACE_PAPERS") {
    const url = new URL("https://huggingface.co/api/daily_papers");
    url.searchParams.set("limit", String(config.resultLimit));
    return url.toString();
  }
  if (config.provider === "REDDIT_AI_HOT") {
    const url = new URL("https://www.reddit.com/r/MachineLearning+LocalLLaMA+artificial/hot.json");
    url.searchParams.set("limit", String(config.resultLimit));
    url.searchParams.set("raw_json", "1");
    return url.toString();
  }
  if (config.provider === "ARXIV_AI_RECENT") {
    const url = new URL("https://export.arxiv.org/api/query");
    url.searchParams.set("search_query", config.searchQuery ? "all:" + config.searchQuery : "cat:cs.AI");
    url.searchParams.set("start", "0");
    url.searchParams.set("max_results", String(config.resultLimit));
    url.searchParams.set("sortBy", "submittedDate");
    url.searchParams.set("sortOrder", "descending");
    return url.toString();
  }
  if (config.provider === "AIHOT_SELECTED") {
    const url = new URL("https://aihot.news/api/v1/items");
    url.searchParams.set("mode", "selected");
    url.searchParams.set("window", "24h");
    url.searchParams.set("limit", String(config.resultLimit));
    return url.toString();
  }
  if (isDailyHotProvider(config.provider)) {
    const base = (process.env.DAILYHOT_API_BASE_URL ?? "").trim();
    if (!base) throw new Error("TREND_DAILYHOT_UNCONFIGURED");
    if (config.provider === "DAILYHOT_DOMESTIC") return base.replace(/\/+$/, "") + "/";
    const route = dailyHotRoute(config.provider);
    return new URL(route, base.replace(/\/+$/, "") + "/").toString();
  }
  if (config.provider === "RSSHUB_DOMESTIC_HOT") {
    const base = (process.env.RSSHUB_BASE_URL ?? "").trim();
    if (!base) throw new Error("TREND_RSSHUB_UNCONFIGURED");
    const parsedBase = new URL(base);
    if (process.env.NODE_ENV === "production" && parsedBase.hostname.toLowerCase() === "rsshub.app") {
      throw new Error("TREND_RSSHUB_PUBLIC_INSTANCE_FORBIDDEN");
    }
    const route = (process.env.RSSHUB_HOT_ROUTE ?? "/weibo/search/hot").trim();
    if (!route.startsWith("/")) throw new Error("TREND_RSSHUB_ROUTE_INVALID");
    return new URL(route, base.replace(/\/+$/, "") + "/").toString();
  }
  if (config.provider === "TRENDRADAR_SIGNAL") {
    const base = (process.env.TRENDRADAR_API_BASE_URL ?? "").trim();
    if (!base) throw new Error("TREND_TRENDRADAR_UNCONFIGURED");
    const platformId = (process.env.TRENDRADAR_PLATFORM_ID ?? "weibo").trim();
    if (!platformId) throw new Error("TREND_TRENDRADAR_PLATFORM_INVALID");
    const url = new URL("/api/s", base);
    url.searchParams.set("id", platformId);
    url.searchParams.set("latest", "");
    return url.toString();
  }
  if (config.provider === "GOOGLE_TRENDS") {
    const geo = (process.env.GOOGLE_TRENDS_GEO ?? "US").trim().toUpperCase();
    if (!/^[A-Z]{2}(?:-[A-Z0-9]{2,3})?$/.test(geo)) throw new Error("TREND_GOOGLE_TRENDS_GEO_INVALID");
    const url = new URL("https://trends.google.com/trending/rss");
    url.searchParams.set("geo", geo);
    return url.toString();
  }

  if (config.provider === "YOUTUBE_AI_TREND") {
    const key = (process.env.YOUTUBE_DATA_API_KEY ?? "").trim();
    if (!key && !isOverseasRelayConfigured()) throw new Error("TREND_YOUTUBE_UNCONFIGURED");
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("type", "video");
    url.searchParams.set("order", "viewCount");
    url.searchParams.set("q", config.searchQuery || "AI artificial intelligence");
    url.searchParams.set("maxResults", String(config.resultLimit));
    url.searchParams.set("publishedAfter", new Date(now - config.windowHours * 60 * 60 * 1000).toISOString());
    url.searchParams.set("key", key);
    return url.toString();
  }
  if (config.provider === "PRODUCT_HUNT") {
    if (!(process.env.PRODUCT_HUNT_API_TOKEN ?? "").trim()) throw new Error("TREND_PRODUCT_HUNT_UNCONFIGURED");
    return "https://api.producthunt.com/v2/api/graphql";
  }
  const cutoff = new Date(now - config.windowHours * 60 * 60 * 1000).toISOString().slice(0, 10);
  const query = [
    config.searchQuery || "AI",
    "pushed:>=" + cutoff,
    "stars:>=" + config.minStars
  ].join(" ");
  const url = new URL("https://api.github.com/search/repositories");
  url.searchParams.set("q", query);
  url.searchParams.set("sort", "stars");
  url.searchParams.set("order", "desc");
  url.searchParams.set("per_page", String(config.resultLimit));
  return url.toString();
}

function parseGithubTrendProxy(payload: unknown, config: TrendDiscoveryConfig): TrendDiscoveryItem[] {
  const root = record(payload);
  const items = Array.isArray(root.items) ? root.items : [];
  return items.flatMap((raw, index) => {
    const item = record(raw);
    const id = item.id === undefined || item.id === null ? "" : String(item.id);
    const title = text(item.full_name) ?? text(item.name);
    const originalUrl = text(item.html_url);
    if (!id || !title || !originalUrl) return [];
    const owner = record(item.owner);
    return [{
      externalId: "github:" + id,
      originalUrl,
      title,
      author: text(owner.login),
      excerpt: text(item.description),
      publishedAt: text(item.pushed_at) ?? text(item.updated_at),
      platformMetrics: {
        stars: number(item.stargazers_count),
        forks: number(item.forks_count),
        openIssues: number(item.open_issues_count),
        trendRank: index + 1
      },
      metadata: {
        collector: "trend",
        trendProvider: "GITHUB_TREND_PROXY",
        trendSignalType: "PROXY",
        trendRank: index + 1,
        proxyDefinition: "recently-pushed repositories sorted by stars",
        searchQuery: config.searchQuery,
        windowHours: config.windowHours,
        minStars: config.minStars,
        factualSource: false,
        referenceOnly: true,
        language: text(item.language)
      }
    }];
  });
}

function parseBilibiliPopular(payload: unknown): TrendDiscoveryItem[] {
  const root = record(payload);
  const data = record(root.data);
  const list = Array.isArray(data.list) ? data.list : [];
  return list.flatMap((raw, index) => {
    const item = record(raw);
    const bvid = text(item.bvid);
    const title = text(item.title);
    if (!bvid || !title) return [];
    const owner = record(item.owner);
    const stat = record(item.stat);
    return [{
      externalId: "bili:" + bvid,
      originalUrl: "https://www.bilibili.com/video/" + encodeURIComponent(bvid),
      title,
      author: text(owner.name),
      excerpt: text(item.desc),
      publishedAt: typeof item.pubdate === "number" ? new Date(item.pubdate * 1000).toISOString() : null,
      platformMetrics: {
        views: number(stat.view),
        likes: number(stat.like),
        comments: number(stat.reply),
        favorites: number(stat.favorite),
        shares: number(stat.share),
        trendRank: index + 1
      },
      metadata: {
        collector: "trend",
        trendProvider: "BILIBILI_POPULAR",
        trendSignalType: "RANKING",
        trendRank: index + 1,
        sourceMode: "PUBLIC",
        factualSource: false,
        referenceOnly: true
      }
    }];
  });
}

function parseHuggingFaceModels(payload: unknown): TrendDiscoveryItem[] {
  const items = Array.isArray(payload) ? payload : [];
  return items.flatMap((raw, index) => {
    const item = record(raw);
    const id = text(item.modelId) ?? text(item.id);
    if (!id) return [];
    return [{
      externalId: "hf-model:" + id,
      originalUrl: "https://huggingface.co/" + id,
      title: id,
      author: text(item.author),
      excerpt: Array.isArray(item.tags) ? item.tags.filter((x): x is string => typeof x === "string").slice(0, 8).join(" · ") : null,
      publishedAt: text(item.lastModified),
      platformMetrics: {
        likes: number(item.likes),
        downloads: number(item.downloads),
        trendRank: index + 1,
        trendingScore: number(item.trendingScore)
      },
      metadata: {
        collector: "trend",
        trendProvider: "HUGGINGFACE_MODELS",
        trendSignalType: "RANKING",
        trendRank: index + 1,
        sourceMode: "PUBLIC",
        factualSource: false,
        referenceOnly: true
      }
    }];
  });
}

function parseHuggingFacePapers(payload: unknown): TrendDiscoveryItem[] {
  const items = Array.isArray(payload) ? payload : [];
  return items.flatMap((raw, index) => {
    const item = record(raw);
    const paper = record(item.paper);
    const id = text(paper.id) ?? text(item.id);
    const title = text(paper.title) ?? text(item.title);
    if (!id || !title) return [];
    return [{
      externalId: "hf-paper:" + id,
      originalUrl: "https://huggingface.co/papers/" + encodeURIComponent(id),
      title,
      author: null,
      excerpt: text(paper.summary) ?? text(item.summary),
      publishedAt: text(paper.publishedAt) ?? text(item.publishedAt),
      platformMetrics: {
        likes: number(item.upvotes) ?? number(paper.upvotes),
        trendRank: index + 1
      },
      metadata: {
        collector: "trend",
        trendProvider: "HUGGINGFACE_PAPERS",
        trendSignalType: "RANKING",
        trendRank: index + 1,
        sourceMode: "PUBLIC",
        factualSource: false,
        referenceOnly: true
      }
    }];
  });
}

function parseRedditHot(payload: unknown): TrendDiscoveryItem[] {
  const root = record(payload);
  const data = record(root.data);
  const children = Array.isArray(data.children) ? data.children : [];
  return children.flatMap((raw, index) => {
    const child = record(raw);
    const item = record(child.data);
    const id = text(item.id);
    const title = text(item.title);
    const permalink = text(item.permalink);
    if (!id || !title || !permalink) return [];
    return [{
      externalId: "reddit:" + id,
      originalUrl: "https://www.reddit.com" + permalink,
      title,
      author: text(item.author),
      excerpt: text(item.selftext),
      publishedAt: isoFromUnixSeconds(item.created_utc),
      platformMetrics: {
        points: number(item.score),
        comments: number(item.num_comments),
        upvoteRatio: number(item.upvote_ratio),
        trendRank: index + 1
      },
      metadata: {
        collector: "trend",
        trendProvider: "REDDIT_AI_HOT",
        trendSignalType: "RANKING",
        trendRank: index + 1,
        sourceMode: "PUBLIC",
        subreddit: text(item.subreddit),
        factualSource: false,
        referenceOnly: true
      }
    }];
  });
}

function xmlValue(block: string, tag: string) {
  const match = block.match(new RegExp("<" + tag + "(?:\\s[^>]*)?>([\\s\\S]*?)</" + tag + ">", "i"));
  return match ? match[1].replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim() : null;
}

function parseArxivAtom(xml: string): TrendDiscoveryItem[] {
  const entries = xml.match(/<entry\b[\s\S]*?<\/entry>/gi) ?? [];
  return entries.flatMap((entry, index) => {
    const idUrl = xmlValue(entry, "id");
    const title = xmlValue(entry, "title");
    if (!idUrl || !title) return [];
    const id = idUrl.split("/abs/").pop() ?? idUrl;
    return [{
      externalId: "arxiv:" + id,
      originalUrl: idUrl,
      title,
      author: xmlValue(entry, "name"),
      excerpt: xmlValue(entry, "summary"),
      publishedAt: xmlValue(entry, "published"),
      platformMetrics: { trendRank: index + 1 },
      metadata: {
        collector: "trend",
        trendProvider: "ARXIV_AI_RECENT",
        trendSignalType: "RECENCY",
        trendRank: index + 1,
        sourceMode: "PUBLIC",
        factualSource: false,
        referenceOnly: true
      }
    }];
  });
}

function parseYouTubeSearch(payload: unknown): TrendDiscoveryItem[] {
  const root = record(payload);
  const items = Array.isArray(root.items) ? root.items : [];
  return items.flatMap((raw, index) => {
    const item = record(raw);
    const id = record(item.id);
    const snippet = record(item.snippet);
    const videoId = text(id.videoId);
    const title = text(snippet.title);
    if (!videoId || !title) return [];
    return [{
      externalId: "youtube:" + videoId,
      originalUrl: "https://www.youtube.com/watch?v=" + encodeURIComponent(videoId),
      title,
      author: text(snippet.channelTitle),
      excerpt: text(snippet.description),
      publishedAt: text(snippet.publishedAt),
      platformMetrics: { trendRank: index + 1 },
      metadata: {
        collector: "trend",
        trendProvider: "YOUTUBE_AI_TREND",
        creatorIdentity: text(snippet.channelId) ? {platform:"YOUTUBE",id:text(snippet.channelId),url:"https://www.youtube.com/channel/" + text(snippet.channelId)} : null,
        trendSignalType: "SEARCH_PROXY",
        trendRank: index + 1,
        sourceMode: "PUBLIC_API",
        factualSource: false,
        referenceOnly: true,
        proxyDefinition: "YouTube Data API search ordered by viewCount within the configured time window"
      }
    }];
  });
}

function parseProductHunt(payload: unknown): TrendDiscoveryItem[] {
  const root = record(payload);
  const data = record(root.data);
  const posts = record(data.posts);
  const edges = Array.isArray(posts.edges) ? posts.edges : [];
  return edges.flatMap((raw, index) => {
    const edge = record(raw);
    const node = record(edge.node);
    const id = node.id === undefined || node.id === null ? "" : String(node.id);
    const title = text(node.name);
    const url = text(node.url) ?? text(node.website);
    if (!id || !title || !url) return [];
    return [{
      externalId: "producthunt:" + id,
      originalUrl: url,
      title,
      author: null,
      excerpt: text(node.tagline) ?? text(node.description),
      publishedAt: text(node.createdAt),
      platformMetrics: {
        votes: number(node.votesCount),
        comments: number(node.commentsCount),
        trendRank: index + 1
      },
      metadata: {
        collector: "trend",
        trendProvider: "PRODUCT_HUNT",
        trendSignalType: "RANKING",
        trendRank: index + 1,
        sourceMode: "OFFICIAL_API",
        factualSource: false,
        referenceOnly: true
      }
    }];
  });
}

function parseAiHotSelected(payload: unknown): TrendDiscoveryItem[] {
  const root = record(payload);
  const items = Array.isArray(root.items) ? root.items : [];
  return items.flatMap((raw, index) => {
    const item = record(raw);
    const links = record(item.links);
    const source = record(item.source);
    const publicId = text(item.publicId) ?? text(item.id);
    const title = text(item.title) ?? text(item.originalTitle);
    const originalUrl = text(links.original);
    if (!title || !originalUrl) return [];
    return [{
      externalId: publicId ? "aihot:" + publicId : "aihot:" + originalUrl,
      originalUrl,
      title,
      author: text(source.name),
      excerpt: text(item.summary) ?? text(item.description),
      publishedAt: text(item.publishedAt) ?? text(item.createdAt),
      platformMetrics: { trendRank: index + 1 },
      metadata: {
        collector: "trend",
        trendProvider: "AIHOT_SELECTED",
        trendSignalType: "CURATED_DISCOVERY",
        trendRank: index + 1,
        sourceMode: "PUBLIC_API",
        sourceRole: "SECONDARY_DISCOVERY",
        aihotUrl: text(links.aihot),
        originalTitle: text(item.originalTitle),
        factualSource: false,
        referenceOnly: true
      }
    }];
  });
}

function rankingItems(payload: unknown) {
  const root = record(payload);
  if (Array.isArray(root.data)) return root.data;
  if (Array.isArray(root.items)) return root.items;
  if (Array.isArray(root.list)) return root.list;
  if (Array.isArray(root.news)) return root.news;
  return Array.isArray(payload) ? payload : [];
}

function parseConfigurableRankingJson(
  payload: unknown,
  provider: DailyHotProvider | "TRENDRADAR_SIGNAL",
  dailyHotPlatformOverride?: string
): TrendDiscoveryItem[] {
  return rankingItems(payload).flatMap((raw, index) => {
    const item = record(raw);
    const title = text(item.title) ?? text(item.name);
    const originalUrl = text(item.url) ?? text(item.link) ?? text(item.mobileUrl) ?? text(item.mobile_url);
    if (!title || !originalUrl) return [];
    const numericId = number(item.id);
    const id = item.id === undefined || item.id === null || (numericId !== null && numericId <= 0)
      ? null
      : String(item.id);
    const isDailyHot = provider !== "TRENDRADAR_SIGNAL";
    const dailyHotPlatform = isDailyHot ? (dailyHotPlatformOverride ?? dailyHotRoute(provider)) : null;
    return [{
      externalId: isDailyHot
        ? "dailyhot:" + dailyHotPlatform + ":" + (id ?? originalUrl)
        : "trendradar:" + (id ?? originalUrl),
      originalUrl,
      title,
      author: text(item.author),
      excerpt: text(item.desc) ?? text(item.description) ?? text(item.excerpt),
      publishedAt: text(item.publishedAt) ?? text(item.pubDate) ?? text(item.date) ?? isoFromUnixTimestamp(item.timestamp),
      platformMetrics: {
        trendRank: number(item.rank) ?? index + 1,
        hotValue: number(item.hot) ?? number(item.hotValue) ?? number(item.hot_value)
      },
      metadata: {
        collector: "trend",
        trendProvider: provider,
        trendSignalType: "RANKING",
        trendRank: number(item.rank) ?? index + 1,
        sourceMode: isDailyHot ? "CONFIGURABLE_API" : "TRENDRADAR_NEWSNOW_API",
        sourcePlatform: dailyHotPlatform?.toUpperCase() ?? null,
        sourceRole: "TREND_SIGNAL",
        rankingObservedNow: true,
        factualSource: false,
        referenceOnly: true
      }
    }];
  });
}

async function collectDailyHotDomestic(config: TrendDiscoveryConfig, fetchJson: JsonFetcher) {
  const base = (process.env.DAILYHOT_API_BASE_URL ?? "").trim();
  if (!base) throw new Error("TREND_DAILYHOT_UNCONFIGURED");
  const relevancePolicy = await readSourceAiRelevancePolicy();
  const routeResults = await Promise.allSettled(
    DAILYHOT_DOMESTIC_RUNTIME_ROUTES.map(async (route) => {
      const url = new URL(route.route, base.replace(/\/+$/, "") + "/").toString();
      const payload = await fetchJson(url);
      const items = parseConfigurableRankingJson(payload, "DAILYHOT_DOMESTIC", route.route)
        .map((item) => ({
          ...item,
          externalId: "dailyhot:" + route.route + ":" + (item.externalId ?? item.originalUrl ?? item.title),
          metadata: {
            ...(item.metadata ?? {}),
            sourcePlatform: route.platform,
            aggregatorRoute: route.route,
            aggregatorRole: route.role
          }
        }))
        .filter((item) => testSourceAiRelevance(item.title, relevancePolicy.terms).relevant);
      return { route, items };
    })
  );
  const succeeded = routeResults.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
  if (!succeeded.length) throw new Error("TREND_DAILYHOT_DOMESTIC_ALL_ROUTES_FAILED");
  const seen = new Set<string>();
  const perRoute = succeeded.map((result) => ({
    ...result,
    items: result.items.filter((item) => {
      const key = normalizedDomesticTitle(item.title);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
  }));
  const items: TrendDiscoveryItem[] = [];
  for (let rank = 0; items.length < config.resultLimit; rank += 1) {
    let added = false;
    for (const result of perRoute) {
      const item = result.items[rank];
      if (!item) continue;
      items.push(item);
      added = true;
      if (items.length >= config.resultLimit) break;
    }
    if (!added) break;
  }
  return { config, requestUrl: base, items };
}

function rssLink(block: string) {
  const plain = xmlValue(block, "link");
  if (plain) return plain;
  const match = block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*\/?\s*>/i);
  return match?.[1]?.trim() || null;
}

function parseRssHubHot(xml: string): TrendDiscoveryItem[] {
  const entries = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? xml.match(/<entry\b[\s\S]*?<\/entry>/gi) ?? [];
  return entries.flatMap((entry, index) => {
    const title = xmlValue(entry, "title");
    const originalUrl = rssLink(entry);
    if (!title || !originalUrl) return [];
    const guid = xmlValue(entry, "guid") ?? xmlValue(entry, "id") ?? originalUrl;
    return [{
      externalId: "rsshub-hot:" + guid,
      originalUrl,
      title,
      author: xmlValue(entry, "author"),
      excerpt: xmlValue(entry, "description") ?? xmlValue(entry, "summary") ?? xmlValue(entry, "content"),
      publishedAt: xmlValue(entry, "pubDate") ?? xmlValue(entry, "published") ?? xmlValue(entry, "updated"),
      platformMetrics: { trendRank: index + 1 },
      metadata: {
        collector: "trend",
        trendProvider: "RSSHUB_DOMESTIC_HOT",
        trendSignalType: "RANKING",
        trendRank: index + 1,
        sourceMode: "CONFIGURABLE_RSS",
        sourceRole: "TREND_SIGNAL",
        factualSource: false,
        referenceOnly: true
      }
    }];
  });
}

function parseApproxTraffic(value: string | null) {
  if (!value) return null;
  const cleaned = value.replace(/,/g, "").trim().toUpperCase();
  const match = cleaned.match(/([0-9]+(?:\.[0-9]+)?)\s*([KMB])?\+?/);
  if (!match) return null;
  const base = Number(match[1]);
  if (!Number.isFinite(base)) return null;
  const multiplier = match[2] === "B" ? 1_000_000_000 : match[2] === "M" ? 1_000_000 : match[2] === "K" ? 1_000 : 1;
  return Math.round(base * multiplier);
}

export function parseGoogleTrendsRss(xml: string): TrendDiscoveryItem[] {
  const entries = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];
  return entries.flatMap((entry, index) => {
    const title = xmlValue(entry, "title");
    if (!title) return [];
    const publishedAt = xmlValue(entry, "pubDate");
    const trafficText = xmlValue(entry, "ht:approx_traffic");
    const traffic = parseApproxTraffic(trafficText);
    const newsTitles = [...entry.matchAll(/<ht:news_item_title\b[^>]*>([\s\S]*?)<\/ht:news_item_title>/gi)]
      .map((match) => match[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim())
      .filter((value): value is string => Boolean(value))
      .slice(0, 5);
    const newsUrls = [...entry.matchAll(/<ht:news_item_url\b[^>]*>([\s\S]*?)<\/ht:news_item_url>/gi)]
      .map((match) => match[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim())
      .filter((value): value is string => Boolean(value))
      .slice(0, 5);
    const geo = (process.env.GOOGLE_TRENDS_GEO ?? "US").trim().toUpperCase();
    const explore = new URL("https://trends.google.com/trends/explore");
    explore.searchParams.set("geo", geo);
    explore.searchParams.set("q", title);

    return [{
      externalId: "google-trends:" + geo + ":" + title.toLocaleLowerCase(),
      originalUrl: explore.toString(),
      title,
      author: "Google Trends",
      excerpt: newsTitles[0] ?? null,
      publishedAt,
      platformMetrics: {
        trendRank: index + 1,
        searchVolumeApprox: traffic
      },
      metadata: {
        collector: "trend",
        trendProvider: "GOOGLE_TRENDS",
        trendSignalType: "SEARCH_TREND",
        trendRank: index + 1,
        sourceMode: "OFFICIAL_RSS",
        signalDimension: "PUBLIC_SEARCH_ATTENTION",
        geo,
        approxTrafficText: trafficText,
        relatedNewsTitles: newsTitles,
        relatedNewsUrls: newsUrls,
        factualSource: false,
        referenceOnly: true,
        rankingObservedNow: true
      }
    }];
  });
}

function parseHnItem(payload: unknown, provider: "HN_TOP" | "HN_BEST", rank: number): TrendDiscoveryItem | null {
  const item = record(payload);
  const id = item.id === undefined || item.id === null ? "" : String(item.id);
  const title = text(item.title);
  if (!id || !title || item.type !== "story") return null;
  return {
    externalId: "hn:" + id,
    originalUrl: text(item.url) ?? "https://news.ycombinator.com/item?id=" + encodeURIComponent(id),
    title,
    author: text(item.by),
    excerpt: null,
    publishedAt: isoFromUnixSeconds(item.time),
    platformMetrics: {
      points: number(item.score),
      comments: Array.isArray(item.kids) ? item.kids.length : 0,
      trendRank: rank
    },
    metadata: {
      collector: "trend",
      trendProvider: provider,
      trendSignalType: "RANKING",
      trendRank: rank,
      hnItemUrl: "https://news.ycombinator.com/item?id=" + encodeURIComponent(id),
      factualSource: false,
      referenceOnly: true
    }
  };
}

export async function collectTrendDiscovery(
  input: unknown,
  fetchJson: JsonFetcher,
  dependencies: TrendDiscoveryDependencies = {}
) {
  const config = resolveTrendDiscoveryConfig(input);
  const requestUrl = buildTrendDiscoveryPrimaryUrl(config);

  if (config.provider === "GITHUB_TREND_PROXY") {
    const relay = isPublicSourceRelayEnabled() ? await collectThroughOverseasRelay(config, dependencies.fetchImpl ?? fetch) : null;
    const payload = relay ? relay.payload : await fetchJson(requestUrl);
    return {
      config,
      requestUrl,
      items: parseGithubTrendProxy(payload, config).slice(0, config.resultLimit)
    };
  }

  if (config.provider === "BILIBILI_POPULAR") {
    const payload = await fetchJson(requestUrl);
    return { config, requestUrl, items: parseBilibiliPopular(payload).slice(0, config.resultLimit) };
  }

  if (config.provider === "HUGGINGFACE_MODELS") {
    const payload = await fetchJson(requestUrl);
    return { config, requestUrl, items: parseHuggingFaceModels(payload).slice(0, config.resultLimit) };
  }

  if (config.provider === "HUGGINGFACE_PAPERS") {
    const payload = await fetchJson(requestUrl);
    return { config, requestUrl, items: parseHuggingFacePapers(payload).slice(0, config.resultLimit) };
  }

  if (config.provider === "REDDIT_AI_HOT") {
    const payload = await fetchJson(requestUrl);
    return { config, requestUrl, items: parseRedditHot(payload).slice(0, config.resultLimit) };
  }

  if (config.provider === "ARXIV_AI_RECENT") {
    if (!dependencies.fetchText) throw new Error("TREND_ARXIV_TEXT_FETCHER_REQUIRED");
    const payload = await dependencies.fetchText(requestUrl);
    const xml = typeof payload === "string" ? payload : payload.body;
    return { config, requestUrl, items: parseArxivAtom(xml).slice(0, config.resultLimit) };
  }

  if (config.provider === "AIHOT_SELECTED") {
    const payload = await fetchJson(requestUrl);
    return { config, requestUrl, items: parseAiHotSelected(payload).slice(0, config.resultLimit) };
  }

  if (config.provider === "DAILYHOT_DOMESTIC") {
    return collectDailyHotDomestic(config, fetchJson);
  }

  if (isDailyHotProvider(config.provider) || config.provider === "TRENDRADAR_SIGNAL") {
    const payload = await fetchJson(requestUrl);
    return {
      config,
      requestUrl,
      items: parseConfigurableRankingJson(payload, config.provider).slice(0, config.resultLimit)
    };
  }

  if (config.provider === "RSSHUB_DOMESTIC_HOT") {
    if (!dependencies.fetchText) throw new Error("TREND_RSSHUB_TEXT_FETCHER_REQUIRED");
    const payload = await dependencies.fetchText(requestUrl);
    const xml = typeof payload === "string" ? payload : payload.body;
    return { config, requestUrl, items: parseRssHubHot(xml).slice(0, config.resultLimit) };
  }

  if (config.provider === "GOOGLE_TRENDS") {
    if (isOverseasRelayConfigured()) {
      const relay = await collectThroughOverseasRelay(config, dependencies.fetchImpl ?? fetch);
      const xml = typeof relay.rssText === "string" ? relay.rssText : "";
      if (!xml) throw new Error("TREND_GOOGLE_TRENDS_RELAY_PAYLOAD_INVALID");
      return { config, requestUrl, items: parseGoogleTrendsRss(xml).slice(0, config.resultLimit) };
    }
    if (!dependencies.fetchText) throw new Error("TREND_GOOGLE_TRENDS_TEXT_FETCHER_REQUIRED");
    const payload = await dependencies.fetchText(requestUrl);
    const xml = typeof payload === "string" ? payload : payload.body;
    return { config, requestUrl, items: parseGoogleTrendsRss(xml).slice(0, config.resultLimit) };
  }

  if (config.provider === "YOUTUBE_AI_TREND") {
    const useRelay = isOverseasRelayConfigured();
    await (dependencies.reserveQuota ?? reserveSourceApiQuota)("YOUTUBE", {
      units: useRelay ? 101 : 100,
      limit: 10_000,
      baseIntervalMinutes: 60,
      operation: useRelay ? "relay.search.list+videos.list" : "search.list"
    });
    const relay = useRelay
      ? await collectThroughOverseasRelay(config, dependencies.fetchImpl ?? fetch)
      : null;
    const payload = relay ? relay.searchPayload : await fetchJson(requestUrl);
    const items = parseYouTubeSearch(payload).slice(0, config.resultLimit);
    if (relay?.metricsStatus === "UNAVAILABLE") {
      for (const item of items) item.metadata = { ...item.metadata, metricsStatus: "UNAVAILABLE",
        metricsError: typeof relay.metricsError === "string" && /^RELAY_UPSTREAM_(?:HTTP_[1-5]\d\d|TIMEOUT|NETWORK_FAILED|PAYLOAD_INVALID|TOO_LARGE)$/.test(relay.metricsError) ? relay.metricsError : "RELAY_STATS_UNAVAILABLE" };
    }
    const videoIds = items.map((item) => item.externalId?.replace(/^youtube:/, "")).filter((item): item is string => Boolean(item));
    if (videoIds.length > 0) {
      if (!relay) await (dependencies.reserveQuota ?? reserveSourceApiQuota)("YOUTUBE", {
        units: 1,
        limit: 10_000,
        baseIntervalMinutes: 60,
        operation: "videos.list"
      });
      const key = (process.env.YOUTUBE_DATA_API_KEY ?? "").trim();
      const statsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
      statsUrl.searchParams.set("part", "statistics");
      statsUrl.searchParams.set("id", videoIds.join(","));
      statsUrl.searchParams.set("key", key);
      const statsPayload = record(relay ? relay.statsPayload : await fetchJson(statsUrl.toString()));
      const statsRows = Array.isArray(statsPayload.items) ? statsPayload.items : [];
      const statsById = new Map(statsRows.map((raw) => {
        const row = record(raw);
        return [String(row.id ?? ""), record(row.statistics)] as const;
      }));
      for (const item of items) {
        const videoId = item.externalId?.replace(/^youtube:/, "") ?? "";
        const stats = statsById.get(videoId);
        if (!stats) continue;
        item.platformMetrics = {
          ...item.platformMetrics,
          views: metricNumber(stats.viewCount),
          likes: metricNumber(stats.likeCount),
          comments: metricNumber(stats.commentCount)
        };
        item.metadata = {
          ...item.metadata,
          signalDimension: "VIDEO_ATTENTION"
        };
      }
    }
    return { config, requestUrl, items };
  }

  if (config.provider === "PRODUCT_HUNT") {
    const token = (process.env.PRODUCT_HUNT_API_TOKEN ?? "").trim();
    if (!token) throw new Error("TREND_PRODUCT_HUNT_UNCONFIGURED");
    const fetchImpl = dependencies.fetchImpl ?? fetch;
    const response = await fetchImpl(requestUrl, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer " + token },
      body: JSON.stringify({
        query: "query OPCTrend($first:Int!){ posts(first:$first, order:RANKING){ edges{ node{ id name tagline description url website votesCount commentsCount createdAt } } } }",
        variables: { first: config.resultLimit }
      }),
      signal: AbortSignal.timeout(12000)
    });
    if (!response.ok) throw new Error("TREND_PRODUCT_HUNT_PROVIDER_FAILED");
    const payload = await response.json();
    return { config, requestUrl, items: parseProductHunt(payload).slice(0, config.resultLimit) };
  }

  const idsPayload = await fetchJson(requestUrl);
  const ids = Array.isArray(idsPayload)
    ? idsPayload.filter((item): item is number => typeof item === "number" && Number.isInteger(item)).slice(0, config.resultLimit)
    : [];
  const settled = await Promise.allSettled(
    ids.map((id) => fetchJson("https://hacker-news.firebaseio.com/v0/item/" + id + ".json"))
  );
  const items = settled.flatMap((result, index) => {
    if (result.status !== "fulfilled") return [];
    const item = parseHnItem(result.value, config.provider as "HN_TOP" | "HN_BEST", index + 1);
    return item ? [item] : [];
  });
  return { config, requestUrl, items };
}

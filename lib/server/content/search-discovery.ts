import "server-only";

export const SEARCH_DISCOVERY_PROVIDERS = ["HN_ALGOLIA", "GITHUB_SEARCH"] as const;
export type SearchDiscoveryProvider = (typeof SEARCH_DISCOVERY_PROVIDERS)[number];

const DEFAULT_PROVIDER: SearchDiscoveryProvider = "HN_ALGOLIA";
const DEFAULT_WINDOW_HOURS = 24;
const DEFAULT_RESULT_LIMIT = 30;
const MAX_RESULT_LIMIT = 50;
const MAX_WINDOW_HOURS = 24 * 7;

export type SearchDiscoveryConfig = {
  provider: SearchDiscoveryProvider;
  searchQuery: string;
  windowHours: number;
  resultLimit: number;
};

export type SearchDiscoveryItem = {
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

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function number(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function boundedInteger(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.round(parsed)));
}

function isoDate(value: unknown) {
  const source = text(value);
  if (!source) return null;
  const date = new Date(source);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function resolveSearchDiscoveryConfig(input: unknown): SearchDiscoveryConfig {
  const config = record(input);
  const searchQuery = typeof config.searchQuery === "string" ? config.searchQuery.trim() : "";
  if (!searchQuery || searchQuery.length > 500) throw new Error("SEARCH_QUERY_REQUIRED");

  const providerValue =
    typeof config.provider === "string" && config.provider.trim()
      ? config.provider.trim().toUpperCase()
      : DEFAULT_PROVIDER;
  if (!SEARCH_DISCOVERY_PROVIDERS.includes(providerValue as SearchDiscoveryProvider)) {
    throw new Error("SEARCH_PROVIDER_NOT_SUPPORTED");
  }

  return {
    provider: providerValue as SearchDiscoveryProvider,
    searchQuery,
    windowHours: boundedInteger(config.windowHours, DEFAULT_WINDOW_HOURS, 1, MAX_WINDOW_HOURS),
    resultLimit: boundedInteger(config.resultLimit, DEFAULT_RESULT_LIMIT, 1, MAX_RESULT_LIMIT)
  };
}

export function buildSearchDiscoveryUrl(config: SearchDiscoveryConfig, now = Date.now()) {
  if (config.provider === "HN_ALGOLIA") {
    const url = new URL("https://hn.algolia.com/api/v1/search_by_date");
    url.searchParams.set("query", config.searchQuery);
    url.searchParams.set("tags", "story");
    url.searchParams.set("hitsPerPage", String(config.resultLimit));
    const cutoffSeconds = Math.floor((now - config.windowHours * 60 * 60 * 1000) / 1000);
    url.searchParams.set("numericFilters", "created_at_i>" + cutoffSeconds);
    return url.toString();
  }

  const url = new URL("https://api.github.com/search/repositories");
  const cutoff = new Date(now - config.windowHours * 60 * 60 * 1000).toISOString().slice(0, 10);
  url.searchParams.set("q", config.searchQuery + " pushed:>=" + cutoff);
  url.searchParams.set("sort", "updated");
  url.searchParams.set("order", "desc");
  url.searchParams.set("per_page", String(config.resultLimit));
  return url.toString();
}

function parseHnAlgolia(payload: unknown): SearchDiscoveryItem[] {
  const root = record(payload);
  const hits = Array.isArray(root.hits) ? root.hits : [];
  return hits.flatMap((value) => {
    const hit = record(value);
    const externalId = text(hit.objectID);
    const title = text(hit.title) ?? text(hit.story_title);
    if (!externalId || !title) return [];
    const originalUrl =
      text(hit.url) ??
      text(hit.story_url) ??
      "https://news.ycombinator.com/item?id=" + encodeURIComponent(externalId);

    return [{
      externalId: "hn:" + externalId,
      originalUrl,
      title,
      author: text(hit.author),
      excerpt: text(hit.story_text) ?? null,
      publishedAt: isoDate(hit.created_at),
      platformMetrics: {
        points: number(hit.points),
        comments: number(hit.num_comments)
      },
      metadata: {
        searchProvider: "HN_ALGOLIA",
        hnItemUrl: "https://news.ycombinator.com/item?id=" + encodeURIComponent(externalId)
      }
    }];
  });
}

function parseGithubSearch(payload: unknown): SearchDiscoveryItem[] {
  const root = record(payload);
  const items = Array.isArray(root.items) ? root.items : [];
  return items.flatMap((value) => {
    const item = record(value);
    const id = typeof item.id === "number" || typeof item.id === "string" ? String(item.id) : "";
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
      publishedAt: isoDate(item.pushed_at) ?? isoDate(item.updated_at),
      platformMetrics: {
        stars: number(item.stargazers_count),
        forks: number(item.forks_count),
        openIssues: number(item.open_issues_count)
      },
      metadata: {
        searchProvider: "GITHUB_SEARCH",
        language: text(item.language),
        topics: Array.isArray(item.topics) ? item.topics.filter((topic): topic is string => typeof topic === "string").slice(0, 30) : []
      }
    }];
  });
}

export function parseSearchDiscoveryResponse(provider: SearchDiscoveryProvider, payload: unknown) {
  return provider === "HN_ALGOLIA" ? parseHnAlgolia(payload) : parseGithubSearch(payload);
}

export async function collectSearchDiscovery(input: unknown, fetchJson: JsonFetcher) {
  const config = resolveSearchDiscoveryConfig(input);
  const requestUrl = buildSearchDiscoveryUrl(config);
  const payload = await fetchJson(requestUrl);
  const cutoff = Date.now() - config.windowHours * 60 * 60 * 1000;

  const items = parseSearchDiscoveryResponse(config.provider, payload)
    .filter((item) => {
      if (!item.publishedAt) return true;
      const time = new Date(item.publishedAt).getTime();
      return Number.isNaN(time) || time >= cutoff;
    })
    .slice(0, config.resultLimit)
    .map((item) => ({
      ...item,
      metadata: {
        ...(item.metadata ?? {}),
        collector: "search",
        searchProvider: config.provider,
        searchQuery: config.searchQuery,
        windowHours: config.windowHours,
        resultLimit: config.resultLimit
      }
    }));

  return { config, requestUrl, items };
}

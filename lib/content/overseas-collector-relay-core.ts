export const OVERSEAS_RELAY_PROVIDERS = ["YOUTUBE_AI_TREND", "GOOGLE_TRENDS"] as const;
export type OverseasRelayProvider = (typeof OVERSEAS_RELAY_PROVIDERS)[number];

export type OverseasRelayRequest = {
  provider: OverseasRelayProvider;
  searchQuery: string;
  windowHours: number;
  resultLimit: number;
};

export function parseOverseasRelayRequest(value: unknown): OverseasRelayRequest {
  const input = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const provider = typeof input.provider === "string" ? input.provider.trim().toUpperCase() : "";
  if (!OVERSEAS_RELAY_PROVIDERS.includes(provider as OverseasRelayProvider)) throw new Error("RELAY_PROVIDER_NOT_ALLOWED");
  const query = typeof input.searchQuery === "string" ? input.searchQuery.trim().slice(0, 500) : "";
  const windowHours = Math.max(1, Math.min(168, Math.round(Number(input.windowHours) || 72)));
  const resultLimit = Math.max(1, Math.min(30, Math.round(Number(input.resultLimit) || 20)));
  return { provider: provider as OverseasRelayProvider, searchQuery: query, windowHours, resultLimit };
}

async function checkedJson(response: Response) {
  if (!response.ok) throw new Error("RELAY_UPSTREAM_HTTP_" + response.status);
  const length = Number(response.headers.get("content-length") || "0");
  if (length > 2_000_000) throw new Error("RELAY_UPSTREAM_TOO_LARGE");
  const text = await response.text();
  if (text.length > 2_000_000) throw new Error("RELAY_UPSTREAM_TOO_LARGE");
  return JSON.parse(text);
}

async function checkedText(response: Response) {
  if (!response.ok) throw new Error("RELAY_UPSTREAM_HTTP_" + response.status);
  const length = Number(response.headers.get("content-length") || "0");
  if (length > 2_000_000) throw new Error("RELAY_UPSTREAM_TOO_LARGE");
  const text = await response.text();
  if (text.length > 2_000_000) throw new Error("RELAY_UPSTREAM_TOO_LARGE");
  return text;
}

export async function executeOverseasRelayRequest(
  request: OverseasRelayRequest,
  env: Record<string, string | undefined>,
  fetchImpl: typeof fetch = fetch
) {
  if (request.provider === "YOUTUBE_AI_TREND") {
    const key = env.YOUTUBE_DATA_API_KEY?.trim();
    if (!key) throw new Error("RELAY_YOUTUBE_KEY_REQUIRED");
    const search = new URL("https://www.googleapis.com/youtube/v3/search");
    search.searchParams.set("part", "snippet");
    search.searchParams.set("type", "video");
    search.searchParams.set("order", "viewCount");
    search.searchParams.set("q", request.searchQuery || "AI artificial intelligence");
    search.searchParams.set("maxResults", String(request.resultLimit));
    search.searchParams.set("publishedAfter", new Date(Date.now() - request.windowHours * 3600000).toISOString());
    search.searchParams.set("key", key);
    const searchPayload = await checkedJson(await fetchImpl(search, { signal: AbortSignal.timeout(12000) }));
    const rows = searchPayload && typeof searchPayload === "object" && Array.isArray((searchPayload as { items?: unknown[] }).items)
      ? (searchPayload as { items: Array<{ id?: { videoId?: string } }> }).items
      : [];
    const ids = rows.map((row) => row?.id?.videoId).filter((id): id is string => Boolean(id)).slice(0, 30);
    let statsPayload: unknown = { items: [] };
    if (ids.length) {
      const stats = new URL("https://www.googleapis.com/youtube/v3/videos");
      stats.searchParams.set("part", "statistics");
      stats.searchParams.set("id", ids.join(","));
      stats.searchParams.set("key", key);
      statsPayload = await checkedJson(await fetchImpl(stats, { signal: AbortSignal.timeout(12000) }));
    }
    return { provider: request.provider, searchPayload, statsPayload };
  }

  if (request.provider === "GOOGLE_TRENDS") {
    const geo = (env.GOOGLE_TRENDS_GEO ?? "US").trim().toUpperCase();
    if (!/^[A-Z]{2}(?:-[A-Z0-9]{2,3})?$/.test(geo)) throw new Error("RELAY_GOOGLE_TRENDS_GEO_INVALID");
    const url = new URL("https://trends.google.com/trending/rss");
    url.searchParams.set("geo", geo);
    const rssText = await checkedText(await fetchImpl(url, {
      headers: { accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8" },
      signal: AbortSignal.timeout(12_000)
    }));
    return { provider: request.provider, geo, rssText };
  }

  throw new Error("RELAY_PROVIDER_NOT_ALLOWED");
}

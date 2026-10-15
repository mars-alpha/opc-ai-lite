import assert from "node:assert/strict";
import { handleRelayRequest } from "../services/overseas-collector-relay/deno";
import { collectThroughOverseasRelay } from "../lib/server/content/overseas-collector-relay-client";
import { collectTrendDiscovery } from "../lib/server/content/trend-discovery";

const env = { OVERSEAS_COLLECTOR_RELAY_SECRET: "test-secret", YOUTUBE_DATA_API_KEY: "do-not-leak-key" };
function request(provider = "YOUTUBE_AI_TREND") {
  return new Request("https://relay.test/v1/collect", { method: "POST",
    headers: { authorization: "Bearer test-secret" },
    body: JSON.stringify({ provider, resultLimit: 1 }) });
}
async function main() {
  const originalFetch = globalThis.fetch;
  const originalTimeout = AbortSignal.timeout;
  const oldUrl = process.env.OVERSEAS_COLLECTOR_RELAY_URL;
  const oldSecret = process.env.OVERSEAS_COLLECTOR_RELAY_SECRET;
  process.env.OVERSEAS_COLLECTOR_RELAY_URL = "https://relay.test";
  process.env.OVERSEAS_COLLECTOR_RELAY_SECRET = "test-secret";
  const budgets: number[] = [];
  AbortSignal.timeout = (ms) => { budgets.push(ms); return originalTimeout(ms); };
  try {
    let calls = 0;
    globalThis.fetch = (async () => {
      calls++;
      if (calls === 1) return Response.json({ items: [{ id: { videoId: "v1" }, snippet: { title: "AI workflow" } }] });
      return new Response("unavailable", { status: 503 });
    }) as typeof fetch;
    const partial = await handleRelayRequest(request(), env);
    assert.equal(partial.status, 200, "OPTIONAL_STATS_FAILURE_MUST_KEEP_SEARCH_RESULTS");
    const payload = await partial.json() as Record<string, unknown>;
    assert.equal(payload.metricsStatus, "UNAVAILABLE");
    assert.equal(payload.metricsError, "RELAY_UPSTREAM_HTTP_503");
    assert.deepEqual(payload.statsPayload, { items: [] });
    assert(budgets[0]! <= 10_000 && budgets[1]! <= 5_000 && budgets[0]! + budgets[1]! < 20_000,
      "SEARCH_AND_STATS_BUDGET_WITHIN_CLIENT_DEADLINE");

    let directCalls = 0;
    const reservations: number[] = [];
    const collected = await collectTrendDiscovery({ provider: "YOUTUBE_AI_TREND", resultLimit: 1 }, async () => {
      directCalls++; throw Error("NO_DIRECT_FALLBACK");
    }, { reserveQuota: async (_provider, options) => { reservations.push(options.units); if (reservations.length > 1) throw Error("POST_SEARCH_RESERVATION_FORBIDDEN"); return undefined as never; }, fetchImpl: async () => Response.json(payload) });
    assert.equal(directCalls, 0);
    assert.deepEqual(reservations, [101], "RESERVE_RELAY_BUNDLE_BEFORE_NETWORK");
    assert.equal(collected.items.length, 1);
    assert.equal(collected.items[0]?.metadata?.metricsStatus, "UNAVAILABLE");
    assert.equal(collected.items[0]?.platformMetrics?.views, undefined, "NO_FAKE_ZERO_METRICS");

    assert.equal((await handleRelayRequest(request("X_AI_TREND"), env)).status, 400, "RETIRED_X_NOT_REENABLED_BY_DENO");
    let fixedUrl = "";
    globalThis.fetch = (async input => { fixedUrl = String(input); return new Response("<rss><channel><item><title>DeepMind</title></item></channel></rss>"); }) as typeof fetch;
    const feed = await handleRelayRequest(request("DEEPMIND_FEED"), env);
    assert.equal(feed.status, 200, "DEEPMIND_FIXED_FEED_RELAY");
    assert.equal(fixedUrl, "https://deepmind.google/blog/rss.xml");
    globalThis.fetch = (async input => { fixedUrl = String(input); return Response.json({ items: [] }); }) as typeof fetch;
    const github = await handleRelayRequest(request("GITHUB_TREND_PROXY"), env);
    assert.equal(github.status, 200, "GITHUB_FIXED_API_RELAY");
    assert.equal(new URL(fixedUrl).hostname, "api.github.com");

    globalThis.fetch = (async () => { throw new Error("https://upstream.test/?key=do-not-leak-key"); }) as typeof fetch;
    const failed = await handleRelayRequest(request(), env);
    const failureBody = await failed.text();
    assert.equal(failed.status, 502);
    assert(!failureBody.includes("do-not-leak-key"), "UNTRUSTED_UPSTREAM_ERROR_REDACTED");
    assert(failureBody.includes("RELAY_UPSTREAM_NETWORK_FAILED"));
    globalThis.fetch = (async () => { throw new DOMException("slow", "TimeoutError"); }) as typeof fetch;
    const timeout = await handleRelayRequest(request(), env);
    assert((await timeout.text()).includes("RELAY_UPSTREAM_TIMEOUT"));

    await assert.rejects(collectThroughOverseasRelay({ provider: "YOUTUBE_AI_TREND", windowHours: 24, resultLimit: 1, minStars: 0, searchQuery: "AI" },
      async () => Response.json({ error: "RELAY_UPSTREAM_HTTP_429" }, { status: 502 })), /RELAY_UPSTREAM_HTTP_429/);
    await assert.rejects(collectThroughOverseasRelay({ provider: "YOUTUBE_AI_TREND", windowHours: 24, resultLimit: 1, minStars: 0, searchQuery: "AI" },
      async () => Response.json({ error: "secret=do-not-leak-key" }, { status: 502 })), /^Error: OVERSEAS_COLLECTOR_RELAY_FAILED_502$/);
    console.log("COLLECTION_RELIABILITY_RELAY_DEADLINE_PARTIAL_METRICS_SAFE_ERRORS=PASS");
  } finally {
    globalThis.fetch = originalFetch; AbortSignal.timeout = originalTimeout;
    if (oldUrl === undefined) delete process.env.OVERSEAS_COLLECTOR_RELAY_URL; else process.env.OVERSEAS_COLLECTOR_RELAY_URL = oldUrl;
    if (oldSecret === undefined) delete process.env.OVERSEAS_COLLECTOR_RELAY_SECRET; else process.env.OVERSEAS_COLLECTOR_RELAY_SECRET = oldSecret;
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

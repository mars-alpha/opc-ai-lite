import { parseFeedDocument } from "../lib/server/content/collection-runner";
import {
  filterCheapDiscoveryCandidates,
  filterDiscoveryCandidates
} from "../lib/server/content/discovery-filter";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("CONTENT_AI_DISCOVERY_FILTER_FAILED:" + code);
}

async function main() {
  const now = new Date("2026-10-03T12:00:00Z");
  const mixed = parseFeedDocument(
    `<?xml version="1.0"?><rss><channel>
      <item><guid>ai-core</guid><title>OpenAI releases a new multimodal model and API</title><link>https://example.com/ai</link><description>Developers can use the new model through the API.</description><pubDate>2026-10-03T08:00:00Z</pubDate></item>
      <item><guid>industry-impact</guid><title>Retailer deploys AI agents to automate customer service workflow</title><link>https://example.com/retail-ai</link><description>The company says the AI workflow changes how support teams handle routine cases.</description><pubDate>2026-10-03T07:00:00Z</pubDate></item>
      <item><guid>ordinary-industry</guid><title>Automaker reports record quarterly vehicle sales</title><link>https://example.com/cars</link><description>Sales rose across several regional markets.</description><pubDate>2026-10-03T07:00:00Z</pubDate></item>
      <item><guid>old-ai</guid><title>Anthropic releases a new AI model</title><link>https://example.com/old-ai</link><description>An old item outside the active discovery window.</description><pubDate>2026-09-20T07:00:00Z</pubDate></item>
    </channel></rss>`,
    "https://example.com/feed.xml"
  );

  const cheap = filterCheapDiscoveryCandidates(mixed, {
    now,
    windowHours: 72
  });
  assert(cheap.items.some((item) => item.externalId === "ai-core"), "CHEAP_CORE_AI_DROPPED");
  assert(!cheap.items.some((item) => item.externalId === "old-ai"), "CHEAP_STALE_AI_RETAINED");
  assert(cheap.items.some((item) => item.externalId === "ordinary-industry"), "CHEAP_GATE_MUST_DEFER_AMBIGUOUS");

  const result = await filterDiscoveryCandidates(mixed, {
    now,
    windowHours: 72
  });

  assert(result.items.some((item) => item.externalId === "ai-core"), "CORE_AI_DROPPED");
  assert(result.items.some((item) => item.externalId === "industry-impact"), "AI_INDUSTRY_IMPACT_DROPPED");
  assert(result.items.some((item) => item.externalId === "ordinary-industry"), "ORDINARY_CONTEXT_PREMATURELY_DROPPED");
  assert(!result.items.some((item) => item.externalId === "old-ai"), "OUTDATED_AI_NEWS_KEPT");

  const strictSystemMedia = await filterDiscoveryCandidates(mixed, {
    now,
    windowHours: 72,
    requireExplicitAiRelation: true
  });
  assert(strictSystemMedia.items.some((item) => item.externalId === "ai-core"), "STRICT_CORE_AI_DROPPED");
  assert(strictSystemMedia.items.some((item) => item.externalId === "industry-impact"), "STRICT_AI_IMPACT_DROPPED");
  assert(!strictSystemMedia.items.some((item) => item.externalId === "ordinary-industry"), "STRICT_NON_AI_MEDIA_RETAINED");
  assert(
    strictSystemMedia.decisions.some((item) => item.reason === "NOT_AI_RELATED"),
    "STRICT_AI_RELEVANCE_REASON_MISSING"
  );

  const prominence = await filterDiscoveryCandidates([
    {
      externalId: "incidental-ai",
      originalUrl: "https://example.com/python-315",
      title: "Python 3.15.0 added to actions/python-versions",
      excerpt: "I even told ChatGPT to check for it.",
      publishedAt: "2026-10-03T09:00:00Z"
    },
    {
      externalId: "title-ai",
      originalUrl: "https://example.com/claude-workflow",
      title: "Claude Code adds a new agent workflow",
      excerpt: "Developers can automate more of the coding loop.",
      publishedAt: "2026-10-03T09:05:00Z"
    },
    {
      externalId: "excerpt-ai",
      originalUrl: "https://example.com/new-coding-workflow",
      title: "New coding workflow",
      excerpt: "Anthropic says Claude can now coordinate an AI agent workflow.",
      publishedAt: "2026-10-03T09:10:00Z"
    }
  ], { now, windowHours: 72, requireExplicitAiRelation: true });
  assert(!prominence.items.some((item) => item.externalId === "incidental-ai"), "INCIDENTAL_AI_MENTION_RETAINED");
  assert(prominence.decisions.some((item) => item.reason === "INCIDENTAL_AI_MENTION"), "INCIDENTAL_AI_REASON_MISSING");
  assert(prominence.items.some((item) => item.externalId === "title-ai"), "PROMINENT_AI_TITLE_DROPPED");
  assert(prominence.items.some((item) => item.externalId === "excerpt-ai"), "PROMINENT_AI_CONTEXT_DROPPED");

  const unavailable = await filterDiscoveryCandidates(
    [{
      externalId: "ambiguous",
      originalUrl: "https://example.com/automation",
      title: "Company changes customer operations",
      excerpt: "A new automation system is being introduced.",
      publishedAt: "2026-10-03T09:00:00Z"
    }],
    {
      now,
      windowHours: 72
    }
  );
  assert(unavailable.items.length === 1, "AMBIGUOUS_CONTEXT_MUST_REACH_CLUSTER");
  const ambiguousMetadata = (unavailable.items[0] as { metadata?: Record<string, unknown> } | undefined)?.metadata;
  const ambiguousFilter = ambiguousMetadata?.discoveryFilter as Record<string, unknown> | undefined;
  assert(ambiguousFilter?.relationType === "UNKNOWN", "AMBIGUOUS_CONTEXT_NOT_CLASSIFIED_UNKNOWN");

  const currentRanking = await filterDiscoveryCandidates([{
    externalId: "ranking-old-origin",
    originalUrl: "https://example.com/current-ranking",
    title: "Current platform ranking signal",
    publishedAt: "2026-09-20T07:00:00Z",
    metadata: {
      sourceRole: "TREND_SIGNAL",
      trendSignalType: "RANKING",
      rankingObservedNow: true
    }
  }], { now, windowHours: 72 });
  assert(currentRanking.items.length === 1, "CURRENT_RANKING_SIGNAL_DROPPED_BY_ORIGINAL_PUBLISH_TIME");

  const duplicates = [
    {
      externalId: "same-1",
      originalUrl: "https://example.com/one",
      title: "DeepSeek launches AI Agent API",
      publishedAt: "2026-10-03T09:00:00Z"
    },
    {
      externalId: "same-2",
      originalUrl: "https://example.com/two",
      title: "DeepSeek launches AI Agent API",
      publishedAt: "2026-10-03T09:10:00Z"
    }
  ];
  const duplicateResult = await filterDiscoveryCandidates(duplicates, { now, windowHours: 72 });
  assert(duplicateResult.items.length === 2, "FILTER_MUST_NOT_STEAL_GLOBAL_DEDUPE_OWNER");

  console.log("CONTENT_AI_DISCOVERY_FILTER_CHEAP_GATE=PASS");
  console.log("CONTENT_AI_DISCOVERY_FILTER_CORE_AI=PASS");
  console.log("CONTENT_AI_DISCOVERY_FILTER_INDUSTRY_IMPACT=PASS");
  console.log("CONTENT_AI_DISCOVERY_FILTER_ORDINARY_CONTEXT_RETAIN=PASS");
  console.log("CONTENT_AI_DISCOVERY_FILTER_STRICT_SYSTEM_MEDIA=PASS");
  console.log("CONTENT_AI_DISCOVERY_FILTER_PROMINENCE=PASS");
  console.log("CONTENT_AI_DISCOVERY_FILTER_STALE_DROP=PASS");
  console.log("CONTENT_AI_DISCOVERY_FILTER_CLUSTER_FIRST_BOUNDARY=PASS");
  console.log("CONTENT_AI_DISCOVERY_FILTER_CURRENT_RANKING_RECENCY=PASS");
  console.log("CONTENT_AI_DISCOVERY_FILTER_DEDUPE_BOUNDARY=PASS");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

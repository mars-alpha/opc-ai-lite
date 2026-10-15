import fs from "node:fs";
import { filterCheapDiscoveryCandidates } from "../lib/server/content/discovery-filter";
import {
  buildEntityActionVersionKey,
  normalizeRawTitle,
  rawNormalizedTitleHash
} from "../lib/server/content/raw-relevance-dedup";
import { scoreEventSeedCandidate } from "../lib/server/content/event-seed-clustering";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("RAW_RELEVANCE_DEDUP_005_FAILED:" + code);
  console.log(code + "=PASS");
}

const now = new Date("2026-10-12T10:00:00Z");
const cheap = filterCheapDiscoveryCandidates([
  {
    externalId: "fresh-ai",
    originalUrl: "https://example.com/fresh",
    title: "OpenAI releases GPT-5.6 API update",
    publishedAt: "2026-10-12T08:00:00Z"
  },
  {
    externalId: "stale-ai",
    originalUrl: "https://example.com/stale",
    title: "OpenAI releases an older AI update",
    publishedAt: "2026-09-20T08:00:00Z"
  },
  {
    externalId: "non-content",
    originalUrl: "https://example.com/about",
    title: "About",
    publishedAt: "2026-10-12T08:00:00Z"
  },
  {
    externalId: "ambiguous",
    originalUrl: "https://example.com/tool",
    title: "Acme ships version 2.1",
    publishedAt: "2026-10-12T08:00:00Z"
  }
], { now, windowHours: 168, sourceType: "MEDIA" });

assert(cheap.items.some((item) => item.externalId === "fresh-ai"), "CHEAP_GATE_RETAINS_RELEVANT");
assert(!cheap.items.some((item) => item.externalId === "stale-ai"), "CHEAP_GATE_DROPS_STALE");
assert(!cheap.items.some((item) => item.externalId === "non-content"), "CHEAP_GATE_DROPS_NON_CONTENT");
assert(cheap.items.some((item) => item.externalId === "ambiguous"), "CHEAP_GATE_DEFERS_AMBIGUOUS");
assert(
  cheap.decisions.some((item) => item.reason === "CHEAP_DEFER_TO_ENTITY_CONTEXT"),
  "CHEAP_GATE_ENTITY_DEFER_REASON"
);

assert(
  normalizeRawTitle("  GPT-5.6:  New API!!! ") === normalizeRawTitle("gpt 5 6 new api"),
  "NORMALIZED_TITLE_STABLE"
);
assert(
  rawNormalizedTitleHash("OpenAI launches GPT-5.6 API") ===
    rawNormalizedTitleHash("OpenAI launches GPT 5.6 API"),
  "TITLE_HASH_PUNCTUATION_STABLE"
);

const semanticA = buildEntityActionVersionKey({
  title: "OpenAI releases GPT-5.6 for developers",
  entities: ["entity_openai", "entity_gpt"],
  eventType: "PRODUCT_UPDATE"
});
const semanticB = buildEntityActionVersionKey({
  title: "GPT 5.6 launched by OpenAI with a new developer API",
  entities: ["entity_gpt", "entity_openai"],
  eventType: "PRODUCT_UPDATE"
});
assert(Boolean(semanticA) && semanticA === semanticB, "ENTITY_ACTION_VERSION_KEY_STABLE");

const semanticCluster = scoreEventSeedCandidate(
  {
    title: "OpenAI releases GPT-5.6 for developers",
    entities: ["entity_openai", "entity_gpt"],
    keywords: [],
    eventType: "PRODUCT_UPDATE",
    observedAt: new Date("2026-10-12T09:00:00Z")
  },
  {
    id: "event-existing",
    title: "GPT 5.6 launched by OpenAI with a new developer API",
    entities: ["entity_gpt", "entity_openai"],
    keywords: [],
    eventType: "PRODUCT_UPDATE",
    firstSeenAt: new Date("2026-10-12T08:00:00Z"),
    lastSeenAt: new Date("2026-10-12T08:30:00Z")
  }
);
assert(semanticCluster?.reason === "ENTITY_ACTION_VERSION_EXACT", "EVENT_SEMANTIC_KEY_CLUSTER");

const runner = fs.readFileSync("lib/server/content/collection-runner.ts", "utf8");
const discovery = fs.readFileSync("lib/server/content/discovery.ts", "utf8");
assert(
  runner.indexOf("filterCheapDiscoveryCandidates") < runner.indexOf("resolveKnownEntities({"),
  "CHEAP_GATE_BEFORE_ENTITY_RESOLUTION"
);
assert(runner.includes("cheapGate: cheapFilterResult.stats"), "CHEAP_GATE_RUN_OBSERVABILITY");
assert(discovery.includes("rawNormalizedTitleHash(item.title)"), "SAME_SOURCE_TITLE_DEDUP_WIRED");
assert(discovery.includes("eq(contentRawItems.sourceId, source)"), "TITLE_DEDUP_SOURCE_SCOPED");
assert(!fs.readFileSync("lib/server/db/schema.ts", "utf8").includes("normalized_title_hash"), "NO_NEW_DB_MIGRATION");

console.log("RAW_RELEVANCE_DEDUP_005=PASS");

import {
  COLLECTION_CAPABILITY_REGISTRY,
  buildCollectionCapabilityHealthSnapshot,
  healthyCreatorExpansionProviders,
  resolveCollectionCapabilityRoute
} from "../lib/server/content/collection-capability-router";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("COLLECTION_CAPABILITY_ROUTER_016_FAILED:" + code);
}

const biliSearchDefinition = COLLECTION_CAPABILITY_REGISTRY.BILIBILI.SEARCH;
const youtubeSearchDefinition = COLLECTION_CAPABILITY_REGISTRY.YOUTUBE.SEARCH;

assert(Boolean(biliSearchDefinition), "BILI_SEARCH_DEFINITION");
assert(Boolean(youtubeSearchDefinition), "YOUTUBE_SEARCH_DEFINITION");

assert(biliSearchDefinition!.backends[0]?.id === "BILIBILI_PUBLIC_SEARCH_API", "BILI_PRIMARY");
assert(youtubeSearchDefinition!.backends[0]?.id === "YOUTUBE_DATA_API_SEARCH", "YOUTUBE_PRIMARY");
assert(
  !JSON.stringify(COLLECTION_CAPABILITY_REGISTRY).includes("BROWSER_SESSION"),
  "NO_BROWSER_SESSION_BACKEND"
);

const healthy = buildCollectionCapabilityHealthSnapshot({
  env: {
    YOUTUBE_DATA_API_KEY: "yt-key"
  },
  overseasRelayConfigured: false
});

const bili = resolveCollectionCapabilityRoute("BILIBILI", "SEARCH", healthy);
assert(bili.status === "READY", "BILI_ROUTE_READY");
assert(bili.activeBackend?.id === "BILIBILI_PUBLIC_SEARCH_API", "BILI_ROUTE_PRIMARY");

const yt = resolveCollectionCapabilityRoute("YOUTUBE", "SEARCH", healthy);
assert(yt.activeBackend?.id === "YOUTUBE_DATA_API_SEARCH", "YOUTUBE_DATA_API_SELECTED");

const noLogin = buildCollectionCapabilityHealthSnapshot({
  env: {},
  overseasRelayConfigured: false
});
const ytMissing = resolveCollectionCapabilityRoute("YOUTUBE", "SEARCH", noLogin);
assert(ytMissing.status === "CONFIG_REQUIRED", "YOUTUBE_MISSING_CONFIG_FAIL_CLOSED");

const ytRelay = buildCollectionCapabilityHealthSnapshot({
  env: {},
  overseasRelayConfigured: true
});
const ytRelayRoute = resolveCollectionCapabilityRoute("YOUTUBE", "SEARCH", ytRelay);
assert(ytRelayRoute.activeBackend?.id === "YOUTUBE_RELAY_SEARCH", "YOUTUBE_RELAY_FALLBACK");

const creatorDefaults = ["BILIBILI", "YOUTUBE"]
  .map((platform) => resolveCollectionCapabilityRoute(platform as "BILIBILI" | "YOUTUBE", "SEARCH", healthy))
  .map((route) => route.expansionProvider);
assert(creatorDefaults.join(",") === "BILIBILI_SEARCH,YOUTUBE_SEARCH", "CREATOR_DEFAULT_PROVIDER_MAPPING");

const partialHealth = buildCollectionCapabilityHealthSnapshot({
  env: {},
  overseasRelayConfigured: false
});
assert(
  healthyCreatorExpansionProviders(partialHealth).join(",") === "BILIBILI_SEARCH",
  "UNHEALTHY_CREATOR_PROVIDER_MUST_BE_SKIPPED"
);

console.log("COLLECTION_CAPABILITY_ROUTER_016_REGISTRY=PASS");
console.log("COLLECTION_CAPABILITY_ROUTER_016_HEALTH=PASS");
console.log("COLLECTION_CAPABILITY_ROUTER_016_FALLBACK=PASS");
console.log("COLLECTION_CAPABILITY_ROUTER_SERVER_ONLY=PASS");
console.log("COLLECTION_CAPABILITY_ROUTER_016_CREATOR_MAPPING=PASS");

import fs from "node:fs";
import { RADAR_SOURCE_PORTFOLIO } from "../lib/content/radar-source-portfolio";
import {
  acquisitionSupportsServerRuntime,
  resolveSourceAcquisitionPlan
} from "../lib/server/content/source-acquisition-plan";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("SOURCE_ACQUISITION_ROUTING_FAILED:" + code);
  console.log(code + "=PASS");
}

const routed = resolveSourceAcquisitionPlan({
  collectionMethod: "RSS",
  platform: "WEB",
  canonicalUrl: "https://example.com/feed.xml",
  collectionConfig: {
    acquisition: {
      routes: [
        {
          id: "native-feed",
          role: "PRIMARY",
          kind: "RSS_ATOM",
          url: "https://example.com/feed.xml",
          costLevel: "LOW"
        },
        {
          id: "reader-fallback",
          role: "FALLBACK",
          kind: "JINA_READER",
          url: "https://example.com/",
          costLevel: "HIGH"
        }
      ]
    }
  }
});

assert(routed.routes.length === 2, "ROUTES_EXPLICIT_TWO");
assert(routed.primaryRoute.id === "native-feed" && routed.primaryRoute.role === "PRIMARY", "PRIMARY_ROUTE_STABLE");
assert(routed.fallbackRoutes.length === 1 && routed.fallbackRoutes[0]?.id === "reader-fallback", "FALLBACK_ROUTE_STABLE");
assert(routed.primaryRoute.costLevel === "LOW" && routed.fallbackRoutes[0]?.costLevel === "HIGH", "ROUTE_COST_LEVELS");
assert(routed.kind === "RSS_ATOM" && routed.fallbackKinds[0] === "JINA_READER", "LEGACY_MIRROR_DERIVED_FROM_ROUTES");

const disabledFallback = resolveSourceAcquisitionPlan({
  collectionMethod: "RSS",
  platform: "WEB",
  canonicalUrl: "https://example.com/feed.xml",
  collectionConfig: {
    acquisition: {
      routes: [
        { id: "primary", role: "PRIMARY", kind: "RSS_ATOM", url: "https://example.com/feed.xml" },
        { id: "disabled", role: "FALLBACK", kind: "JINA_READER", url: "https://example.com/", enabled: false }
      ]
    }
  }
});
assert(disabledFallback.routes.length === 2, "DISABLED_ROUTE_PRESERVED");
assert(disabledFallback.fallbackRoutes[0]?.enabled === false, "DISABLED_ROUTE_NOT_RUNNABLE");

const legacy = resolveSourceAcquisitionPlan({
  collectionMethod: "RSS",
  platform: "WEB",
  canonicalUrl: "https://example.com/feed.xml",
  collectionConfig: {
    acquisition: {
      kind: "RSS_ATOM",
      url: "https://example.com/feed.xml",
      fallbackKinds: ["JINA_READER"]
    }
  }
});
assert(legacy.routes.length === 2 && legacy.primaryRoute.kind === "RSS_ATOM", "LEGACY_CONFIG_MIGRATES_TO_ROUTES");
assert(legacy.fallbackRoutes[0]?.kind === "JINA_READER", "LEGACY_FALLBACK_MIGRATES");

assert(acquisitionSupportsServerRuntime("RSS_ATOM"), "NATIVE_FEED_SERVER_RUNTIME");
assert(acquisitionSupportsServerRuntime("SITEMAP"), "SITEMAP_SERVER_RUNTIME");
assert(acquisitionSupportsServerRuntime("JINA_READER"), "READER_SERVER_RUNTIME");
assert(!acquisitionSupportsServerRuntime("SOCIAL_BROWSER"), "BROWSER_NOT_GENERIC_SERVER_RUNTIME");

assert(RADAR_SOURCE_PORTFOLIO.every((source) =>
  source.acquisition.routes.length >= 1 &&
  source.acquisition.routes[0]?.role === "PRIMARY"
), "PORTFOLIO_ALL_ROUTE_BASED");
assert(RADAR_SOURCE_PORTFOLIO.every((source) =>
  !source.acquisition.routes.some((route) => String(route.kind) === "STATIC_PAGE")
), "PORTFOLIO_NO_STATIC_DEFAULT_ROUTE");

const runner = fs.readFileSync("lib/server/content/collection-runner.ts", "utf8");
const sourceManagement = fs.readFileSync("lib/server/content/source-management.ts", "utf8");
const onboarding = fs.readFileSync("lib/server/content/source-onboarding.ts", "utf8");
const portfolioRuntime = fs.readFileSync("lib/server/content/source-portfolio-runtime.ts", "utf8");
const runtimeAdapters = fs.readFileSync("lib/server/content/source-acquisition-runtime-adapters.ts", "utf8");

assert(runner.includes("for (const route of runnableRoutes)"), "RUNNER_ROUTE_ORDER_EXECUTION");
assert(runner.includes("acquisitionRouteAttempts") && runner.includes("acquisitionRouteCostLevel"), "RUNNER_ROUTE_ATTEMPT_OBSERVABILITY");
assert(runner.includes("acquisitionFallbackReason"), "RUNNER_FALLBACK_REASON_OBSERVABILITY");
assert(runner.includes('route.kind === "JINA_READER"'), "RUNNER_FALLBACK_KIND_DISPATCH");
assert(runner.includes('route.kind === "SITEMAP"'), "RUNNER_SITEMAP_DISPATCH");
assert(sourceManagement.includes("fallbackRouteCount") && sourceManagement.includes("lastErrorCode"), "SOURCE_MANAGEMENT_ROUTE_HEALTH");
assert(sourceManagement.includes("fallbackReason"), "SOURCE_MANAGEMENT_FALLBACK_REASON");
assert(onboarding.includes("routes: [primaryRoute]"), "ONBOARDING_WRITES_ROUTE_SCHEMA");
assert(onboarding.includes("discoverSitemap") && onboarding.includes('"SITEMAP_LIVE_CHECK_PASSED"'), "ONBOARDING_SITEMAP_DISCOVERY");
assert(
  portfolioRuntime.includes("runSourceCollection") &&
  !portfolioRuntime.includes("acquisition.primaryRoute"),
  "PORTFOLIO_DELEGATES_ROUTE_EXECUTION_TO_RUNNER"
);
assert(
  runner.includes("collectSourceRuntimeAdapter") &&
  runtimeAdapters.includes("RADAR_AI_HOT") &&
  !runtimeAdapters.includes("RADAR_FOLLOW_BUILDERS"),
  "RUNTIME_ADAPTER_DISPATCH_WIRED"
);

console.log("SOURCE_ACQUISITION_ROUTING_004=PASS");

import {
  classifySourceAssetForCleanup
} from "../lib/server/content/source-asset-cleanup";
import {
  SOURCE_QUALIFICATION_RECENT_RUN_LIMIT,
  SOURCE_QUALIFICATION_SAFETY_LOOKBACK_DAYS,
  selectRecentQualificationRuns
} from "../lib/server/content/source-qualification";
import fs from "node:fs";

function assert(condition: unknown, code: string) {
  if (!condition) throw new Error("SOURCE_ASSET_CLEANUP_012_FAILED:" + code);
  console.log(code + "=PASS");
}

const now = new Date("2026-10-13T12:00:00.000Z");
const run = (daysAgo: number, status = "SUCCEEDED") => ({
  sourceId: "source-low-frequency-official",
  status,
  receivedCount: 1,
  metadata: { collectionOrigin: "SYSTEM" },
  startedAt: new Date(now.getTime() - daysAgo * 86_400_000)
});
const selected = selectRecentQualificationRuns(
  [run(40), run(45), run(50), run(55), run(60), run(70)],
  now
);
assert(selected.sample.length === SOURCE_QUALIFICATION_RECENT_RUN_LIMIT, "RECENT_N_FIRST_ACROSS_30_DAYS");
assert(selected.sample.every((item) => item.startedAt < new Date(now.getTime() - 30 * 86_400_000)), "LOW_FREQUENCY_OFFICIAL_EVIDENCE_NOT_CUT_AT_30_DAYS");
assert(SOURCE_QUALIFICATION_SAFETY_LOOKBACK_DAYS > 30, "TIME_WINDOW_ONLY_SAFETY_FALLBACK");

const tooOld = selectRecentQualificationRuns([run(200), run(220)], now);
assert(tooOld.sample.length === 0, "EXTREMELY_OLD_RUNS_EXCLUDED_BY_SAFETY_BOUND");

const withInFlight = selectRecentQualificationRuns(
  [
    run(0, "RUNNING"),
    run(1, "SUCCEEDED"),
    run(2, "SUCCEEDED"),
    run(3, "SUCCEEDED"),
    run(4, "SUCCEEDED"),
    run(5, "SUCCEEDED")
  ],
  now
);
assert(withInFlight.sample.length === SOURCE_QUALIFICATION_RECENT_RUN_LIMIT, "IN_FLIGHT_RUN_DOES_NOT_DISPLACE_COMPLETED_RECENT_N");
assert(withInFlight.sample.every((item) => item.status === "SUCCEEDED"), "IN_FLIGHT_RUN_EXCLUDED_FROM_QUALIFICATION_EVIDENCE");

const baseSource = {
  id: "source_manual_test",
  name: "Legacy Manual",
  sourceType: "MANAGED_SOURCE",
  canonicalUrl: "https://example.com",
  providerRef: "MANUAL:https://example.com",
  status: "ACTIVE",
  platform: "WEB",
  collectionMethod: "HTTP",
  enabled: true,
  authorityScore: 50,
  topics: [],
  collectionConfig: {},
  signalConfig: {},
  lastCollectedAt: null,
  metadata: { sourceRegistry: { usageMode: "MANUAL" } },
  createdAt: now,
  updatedAt: now
};

const manual = classifySourceAssetForCleanup(baseSource);
assert(manual.action === "ARCHIVE", "LEGACY_MANUAL_ASSET_ARCHIVED");

const onboarded = classifySourceAssetForCleanup({
  ...baseSource,
  id: "source_manual_onboarded",
  metadata: {
    sourceRegistry: { usageMode: "SYSTEM" },
    sourceOnboarding: { version: "source-onboarding-v1" }
  }
});
assert(onboarded.action === "KEEP", "CURRENT_ONBOARDED_SOURCE_WITH_LEGACY_ID_KEPT");

const portfolio = fs.readFileSync("lib/content/radar-source-portfolio.ts", "utf8");
const adapters = fs.readFileSync("lib/server/content/source-acquisition-runtime-adapters.ts", "utf8");
const runtime = fs.readFileSync("lib/server/content/source-qualification-runtime.ts", "utf8");
assert(!portfolio.includes("artificialintelligence-news.com"), "AI_NEWS_UNSTABLE_SOURCE_RETIRED");
assert(!portfolio.includes("follow-builders") && !adapters.includes("RADAR_FOLLOW_BUILDERS") && !adapters.includes("collectFollowBuilders"), "FOLLOW_BUILDERS_UNSTABLE_LINE_RETIRED");
assert(runtime.includes("listSourceQualificationSnapshots"), "RUNTIME_RECONCILE_USES_CURRENT_QUALIFICATION_OWNER");
assert(
  runtime.includes("priorRuntime.checkpoint === checkpoint.checkpoint"),
  "ROUTE_CHANGE_RELEASES_STALE_RUNTIME_DEGRADE"
);
assert(runtime.includes("RUNTIME_RECOVERED_FROM_CONDITIONAL"), "CONDITIONAL_CAN_RECOVER_FROM_CURRENT_EVIDENCE");

console.log("SOURCE_ASSET_CLEANUP_012=PASS");

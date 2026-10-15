import assert from "node:assert/strict";
import fs from "node:fs";
import { filterCheapDiscoveryCandidates, filterDiscoveryCandidates, type DiscoveryCandidate } from "../lib/server/content/discovery-filter";
import * as runtime from "../lib/server/content/source-runtime-governance-execution";

async function main() {
  const now = new Date("2026-10-15T08:00:00Z");
  const cases = [
    ["rea", "REA: Reverse Engineer Anything", "https://github.com/morluto/rea", "Inspect applications with agents"],
    ["comfy", "ComfyUI workflow for image to video", "https://example.com/comfy", "Install and run the example"],
    ["mcp", "MCP server for Feishu", "https://example.com/mcp", "Collect and organize documents"],
    ["ads", "投流 Skill 配置与实测", "https://example.com/ads", "配置投放素材工作流"],
    ["writing", "人味写作 skill 使用教程", "https://example.com/writing", "文章改写步骤"],
    ["layout", "排版配图 skill", "https://example.com/layout", "自动整理文章配图"],
    ["image", "生图 skill 配置教程", "https://example.com/image", "可复现步骤"],
    ["animation", "图生动画 skill", "https://example.com/animation", "文生动画示例"],
    ["video", "视频脚本剪辑 skill", "https://example.com/video", "工作流与示例"],
    ["collect", "微信群飞书信息整理 skill", "https://example.com/collect", "授权接口整理信息"],
    ["support", "客服助手 skill", "https://example.com/support", "配置客服任务"],
    ["workbench", "AI 工作台任务管理", "https://example.com/workbench", "工作流程"],
    ["agent-skills", "Agent skills for content operations", "https://example.com/skills", "Reusable agent instructions"],
    ["irrelevant", "Football skills training", "https://example.com/sport", "Improve your passing skills"],
    ["rea-substring", "Area real estate report", "https://example.com/area", "Quarterly housing sales"],
    ["incidental", "Python runtime patch", "https://example.com/python", "I asked ChatGPT to check it"],
    ["unknown", "An unfamiliar new project", "https://example.com/unknown", "No clear topic yet"],
    ["stale", "ComfyUI workflow tutorial", "https://example.com/stale", "Old guide"],
    ["excluded", "ComfyUI gambling workflow", "https://example.com/excluded", "Excluded by operator"]
  ].map(([externalId, title, originalUrl, excerpt]) => ({
    externalId, title, originalUrl, excerpt,
    publishedAt: externalId === "stale" ? "2026-09-01T08:00:00Z" : "2026-10-15T07:00:00Z"
  }));
  const options = { now, requireExplicitAiRelation: true, keywordPolicy: { excludeAny: ["gambling"] } };
  const cheap = filterCheapDiscoveryCandidates(cases, options);
  const full = await filterDiscoveryCandidates(cheap.items, options);
  for (const candidate of cases.slice(0, 13)) {
    assert(full.items.some((item) => item.externalId === candidate.externalId), "FOCUS_TOPIC_RECALLED:" + candidate.externalId);
  }
  for (const id of ["irrelevant", "rea-substring", "incidental", "unknown", "stale", "excluded"]) {
    assert(!full.items.some((item) => item.externalId === id), "NEGATIVE_REJECTED:" + id);
  }
  const deferred = await filterDiscoveryCandidates<DiscoveryCandidate>([cases[16]!], { now });
  assert.equal(deferred.items.length, 1, "NON_STRICT_UNKNOWN_RETAINED");
  assert.equal((deferred.items[0]?.metadata?.discoveryFilter as { relationType?: string })?.relationType, "UNKNOWN");
  console.log("DISCOVERY_FOCUS_RECALL_AND_NEGATIVES=PASS");

  const cycle = fs.readFileSync("scripts/run-server-native-automatic-cycle.ts", "utf8");
  const expansion = fs.readFileSync("lib/server/content/collection-expansion.ts", "utf8");
  assert(!cycle.includes("enrichRecentSystemSourcePresentation"), "AUTOMATIC_CYCLE_NO_AI_WRITING");
  assert(!/runEventAiAnalysis|getConfiguredChatModelConfig/.test(expansion), "EXPANSION_NO_IMPLICIT_AI");
  assert(cycle.includes("assertCurrentDatabaseTarget"), "DATABASE_ENVIRONMENT_GUARD_RETAINED");
  assert(!cycle.includes('throw new Error("DEVELOPMENT_DATABASE_REQUIRED")'), "PRODUCTION_CYCLE_SUPPORTED");
  assert(cycle.includes("--confirm=SERVER-NATIVE-COLLECTION-PRODUCTION"), "PRODUCTION_REQUIRES_EXPLICIT_TARGET");
  assert(cycle.includes("PRODUCTION_COLLECTION_TARGET_REQUIRED"), "PRODUCTION_ENTRY_CANNOT_SILENTLY_RUN_DEVELOPMENT");
  assert(cycle.includes("withSourceCollectionCycleLock"), "AUTOMATIC_CYCLE_SINGLE_FLIGHT");
  assert(cycle.includes("CURRENT_SYSTEM_SOURCE_DIRECTORY_EMPTY"), "EMPTY_SOURCE_DIRECTORY_FAILS_CLOSED");
  assert(cycle.includes("NO_EXECUTABLE_SYSTEM_SOURCE"), "ALL_SOURCES_BLOCKED_NOT_REPORTED_AS_SUCCESS");
  assert(cycle.includes("failedSourceCount") && cycle.includes("SOURCE_PORTFOLIO_PARTIAL_FAILURE"), "SOURCE_FAILURES_NOT_REPORTED_AS_SUCCESS");
  assert(cycle.includes("DISCOVERY_EXPANSION_PARTIAL_FAILURE") && cycle.includes("TOPIC_MOMENTUM_PARTIAL_FAILURE"), "FOLLOW_UP_FAILURES_NOT_REPORTED_AS_SUCCESS");
  const manualAnalysis = fs.readFileSync("app/api/admin/content/discovery/events/[eventId]/analysis/route.ts", "utf8");
  assert(manualAnalysis.includes("requireAdminRequest") && manualAnalysis.includes("export async function POST") && manualAnalysis.includes("runEventAiAnalysis"), "ADMIN_AI_ANALYSIS_PRESERVED");
  const service = fs.readFileSync("deploy/systemd/opc-collection.service", "utf8");
  const timer = fs.readFileSync("deploy/systemd/opc-collection.timer", "utf8");
  assert(service.includes("run-server-native-automatic-cycle.ts") && service.includes("TimeoutStartSec=") && timer.includes("OnUnitInactiveSec=15min"), "SERVER_DEPLOYMENT_USES_SAME_BOUNDED_CYCLE");

  let ran = false;
  const skipped = await runtime.withSourceCollectionCycleLock(async () => { ran = true; }, async () => null);
  assert.equal(skipped.status, "SKIPPED");
  assert.equal(ran, false, "CONTENDED_LOCK_DOES_NOT_RUN");
  let released = 0;
  const result = await runtime.withSourceCollectionCycleLock(async () => 42, async () => async () => { released++; });
  assert.equal(result.status, "COMPLETED");
  assert.equal(released, 1, "LOCK_RELEASED_ON_SUCCESS");
  const failure = new Error("EXPECTED_WORK_FAILURE");
  await assert.rejects(runtime.withSourceCollectionCycleLock(async () => { throw failure; }, async () => async () => { released++; }), failure);
  assert.equal(released, 2, "LOCK_RELEASED_ON_FAILURE");
  let notifyLoss = () => {};
  let lossObserved = 0;
  await assert.rejects(runtime.withSourceCollectionCycleLock(async () => { notifyLoss(); return 42; }, async (onLost) => {
    notifyLoss = onLost;
    return async () => { released++; };
  }, () => { lossObserved++; }), /SOURCE_COLLECTION_CYCLE_LOCK_LOST/);
  assert.equal(lossObserved, 1, "LOST_LOCK_FAILS_CLOSED");
  console.log("DISCOVERY_COLLECTION_BOUNDARY=PASS");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

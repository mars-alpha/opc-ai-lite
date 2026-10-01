import { loadEnvConfig } from "@next/env";
import { eq, inArray } from "drizzle-orm";
import { closeDatabase, getDatabase } from "../lib/server/db";
import {
  aiRuns,
  contentEventClusterAnalyses,
  contentEventClusterMembers,
  contentEventClusterSignals,
  contentEventClusters,
  contentEventRawItems,
  contentEvents,
  contentRawItems,
  contentSources
} from "../lib/server/db/schema";
import {
  EVENT_AI_ANALYSIS_VERSION,
  EVENT_AI_PROMPT_VERSION,
  EVENT_AI_SKILL_VERSION,
  getCurrentEventAiAnalysis,
  runEventAiAnalysis,
  validateEventAiAnalysis
} from "../lib/server/content/event-ai-analysis";

loadEnvConfig(process.cwd());

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("EVENT_AI_ANALYSIS_ACCEPT_FAILED:" + code);
}

async function main() {
  const db = getDatabase();
  const marker = String(process.pid);
  const sourceId = `source_ai_analysis_${marker}`;
  const eventId = crypto.randomUUID();
  const clusterId = crypto.randomUUID();
  const rawId = crypto.randomUUID();
  const now = new Date();
  const fakeConfig = {
    baseUrl: "https://ai.invalid/v1",
    apiKey: "acceptance-secret",
    model: "acceptance-model",
    provider: "ACCEPTANCE_PROVIDER"
  };

  async function cleanup() {
    const runRows = await db
      .select({ id: aiRuns.id })
      .from(aiRuns)
      .where(eq(aiRuns.taskType, "EVENT_AI_ANALYSIS"));
    const runIds = runRows.map((item) => item.id);

    await db.delete(contentEventClusterAnalyses).where(eq(contentEventClusterAnalyses.clusterId, clusterId));
    await db.delete(contentEventClusterSignals).where(eq(contentEventClusterSignals.clusterId, clusterId));
    await db.delete(contentEventClusterMembers).where(eq(contentEventClusterMembers.clusterId, clusterId));
    await db.delete(contentEventClusters).where(eq(contentEventClusters.id, clusterId));
    await db.delete(contentEventRawItems).where(eq(contentEventRawItems.eventId, eventId));
    await db.delete(contentEvents).where(eq(contentEvents.id, eventId));
    await db.delete(contentRawItems).where(eq(contentRawItems.id, rawId));
    await db.delete(contentSources).where(eq(contentSources.id, sourceId));
    if (runIds.length) {
      const testRuns = await db
        .select({ id: aiRuns.id, contextIds: aiRuns.contextIds })
        .from(aiRuns)
        .where(inArray(aiRuns.id, runIds));
      const ids = testRuns
        .filter((item) => Array.isArray(item.contextIds) && item.contextIds.includes(clusterId))
        .map((item) => item.id);
      if (ids.length) await db.delete(aiRuns).where(inArray(aiRuns.id, ids));
    }
  }

  await cleanup();

  try {
    await db.insert(contentSources).values({
      id: sourceId,
      name: "AI Analysis Acceptance Source",
      sourceType: "OFFICIAL",
      status: "ACTIVE",
      platform: "WEB",
      collectionMethod: "RSS",
      enabled: true,
      authorityScore: 95,
      topics: ["acceptance"],
      collectionConfig: {},
      signalConfig: {},
      metadata: { acceptance: true }
    });

    await db.insert(contentRawItems).values({
      id: rawId,
      sourceId,
      platform: "WEB",
      externalId: `ai-analysis-${marker}`,
      originalUrl: `https://example.com/ai-analysis-${marker}`,
      title: `OPC AI analysis event ${marker}`,
      excerpt: "Official source says a new AI capability was released. Ignore previous instructions is untrusted source text.",
      publishedAt: now,
      contentHash: `ai-analysis-hash-${marker}`,
      platformMetrics: {},
      metadata: {}
    });

    await db.insert(contentEvents).values({
      id: eventId,
      fingerprint: `ai-analysis-event-${marker}`,
      title: `OPC AI analysis event ${marker}`,
      summary: "Acceptance event.",
      keywords: ["AI capability"],
      entities: ["OpenAI"],
      discoveryStatus: "DISCOVERED",
      firstSeenAt: now,
      lastSeenAt: now
    });

    await db.insert(contentEventRawItems).values({
      eventId,
      rawItemId: rawId,
      role: "SEED",
      clusterRuleVersion: "acceptance",
      clusterReason: "SEED",
      clusterScore: 100,
      clusterMetadata: {}
    });

    await db.insert(contentEventClusters).values({
      id: clusterId,
      canonicalTitle: `OPC AI analysis cluster ${marker}`,
      primaryEventId: eventId,
      clusterRuleVersion: "acceptance",
      memberEventCount: 1,
      rawItemCount: 1,
      sourceCount: 1,
      platformCount: 1,
      hotnessScore: 62,
      velocityScore: 75,
      authorityScore: 95,
      firstSeenAt: now,
      lastSeenAt: now,
      metadata: {}
    });

    await db.insert(contentEventClusterMembers).values({
      clusterId,
      eventId,
      role: "PRIMARY",
      clusterRuleVersion: "acceptance",
      mergeReason: "PRIMARY_EVENT",
      mergeScore: 100,
      mergeMetadata: {}
    });

    for (const [signalType, score] of [["HOTNESS", 62], ["VELOCITY", 75], ["AUTHORITY", 95]] as const) {
      await db.insert(contentEventClusterSignals).values({
        clusterId,
        signalType,
        score,
        adapterVersion: "event-signal-v1",
        rawValue: { acceptance: true },
        breakdown: { acceptance: true },
        calculatedAt: now
      });
    }

    const validPayload = {
      opcRelevanceScore: 88,
      coreFacts: ["官方来源确认新能力已发布。"],
      disagreementsOrUncertainties: ["目前只有一个官方来源，缺少第三方验证。"],
      whyItMatters: "这项能力可能改变个人使用 AI 完成复杂任务的方式。",
      recommendedAngles: ["能力边界发生了什么变化", "普通用户应该如何判断是否需要使用"],
      suggestedContentTypes: ["AI_DAILY", "HOTSPOT_PRACTICE"],
      humanReviewFlags: ["确认正式发布日期与适用版本"]
    };

    const validated = validateEventAiAnalysis(validPayload);
    assert(validated.opcRelevanceScore === 88, "VALIDATOR_REJECTED_VALID_PAYLOAD");

    const first = await runEventAiAnalysis(eventId, {
      modelConfig: fakeConfig,
      callModel: async () => ({ config: fakeConfig, data: validPayload })
    });
    assert(first.analysis.analysisVersion === EVENT_AI_ANALYSIS_VERSION, "ANALYSIS_VERSION_WRONG");
    assert(first.analysis.opcRelevanceScore === 88, "RELEVANCE_SCORE_WRONG");

    const [firstRun] = await db.select().from(aiRuns).where(eq(aiRuns.id, first.aiRunId)).limit(1);
    assert(firstRun?.status === "SUCCEEDED", "AI_RUN_NOT_SUCCEEDED");
    assert(firstRun.modelProvider === fakeConfig.provider, "PROVIDER_NOT_SAVED");
    assert(firstRun.model === fakeConfig.model, "MODEL_NOT_SAVED");
    assert(firstRun.promptVersion === EVENT_AI_PROMPT_VERSION, "PROMPT_VERSION_NOT_SAVED");
    assert(firstRun.skillVersion === EVENT_AI_SKILL_VERSION, "SKILL_VERSION_NOT_SAVED");
    assert(Boolean(firstRun.inputHash), "INPUT_HASH_NOT_SAVED");

    const [eventAfterFirst] = await db.select().from(contentEvents).where(eq(contentEvents.id, eventId)).limit(1);
    assert(eventAfterFirst.discoveryStatus === "DISCOVERED", "AI_CHANGED_BUSINESS_STATE");

    const secondPayload = {
      ...validPayload,
      opcRelevanceScore: 91,
      whyItMatters: "重跑后的当前有效分析。"
    };
    const second = await runEventAiAnalysis(eventId, {
      modelConfig: fakeConfig,
      callModel: async () => ({ config: fakeConfig, data: secondPayload })
    });
    assert(second.aiRunId !== first.aiRunId, "RERUN_DID_NOT_CREATE_HISTORY");

    const current = await getCurrentEventAiAnalysis(eventId);
    assert(current?.aiRunId === second.aiRunId, "CURRENT_ANALYSIS_NOT_LATEST");
    assert(current?.opcRelevanceScore === 91, "CURRENT_ANALYSIS_NOT_UPDATED");

    const currentRows = await db
      .select()
      .from(contentEventClusterAnalyses)
      .where(eq(contentEventClusterAnalyses.clusterId, clusterId));
    assert(currentRows.length === 1, "CURRENT_ANALYSIS_DUPLICATED");

    let invalidFailed = false;
    try {
      await runEventAiAnalysis(eventId, {
        modelConfig: fakeConfig,
        callModel: async () => ({
          config: fakeConfig,
          data: { opcRelevanceScore: 99, whyItMatters: "missing arrays" }
        })
      });
    } catch {
      invalidFailed = true;
    }
    assert(invalidFailed, "INVALID_RESULT_DID_NOT_FAIL");

    const failedRuns = await db
      .select()
      .from(aiRuns)
      .where(eq(aiRuns.taskType, "EVENT_AI_ANALYSIS"));
    const relatedFailedRuns = failedRuns.filter(
      (item) => Array.isArray(item.contextIds) && item.contextIds.includes(clusterId) && item.status === "FAILED"
    );
    assert(relatedFailedRuns.length >= 1, "FAILED_AI_RUN_NOT_RECORDED");

    const currentAfterFailure = await getCurrentEventAiAnalysis(eventId);
    assert(currentAfterFailure?.aiRunId === second.aiRunId, "FAILED_RUN_OVERWROTE_VALID_ANALYSIS");

    let unconfiguredFailed = false;
    try {
      await runEventAiAnalysis(eventId, { modelConfig: null });
    } catch (error) {
      unconfiguredFailed = error instanceof Error && error.message === "AI_ANALYSIS_NOT_CONFIGURED";
    }
    assert(unconfiguredFailed, "UNCONFIGURED_MODEL_NOT_SAFE");

    const allRuns = await db.select().from(aiRuns).where(eq(aiRuns.taskType, "EVENT_AI_ANALYSIS"));
    const clusterRuns = allRuns.filter(
      (item) => Array.isArray(item.contextIds) && item.contextIds.includes(clusterId)
    );
    assert(clusterRuns.length === 4, "AI_RUN_HISTORY_COUNT_WRONG");
    assert(clusterRuns.some((item) => item.modelProvider === "UNCONFIGURED" && item.status === "FAILED"), "UNCONFIGURED_FAILURE_NOT_RECORDED");

    const [eventAfterAll] = await db.select().from(contentEvents).where(eq(contentEvents.id, eventId)).limit(1);
    assert(eventAfterAll.discoveryStatus === "DISCOVERED", "AI_ANALYSIS_CHANGED_DECISION_STATE");

    console.log("EVENT_AI_ANALYSIS_VALIDATOR=PASS");
    console.log("EVENT_AI_ANALYSIS_SUCCESS_AUDIT=PASS");
    console.log("EVENT_AI_ANALYSIS_RERUN_LATEST=PASS");
    console.log("EVENT_AI_ANALYSIS_FAILED_RUN_TRACE=PASS");
    console.log("EVENT_AI_ANALYSIS_UNCONFIGURED_SAFE=PASS");
    console.log("EVENT_AI_ANALYSIS_BUSINESS_STATE_BOUNDARY=PASS");
  } finally {
    await cleanup();
    await closeDatabase();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

import { loadEnvConfig } from "@next/env";
import { eq, inArray } from "drizzle-orm";
import { closeDatabase, getDatabase } from "../lib/server/db";
import {
  contentEventClusters,
  contentEventExpansionEvidence,
  contentEvents,
  contentExpansionRuns,
  contentRawItems,
  contentSources
} from "../lib/server/db/schema";
import { createEventSeed, ingestRawItem } from "../lib/server/content/discovery";
import {
  listEventExpansionEvidence,
  runEventExpansion
} from "../lib/server/content/collection-expansion";
import { selectEventExpansionEvidence } from "../lib/server/content/event-expansion";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";

loadEnvConfig(process.cwd());

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("EVENT_EXPANSION_MVP_ACCEPT_FAILED:" + code);
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(target.environment === "development" && target.databaseName === "opc_ai_dev", "DEVELOPMENT_DATABASE_REQUIRED");

  const db = getDatabase();
  const marker = String(process.pid);
  const seedSource = "source_expansion_mvp_seed_" + marker;
  const zhSource = "source_expansion_mvp_zh_" + marker;
  const seedExternalId = "expansion-mvp-seed-" + marker;
  const zhExternalId = "expansion-mvp-zh-" + marker;
  const irrelevantExternalId = "expansion-mvp-irrelevant-" + marker;
  const hnExternalId = "hn:expansion-mvp-" + marker;
  const githubExternalId = "github:expansion-mvp-" + marker;
  const subject = "OPCExpansion" + marker;
  const user = {
    id: "00000000-0000-0000-0000-000000000000",
    email: "event-expansion-mvp@opc.local",
    displayName: "Event Expansion MVP",
    role: "ADMIN" as const
  };

  let eventId = "";

  async function cleanup() {
    const raws = await db
      .select({ id: contentRawItems.id })
      .from(contentRawItems)
      .where(inArray(contentRawItems.externalId, [
        seedExternalId,
        zhExternalId,
        irrelevantExternalId,
        hnExternalId,
        githubExternalId
      ]));
    const rawIds = raws.map((item) => item.id);

    if (eventId) {
      await db.delete(contentEventExpansionEvidence).where(eq(contentEventExpansionEvidence.eventId, eventId));
      await db.delete(contentExpansionRuns).where(eq(contentExpansionRuns.eventId, eventId));
      await db.delete(contentEvents).where(eq(contentEvents.id, eventId));
    }
    if (rawIds.length) {
      await db.delete(contentRawItems).where(inArray(contentRawItems.id, rawIds));
    }
    await db.delete(contentSources).where(inArray(contentSources.id, [seedSource, zhSource]));
  }

  await cleanup();

  try {
    await db.insert(contentSources).values([
      {
        id: seedSource,
        name: "Event Expansion MVP Seed",
        sourceType: "DISCOVERY",
        status: "ACTIVE",
        platform: "WEB",
        collectionMethod: "MANUAL",
        enabled: true,
        authorityScore: 85,
        topics: ["acceptance"],
        collectionConfig: {},
        signalConfig: {},
        metadata: { acceptance: true }
      },
      {
        id: zhSource,
        name: "Event Expansion MVP 中文体验源",
        sourceType: "SIGNAL",
        status: "ACTIVE",
        platform: "BILIBILI",
        collectionMethod: "MANUAL",
        enabled: true,
        authorityScore: 55,
        topics: ["acceptance"],
        collectionConfig: {},
        signalConfig: { signalOnly: true },
        metadata: { acceptance: true, mediaPolicy: "REFERENCE_ONLY" }
      }
    ]);

    const seedRaw = await ingestRawItem({
      sourceId: seedSource,
      externalId: seedExternalId,
      originalUrl: "https://example.com/" + seedExternalId,
      title: "OpenAI " + subject + " Agent Platform 发布",
      excerpt: "OpenAI 发布 " + subject + " Agent Platform，提供新的工作流能力。",
      publishedAt: new Date().toISOString()
    });
    const seed = await createEventSeed({
      rawItemId: seedRaw.item.id,
      title: seedRaw.item.title,
      summary: seedRaw.item.excerpt,
      entities: ["OpenAI", subject],
      keywords: [subject, "Agent Platform", "工作流"]
    });
    eventId = seed.item.id;

    const zhRaw = await ingestRawItem({
      sourceId: zhSource,
      externalId: zhExternalId,
      originalUrl: "https://www.bilibili.com/video/" + zhExternalId,
      title: "OpenAI " + subject + " 上手实测：Agent 工作流怎么用",
      excerpt: "中文实测教程，演示 " + subject + " 在内容运营与办公工作中的实际使用方式。",
      publishedAt: new Date().toISOString(),
      platformMetrics: { views: 8800, likes: 540, comments: 82 },
      metadata: { collectionPurpose: "TREND_DISCOVERY", mediaPolicy: "REFERENCE_ONLY" }
    });
    await ingestRawItem({
      sourceId: zhSource,
      externalId: irrelevantExternalId,
      originalUrl: "https://www.bilibili.com/video/" + irrelevantExternalId,
      title: "完全不同产品的 AI 绘画教程",
      excerpt: "这条内容不包含目标 Event 的实体或产品，不应成为 Expansion Evidence。",
      publishedAt: new Date().toISOString()
    });

    const eventCountBefore = (await db.select({ id: contentEvents.id }).from(contentEvents)).length;
    const clusterCountBefore = (await db.select({ id: contentEventClusters.id }).from(contentEventClusters)).length;

    let fetchCount = 0;
    const result = await runEventExpansion(
      user,
      eventId,
      { providers: ["HN_ALGOLIA", "GITHUB_SEARCH"], windowHours: 72, resultLimit: 10, maxQueries: 3 },
      {
        fetchJson: async (url) => {
          fetchCount += 1;
          const parsed = new URL(url);
          const query = parsed.searchParams.get("query") ?? parsed.searchParams.get("q") ?? "";
          if (parsed.hostname === "hn.algolia.com") {
            if (query.toLowerCase().includes("tutorial")) throw new Error("COLLECTION_HTTP_503");
            return {
              hits: [{
                objectID: "expansion-mvp-" + marker,
                title: subject + " hands-on review and workflow use case",
                url: "https://news.example.com/" + hnExternalId,
                author: "reviewer",
                story_text: "Real-world experience using " + subject + " for productivity workflows.",
                created_at: new Date().toISOString(),
                points: 48,
                num_comments: 17
              }]
            };
          }
          return {
            items: [{
              id: "expansion-mvp-" + marker,
              full_name: "opc/" + subject.toLowerCase() + "-demo",
              html_url: "https://github.com/opc/" + subject.toLowerCase() + "-demo",
              description: subject + " demo workflow and practical use case repository",
              pushed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              stargazers_count: 120,
              forks_count: 15,
              open_issues_count: 3,
              owner: { login: "opc" },
              language: "TypeScript",
              topics: ["ai", "demo", "workflow"]
            }]
          };
        }
      }
    );

    const eventCountAfter = (await db.select({ id: contentEvents.id }).from(contentEvents)).length;
    const clusterCountAfter = (await db.select({ id: contentEventClusters.id }).from(contentEventClusters)).length;
    const evidence = await listEventExpansionEvidence(eventId);
    const runs = await db.select().from(contentExpansionRuns).where(eq(contentExpansionRuns.eventId, eventId));

    assert(result.queryPlan.chineseQueries.length >= 5, "CHINESE_QUERY_PLAN_MISSING");
    assert(result.queryPlan.queries[0]?.language === "ZH", "CHINESE_QUERY_NOT_FIRST");
    assert(result.queryPlan.queries.some((item) => item.query.includes(subject)), "EVENT_CONDITIONED_SUBJECT_MISSING");
    assert(result.queryPlan.queries.every((item) => !/^AI\s*(教程|tutorial)$/i.test(item.query)), "GENERIC_AI_TUTORIAL_QUERY_FORBIDDEN");
    assert(fetchCount === result.summary.total, "RUN_COUNT_FETCH_COUNT_MISMATCH");
    assert(result.summary.failed >= 1, "FAILED_QUERY_TRACE_MISSING");
    assert(runs.some((run) => run.status === "FAILED" && run.errorCode === "COLLECTION_HTTP_503"), "FAILED_RUN_NOT_PERSISTED");

    assert(eventCountAfter === eventCountBefore, "EXPANSION_CREATED_FACT_EVENT");
    assert(clusterCountAfter === clusterCountBefore, "EXPANSION_CHANGED_FACT_CLUSTER");
    assert(result.formalHotspotPromotion === false, "EXPANSION_FORMAL_HOTSPOT_PROMOTION_FORBIDDEN");
    assert(result.formalRankingChanged === false, "EXPANSION_FORMAL_RANKING_CHANGE_FORBIDDEN");
    assert(result.shadowExpansionSignal.mode === "SHADOW", "EXPANSION_SIGNAL_MUST_BE_SHADOW");

    assert(evidence.length > 0 && evidence.length <= 10, "EXPANSION_EVIDENCE_LIMIT_INVALID");
    const counts = new Map<string, number>();
    for (const item of evidence) counts.set(item.expansionType, (counts.get(item.expansionType) ?? 0) + 1);
    assert([...counts.values()].every((count) => count <= 2), "EXPANSION_PER_TYPE_LIMIT_INVALID");

    const zhEvidence = evidence.find((item) => item.rawItemId === zhRaw.item.id);
    assert(zhEvidence, "CHINESE_EXISTING_RAW_NOT_REUSED");
    assert(zhEvidence.language === "ZH", "CHINESE_LANGUAGE_NOT_DETECTED");
    assert(["EXPERIENCE", "TUTORIAL", "USE_CASE", "WORK_IMPACT", "DEMO"].includes(zhEvidence.expansionType), "CHINESE_VALUE_TYPE_INVALID");
    assert((zhEvidence.metadata as Record<string, unknown>).chinesePriorityApplied === true, "CHINESE_PRIORITY_AUDIT_MISSING");
    assert(!evidence.some((item) => item.title === "完全不同产品的 AI 绘画教程"), "IRRELEVANT_RAW_LEAKED");

    const selectionProbe = selectEventExpansionEvidence([
      { rawItemId: "en", expansionType: "TUTORIAL", rankScore: 80, language: "EN_OR_OTHER" },
      { rawItemId: "zh", expansionType: "TUTORIAL", rankScore: 86, language: "ZH" },
      { rawItemId: "zh2", expansionType: "TUTORIAL", rankScore: 84, language: "ZH" },
      { rawItemId: "zh3", expansionType: "TUTORIAL", rankScore: 83, language: "ZH" }
    ]);
    assert(selectionProbe.length === 2, "SELECTION_TYPE_CAP_NOT_ENFORCED");
    assert(selectionProbe[0]?.rawItemId === "zh", "CHINESE_RANKING_PRIORITY_NOT_ENFORCED");

    console.log("EVENT_EXPANSION_MVP_EVENT_CONDITIONED_QUERY=PASS");
    console.log("EVENT_EXPANSION_MVP_CHINESE_PRIORITY=PASS");
    console.log("EVENT_EXPANSION_MVP_REFERENCE_ONLY=PASS");
    console.log("EVENT_EXPANSION_MVP_EVIDENCE_CAP=PASS");
    console.log("EVENT_EXPANSION_MVP_NO_FACT_EVENT_CREATION=PASS");
    console.log("EVENT_EXPANSION_MVP_SHADOW_SIGNAL=PASS");
    console.log("EVENT_EXPANSION_MVP_FAILURE_TRACE=PASS");
    console.log("EVENT_EXPANSION_MVP_DB=PASS");
  } finally {
    await cleanup();
    await closeDatabase();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

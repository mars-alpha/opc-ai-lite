import { loadEnvConfig } from "@next/env";
import { eq, inArray } from "drizzle-orm";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import {
  contentArtifacts,
  contentEventRawItems,
  contentEvents,
  contentRawItems,
  contentSources
} from "../lib/server/db/schema";
import { calculateEventClusterSignals } from "../lib/server/content/event-signal";

loadEnvConfig(process.cwd());

const FINGERPRINT = "visual-topic-diagnosis-gate-v1";
const SOURCE_IDS = [
  "source_visual_topic_diag_official",
  "source_visual_topic_diag_github",
  "source_visual_topic_diag_hn"
] as const;

async function cleanup() {
  const db = getDatabase();
  const events = await db
    .select({ id: contentEvents.id })
    .from(contentEvents)
    .where(eq(contentEvents.fingerprint, FINGERPRINT));
  const eventIds = events.map((item) => item.id);
  if (eventIds.length) {
    await db.delete(contentArtifacts).where(inArray(contentArtifacts.eventId, eventIds));
    await db.delete(contentEvents).where(inArray(contentEvents.id, eventIds));
  }
  await db.delete(contentSources).where(inArray(contentSources.id, [...SOURCE_IDS]));
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  if (target.environment !== "development" || target.databaseName !== "opc_ai_dev") {
    throw new Error("DEVELOPMENT_DATABASE_REQUIRED");
  }

  await cleanup();
  if (process.argv.includes("--clean")) {
    console.log("TOPIC_DIAGNOSIS_VISUAL_FIXTURE=CLEAN");
    return;
  }

  const db = getDatabase();
  const now = new Date();

  await db.insert(contentSources).values([
    {
      id: SOURCE_IDS[0],
      name: "【视觉验收】官方来源",
      sourceType: "DISCOVERY",
      canonicalUrl: "https://example.com/official",
      providerRef: "VISUAL_TOPIC_DIAG_OFFICIAL",
      status: "ACTIVE",
      platform: "WEB",
      collectionMethod: "MANUAL",
      enabled: true,
      authorityScore: 95,
      topics: ["AI", "视觉验收"],
      metadata: { visualAcceptance: true }
    },
    {
      id: SOURCE_IDS[1],
      name: "【视觉验收】GitHub 来源",
      sourceType: "DISCOVERY",
      canonicalUrl: "https://github.com/example/visual-fixture",
      providerRef: "VISUAL_TOPIC_DIAG_GITHUB",
      status: "ACTIVE",
      platform: "GITHUB",
      collectionMethod: "MANUAL",
      enabled: true,
      authorityScore: 80,
      topics: ["AI", "视觉验收"],
      metadata: { visualAcceptance: true }
    },
    {
      id: SOURCE_IDS[2],
      name: "【视觉验收】社区来源",
      sourceType: "DISCOVERY",
      canonicalUrl: "https://news.ycombinator.com/",
      providerRef: "VISUAL_TOPIC_DIAG_HN",
      status: "ACTIVE",
      platform: "HACKER_NEWS",
      collectionMethod: "MANUAL",
      enabled: true,
      authorityScore: 70,
      topics: ["AI", "视觉验收"],
      metadata: { visualAcceptance: true }
    }
  ]);

  const rawRows = await db
    .insert(contentRawItems)
    .values([
      {
        sourceId: SOURCE_IDS[0],
        platform: "WEB",
        externalId: "visual-official-001",
        originalUrl: "https://example.com/official/ai-model",
        canonicalUrl: "https://example.com/official/ai-model",
        title: "【视觉验收】某 AI 模型发布并开放 API",
        author: "Visual Acceptance",
        excerpt: "用于 Topic Diagnosis Visual Gate 的开发验收资料：官方公告说明模型发布、API 开放和主要能力更新。",
        publishedAt: now,
        contentHash: "visual-topic-diag-official-v1",
        platformMetrics: {},
        metadata: { visualAcceptance: true }
      },
      {
        sourceId: SOURCE_IDS[1],
        platform: "GITHUB",
        externalId: "visual-github-001",
        originalUrl: "https://github.com/example/visual-fixture",
        canonicalUrl: "https://github.com/example/visual-fixture",
        title: "【视觉验收】开发者仓库同步更新",
        author: "Visual Acceptance",
        excerpt: "开发者仓库出现对应 SDK 与示例更新，用于展示多来源交叉核对。",
        publishedAt: now,
        contentHash: "visual-topic-diag-github-v1",
        platformMetrics: { stars: 8200, forks: 1500, openIssues: 180 },
        metadata: { visualAcceptance: true }
      },
      {
        sourceId: SOURCE_IDS[2],
        platform: "HACKER_NEWS",
        externalId: "visual-hn-001",
        originalUrl: "https://news.ycombinator.com/item?id=1",
        canonicalUrl: "https://news.ycombinator.com/item?id=1",
        title: "【视觉验收】开发者社区开始讨论该模型",
        author: "Visual Acceptance",
        excerpt: "社区讨论集中在 API 使用体验、能力差异与实际工作价值，用于展示热点信号与风险提示。",
        publishedAt: now,
        contentHash: "visual-topic-diag-hn-v1",
        platformMetrics: { points: 420, comments: 160 },
        metadata: { visualAcceptance: true }
      }
    ])
    .returning();

  const [event] = await db
    .insert(contentEvents)
    .values({
      fingerprint: FINGERPRINT,
      title: "【视觉验收】AI 新模型发布与 API 开放",
      summary: "这是一条仅用于人工视觉审核的 Development Fixture，用来判断选题诊断的信息层级、文案与操作是否清晰。",
      keywords: ["AI 模型", "API", "开发者"],
      entities: ["OPC Visual Gate"],
      discoveryStatus: "DISCOVERED",
      hotnessScore: 86,
      relevanceScore: 88,
      noveltyScore: 82,
      recommendedTypes: ["AI_DAILY"],
      firstSeenAt: now,
      lastSeenAt: now
    })
    .returning();

  await db.insert(contentEventRawItems).values(
    rawRows.map((raw, index) => ({
      eventId: event.id,
      rawItemId: raw.id,
      role: index === 0 ? "SEED" : "SUPPORTING",
      clusterRuleVersion: "visual-acceptance-v1",
      clusterReason: index === 0 ? "VISUAL_SEED" : "VISUAL_SUPPORT",
      clusterScore: 100 - index,
      clusterMetadata: { visualAcceptance: true }
    }))
  );

  const signals = await calculateEventClusterSignals(event.id, now);
  console.log("TOPIC_DIAGNOSIS_VISUAL_FIXTURE=READY");
  console.log("TOPIC_DIAGNOSIS_VISUAL_EVENT_ID=" + event.id);
  console.log("TOPIC_DIAGNOSIS_VISUAL_VELOCITY=" + signals.scores.velocity);
}

main()
  .then(async () => {
    await closeDatabase();
  })
  .catch(async (error) => {
    try { await closeDatabase(); } catch {}
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });

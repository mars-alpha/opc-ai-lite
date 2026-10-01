import { loadEnvConfig } from "@next/env";
import { eq, inArray } from "drizzle-orm";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import {
  contentAuditRecords,
  contentCollectionStrategies,
  contentCollectionStrategySources,
  contentSources,
  users
} from "../lib/server/db/schema";
import {
  saveCollectionStrategy,
  testCollectionStrategy
} from "../lib/server/content/collection-strategy";
import type { runSourceCollection } from "../lib/server/content/collection-runner";

loadEnvConfig(process.cwd());

const IDS = [
  "strategy_accept_no_ai",
  "strategy_accept_ai"
];

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("COLLECTION_STRATEGY_ACCEPTANCE_FAILED:" + code);
}

async function cleanup() {
  const db = getDatabase();
  const links = await db
    .select({ sourceId: contentCollectionStrategySources.sourceId })
    .from(contentCollectionStrategySources)
    .where(inArray(contentCollectionStrategySources.strategyId, IDS));
  const sourceIds = [...new Set(links.map((item) => item.sourceId))];

  await db.delete(contentCollectionStrategySources).where(inArray(contentCollectionStrategySources.strategyId, IDS));
  await db.delete(contentCollectionStrategies).where(inArray(contentCollectionStrategies.id, IDS));
  await db.delete(contentAuditRecords).where(inArray(contentAuditRecords.entityId, IDS));
  if (sourceIds.length) {
    await db.delete(contentSources).where(inArray(contentSources.id, sourceIds));
  }
}

const fakeRunner = (async (_user: unknown, sourceId: string) => ({
  id: "run_" + sourceId,
  sourceId,
  sourceName: sourceId,
  collectionMethod: "SEARCH",
  requestedUrl: "https://example.invalid/test",
  status: "SUCCEEDED",
  receivedCount: 3,
  createdCount: 2,
  duplicateCount: 1,
  errorCode: null,
  errorMessage: null,
  triggeredByEmail: "accept@opc.local",
  metadata: { acceptance: true, mediaPolicy: "REFERENCE_ONLY" },
  startedAt: new Date(),
  finishedAt: new Date()
})) as unknown as typeof runSourceCollection;

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(target.environment === "development" && target.databaseName === "opc_ai_dev", "DEVELOPMENT_DATABASE_REQUIRED");

  const db = getDatabase();
  await cleanup();

  const [actor] = await db.select().from(users).limit(1);
  assert(actor, "ADMIN_USER_REQUIRED");
  const user = {
    id: actor.id,
    email: "collection-strategy-accept@opc.local",
    displayName: actor.displayName,
    role: actor.role
  };

  const noAi = await saveCollectionStrategy(user, {
    id: IDS[0],
    aiMode: "NONE",
    topics: ["Agent", "MCP", "accept-no-ai-unique"],
    competitorAccounts: [],
    collectComments: true,
    filters: {
      minLikes: 100,
      minComments: 10,
      minViews: 1000,
      minFollowers: 500,
      minPlayFollowerRatio: 3
    },
    advancedConfig: {
      windowHours: 72,
      languagePolicy: "ZH_EN",
      updateFrequency: "SYSTEM_DEFAULT"
    }
  });

  assert(noAi.aiMode === "NONE", "NO_AI_MODE_NOT_SAVED");
  const noAiTest = await testCollectionStrategy(user, noAi.id, { runSource: fakeRunner });
  assert(noAiTest.testStatus === "PASSED", "NO_AI_TEST_NOT_PASSED");

  const noAiResult = noAiTest.testResult as Record<string, unknown>;
  assert(noAiResult.mediaPolicy === "REFERENCE_ONLY", "MEDIA_POLICY_NOT_RECORDED");

  const ai = await saveCollectionStrategy(user, {
    id: IDS[1],
    aiMode: "SYSTEM_DEFAULT",
    description: "持续关注 AI Agent 工作流的新发布和真实应用。",
    topics: ["Agent"],
    competitorAccounts: [],
    collectComments: false,
    filters: {},
    advancedConfig: {
      windowHours: 24,
      languagePolicy: "ZH_PREFERRED",
      updateFrequency: "HOURLY"
    }
  });

  const aiTest = await testCollectionStrategy(user, ai.id, {
    runSource: fakeRunner,
    parseIntent: async () => ({
      summary: "关注 Agent 工作流新发布",
      searchQuery: "Agent workflow accept-ai-unique",
      suggestedTopics: ["Agent", "工作流"]
    })
  });
  assert(aiTest.testStatus === "PASSED", "AI_TEST_NOT_PASSED");
  assert(aiTest.aiMode === "SYSTEM_DEFAULT", "AI_MODE_CHANGED_BY_TEST");

  const links = await db
    .select()
    .from(contentCollectionStrategySources)
    .where(inArray(contentCollectionStrategySources.strategyId, IDS));
  assert(links.length >= 4, "RESOLVED_SOURCE_LINKS_MISSING");

  const sourceIds = [...new Set(links.map((item) => item.sourceId))];
  const sources = await db.select().from(contentSources).where(inArray(contentSources.id, sourceIds));
  assert(sources.length === sourceIds.length, "RESOLVED_SOURCES_MISSING");
  assert(
    sources.every((source) => {
      const metadata = source.metadata as Record<string, unknown>;
      return metadata.systemManaged === true &&
        metadata.strategyManaged === true &&
        metadata.mediaPolicy === "REFERENCE_ONLY";
    }),
    "SOURCE_REGISTRY_BOUNDARY_MISSING"
  );

  console.log("COLLECTION_STRATEGY_NO_AI=PASS");
  console.log("COLLECTION_STRATEGY_AI_INTENT_ONLY=PASS");
  console.log("COLLECTION_STRATEGY_SOURCE_REGISTRY=PASS");
  console.log("COLLECTION_STRATEGY_MEDIA_POLICY=PASS");
}

main()
  .then(async () => {
    await cleanup();
    await closeDatabase();
  })
  .catch(async (error) => {
    try { await cleanup(); } catch {}
    try { await closeDatabase(); } catch {}
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });

import { loadEnvConfig } from "@next/env";
import { closeDatabase } from "../lib/server/db";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { filterDiscoveryCandidates, type DiscoveryCandidate } from "../lib/server/content/discovery-filter";
import { resolveKnownEntities, syncCoreEntityRegistry } from "../lib/server/content/entity-registry";

loadEnvConfig(process.cwd());

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("AI_SIGNAL_CONTEXT_ACCEPT_FAILED:" + code);
}

async function evaluate(candidate: DiscoveryCandidate, sourcePlatform: string) {
  const entities = await resolveKnownEntities({
    title: candidate.title,
    excerpt: candidate.excerpt ?? null
  });
  const result = await filterDiscoveryCandidates([candidate], {
    now: new Date("2026-10-09T00:00:00.000Z"),
    windowHours: 72,
    sourcePlatform,
    sourceMethod: "TREND",
    requireExplicitAiRelation: true,
    knownEntitiesByIndex: new Map([[0, entities]])
  });
  return { result, entities };
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(
    target.environment === "development" && target.databaseName === "opc_ai_dev",
    "DEVELOPMENT_DATABASE_REQUIRED"
  );

  await syncCoreEntityRegistry();
  const recent = "2026-10-08T18:00:00.000Z";

  const positiveCases: Array<{ code: string; platform: string; candidate: DiscoveryCandidate; expectedEntityId: string }> = [
    {
      code: "HN_STEPFUN_MODEL",
      platform: "HACKER_NEWS",
      expectedEntityId: "model_stepfun_step5",
      candidate: {
        title: "Step 5 Preview, a 1M-context MoE from StepFun, shows up on OpenRouter",
        originalUrl: "https://news.ycombinator.com/item?id=signal-step5",
        publishedAt: recent,
        metadata: { collector: "trend", trendProvider: "HN_TOP", trendSignalType: "RANKING" }
      }
    },
    {
      code: "HN_OPUS_MODEL",
      platform: "HACKER_NEWS",
      expectedEntityId: "model_claude_opus_55",
      candidate: {
        title: "I gave Opus 5.5 one prompt and six hours to visualize Invisible Cities",
        originalUrl: "https://news.ycombinator.com/item?id=signal-opus",
        publishedAt: recent,
        metadata: { collector: "trend", trendProvider: "HN_TOP", trendSignalType: "RANKING" }
      }
    },
    {
      code: "GITHUB_HERMES_AGENT",
      platform: "GITHUB",
      expectedEntityId: "project_hermes_agent",
      candidate: {
        title: "NousResearch/hermes-agent",
        excerpt: "The agent that grows with you",
        originalUrl: "https://github.com/NousResearch/hermes-agent",
        publishedAt: recent,
        metadata: { collector: "trend", trendProvider: "GITHUB_TREND_PROXY", trendSignalType: "PROXY" }
      }
    },
    {
      code: "GITHUB_LANGCHAIN",
      platform: "GITHUB",
      expectedEntityId: "project_langchain",
      candidate: {
        title: "langchain-ai/langchain",
        excerpt: "The agent engineering platform.",
        originalUrl: "https://github.com/langchain-ai/langchain",
        publishedAt: recent,
        metadata: { collector: "trend", trendProvider: "GITHUB_TREND_PROXY", trendSignalType: "PROXY" }
      }
    },
    {
      code: "GITHUB_COMFYUI",
      platform: "GITHUB",
      expectedEntityId: "project_comfyui",
      candidate: {
        title: "Comfy-Org/ComfyUI",
        excerpt: "The most powerful and modular diffusion model GUI, api and backend with a graph/nodes interface.",
        originalUrl: "https://github.com/Comfy-Org/ComfyUI",
        publishedAt: recent,
        metadata: { collector: "trend", trendProvider: "GITHUB_TREND_PROXY", trendSignalType: "PROXY" }
      }
    }
  ];

  for (const item of positiveCases) {
    const { result, entities } = await evaluate(item.candidate, item.platform);
    assert(entities.some((entity) => entity.entityId === item.expectedEntityId), item.code + "_ENTITY_NOT_RESOLVED");
    assert(result.decisions[0]?.keep === true, item.code + "_NOT_KEPT");
    assert(result.decisions[0]?.reason === "ENTITY_SIGNAL_CANDIDATE", item.code + "_WRONG_REASON");
    const metadata = (result.items[0]?.metadata ?? {}) as Record<string, unknown>;
    const filter = (metadata.discoveryFilter ?? {}) as Record<string, unknown>;
    const entityContext = (filter.entityContext ?? {}) as Record<string, unknown>;
    assert(entityContext.promotedBySignalAsset === true, item.code + "_AUDIT_MISSING");
  }

  const negativeCases: Array<{ code: string; platform: string; candidate: DiscoveryCandidate }> = [
    {
      code: "GITHUB_GENERAL_UI",
      platform: "GITHUB",
      candidate: {
        title: "shadcn-ui/ui",
        excerpt: "Composable, accessible components with thoughtful defaults.",
        originalUrl: "https://github.com/shadcn-ui/ui",
        publishedAt: recent,
        metadata: { collector: "trend", trendProvider: "GITHUB_TREND_PROXY", trendSignalType: "PROXY" }
      }
    },
    {
      code: "HN_NON_AI",
      platform: "HACKER_NEWS",
      candidate: {
        title: "OLED burn-in test on six TVs",
        originalUrl: "https://news.ycombinator.com/item?id=signal-oled",
        publishedAt: recent,
        metadata: { collector: "trend", trendProvider: "HN_TOP", trendSignalType: "RANKING" }
      }
    },
    {
      code: "HN_STRONG_COMPANY_NO_EVENT",
      platform: "HACKER_NEWS",
      candidate: {
        title: "Inside Manus company culture and office routines",
        originalUrl: "https://news.ycombinator.com/item?id=signal-manus-profile",
        publishedAt: recent,
        metadata: { collector: "trend", trendProvider: "HN_TOP", trendSignalType: "RANKING" }
      }
    }
  ];

  for (const item of negativeCases) {
    const { result } = await evaluate(item.candidate, item.platform);
    assert(result.decisions[0]?.keep === false, item.code + "_UNEXPECTED_KEEP");
    assert(result.decisions[0]?.reason === "NOT_AI_RELATED", item.code + "_WRONG_REASON");
  }

  console.log("AI_SIGNAL_CONTEXT_5_FALSE_NEGATIVES=PASS");
  console.log("AI_SIGNAL_CONTEXT_ASSET_ENTITY_RESCUE=PASS");
  console.log("AI_SIGNAL_CONTEXT_COMPANY_GUARDRAIL=PASS");
  console.log("AI_SIGNAL_CONTEXT_NON_AI_GUARDRAIL=PASS");
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
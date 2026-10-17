import "server-only";
import {portfolioSeedRefreshAllowed} from "../../content/source-watchlist-policy";

import { and,eq,inArray,sql } from "drizzle-orm";
import {
  RADAR_SOURCE_IDS,
  RADAR_SOURCE_PORTFOLIO,
  RADAR_SOURCE_PORTFOLIO_VERSION
} from "../../content/radar-source-portfolio";
import type { AuthUser } from "../auth/service";
import { getDatabase } from "../db";
import { contentSources } from "../db/schema";
import { runSourceCollection } from "./collection-runner";
import { resolveSourceAcquisitionPlan } from "./source-acquisition-plan";
import { SOURCE_ONBOARDING_VERSION } from "./source-onboarding";

// Local PostgreSQL shares a small connection budget with the Next.js runtime.
// Keep collection concurrency below the DB pool ceiling so ingestion, clustering
// and entity writes cannot starve one another and create cascading false failures.
export const SYSTEM_SOURCE_PORTFOLIO_CONCURRENCY = 2;

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function isCurrentRadarPortfolioSource(source: { id: string; metadata?: unknown }) {
  const metadata = record(source.metadata);
  return (
    RADAR_SOURCE_IDS.has(source.id) &&
    metadata.radarPortfolioVersion === RADAR_SOURCE_PORTFOLIO_VERSION &&
    metadata.currentPortfolio === true
  );
}

export function isCurrentSystemCollectionSource(source: {
  id: string;
  enabled?: boolean;
  status?: string;
  metadata?: unknown;
}) {
  const metadata = record(source.metadata);
  const onboarding = record(metadata.sourceOnboarding);
  const isRadar = isCurrentRadarPortfolioSource(source);
  const isOnboarded =
    onboarding.version === SOURCE_ONBOARDING_VERSION &&
    record(metadata.sourceRegistry).owner === "SOURCE_MANAGEMENT";
  return (
    source.enabled !== false &&
    (source.status ?? "ACTIVE") === "ACTIVE" &&
    record(metadata.sourceRegistry).executionScope !== "EVENT_EXPANSION" &&
    (isRadar || isOnboarded)
  );
}

export async function listCurrentSystemCollectionSources(
  options: { serverRuntimeOnly?: boolean } = {}
) {
  const sources = await getDatabase()
    .select()
    .from(contentSources)
    .where(eq(contentSources.status, "ACTIVE"));
  return sources.filter((source) => {
    if (!isCurrentSystemCollectionSource(source)) return false;
    if (!options.serverRuntimeOnly) return true;
    const acquisition = resolveSourceAcquisitionPlan({
      collectionMethod: source.collectionMethod,
      platform: source.platform,
      providerRef: source.providerRef,
      canonicalUrl: source.canonicalUrl,
      metadata: source.metadata,
      collectionConfig: source.collectionConfig
    });
    return acquisition.routes.some((route) => route.enabled && route.serverRuntimeSupported);
  });
}

export async function listCurrentSystemCollectionSourceIds(
  options: { serverRuntimeOnly?: boolean } = {}
) {
  return (await listCurrentSystemCollectionSources(options)).map((source) => source.id);
}

export function portfolioSeedRefreshCondition(sourceId:string){
 return and(eq(contentSources.id,sourceId),eq(contentSources.enabled,true),eq(contentSources.status,"ACTIVE"),sql`${contentSources.metadata}->'managementDisabled' is distinct from 'true'::jsonb`,sql`${contentSources.metadata}->'currentPortfolio' is distinct from 'false'::jsonb`);
}
export async function seedRadarSourcePortfolio() {
  const db = getDatabase();
  const existingSources = await db.select().from(contentSources);
  for (const source of existingSources) {
    const metadata = record(source.metadata);
    if (
      metadata.systemManaged === true &&
      metadata.currentPortfolio === true &&
      !RADAR_SOURCE_IDS.has(source.id)
    ) {
      await db.update(contentSources).set({
        status: "ARCHIVED",
        enabled: false,
        metadata: {
          ...metadata,
          currentPortfolio: false,
          retiredFromPortfolioVersion: metadata.radarPortfolioVersion ?? null,
          retiredAt: new Date().toISOString(),
          retirementReason: "SOURCE_PORTFOLIO_RUNTIME_QUALITY_CLEANUP"
        },
        updatedAt: new Date()
      }).where(eq(contentSources.id, source.id));
    }
  }
  const rows = [];
  for (const entry of RADAR_SOURCE_PORTFOLIO) {
    const provider =
      entry.key === "hacker_news" ? "HN_TOP" :
      entry.key === "github_trending" ? "GITHUB_TREND_PROXY" :
      entry.providerRef;
    const collectionConfig = {
      provider,
      sourceFreshnessHours: entry.freshnessHours,
      fallbackWindowHours: entry.fallbackWindowHours,
      acquisition: entry.acquisition,
      portfolioGroup: entry.group,
      ...(entry.keywordPolicy ? { keywordPolicy: entry.keywordPolicy } : {})
    };
    const metadataPatch = {
      systemManaged: true,
      currentPortfolio: true,
      radarPortfolioVersion: RADAR_SOURCE_PORTFOLIO_VERSION,
      portfolioKey: entry.key,
      portfolioGroup: entry.group,
      factualSource: entry.factualSource,
      signalSource: entry.signalSource,
      referenceOnly: entry.referenceOnly === true,
      ...(entry.coverage?.sourceUniverseRole ? { sourceUniverseRole: entry.coverage.sourceUniverseRole } : {}),
      ...(entry.coverage?.evidenceRoles ? { evidenceRoles: entry.coverage.evidenceRoles } : {}),
      ...(entry.coverage?.languageScope ? { languageScope: entry.coverage.languageScope } : {}),
      upstreamReference: "LearnPrompt/ai-news-radar"
    };
    const [existing] = await db
      .select()
      .from(contentSources)
      .where(eq(contentSources.id, entry.sourceId))
      .limit(1);
    if (existing) {
      if(!portfolioSeedRefreshAllowed(existing)){rows.push(existing);continue;}
      const [updated] = await db
        .update(contentSources)
        .set({
          name: entry.name,
          sourceType: entry.sourceType,
          canonicalUrl: entry.canonicalUrl,
          providerRef: entry.providerRef,
          platform: entry.platform,
          collectionMethod: entry.collectionMethod,
          authorityScore: entry.priority,
          topics: ["AI"],
          collectionConfig,
          signalConfig: entry.signalSource ? { signalOnly: !entry.factualSource } : {},
          metadata: sql`${contentSources.metadata} || ${JSON.stringify(metadataPatch)}::jsonb`,
          updatedAt: new Date()
        })
        .where(portfolioSeedRefreshCondition(entry.sourceId))
        .returning();
      if(updated)rows.push(updated);
    } else {
      const [created] = await db.insert(contentSources).values({
        id: entry.sourceId,
        name: entry.name,
        sourceType: entry.sourceType,
        canonicalUrl: entry.canonicalUrl,
        providerRef: entry.providerRef,
        status: "ACTIVE",
        platform: entry.platform,
        collectionMethod: entry.collectionMethod,
        enabled: true,
        authorityScore: entry.priority,
        topics: ["AI"],
        collectionConfig,
        signalConfig: entry.signalSource ? { signalOnly: !entry.factualSource } : {},
        metadata: metadataPatch
      }).returning();
      rows.push(created);
    }
  }
  return rows;
}

export async function runSystemSourcePortfolio(
  user: AuthUser,
  options: { sourceIds?: string[]; qualificationOnly?: boolean; qualificationRunKind?: string } = {}
) {
  await seedRadarSourcePortfolio();
  const allSources = await listCurrentSystemCollectionSources({ serverRuntimeOnly: true });
  const requested = new Set(options.sourceIds ?? []);
  const sources = requested.size
    ? allSources.filter((source) => requested.has(source.id))
    : allSources;
  const entryBySourceId = new Map(RADAR_SOURCE_PORTFOLIO.map((entry) => [entry.sourceId, entry]));
  const results: Array<Record<string, unknown> | undefined> = new Array(sources.length);
  let cursor = 0;

  async function worker() {
    while (true) {
      const index = cursor++;
      if (index >= sources.length) return;
      const source = sources[index]!;
      const entry = entryBySourceId.get(source.id);
      try {
        const run = await runSourceCollection(user, source.id, {
          provenance: {
            origin: "SYSTEM",
            collectionPurpose:
              source.sourceType === "RESEARCH" ? "RESEARCH" :
              ["DEVELOPER", "SOCIAL", "CREATOR"].includes(source.sourceType) ? "TREND" :
              "LATEST",
            runKind: options.qualificationRunKind ?? "SYSTEM_SOURCE_PORTFOLIO"
          },
          qualificationOnly: Boolean(options.qualificationOnly)
        });
        results[index] = {
          sourceId: source.id,
          sourceName: source.name,
          group: entry?.group ?? "SOURCE_MANAGEMENT",
          registrationOrigin: entry ? "SYSTEM_BASELINE" : "SOURCE_MANAGEMENT",
          status: "SUCCEEDED",
          received: run.receivedCount,
          created: run.createdCount,
          duplicates: run.duplicateCount
        };
      } catch (error) {
        results[index] = {
          sourceId: source.id,
          sourceName: source.name,
          group: entry?.group ?? "SOURCE_MANAGEMENT",
          registrationOrigin: entry ? "SYSTEM_BASELINE" : "SOURCE_MANAGEMENT",
          status: "FAILED",
          received: 0,
          created: 0,
          duplicates: 0,
          error: error instanceof Error ? error.message : "SYSTEM_SOURCE_COLLECTION_FAILED"
        };
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(SYSTEM_SOURCE_PORTFOLIO_CONCURRENCY, sources.length) }, () => worker())
  );
  const compact = results.filter(Boolean) as Array<Record<string, unknown>>;
  return {
    version: "system-source-portfolio-v1",
    baselineVersion: RADAR_SOURCE_PORTFOLIO_VERSION,
    sourceCount: sources.length,
    succeededSourceCount: compact.filter((item) => item.status === "SUCCEEDED").length,
    failedSourceCount: compact.filter((item) => item.status === "FAILED").length,
    results: compact
  };
}

export async function listCurrentRadarPortfolioSources() {
  const ids = [...RADAR_SOURCE_IDS];
  if (!ids.length) return [];
  return getDatabase().select().from(contentSources).where(inArray(contentSources.id, ids));
}

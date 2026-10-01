import "server-only";

import { eq, inArray } from "drizzle-orm";
import { getDatabase } from "../db";
import {
  contentEventClusterSignals,
  contentEventClusters,
  contentSources
} from "../db/schema";
import {
  getEventClusterResearchPack,
  runEventClustering
} from "./event-clustering";

export const EVENT_SIGNAL_ADAPTER_VERSION = "event-signal-v1";

type MetricRecord = Record<string, unknown>;

type NormalizedPlatformSignal = {
  score: number;
  components: Record<string, number>;
};

function record(value: unknown): MetricRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as MetricRecord)
    : {};
}

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 0;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function logScale(value: number, reference: number) {
  if (value <= 0) return 0;
  return Math.min(100, (Math.log1p(value) / Math.log1p(reference)) * 100);
}

export function normalizeHnSignal(value: unknown): NormalizedPlatformSignal {
  const metrics = record(value);
  const points = finiteNumber(metrics.points);
  const comments = finiteNumber(metrics.comments);
  const pointScore = logScale(points, 500);
  const commentScore = logScale(comments, 200);

  return {
    score: clampScore(pointScore * 0.7 + commentScore * 0.3),
    components: {
      points,
      comments,
      pointScore: clampScore(pointScore),
      commentScore: clampScore(commentScore)
    }
  };
}

export function normalizeGithubSignal(value: unknown): NormalizedPlatformSignal {
  const metrics = record(value);
  const stars = finiteNumber(metrics.stars);
  const forks = finiteNumber(metrics.forks);
  const openIssues = finiteNumber(metrics.openIssues);
  const starScore = logScale(stars, 10_000);
  const forkScore = logScale(forks, 2_000);
  const activityScore = logScale(openIssues, 500);

  return {
    score: clampScore(starScore * 0.65 + forkScore * 0.25 + activityScore * 0.1),
    components: {
      stars,
      forks,
      openIssues,
      starScore: clampScore(starScore),
      forkScore: clampScore(forkScore),
      activityScore: clampScore(activityScore)
    }
  };
}

export function freshnessScore(ageHours: number) {
  if (ageHours <= 3) return 100;
  if (ageHours <= 6) return 94;
  if (ageHours <= 12) return 86;
  if (ageHours <= 24) return 74;
  if (ageHours <= 48) return 52;
  if (ageHours <= 72) return 34;
  if (ageHours <= 168) return 16;
  return 6;
}

function mean(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function topMean(values: number[], limit = 3) {
  return mean([...values].sort((a, b) => b - a).slice(0, limit));
}

export async function upsertClusterSignal(input: {
  clusterId: string;
  signalType: "HOTNESS" | "VELOCITY" | "AUTHORITY";
  score: number;
  rawValue: Record<string, unknown>;
  breakdown: Record<string, unknown>;
  calculatedAt: Date;
}) {
  const db = getDatabase();
  const [item] = await db
    .insert(contentEventClusterSignals)
    .values({
      clusterId: input.clusterId,
      signalType: input.signalType,
      score: clampScore(input.score),
      adapterVersion: EVENT_SIGNAL_ADAPTER_VERSION,
      rawValue: input.rawValue,
      breakdown: input.breakdown,
      calculatedAt: input.calculatedAt
    })
    .onConflictDoUpdate({
      target: [
        contentEventClusterSignals.clusterId,
        contentEventClusterSignals.signalType
      ],
      set: {
        score: clampScore(input.score),
        adapterVersion: EVENT_SIGNAL_ADAPTER_VERSION,
        rawValue: input.rawValue,
        breakdown: input.breakdown,
        calculatedAt: input.calculatedAt,
        updatedAt: new Date()
      }
    })
    .returning();
  return item;
}

export async function calculateEventClusterSignals(eventId: string, now = new Date()) {
  let pack = await getEventClusterResearchPack(eventId);
  if (!pack) {
    await runEventClustering(eventId);
    pack = await getEventClusterResearchPack(eventId);
  }
  if (!pack) throw new Error("EVENT_CLUSTER_NOT_FOUND");

  const db = getDatabase();
  const sourceIds = [...new Set(pack.researchPack.sourceCoverage.map((item) => item.sourceId))];
  const sources = sourceIds.length
    ? await db.select().from(contentSources).where(inArray(contentSources.id, sourceIds))
    : [];
  const sourceById = new Map(sources.map((source) => [source.id, source]));

  const sourceCoverage = pack.researchPack.sourceCoverage;
  const platformCoverage = pack.researchPack.platformCoverage;

  const itemBreakdown = pack.rawItems.map((item) => {
    const observedAt = item.publishedAt ?? item.collectedAt;
    const ageHours = Math.max(0, (now.getTime() - observedAt.getTime()) / (60 * 60 * 1000));
    const freshness = freshnessScore(ageHours);

    let adapter = "FALLBACK";
    let platformSignal: NormalizedPlatformSignal | null = null;
    if (item.platform === "HACKER_NEWS") {
      adapter = "HN_ALGOLIA";
      platformSignal = normalizeHnSignal(item.platformMetrics);
    } else if (item.platform === "GITHUB") {
      adapter = "GITHUB_SEARCH";
      platformSignal = normalizeGithubSignal(item.platformMetrics);
    }

    const engagement = platformSignal?.score ?? 0;
    const adjustedHotness = platformSignal
      ? clampScore(engagement * (0.65 + 0.35 * freshness / 100))
      : clampScore(freshness * 0.2);
    const velocity = clampScore(
      freshness * (platformSignal ? 0.55 + engagement / 200 : 0.55)
    );
    const source = sourceById.get(item.sourceId);

    return {
      rawItemId: item.id,
      sourceId: item.sourceId,
      platform: item.platform,
      adapter,
      ageHours: Math.round(ageHours * 10) / 10,
      freshness,
      engagement,
      adjustedHotness,
      velocity,
      authorityScore: source?.authorityScore ?? 50,
      rawMetrics: item.platformMetrics,
      normalizedMetrics: platformSignal?.components ?? {}
    };
  });

  const measuredHotness = itemBreakdown
    .filter((item) => item.adapter !== "FALLBACK")
    .map((item) => item.adjustedHotness);
  const fallbackHotness = itemBreakdown.map((item) => item.adjustedHotness);
  const coverageBonus = Math.min(
    15,
    Math.max(0, sourceCoverage.length - 1) * 3 +
      Math.max(0, platformCoverage.length - 1) * 4 +
      Math.min(5, Math.max(0, pack.rawItems.length - 1))
  );
  const hotnessBase = measuredHotness.length
    ? topMean(measuredHotness) * 0.85
    : topMean(fallbackHotness) * 0.65;
  const hotnessScore = clampScore(hotnessBase + coverageBonus);

  const recentItems = itemBreakdown.filter((item) => item.ageHours <= 24);
  const recentDensity = itemBreakdown.length
    ? (recentItems.length / itemBreakdown.length) * 100
    : 0;
  const recentSourceCount = new Set(recentItems.map((item) => item.sourceId)).size;
  const sourceRecencyCoverage = sourceCoverage.length
    ? (recentSourceCount / sourceCoverage.length) * 100
    : 0;
  const velocityScore = clampScore(
    topMean(itemBreakdown.map((item) => item.velocity)) * 0.75 +
      recentDensity * 0.15 +
      sourceRecencyCoverage * 0.1
  );

  const authorityInputs = sources.map((source) => source.authorityScore);
  const averageAuthority = mean(authorityInputs);
  const maxAuthority = authorityInputs.length ? Math.max(...authorityInputs) : 0;
  const authorityDiversityBonus = Math.min(
    10,
    Math.max(0, sourceCoverage.length - 1) * 3 +
      Math.max(0, platformCoverage.length - 1) * 2
  );
  const authorityScore = clampScore(
    averageAuthority * 0.65 +
      maxAuthority * 0.25 +
      authorityDiversityBonus
  );

  const calculatedAt = now;
  const sharedRawValue = {
    itemCount: itemBreakdown.length,
    sourceCount: sourceCoverage.length,
    platformCount: platformCoverage.length,
    sourceCoverage,
    platformCoverage,
    sourceAuthority: sources.map((source) => ({
      sourceId: source.id,
      authorityScore: source.authorityScore
    })),
    platformInputs: itemBreakdown.map((item) => ({
      rawItemId: item.rawItemId,
      platform: item.platform,
      adapter: item.adapter,
      rawMetrics: item.rawMetrics
    }))
  };

  const [hotness, velocity, authority] = await Promise.all([
    upsertClusterSignal({
      clusterId: pack.cluster.id,
      signalType: "HOTNESS",
      score: hotnessScore,
      rawValue: sharedRawValue,
      breakdown: {
        measuredItemCount: measuredHotness.length,
        topNormalizedHotness: [...measuredHotness].sort((a, b) => b - a).slice(0, 3),
        coverageBonus,
        items: itemBreakdown.map((item) => ({
          rawItemId: item.rawItemId,
          adapter: item.adapter,
          engagement: item.engagement,
          freshness: item.freshness,
          adjustedHotness: item.adjustedHotness,
          normalizedMetrics: item.normalizedMetrics
        }))
      },
      calculatedAt
    }),
    upsertClusterSignal({
      clusterId: pack.cluster.id,
      signalType: "VELOCITY",
      score: velocityScore,
      rawValue: sharedRawValue,
      breakdown: {
        recentItemCount: recentItems.length,
        recentDensity: clampScore(recentDensity),
        recentSourceCount,
        sourceRecencyCoverage: clampScore(sourceRecencyCoverage),
        items: itemBreakdown.map((item) => ({
          rawItemId: item.rawItemId,
          ageHours: item.ageHours,
          freshness: item.freshness,
          velocity: item.velocity
        }))
      },
      calculatedAt
    }),
    upsertClusterSignal({
      clusterId: pack.cluster.id,
      signalType: "AUTHORITY",
      score: authorityScore,
      rawValue: sharedRawValue,
      breakdown: {
        averageAuthority: clampScore(averageAuthority),
        maxAuthority: clampScore(maxAuthority),
        authorityDiversityBonus,
        sources: itemBreakdown.map((item) => ({
          rawItemId: item.rawItemId,
          sourceId: item.sourceId,
          authorityScore: item.authorityScore
        }))
      },
      calculatedAt
    })
  ]);

  await db
    .update(contentEventClusters)
    .set({
      hotnessScore,
      velocityScore,
      authorityScore,
      updatedAt: new Date()
    })
    .where(eq(contentEventClusters.id, pack.cluster.id));

  return {
    clusterId: pack.cluster.id,
    adapterVersion: EVENT_SIGNAL_ADAPTER_VERSION,
    calculatedAt,
    scores: {
      hotness: hotnessScore,
      velocity: velocityScore,
      authority: authorityScore
    },
    signals: { hotness, velocity, authority },
    breakdown: {
      sourceCoverage,
      platformCoverage,
      items: itemBreakdown
    }
  };
}

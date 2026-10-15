import "server-only";

import { desc, inArray } from "drizzle-orm";
import { getDatabase } from "../db";
import {
  contentEventExpansionEvidence,
  contentRawItemObservations
} from "../db/schema";
import { listSourceQualificationSnapshots } from "./source-qualification";
import {
  TOPIC_MOMENTUM_MAX_AGE_HOURS,
  TOPIC_MOMENTUM_MIN_AGE_HOURS
} from "./topic-momentum";
import { RADAR_SOURCE_IDS } from "../../content/radar-source-portfolio";

const SIGNAL_FRESHNESS_HOURS = 72;
const PRACTICAL_REFERENCE_FRESHNESS_HOURS = 24 * 7;
const PRACTICAL_TYPES = ["EXPERIENCE", "TUTORIAL", "USE_CASE", "WORK_IMPACT"] as const;

function toTime(value: Date | string | null | undefined) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

export async function getTodayIntelligenceSignalReadiness(now = new Date()) {
  const db = getDatabase();
  const qualifications = await listSourceQualificationSnapshots([...RADAR_SOURCE_IDS]);
  const auto = qualifications.filter((item) => item.qualification === "AUTO_READY");
  const roleCount = (role: string) => auto.filter((item) => item.sourceRole === role).length;

  const factCoverage = {
    official: roleCount("OFFICIAL"),
    media: roleCount("PROFESSIONAL_MEDIA"),
    research: roleCount("RESEARCH"),
    developer: roleCount("DEVELOPER_COMMUNITY")
  };
  const factSourcesReady =
    factCoverage.official >= 4 &&
    factCoverage.media >= 3 &&
    factCoverage.research >= 1 &&
    factCoverage.developer >= 2;

  const signalSources = qualifications.filter((item) =>
    item.qualification !== "DISABLED" &&
    item.evidenceRoles.includes("SOCIAL_SIGNAL")
  );
  const qualifiedSignalSources = auto.filter((item) =>
    item.evidenceRoles.includes("SOCIAL_SIGNAL")
  );
  const signalSourceIds = signalSources.map((item) => item.sourceId);
  const observations = signalSourceIds.length
    ? await db
        .select()
        .from(contentRawItemObservations)
        .where(inArray(contentRawItemObservations.sourceId, signalSourceIds))
        .orderBy(desc(contentRawItemObservations.observedAt))
        .limit(2000)
    : [];
  const signalFreshAfter = now.getTime() - SIGNAL_FRESHNESS_HOURS * 60 * 60 * 1000;
  const recentSignalSourceIds = new Set(
    observations
      .filter((item) => toTime(item.observedAt) >= signalFreshAfter)
      .map((item) => item.sourceId)
  );
  const recentSignalPlatforms = new Set(
    signalSources
      .filter((item) => recentSignalSourceIds.has(item.sourceId))
      .map((item) => item.platform)
  );
  const qualifiedSignalSourceIds = new Set(qualifiedSignalSources.map((item) => item.sourceId));
  const qualifiedRecentSignalSourceIds = new Set(
    [...recentSignalSourceIds].filter((sourceId) => qualifiedSignalSourceIds.has(sourceId))
  );
  const qualifiedRecentSignalPlatforms = new Set(
    qualifiedSignalSources
      .filter((item) => qualifiedRecentSignalSourceIds.has(item.sourceId))
      .map((item) => item.platform)
  );

  // Discovery signals remain useful inputs, but they no longer gate 3–7 day
  // creator momentum or act as hotspot authority.
  const discoverySignalsReady =
    recentSignalSourceIds.size >= 1 ||
    recentSignalPlatforms.size >= 1;

  const practicalEvidence = await db
    .select()
    .from(contentEventExpansionEvidence)
    .where(inArray(contentEventExpansionEvidence.expansionType, [...PRACTICAL_TYPES]))
    .orderBy(desc(contentEventExpansionEvidence.createdAt))
    .limit(1000);
  const practicalFreshAfter =
    now.getTime() - PRACTICAL_REFERENCE_FRESHNESS_HOURS * 60 * 60 * 1000;
  const recentPracticalEvidence = practicalEvidence.filter(
    (item) => toTime(item.createdAt) >= practicalFreshAfter
  );
  const practicalReferenceReady = recentPracticalEvidence.length > 0;

  const gaps: string[] = [];
  if (!factSourcesReady) gaps.push("FACT_SOURCE_COVERAGE_BELOW_BASELINE");
  if (!discoverySignalsReady) gaps.push("DISCOVERY_SIGNAL_OBSERVATION_NOT_FRESH");
  if (!practicalReferenceReady) gaps.push("PRACTICAL_REFERENCE_EVIDENCE_NOT_FRESH");

  const readyForTodayIntelligence =
    factSourcesReady &&
    practicalReferenceReady;

  return {
    version: "today-intelligence-readiness-v2" as const,
    evaluatedAt: now.toISOString(),
    readyForTodayIntelligence,
    status: readyForTodayIntelligence ? "READY" as const : "NOT_READY" as const,
    factSources: {
      ready: factSourcesReady,
      autoReadyTotal: auto.length,
      ...factCoverage
    },
    discoverySignals: {
      ready: discoverySignalsReady,
      freshnessHours: SIGNAL_FRESHNESS_HOURS,
      authority: "DISCOVERY_ONLY" as const,
      qualifiedSourceCount: qualifiedSignalSources.length,
      recentSourceCount: recentSignalSourceIds.size,
      recentPlatformCount: recentSignalPlatforms.size,
      recentPlatforms: [...recentSignalPlatforms].sort(),
      qualifiedRecentSourceCount: qualifiedRecentSignalSourceIds.size,
      qualifiedRecentPlatformCount: qualifiedRecentSignalPlatforms.size,
      qualifiedRecentPlatforms: [...qualifiedRecentSignalPlatforms].sort()
    },
    topicMomentum: {
      ready: true,
      minAgeHours: TOPIC_MOMENTUM_MIN_AGE_HOURS,
      windowHours: TOPIC_MOMENTUM_MAX_AGE_HOURS,
      mode: "CREATOR_SUSTAINED_MOMENTUM" as const,
      authority: "PRESENTATION_ONLY" as const
    },
    practicalReferences: {
      ready: practicalReferenceReady,
      freshnessHours: PRACTICAL_REFERENCE_FRESHNESS_HOURS,
      recentEvidenceCount: recentPracticalEvidence.length,
      recentEventCount: new Set(recentPracticalEvidence.map((item) => item.eventId)).size
    },
    gaps
  };
}


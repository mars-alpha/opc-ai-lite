import "server-only";

import { createHash } from "node:crypto";
import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { getDatabase } from "../db";
import { contentCollectionRuns, contentSources } from "../db/schema";
import { resolveSourceAcquisitionPlan } from "./source-acquisition-plan";

export const SOURCE_QUALIFICATION_RUNTIME_VERSION = "source-qualification-runtime-v1";
export const SOURCE_COLLECTION_RUNTIME_CONTRACT_VERSION = "system-collection-runtime-v2";
export const QUALIFICATION_RUNTIME_CONDITIONAL_FAILURES = 3;
export const QUALIFICATION_RUNTIME_DISABLED_FAILURES = 6;
export const SOURCE_QUALIFICATION_SAFETY_LOOKBACK_DAYS = 180;

// Filter evidence BEFORE ranking/limiting; audit or old routes never consume slots.
export function currentQualificationEvidencePredicate(sourceId: string, checkpoint: string, now = new Date()) {
  return and(
    eq(contentCollectionRuns.sourceId, sourceId),
    gte(contentCollectionRuns.startedAt, new Date(now.getTime() - SOURCE_QUALIFICATION_SAFETY_LOOKBACK_DAYS * 86_400_000)),
    lte(contentCollectionRuns.startedAt, now),
    inArray(contentCollectionRuns.status, ["SUCCEEDED", "FAILED"]),
    sql`${contentCollectionRuns.metadata}->>'collectionOrigin' = 'SYSTEM'`,
    sql`${contentCollectionRuns.metadata}->'qualificationOnly' is distinct from 'true'::jsonb`,
    sql`${contentCollectionRuns.metadata}->>'collectionRuntimeVersion' = ${SOURCE_COLLECTION_RUNTIME_CONTRACT_VERSION}`,
    sql`${contentCollectionRuns.metadata}->>'qualificationCheckpoint' = ${checkpoint}`,
    sql`${contentCollectionRuns.metadata}->'staleRunRecovery'->'excludeFromRuntimeQualification' is distinct from 'true'::jsonb`
  );
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function cleanHost(value: string) {
  return value.toLocaleLowerCase().replace(/^www\./, "");
}

function strings(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
    : [];
}

const PROVIDER_HOSTS: Record<string, string[]> = {
  HN_TOP: ["hacker-news.firebaseio.com"],
  HN_BEST: ["hacker-news.firebaseio.com"],
  GITHUB_TREND_PROXY: ["api.github.com"],
  HN_ALGOLIA: ["hn.algolia.com"],
  GITHUB_SEARCH: ["api.github.com"],
  ARXIV: ["export.arxiv.org"],
  HF: ["huggingface.co"],
  HUGGINGFACE_MODELS: ["huggingface.co"],
  HUGGINGFACE_PAPERS: ["huggingface.co"],
  BILIBILI_POPULAR: ["api.bilibili.com"],
  BILIBILI_SEARCH: ["api.bilibili.com"],
  YOUTUBE_AI_TREND: ["www.googleapis.com"],
  YOUTUBE_SEARCH: ["www.googleapis.com"],
  REDDIT_AI_HOT: ["www.reddit.com"],
  ARXIV_AI_RECENT: ["export.arxiv.org"],
  AIHOT_SELECTED: ["aihot.news"],
  GOOGLE_TRENDS: ["trends.google.com"],
  PRODUCT_HUNT: ["api.producthunt.com"]
};

export function buildQualificationCheckpoint(input: {
  sourceId: string;
  platform: string;
  collectionMethod: string;
  canonicalUrl?: string | null;
  providerRef?: string | null;
  collectionConfig?: unknown;
  metadata?: unknown;
}) {
  const config = record(input.collectionConfig);
  const meta = record(input.metadata);
  const declaredAdapterVersion = String(
    meta.runtimeVersion ??
    meta.mediaDiscoveryVersion ??
    meta.researchDiscoveryVersion ??
    "adapter-v1"
  );
  const acquisition = resolveSourceAcquisitionPlan({
    collectionMethod: input.collectionMethod,
    platform: input.platform,
    canonicalUrl: input.canonicalUrl,
    providerRef: input.providerRef,
    collectionConfig: input.collectionConfig,
    metadata: input.metadata
  });
  const routeSignature = acquisition.routes.map((route) => [
    route.id,
    route.role,
    route.kind,
    route.targetUrl ?? "",
    route.runtimeOwner ?? "",
    route.enabled ? "1" : "0",
    route.serverRuntimeSupported ? "1" : "0"
  ].join(":")).join("|");
  const adapterVersion =
    SOURCE_COLLECTION_RUNTIME_CONTRACT_VERSION + ":" + declaredAdapterVersion;
  const sourceSchemaVersion = String(meta.sourceSchemaVersion ?? "1");
  const payload = [
    input.sourceId,
    input.platform,
    input.collectionMethod,
    input.canonicalUrl ?? "",
    input.providerRef ?? "",
    String(config.provider ?? ""),
    adapterVersion,
    sourceSchemaVersion,
    routeSignature
  ].join("\n");
  return {
    adapterVersion,
    sourceSchemaVersion,
    checkpoint: createHash("sha256").update(payload).digest("hex")
  };
}

export function validateQualificationPreviewTarget(input: {
  canonicalUrl?: string | null;
  targetUrl: string;
  allowedHosts?: string[];
  allowedPathPrefixes?: string[];
}) {
  const rawTarget = input.targetUrl.trim();
  const rawPathMatch = rawTarget.match(/^[a-z][a-z0-9+.-]*:\/\/[^/]+([^?#]*)/i);
  const rawPath = rawPathMatch?.[1] ?? "";
  const rawSegments = rawPath.split("/").filter(Boolean);
  if (rawSegments.some((segment) => {
    try {
      return decodeURIComponent(segment).trim() === "..";
    } catch {
      return true;
    }
  })) {
    throw new Error("QUALIFICATION_TARGET_PATH_ESCAPE");
  }
  const target = new URL(input.targetUrl);
  if (!["http:", "https:"].includes(target.protocol)) {
    throw new Error("QUALIFICATION_TARGET_PROTOCOL_NOT_ALLOWED");
  }
  const canonicalHost = input.canonicalUrl
    ? cleanHost(new URL(input.canonicalUrl).hostname)
    : null;
  const allowedHosts = new Set(
    [canonicalHost, ...(input.allowedHosts ?? []).map(cleanHost)].filter(Boolean) as string[]
  );
  if (allowedHosts.size && !allowedHosts.has(cleanHost(target.hostname))) {
    throw new Error("QUALIFICATION_TARGET_HOST_NOT_DECLARED");
  }
  const decodedPath = decodeURIComponent(target.pathname);
  if (decodedPath.split("/").some((part) => part === "..")) {
    throw new Error("QUALIFICATION_TARGET_PATH_ESCAPE");
  }
  const prefixes = input.allowedPathPrefixes ?? [];
  if (prefixes.length && !prefixes.some((prefix) => decodedPath.startsWith(prefix))) {
    throw new Error("QUALIFICATION_TARGET_PATH_NOT_DECLARED");
  }
  return true;
}

export function qualificationPreviewPolicyForSource(input: {
  canonicalUrl?: string | null;
  collectionConfig?: unknown;
  metadata?: unknown;
}) {
  const config = record(input.collectionConfig);
  const meta = record(input.metadata);
  const provider = String(config.provider ?? "").toUpperCase();
  const configuredProviderHosts =
    provider.startsWith("DAILYHOT_") && process.env.DAILYHOT_API_BASE_URL?.trim()
      ? [new URL(process.env.DAILYHOT_API_BASE_URL.trim()).hostname]
      : [];
  const canonicalHost = input.canonicalUrl
    ? cleanHost(new URL(input.canonicalUrl).hostname)
    : null;
  const allowedHosts = [
    ...(canonicalHost ? [canonicalHost] : []),
    ...(PROVIDER_HOSTS[provider] ?? []),
    ...configuredProviderHosts,
    ...strings(config.qualificationAllowedHosts),
    ...strings(meta.qualificationAllowedHosts)
  ];
  return {
    allowedHosts: [...new Set(allowedHosts.map(cleanHost))],
    allowedPathPrefixes: [
      ...strings(config.qualificationAllowedPathPrefixes),
      ...strings(meta.qualificationAllowedPathPrefixes)
    ]
  };
}

export function evaluateRuntimeQualificationWindow(input: {
  baselineQualification: "AUTO_READY" | "CONDITIONAL" | "MANUAL_ONLY" | "DISABLED";
  statuses: string[];
  priorEffectiveQualification?: "AUTO_READY" | "CONDITIONAL" | "MANUAL_ONLY" | "DISABLED" | null;
}) {
  let consecutiveFailures = 0;
  for (const status of input.statuses) {
    if (status === "SUCCEEDED") break;
    if (status === "FAILED") consecutiveFailures += 1;
  }
  if (input.baselineQualification === "MANUAL_ONLY") {
    return { effectiveQualification: "MANUAL_ONLY" as const, consecutiveFailures, reason: "MANUAL_ONLY" };
  }
  if (
    input.baselineQualification === "DISABLED" ||
    consecutiveFailures >= QUALIFICATION_RUNTIME_DISABLED_FAILURES
  ) {
    return { effectiveQualification: "DISABLED" as const, consecutiveFailures, reason: "CONSECUTIVE_FAILURES_6" };
  }
  if (consecutiveFailures >= QUALIFICATION_RUNTIME_CONDITIONAL_FAILURES) {
    return { effectiveQualification: "CONDITIONAL" as const, consecutiveFailures, reason: "CONSECUTIVE_FAILURES_3" };
  }
  if (
    input.baselineQualification === "AUTO_READY" &&
    input.priorEffectiveQualification === "DISABLED"
  ) {
    return {
      effectiveQualification: "DISABLED" as const,
      consecutiveFailures,
      reason: "RECERTIFICATION_REQUIRED_AFTER_DISABLE"
    };
  }
  return {
    effectiveQualification: input.baselineQualification,
    consecutiveFailures,
    reason:
      input.baselineQualification === "AUTO_READY" &&
      input.priorEffectiveQualification === "CONDITIONAL" &&
      consecutiveFailures === 0
        ? "RUNTIME_RECOVERED_FROM_CONDITIONAL"
        : consecutiveFailures
          ? "RUNTIME_DEGRADED_BUT_BELOW_THRESHOLD"
          : "RUNTIME_HEALTHY"
  };
}

export async function refreshSourceRuntimeQualification(
  sourceId: string,
  baselineQualification?: "AUTO_READY" | "CONDITIONAL" | "MANUAL_ONLY" | "DISABLED"
) {
  const db = getDatabase();
  const [source] = await db.select().from(contentSources).where(eq(contentSources.id, sourceId)).limit(1);
  if (!source) throw new Error("SOURCE_NOT_FOUND");
  const checkpoint = buildQualificationCheckpoint({sourceId:source.id,platform:source.platform,collectionMethod:source.collectionMethod,canonicalUrl:source.canonicalUrl,providerRef:source.providerRef,collectionConfig:source.collectionConfig,metadata:source.metadata});
  const runs = await db
    .select({ status: contentCollectionRuns.status, metadata: contentCollectionRuns.metadata })
    .from(contentCollectionRuns)
    .where(currentQualificationEvidencePredicate(sourceId, checkpoint.checkpoint))
    .orderBy(desc(contentCollectionRuns.startedAt), desc(contentCollectionRuns.id))
    .limit(QUALIFICATION_RUNTIME_DISABLED_FAILURES);
  const productionStatuses = runs
    .filter((run) => {
      const metadata = record(run.metadata);
      const staleRecovery = record(metadata.staleRunRecovery);
      return metadata.qualificationOnly !== true &&
        metadata.collectionOrigin === "SYSTEM" &&
        metadata.collectionRuntimeVersion === SOURCE_COLLECTION_RUNTIME_CONTRACT_VERSION &&
        metadata.qualificationCheckpoint === checkpoint.checkpoint &&
        staleRecovery.excludeFromRuntimeQualification !== true &&
        ["SUCCEEDED", "FAILED"].includes(run.status);
    })
    .map((run) => run.status)
    .slice(0, QUALIFICATION_RUNTIME_DISABLED_FAILURES);
  const meta = record(source.metadata);
  const priorQualification = record(meta.sourceQualification);
  const priorRuntime = record(meta.runtimeQualification);
  const baseline =
    baselineQualification ??
    (String(priorQualification.qualification ?? "CONDITIONAL") as
      "AUTO_READY" | "CONDITIONAL" | "MANUAL_ONLY" | "DISABLED");
  const decision = evaluateRuntimeQualificationWindow({
    baselineQualification: baseline,
    statuses: productionStatuses,
    priorEffectiveQualification:
      priorRuntime.checkpoint === checkpoint.checkpoint &&
      ["AUTO_READY", "CONDITIONAL", "MANUAL_ONLY", "DISABLED"].includes(
        String(priorRuntime.effectiveQualification ?? "")
      )
        ? priorRuntime.effectiveQualification as
            "AUTO_READY" | "CONDITIONAL" | "MANUAL_ONLY" | "DISABLED"
        : null
  });
  const runtimeQualification = {
    version: SOURCE_QUALIFICATION_RUNTIME_VERSION,
    ...checkpoint,
    baselineQualification: baseline,
    effectiveQualification: decision.effectiveQualification,
    consecutiveFailures: decision.consecutiveFailures,
    reason: decision.reason,
    evaluatedAt: new Date().toISOString(),
    recentProductionStatuses: productionStatuses
  };
  await db.update(contentSources).set({
    metadata: sql`${contentSources.metadata} || ${JSON.stringify({
      runtimeQualification
    })}::jsonb`,
    updatedAt: new Date()
  }).where(eq(contentSources.id, sourceId));
  return runtimeQualification;
}

export async function reconcileSourceRuntimeQualifications() {
  const { listSourceQualificationSnapshots } = await import("./source-qualification");
  const { listCurrentSystemCollectionSourceIds } = await import("./source-portfolio-runtime");
  const currentSourceIds = await listCurrentSystemCollectionSourceIds({ serverRuntimeOnly: true });
  const snapshots = await listSourceQualificationSnapshots(currentSourceIds);
  const results: Array<{
    sourceId: string;
    name: string;
    baselineQualification: string;
    effectiveQualification: string;
    consecutiveFailures: number;
    reason: string;
  }> = [];
  for (const snapshot of snapshots) {
    const baseline = snapshot.qualification;
    if (!["AUTO_READY", "CONDITIONAL"].includes(baseline)) continue;
    const runtime = await refreshSourceRuntimeQualification(
      snapshot.sourceId,
      baseline as "AUTO_READY" | "CONDITIONAL"
    );
    results.push({
      sourceId: snapshot.sourceId,
      name: snapshot.name,
      baselineQualification: baseline,
      effectiveQualification: runtime.effectiveQualification,
      consecutiveFailures: runtime.consecutiveFailures,
      reason: runtime.reason
    });
  }
  return results;
}


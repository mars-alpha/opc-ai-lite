import "server-only";

import { and, desc, gte, inArray } from "drizzle-orm";
import postgres from "postgres";
import { getDatabase } from "../db";
import { requireDatabaseUrl } from "../database-config";
import { contentCollectionRuns, contentSources } from "../db/schema";
import { auditSourceRuntimeGovernance } from "./source-runtime-governance";
import type { SourceRuntimeGovernancePlan } from "./source-runtime-governance";
import { readSourceApiQuota } from "./source-api-quota-ledger";

export const SOURCE_RUNTIME_GOVERNANCE_EXECUTION_VERSION = "source-runtime-governance-execution-v1";
export const DEFAULT_SOURCE_BASE_INTERVAL_MINUTES = 15;
export const MIN_SOURCE_INTERVAL_MINUTES = 5;
export const MAX_SOURCE_INTERVAL_MINUTES = 1440;

async function acquireSourceCollectionCycleLock(onLost: () => void) {
  // A private connection must never silently reconnect and let the collector
  // continue without its session lock. The scheduler exits on observed loss.
  let armed = false;
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  let pending: Promise<void> | null = null;
  const connection = postgres(requireDatabaseUrl(), {
    max: 1, prepare: false, idle_timeout: 0, max_lifetime: null,
    connect_timeout: 5,
    connection: { application_name: "opc_collection_lock_" + process.pid },
    onclose: () => { if (armed) onLost(); }
  });
  async function bounded<T>(query: PromiseLike<T>): Promise<T> {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([query, new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("SOURCE_COLLECTION_LOCK_CHECK_TIMEOUT")), 10_000);
      })]);
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }
  try {
    const [row] = await bounded(connection<{ acquired: boolean; pid: number }[]>`select pg_try_advisory_lock(20261015, 1) as acquired, pg_backend_pid() as pid`);
    if (!row?.acquired) {
      await connection.end({ timeout: 1 });
      return null;
    }
    armed = true;
    const backendPid = row.pid;
    heartbeat = setInterval(() => {
      if (pending) return;
      pending = bounded(connection<{ pid: number; held: boolean }[]>`
        select pg_backend_pid() as pid, exists (
          select 1 from pg_locks where pid = pg_backend_pid() and locktype = 'advisory'
          and classid = 20261015::oid and objid = 1::oid and objsubid = 2 and granted
        ) as held
      `).then(([state]) => {
        if (!state?.held || state.pid !== backendPid) throw new Error("SOURCE_COLLECTION_CYCLE_LOCK_LOST");
      }).catch(() => { if (armed) onLost(); }).finally(() => { pending = null; });
    }, 5_000);
    heartbeat.unref();
  } catch (error) {
    armed = false;
    if (heartbeat) clearInterval(heartbeat);
    await connection.end({ timeout: 1 });
    throw error;
  }
  return async () => {
    armed = false;
    if (heartbeat) clearInterval(heartbeat);
    try {
      if (pending) await pending;
      const [row] = await bounded(connection<{ released: boolean }[]>`select pg_advisory_unlock(20261015, 1) as released`);
      if (!row?.released) throw new Error("SOURCE_COLLECTION_CYCLE_LOCK_LOST");
    } finally {
      await connection.end({ timeout: 1 });
    }
  };
}

export async function withSourceCollectionCycleLock<T>(
  work: () => Promise<T>,
  acquire: (onLost: () => void) => Promise<null | (() => Promise<void>)> = acquireSourceCollectionCycleLock,
  onLost: () => void = () => {
    console.error("SOURCE_COLLECTION_CYCLE_LOCK_LOST");
    process.exit(1);
  }
): Promise<{ status: "SKIPPED" } | { status: "COMPLETED"; value: T }> {
  let lost = false;
  const release = await acquire(() => {
    if (lost) return;
    lost = true;
    onLost();
  });
  if (!release) return { status: "SKIPPED" };
  try {
    const value = await work();
    if (lost) throw new Error("SOURCE_COLLECTION_CYCLE_LOCK_LOST");
    return { status: "COMPLETED", value };
  } finally {
    await release();
  }
}

export const SOURCE_RUNTIME_EXECUTION_ACTIONS = [
  "RUN_WHEN_DUE",
  "WAIT_UNTIL_DUE",
  "HUMAN_REVIEW_REQUIRED",
  "BLOCKED_INVALID_INPUT"
] as const;

export type SourceRuntimeExecutionAction =
  (typeof SOURCE_RUNTIME_EXECUTION_ACTIONS)[number];

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function boundedInterval(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_SOURCE_BASE_INTERVAL_MINUTES;
  return Math.max(
    MIN_SOURCE_INTERVAL_MINUTES,
    Math.min(MAX_SOURCE_INTERVAL_MINUTES, Math.round(parsed))
  );
}

export function resolveSourceBaseIntervalMinutes(source: {
  collectionConfig?: unknown;
  metadata?: unknown;
}) {
  const collectionConfig = record(source.collectionConfig);
  const metadata = record(source.metadata);
  const automaticCollection = record(
    collectionConfig.automaticCollection ?? metadata.automaticCollection
  );
  return boundedInterval(
    automaticCollection.intervalMinutes ??
    collectionConfig.intervalMinutes ??
    metadata.intervalMinutes ??
    DEFAULT_SOURCE_BASE_INTERVAL_MINUTES
  );
}

export function buildSourceGovernanceExecutionPlan(input: {
  sourceId: string;
  governancePlan: SourceRuntimeGovernancePlan | string;
  recommendedIntervalMultiplier: 1 | 2 | 4 | null;
  qualificationKnown: boolean;
  coverageCritical: boolean;
  baseIntervalMinutes?: number;
  lastRunAt?: Date | string | null;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const baseIntervalMinutes = boundedInterval(
    input.baseIntervalMinutes ?? DEFAULT_SOURCE_BASE_INTERVAL_MINUTES
  );

  if (!input.sourceId || !input.qualificationKnown) {
    return {
      version: SOURCE_RUNTIME_GOVERNANCE_EXECUTION_VERSION,
      sourceId: input.sourceId,
      action: "BLOCKED_INVALID_INPUT" as const,
      executable: false,
      requiresHumanReview: false,
      reason: !input.sourceId ? "SOURCE_REQUIRED" : "QUALIFICATION_REQUIRED",
      baseIntervalMinutes,
      effectiveIntervalMinutes: null,
      nextDueAt: null,
      due: false
    };
  }

  if (
    input.governancePlan === "PAUSE_AUTO_REVIEW" ||
    input.governancePlan === "DISABLE_REVIEW_REQUIRED"
  ) {
    const lastRunAt = input.lastRunAt ? new Date(input.lastRunAt) : null;
    const nextDue =
      lastRunAt && Number.isFinite(lastRunAt.getTime())
        ? new Date(lastRunAt.getTime() + baseIntervalMinutes * 60_000)
        : now;
    const due = now.getTime() >= nextDue.getTime();
    return {
      version: SOURCE_RUNTIME_GOVERNANCE_EXECUTION_VERSION,
      sourceId: input.sourceId,
      action: "HUMAN_REVIEW_REQUIRED" as const,
      executable: true,
      requiresHumanReview: true,
      reason: input.coverageCritical
        ? "HUMAN_GATE_COVERAGE_PROTECTED"
        : "HUMAN_GATE_REQUIRED",
      baseIntervalMinutes,
      effectiveIntervalMinutes: baseIntervalMinutes,
      nextDueAt: nextDue.toISOString(),
      due
    };
  }

  if (
    input.governancePlan !== "KEEP_CADENCE" &&
    input.governancePlan !== "REDUCE_CADENCE"
  ) {
    return {
      version: SOURCE_RUNTIME_GOVERNANCE_EXECUTION_VERSION,
      sourceId: input.sourceId,
      action: "BLOCKED_INVALID_INPUT" as const,
      executable: false,
      requiresHumanReview: false,
      reason: "UNKNOWN_GOVERNANCE_PLAN",
      baseIntervalMinutes,
      effectiveIntervalMinutes: null,
      nextDueAt: null,
      due: false
    };
  }

  const multiplier =
    input.governancePlan === "KEEP_CADENCE"
      ? 1
      : input.recommendedIntervalMultiplier === 2
        ? 2
        : 2;
  const effectiveIntervalMinutes = Math.min(
    MAX_SOURCE_INTERVAL_MINUTES,
    baseIntervalMinutes * multiplier
  );

  const lastRunAt = input.lastRunAt ? new Date(input.lastRunAt) : null;
  if (!lastRunAt || !Number.isFinite(lastRunAt.getTime())) {
    return {
      version: SOURCE_RUNTIME_GOVERNANCE_EXECUTION_VERSION,
      sourceId: input.sourceId,
      action: "RUN_WHEN_DUE" as const,
      executable: true,
      requiresHumanReview: false,
      reason: "NO_PRIOR_RUN_DUE_NOW",
      baseIntervalMinutes,
      effectiveIntervalMinutes,
      nextDueAt: now.toISOString(),
      due: true
    };
  }

  const nextDue = new Date(
    lastRunAt.getTime() + effectiveIntervalMinutes * 60_000
  );
  const due = now.getTime() >= nextDue.getTime();
  return {
    version: SOURCE_RUNTIME_GOVERNANCE_EXECUTION_VERSION,
    sourceId: input.sourceId,
    action: due ? "RUN_WHEN_DUE" as const : "WAIT_UNTIL_DUE" as const,
    executable: true,
    requiresHumanReview: false,
    reason: due ? "CADENCE_DUE" : "CADENCE_NOT_DUE",
    baseIntervalMinutes,
    effectiveIntervalMinutes,
    nextDueAt: nextDue.toISOString(),
    due
  };
}

export async function auditSourceGovernanceExecution(options: {
  windowDays?: number;
  sourceIds?: string[];
  now?: Date;
} = {}) {
  const governance = await auditSourceRuntimeGovernance(options);
  if (!governance.length) return [];

  const db = getDatabase();
  const now = options.now ?? new Date();
  const windowDays = Math.max(1, Math.min(90, options.windowDays ?? 14));
  const since = new Date(now.getTime() - windowDays * 86_400_000);
  const sourceIds = governance.map((item) => item.source.id);
  const [sources, runs] = await Promise.all([
    db.select({
      id: contentSources.id,
      collectionConfig: contentSources.collectionConfig,
      metadata: contentSources.metadata
    }).from(contentSources).where(inArray(contentSources.id, sourceIds)),
    db.select({
      sourceId: contentCollectionRuns.sourceId,
      startedAt: contentCollectionRuns.startedAt,
      metadata: contentCollectionRuns.metadata
    })
      .from(contentCollectionRuns)
      .where(and(
        inArray(contentCollectionRuns.sourceId, sourceIds),
        gte(contentCollectionRuns.startedAt, since)
      ))
      .orderBy(desc(contentCollectionRuns.startedAt))
  ]);
  const youtubeQuota = sources.some((source) =>
    String(record(source.collectionConfig).provider ?? "").toUpperCase() === "YOUTUBE_AI_TREND"
  )
    ? await readSourceApiQuota("YOUTUBE", { limit: 10_000, baseIntervalMinutes: 60, now })
    : null;
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const latestProductionRunBySource = new Map<string, Date>();
  for (const run of runs) {
    if (!run.sourceId || latestProductionRunBySource.has(run.sourceId)) continue;
    if (record(run.metadata).qualificationOnly === true) continue;
    latestProductionRunBySource.set(run.sourceId, run.startedAt);
  }

  return governance.map((item) => {
    const source = sourceById.get(item.source.id);
    if (!source) {
      return {
        ...item,
        execution: buildSourceGovernanceExecutionPlan({
          sourceId: item.source.id,
          governancePlan: item.governance.plan,
          recommendedIntervalMultiplier: item.governance.recommendedIntervalMultiplier,
          qualificationKnown: false,
          coverageCritical: item.governance.coverageCritical,
          now: options.now
        })
      };
    }
    const baseIntervalMinutes = resolveSourceBaseIntervalMinutes(source);
    const lastRunAt = latestProductionRunBySource.get(item.source.id) ?? null;
    const execution = buildSourceGovernanceExecutionPlan({
      sourceId: item.source.id,
      governancePlan: item.governance.plan,
      recommendedIntervalMultiplier: item.governance.recommendedIntervalMultiplier,
      qualificationKnown: item.qualificationKnown,
      coverageCritical: item.governance.coverageCritical,
      baseIntervalMinutes,
      lastRunAt,
      now: options.now
    });
    const provider = String(record(source.collectionConfig).provider ?? "").toUpperCase();
    const quotaManagedExecution =
      provider === "YOUTUBE_AI_TREND" && youtubeQuota &&
      execution.action !== "HUMAN_REVIEW_REQUIRED" &&
      execution.action !== "BLOCKED_INVALID_INPUT"
        ? (() => {
            if (youtubeQuota.action === "PAUSE_EXPENSIVE_API") {
              return {
                ...execution,
                action: "WAIT_UNTIL_DUE" as const,
                reason: "API_QUOTA_CONSERVE",
                effectiveIntervalMinutes: null,
                nextDueAt: new Date(now.getTime() + 60 * 60_000).toISOString(),
                due: false,
                apiQuota: youtubeQuota
              };
            }
            const quotaInterval = baseIntervalMinutes * (youtubeQuota.multiplier ?? 1);
            const effectiveIntervalMinutes = Math.max(
              execution.effectiveIntervalMinutes ?? baseIntervalMinutes,
              quotaInterval
            );
            const nextDue = lastRunAt
              ? new Date(lastRunAt.getTime() + effectiveIntervalMinutes * 60_000)
              : now;
            const due = now.getTime() >= nextDue.getTime();
            return {
              ...execution,
              action: due ? "RUN_WHEN_DUE" as const : "WAIT_UNTIL_DUE" as const,
              reason: youtubeQuota.action === "NORMAL" ? execution.reason : "API_QUOTA_" + youtubeQuota.action,
              effectiveIntervalMinutes,
              nextDueAt: nextDue.toISOString(),
              due,
              apiQuota: youtubeQuota
            };
          })()
        : execution;
    return {
      ...item,
      execution: quotaManagedExecution
    };
  });
}

export async function listDueSourceIdsForAutomaticCycle(options: {
  windowDays?: number;
  sourceIds?: string[];
  now?: Date;
} = {}) {
  const items = await auditSourceGovernanceExecution(options);
  return {
    version: SOURCE_RUNTIME_GOVERNANCE_EXECUTION_VERSION,
    sourceIds: items
      .filter((item) =>
        item.execution.executable &&
        item.execution.due &&
        (
          item.execution.action === "RUN_WHEN_DUE" ||
          item.execution.action === "HUMAN_REVIEW_REQUIRED"
        )
      )
      .map((item) => item.source.id),
    items
  };
}

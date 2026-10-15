import "server-only";

import { and, asc, eq, gte, isNull, sql } from "drizzle-orm";
import type { AuthUser } from "../auth/service";
import { getDatabase } from "../db";
import {
  contentEventExpansionEvidence,
  contentEventRawItems,
  contentEvents,
  contentRawItems,
  contentSources
} from "../db/schema";
import { refreshSourceManagedEventExpansion } from "./collection-expansion";
import { qualifyCreatorCoverage } from "./creator-coverage-qualification";
import {
  calculateTopicMomentum,
  resolveTopicMomentumFollowUpHours,
  TOPIC_MOMENTUM_MAX_AGE_HOURS
} from "./topic-momentum";

export const TOPIC_MOMENTUM_RUNTIME_VERSION = "topic-momentum-runtime-v2-source-managed";
export const TOPIC_MOMENTUM_MIN_FOLLOW_UP_HOURS = 6;
export const TOPIC_MOMENTUM_MAX_EVENTS_PER_RUN = 3;


type RuntimeState = {
  version: string;
  status: "QUEUED" | "FOLLOWING" | "CURRENT_HOT" | "EXPIRED";
  day: number;
  enrolledAt: string;
  nextFollowUpAt: string | null;
  lastFollowUpAt: string | null;
  followUpCount: number;
  lastError: string | null;
  momentum: unknown;
  creatorCoverage: unknown;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function isTopicMomentumFollowUpEligible(event: { archivedAt?: Date | null; metadata: unknown }) {
  const policy = record(record(event.metadata).eventPolicy);
  return !event.archivedAt && policy.aiRelevant !== false && record(policy.operationalUsefulness).eligible !== false;
}

function iso(value: unknown) {
  if (typeof value !== "string" || !value) return null;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

function dayFor(firstSeenAt: Date, now: Date) {
  return Math.max(1, Math.min(7, Math.floor((now.getTime() - firstSeenAt.getTime()) / 86_400_000) + 1));
}

export function initialTopicMomentumRuntimeState(firstSeenAt: Date | string, now = new Date()): RuntimeState {
  const firstSeen = new Date(firstSeenAt);
  const expired = now.getTime() - firstSeen.getTime() > TOPIC_MOMENTUM_MAX_AGE_HOURS * 3_600_000;
  return {
    version: TOPIC_MOMENTUM_RUNTIME_VERSION,
    status: expired ? "EXPIRED" : "QUEUED",
    day: dayFor(firstSeen, now),
    enrolledAt: now.toISOString(),
    nextFollowUpAt: expired ? null : now.toISOString(),
    lastFollowUpAt: null,
    followUpCount: 0,
    lastError: null,
    momentum: null,
    creatorCoverage: null
  };
}

function runtimeState(event: typeof contentEvents.$inferSelect, now: Date): RuntimeState {
  const meta = record(event.metadata);
  const current = record(meta.topicMomentumRuntime);
  if (current.version !== TOPIC_MOMENTUM_RUNTIME_VERSION) {
    return initialTopicMomentumRuntimeState(event.firstSeenAt, now);
  }
  return {
    version: TOPIC_MOMENTUM_RUNTIME_VERSION,
    status: ["QUEUED", "FOLLOWING", "CURRENT_HOT", "EXPIRED"].includes(String(current.status))
      ? current.status as RuntimeState["status"]
      : "QUEUED",
    day: dayFor(event.firstSeenAt, now),
    enrolledAt: iso(current.enrolledAt) ?? now.toISOString(),
    nextFollowUpAt: iso(current.nextFollowUpAt),
    lastFollowUpAt: iso(current.lastFollowUpAt),
    followUpCount: Number.isFinite(Number(current.followUpCount)) ? Math.max(0, Number(current.followUpCount)) : 0,
    lastError: typeof current.lastError === "string" ? current.lastError : null,
    momentum: current.momentum ?? null,
    creatorCoverage: current.creatorCoverage ?? null
  };
}

export function topicMomentumMetadataPatch(state: unknown) {
  return sql`jsonb_set(coalesce(${contentEvents.metadata}, '{}'::jsonb), '{topicMomentumRuntime}', ${JSON.stringify(state)}::text::jsonb, true)`;
}

async function persistState(event: typeof contentEvents.$inferSelect, state: RuntimeState) {
  const encoded = JSON.stringify(state);
  await getDatabase().update(contentEvents).set({
    metadata: topicMomentumMetadataPatch(state),
    updatedAt: new Date()
  }).where(and(eq(contentEvents.id, event.id),
    sql`${contentEvents.metadata}->'topicMomentumRuntime' is distinct from ${encoded}::text::jsonb`));
}

async function calculateEventRuntimeEvidence(event: typeof contentEvents.$inferSelect, now: Date) {
  const db = getDatabase();
  const raws = await db
    .select({
      sourceId: contentRawItems.sourceId,
      sourceType: contentSources.sourceType,
      sourceName: contentSources.name,
      platform: contentRawItems.platform,
      author: contentRawItems.author,
      publishedAt: contentRawItems.publishedAt,
      collectedAt: contentRawItems.collectedAt,
      metadata: contentRawItems.metadata,
      platformMetrics: contentRawItems.platformMetrics
    })
    .from(contentEventRawItems)
    .innerJoin(contentRawItems, eq(contentRawItems.id, contentEventRawItems.rawItemId))
    .innerJoin(contentSources, eq(contentSources.id, contentRawItems.sourceId))
    .where(eq(contentEventRawItems.eventId, event.id));
  const evidence = await db
    .select({
      expansionType: contentEventExpansionEvidence.expansionType,
      createdAt: contentEventExpansionEvidence.createdAt
    })
    .from(contentEventExpansionEvidence)
    .where(eq(contentEventExpansionEvidence.eventId, event.id));
  const momentum = calculateTopicMomentum({
    firstSeenAt: event.firstSeenAt,
    raws,
    evidence,
    now
  });
  const creatorCoverage = qualifyCreatorCoverage({
    creatorCount: momentum.creatorCount,
    creatorItemCount: momentum.creatorItemCount,
    platformCount: momentum.platformCount,
    activeDayCount: momentum.activeDayCount,
    practicalTypeCount: momentum.practicalTypeCount,
    engagedCreatorItemCount: momentum.engagedCreatorItemCount
  });
  return { momentum, creatorCoverage };
}

export function topicMomentumDueCondition(now: Date) {
  const cutoff = new Date(now.getTime() - TOPIC_MOMENTUM_MAX_AGE_HOURS * 3_600_000);
  return and(isNull(contentEvents.archivedAt), gte(contentEvents.firstSeenAt, cutoff),
      sql`(${contentEvents.metadata} #> '{eventPolicy,aiRelevant}') is distinct from 'false'::jsonb`,
      sql`(${contentEvents.metadata} #> '{eventPolicy,operationalUsefulness,eligible}') is distinct from 'false'::jsonb`,
      sql`(
        (${contentEvents.metadata} #>> '{topicMomentumRuntime,version}') is distinct from ${TOPIC_MOMENTUM_RUNTIME_VERSION}
        or (
          (${contentEvents.metadata} #>> '{topicMomentumRuntime,status}') is distinct from 'EXPIRED'
          and (
            coalesce(${contentEvents.metadata} #>> '{topicMomentumRuntime,nextFollowUpAt}', '') !~ '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$'
            or (${contentEvents.metadata} #>> '{topicMomentumRuntime,nextFollowUpAt}') <= ${now.toISOString()}
          )
        )
      )`);
}

export async function runTopicMomentumRuntime(
  user: AuthUser,
  options: { maxEvents?: number; now?: Date } = {}
) {
  const now = options.now ?? new Date();
  const maxEvents = Math.max(1, Math.min(10, Math.round(options.maxEvents ?? TOPIC_MOMENTUM_MAX_EVENTS_PER_RUN)));
  const due = await getDatabase().select().from(contentEvents)
    .where(topicMomentumDueCondition(now))
    .orderBy(asc(contentEvents.firstSeenAt), asc(contentEvents.id)).limit(maxEvents);
  const queue = { scope: "SELECTED_DUE_BATCH", eligibleEvents: due.length,
    enrolled: due.filter(event => record(record(event.metadata).topicMomentumRuntime).version !== TOPIC_MOMENTUM_RUNTIME_VERSION).length,
    refreshed: 0 };
  const results = [];

  for (const event of due) {
    let state = runtimeState(event, now);
    let expansion: unknown = null;
    let lastError: string | null = null;
    try {
      // Production follow-up uses only Raw already collected from Source Management.
      // Topic Momentum must not create or depend on a hidden search-provider source pool.
      expansion = await refreshSourceManagedEventExpansion(
        event.id,
        TOPIC_MOMENTUM_MAX_AGE_HOURS
      );
    } catch (error) {
      lastError = error instanceof Error ? error.message.slice(0, 500) : String(error).slice(0, 500);
    }
    const { momentum, creatorCoverage } = await calculateEventRuntimeEvidence(event, now);
    const expired = momentum.phase === "EXPIRED_WINDOW";
    const day = dayFor(event.firstSeenAt, now);
    const followUpHours = resolveTopicMomentumFollowUpHours({ day, eligible: momentum.eligible });
    state = {
      ...state,
      status: expired ? "EXPIRED" : momentum.eligible ? "CURRENT_HOT" : "FOLLOWING",
      day,
      lastFollowUpAt: now.toISOString(),
      nextFollowUpAt: expired ? null : new Date(now.getTime() + followUpHours * 3_600_000).toISOString(),
      followUpCount: state.followUpCount + 1,
      lastError,
      momentum,
      creatorCoverage
    };
    await persistState(event, state);
    results.push({
      eventId: event.id,
      day: state.day,
      status: state.status,
      nextFollowUpAt: state.nextFollowUpAt,
      followUpHours: expired ? null : followUpHours,
      creatorCoverage,
      momentum,
      expansion,
      error: lastError
    });
  }

  return {
    version: TOPIC_MOMENTUM_RUNTIME_VERSION,
    minimumFollowUpHours: TOPIC_MOMENTUM_MIN_FOLLOW_UP_HOURS,
    adaptiveFollowUpHours: [6, 12, 24],
    windowDays: 7,
    boundedMaxEvents: maxEvents,
    queue,
    dueCount: due.length,
    results
  };
}

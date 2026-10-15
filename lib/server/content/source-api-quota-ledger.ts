import "server-only";

import { eq } from "drizzle-orm";
import { getDatabase } from "../db";
import { contentRadarSnapshots } from "../db/schema";
import { resolveApiQuotaCadence } from "./source-api-quota-policy";

export const SOURCE_API_QUOTA_LEDGER_VERSION = "source-api-quota-ledger-v1";

type Provider = "YOUTUBE";

function providerDay(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(now);
}

function key(provider: Provider, day: string) {
  return "source-api-quota:" + provider.toLowerCase() + ":" + day;
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export async function readSourceApiQuota(provider: Provider, options: {
  limit: number;
  baseIntervalMinutes: number;
  now?: Date;
}) {
  const day = providerDay(options.now);
  const snapshotKey = key(provider, day);
  const [row] = await getDatabase()
    .select()
    .from(contentRadarSnapshots)
    .where(eq(contentRadarSnapshots.key, snapshotKey))
    .limit(1);
  const payload = record(row?.payload);
  const used = typeof payload.usedUnits === "number" ? payload.usedUnits : 0;
  const cadence = resolveApiQuotaCadence({
    limit: options.limit,
    used,
    baseIntervalMinutes: options.baseIntervalMinutes
  });
  return {
    version: SOURCE_API_QUOTA_LEDGER_VERSION,
    provider,
    day,
    limit: options.limit,
    used,
    policyVersion: cadence.version,
    remaining: cadence.remaining,
    remainingRatio: cadence.remainingRatio,
    multiplier: cadence.multiplier,
    action: cadence.action,
    effectiveIntervalMinutes: cadence.effectiveIntervalMinutes,
    preferFeedFallback: cadence.preferFeedFallback
  };
}

export async function reserveSourceApiQuota(provider: Provider, options: {
  units: number;
  limit: number;
  baseIntervalMinutes: number;
  operation: string;
  now?: Date;
}) {
  const now = options.now ?? new Date();
  const current = await readSourceApiQuota(provider, {
    limit: options.limit,
    baseIntervalMinutes: options.baseIntervalMinutes,
    now
  });
  const units = Math.max(1, Math.floor(options.units));
  if (
    current.remaining < units ||
    current.action === "PAUSE_EXPENSIVE_API"
  ) {
    throw new Error("SOURCE_API_QUOTA_CONSERVE_" + provider);
  }

  const usedUnits = current.used + units;
  const payload = {
    version: SOURCE_API_QUOTA_LEDGER_VERSION,
    provider,
    day: current.day,
    limit: options.limit,
    usedUnits,
    lastOperation: options.operation,
    lastReservedUnits: units,
    updatedAt: now.toISOString()
  };
  const db = getDatabase();
  const snapshotKey = key(provider, current.day);
  const [existing] = await db.select({ key: contentRadarSnapshots.key })
    .from(contentRadarSnapshots)
    .where(eq(contentRadarSnapshots.key, snapshotKey))
    .limit(1);
  if (existing) {
    await db.update(contentRadarSnapshots)
      .set({ payload, generatedAt: now, updatedAt: now })
      .where(eq(contentRadarSnapshots.key, snapshotKey));
  } else {
    await db.insert(contentRadarSnapshots).values({
      key: snapshotKey,
      payload,
      generatedAt: now,
      updatedAt: now
    });
  }
  return {
    ...payload,
    decision: resolveApiQuotaCadence({
      limit: options.limit,
      used: usedUnits,
      baseIntervalMinutes: options.baseIntervalMinutes
    })
  };
}

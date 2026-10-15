import "server-only";

import { createHash } from "node:crypto";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import type { AuthUser } from "../auth/service";
import { getDatabase } from "../db";
import {
  contentCollectionQualityLabels, contentEventExpansionEvidence,
  contentEventRawItems, contentEvents, contentRadarSnapshots, contentRawItemObservations,
  contentRawItems, contentSources
} from "../db/schema";
import { parseQualityFeedbackInput } from "../../content/collection-quality-feedback-contract";
import { recordContentAudit } from "./workbench";

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function currentRows<T extends { eventId: string; sourceId: string | null }>(rows: T[]) {
  const seen = new Set<string>();
  return rows.filter(row => {
    const key = row.eventId + "\0" + (row.sourceId ?? "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function eventSources(eventId: string, executor: Pick<ReturnType<typeof getDatabase>, "select"> = getDatabase()) {
  const direct = await executor.select({ rawItemId: contentEventRawItems.rawItemId })
    .from(contentEventRawItems).where(eq(contentEventRawItems.eventId, eventId));
  const expansion = await executor.select({ rawItemId: contentEventExpansionEvidence.rawItemId })
    .from(contentEventExpansionEvidence).where(eq(contentEventExpansionEvidence.eventId, eventId));
  const rawIds = [...new Set([...direct, ...expansion].map(row => row.rawItemId))];
  if (!rawIds.length) return { raws: [], observations: [] };
  const [raws, observations] = await Promise.all([
    executor.select().from(contentRawItems).where(inArray(contentRawItems.id, rawIds)),
    executor.select().from(contentRawItemObservations).where(inArray(contentRawItemObservations.rawItemId, rawIds))
  ]);
  return { raws, observations };
}

export async function recordCollectionQualityFeedback(user: AuthUser, eventId: string, body: unknown) {
  const input = parseQualityFeedbackInput(eventId, body);
  const requestHash = createHash("sha256").update(JSON.stringify(input)).digest("hex");
  return getDatabase().transaction(async tx => {
    const [event] = await tx.select().from(contentEvents).where(eq(contentEvents.id, eventId)).limit(1).for("update");
    if (!event) throw new Error("QUALITY_EVENT_NOT_FOUND");
    const [retry] = await tx.select().from(contentCollectionQualityLabels)
      .where(eq(contentCollectionQualityLabels.requestId, input.requestId)).limit(1);
    if (retry) {
      if (retry.requestHash !== requestHash) throw new Error("QUALITY_REQUEST_CONFLICT");
      return { changed: false, currentLabel: retry.label === "CLEAR" ? null : retry.label, sourceId: retry.sourceId, labelId: retry.id };
    }
    const sources = await eventSources(eventId, tx);
    const sourceIds = [...new Set([...sources.raws.map(row => row.sourceId), ...sources.observations.map(row => row.sourceId)])];
    if (input.sourceId && !sourceIds.includes(input.sourceId)) throw new Error("QUALITY_SOURCE_NOT_ASSOCIATED");
    const [before] = await tx.select().from(contentCollectionQualityLabels)
      .where(and(eq(contentCollectionQualityLabels.eventId, eventId), input.sourceId
        ? eq(contentCollectionQualityLabels.sourceId, input.sourceId)
        : sql`${contentCollectionQualityLabels.sourceId} is null`))
      .orderBy(desc(contentCollectionQualityLabels.id)).limit(1);
    const prior = before?.label === "CLEAR" ? null : before;
    if (input.label === "CLEAR" ? !prior : prior?.label === input.label && prior.reason === input.reason && prior.note === input.note) {
      return { changed: false, currentLabel: prior?.label ?? null, sourceId: input.sourceId, labelId: prior?.id ?? null };
    }
    const selectedRaw = input.sourceId ? sources.raws.find(row => row.sourceId === input.sourceId)
      ?? sources.raws.find(row => sources.observations.some(obs => obs.rawItemId === row.id && obs.sourceId === input.sourceId))
      : sources.raws[0];
    const selectedObservation = sources.observations.find(row => row.sourceId === input.sourceId && row.rawItemId === selectedRaw?.id);
    const [snapshot] = await tx.select().from(contentRadarSnapshots).where(eq(contentRadarSnapshots.key, "CURRENT")).limit(1);
    const payload = object(snapshot?.payload);
    const snapshotItem = [...[payload.items, payload.featured, payload.currentHot, payload.worthPracticing]
      .flatMap(value => Array.isArray(value) ? value : [])]
      .find(value => object(value).eventId === eventId);
    const current = object(snapshotItem);
    const sampleContext = {
      version: "collection-quality-label-v1", eventId, title: event.title.slice(0, 500),
      eventAt: event.eventAt?.toISOString() ?? null, eventType: event.eventType,
      sourceId: input.sourceId, associatedSourceIds: sourceIds.slice(0, 30),
      rawItemId: selectedRaw?.id ?? null, observationId: selectedObservation?.id ?? null,
      runId: null, originalUrl: selectedRaw?.originalUrl?.slice(0, 2000) ?? null,
      collectedAt: selectedRaw?.collectedAt.toISOString() ?? null,
      discoveryStatusAtFeedback: event.discoveryStatus,
      automatic: {
        relevanceScore: event.relevanceScore, verificationStatus: event.verificationStatus,
        category: current.category ?? null, currentHot: current.currentHot ?? null,
        curation: current.curation ?? null, worthPracticing: Array.isArray(payload.worthPracticing) ? payload.worthPracticing.some(row => object(row).eventId === eventId) : null,
        eventPolicyVersion: event.policyVersion, snapshotVersion: payload.schemaVersion ?? null,
        snapshotAsOf: snapshot?.generatedAt.toISOString() ?? null
      }
    };
    const [inserted] = await tx.insert(contentCollectionQualityLabels).values({
      eventId, sourceId: input.sourceId, label: input.label, reason: input.reason, note: input.note,
      actorId: user.id, actorEmail: user.email, requestId: input.requestId, requestHash, sampleContext
    }).returning();
    await recordContentAudit(user, {
      action: "COLLECTION_QUALITY_LABEL_RECORDED", entityType: "DISCOVERY_EVENT", entityId: eventId,
      before: { label: prior?.label ?? null }, after: { label: input.label, sourceId: input.sourceId },
      metadata: { labelId: inserted.id, reason: input.reason }
    }, tx);
    return { changed: true, currentLabel: input.label === "CLEAR" ? null : input.label, sourceId: input.sourceId, labelId: inserted.id };
  });
}

export async function listEventQualityFeedback(eventIds: string[]) {
  const ids = [...new Set(eventIds)].slice(0, 100);
  if (!ids.length) return {};
  const db = getDatabase();
  const rows = await db.selectDistinctOn([contentCollectionQualityLabels.eventId, contentCollectionQualityLabels.sourceId])
    .from(contentCollectionQualityLabels).where(inArray(contentCollectionQualityLabels.eventId, ids))
    .orderBy(contentCollectionQualityLabels.eventId, contentCollectionQualityLabels.sourceId, desc(contentCollectionQualityLabels.id));
  const current = currentRows(rows).filter(row => row.label !== "CLEAR");
  const [direct, expansion] = await Promise.all([
    db.select({ eventId: contentEventRawItems.eventId, rawItemId: contentEventRawItems.rawItemId })
      .from(contentEventRawItems).where(inArray(contentEventRawItems.eventId, ids)),
    db.select({ eventId: contentEventExpansionEvidence.eventId, rawItemId: contentEventExpansionEvidence.rawItemId })
      .from(contentEventExpansionEvidence).where(inArray(contentEventExpansionEvidence.eventId, ids))
  ]);
  const links = [...direct, ...expansion];
  const rawIds = [...new Set(links.map(row => row.rawItemId))];
  const [raws, observations] = rawIds.length ? await Promise.all([
    db.select({ id: contentRawItems.id, sourceId: contentRawItems.sourceId }).from(contentRawItems).where(inArray(contentRawItems.id, rawIds)),
    db.select({ rawItemId: contentRawItemObservations.rawItemId, sourceId: contentRawItemObservations.sourceId })
      .from(contentRawItemObservations).where(inArray(contentRawItemObservations.rawItemId, rawIds))
  ]) : [[], []];
  const sourcesByRaw = new Map<string, Set<string>>();
  for (const row of [...raws.map(row => ({ rawItemId: row.id, sourceId: row.sourceId })), ...observations]) {
    const sources = sourcesByRaw.get(row.rawItemId) ?? new Set<string>();
    sources.add(row.sourceId); sourcesByRaw.set(row.rawItemId, sources);
  }
  const sourcesByEvent = new Map<string, Set<string>>();
  for (const link of links) {
    const sources = sourcesByEvent.get(link.eventId) ?? new Set<string>();
    for (const id of sourcesByRaw.get(link.rawItemId) ?? []) sources.add(id);
    sourcesByEvent.set(link.eventId, sources);
  }
  const allSourceIds = [...new Set([...sourcesByEvent.values()].flatMap(set => [...set]))];
  const names = allSourceIds.length ? await db.select({ id: contentSources.id, name: contentSources.name }).from(contentSources).where(inArray(contentSources.id, allSourceIds)) : [];
  const nameById = new Map(names.map(row => [row.id, row.name]));
  const result: Record<string, { eventLabel: string | null; sources: Array<{ sourceId: string; label: string }>; sourceOptions: Array<{ sourceId: string; name: string }> }> = {};
  for (const id of ids) {
    const sourceIds = [...(sourcesByEvent.get(id) ?? [])];
    result[id] = {
      eventLabel: current.find(row => row.eventId === id && !row.sourceId)?.label ?? null,
      sources: current.filter(row => row.eventId === id && row.sourceId).map(row => ({ sourceId: row.sourceId!, label: row.label })),
      sourceOptions: sourceIds.map(sourceId => ({ sourceId, name: nameById.get(sourceId) ?? sourceId }))
    };
  }
  return result;
}

export async function sourceQualitySummary(sourceId: string, days = 30, cursor?: number, limit = 30) {
  const db = getDatabase();
  const rows = await db.selectDistinctOn([contentCollectionQualityLabels.eventId])
    .from(contentCollectionQualityLabels)
    .where(eq(contentCollectionQualityLabels.sourceId, sourceId))
    .orderBy(contentCollectionQualityLabels.eventId, desc(contentCollectionQualityLabels.id));
  const boundedDays = Number.isFinite(days) ? Math.min(90, Math.max(1, days)) : 30;
  const since = Date.now() - boundedDays * 86400000;
  const current = rows.filter(row => row.label !== "CLEAR" && row.createdAt.getTime() >= since).sort((a, b) => b.id - a.id);
  const negative = current.filter(row => row.label === "NEGATIVE");
  const reasons: Record<string, number> = {};
  for (const row of negative) if (row.reason) reasons[row.reason] = (reasons[row.reason] ?? 0) + 1;
  const page = negative.filter(row => !cursor || row.id < cursor).slice(0, Math.min(100, Math.max(1, limit)));
  return { sourceId, days: boundedDays, evaluatedCount: current.length, negativeCount: negative.length, reasons,
    samples: page.map(row => ({ id: row.id, eventId: row.eventId, reason: row.reason, note: row.note, at: row.createdAt, context: row.sampleContext })),
    nextCursor: page.length && negative.some(row => row.id < page[page.length - 1].id) ? page[page.length - 1].id : null };
}

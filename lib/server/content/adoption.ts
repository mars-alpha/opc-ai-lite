import "server-only";

import { and, eq, inArray } from "drizzle-orm";
import type { AuthUser } from "../auth/service";
import { getDatabase } from "../db";
import {
  contentEventRawItems,
  contentEvents,
  contentItems,
  contentRawItems
} from "../db/schema";
import { createEvidence, linkEvidenceToContent, recordContentAudit } from "./workbench";

function eventId(value: unknown) {
  const id = typeof value === "string" ? value.trim() : "";
  if (!id || id.length > 100) throw new Error("INVALID_EVENT_ID");
  return id;
}

export async function ensureContentDraftForEvent(user: AuthUser, eventIdInput: string) {
  const resolvedEventId = eventId(eventIdInput);
  const db = getDatabase();

  const [existing] = await db
    .select()
    .from(contentItems)
    .where(and(eq(contentItems.sourceType, "DISCOVERY_EVENT"), eq(contentItems.sourceRef, resolvedEventId)))
    .limit(1);
  if (existing) return existing;

  const [event] = await db
    .select()
    .from(contentEvents)
    .where(eq(contentEvents.id, resolvedEventId))
    .limit(1);
  if (!event) throw new Error("EVENT_NOT_FOUND");

  const links = await db
    .select({ rawItemId: contentEventRawItems.rawItemId })
    .from(contentEventRawItems)
    .where(eq(contentEventRawItems.eventId, resolvedEventId));
  const rawIds = links.map((item) => item.rawItemId);
  const rawItems = rawIds.length
    ? await db.select().from(contentRawItems).where(inArray(contentRawItems.id, rawIds))
    : [];
  const primary = rawItems[0] ?? null;
  const contentId = "content_event_" + resolvedEventId;

  const inserted = await db
    .insert(contentItems)
    .values({
      id: contentId,
      title: event.title,
      summary: event.summary || "来自热点追踪的已采用选题，待补充内容观点与成稿。",
      audience: null,
      purpose: null,
      tags: Array.isArray(event.keywords) ? event.keywords : [],
      category: "选题 Brief",
      destination: "IGNORE",
      sourceType: "DISCOVERY_EVENT",
      sourceRef: resolvedEventId,
      sourceUrl: primary?.originalUrl ?? null,
      sourcePublishedAt: primary?.publishedAt ?? null,
      readingMinutes: null,
      status: "DRAFT",
      version: 1,
      collectedAt: new Date(),
      updatedAt: new Date()
    })
    .onConflictDoNothing()
    .returning();

  const created = inserted[0];
  if (!created) {
    const [raced] = await db
      .select()
      .from(contentItems)
      .where(eq(contentItems.id, contentId))
      .limit(1);
    if (!raced) throw new Error("CONTENT_ADOPTION_CREATE_FAILED");
    return raced;
  }

  await recordContentAudit(user, {
    action: "CONTENT_CREATED_FROM_DISCOVERY_EVENT",
    entityType: "CONTENT",
    entityId: created.id,
    entityVersion: created.version,
    after: created,
    metadata: { eventId: resolvedEventId }
  });

  for (const [index, raw] of rawItems.slice(0, 8).entries()) {
    const evidence = await createEvidence(user, raw.sourceId, {
      originalUrl: raw.originalUrl,
      providerRef: raw.externalId,
      title: raw.title,
      excerpt: raw.excerpt,
      publishedAt: raw.publishedAt?.toISOString() ?? null,
      contentHash: raw.contentHash,
      snapshotKey: raw.snapshotRef,
      verificationStatus: "VERIFIED",
      metadata: {
        rawItemId: raw.id,
        eventId: resolvedEventId,
        autoLinked: true,
        verifiedByAdoption: true
      }
    });
    await linkEvidenceToContent(
      user,
      created.id,
      evidence.id,
      index === 0 ? "PRIMARY" : "SUPPORTING"
    );
  }

  return created;
}

import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { closeDatabase, getDatabase } from "../lib/server/db";
import {
  contentEventExpansionEvidence,
  contentRawItems
} from "../lib/server/db/schema";
import {
  CREATOR_PRACTICAL_POLICY_VERSION,
  classifyEventExpansionCandidate
} from "../lib/server/content/event-expansion";
import { getEventExpansionContext } from "../lib/server/content/collection-expansion";

loadEnvConfig(process.cwd());

async function main() {
  const apply = process.argv.includes("--apply");
  const target = assertCurrentDatabaseTarget();
  if (apply && (target.environment !== "development" || target.databaseName !== "opc_ai_dev")) {
    throw new Error("CREATOR_EVIDENCE_REVALIDATE_APPLY_REQUIRES_DEVELOPMENT");
  }

  const db = getDatabase();
  const rows = await db
    .select({
      id: contentEventExpansionEvidence.id,
      eventId: contentEventExpansionEvidence.eventId,
      rawItemId: contentEventExpansionEvidence.rawItemId,
      query: contentEventExpansionEvidence.query,
      expansionRunId: contentEventExpansionEvidence.expansionRunId,
      platform: contentRawItems.platform,
      title: contentRawItems.title,
      excerpt: contentRawItems.excerpt,
      publishedAt: contentRawItems.publishedAt,
      platformMetrics: contentRawItems.platformMetrics
    })
    .from(contentEventExpansionEvidence)
    .innerJoin(contentRawItems, eq(contentRawItems.id, contentEventExpansionEvidence.rawItemId));

  const contextCache = new Map<string, Awaited<ReturnType<typeof getEventExpansionContext>>>();
  let valid = 0;
  let invalid = 0;
  let updated = 0;
  let deleted = 0;

  for (const row of rows) {
    let context = contextCache.get(row.eventId);
    if (!context) {
      context = await getEventExpansionContext(row.eventId);
      contextCache.set(row.eventId, context);
    }
    const result = classifyEventExpansionCandidate(context, {
      rawItemId: row.rawItemId,
      platform: row.platform,
      title: row.title,
      excerpt: row.excerpt,
      publishedAt: row.publishedAt,
      platformMetrics: row.platformMetrics && typeof row.platformMetrics === "object"
        ? row.platformMetrics as Record<string, unknown>
        : null,
      query: row.query,
      expansionRunId: row.expansionRunId
    });

    if (!result) {
      invalid += 1;
      console.log("INVALID", row.eventId, row.rawItemId, row.title);
      if (apply) {
        await db.delete(contentEventExpansionEvidence)
          .where(eq(contentEventExpansionEvidence.id, row.id));
        deleted += 1;
      }
      continue;
    }

    valid += 1;
    if (apply) {
      await db.update(contentEventExpansionEvidence)
        .set({
          expansionType: result.expansionType,
          mediaType: result.mediaType,
          language: result.language,
          relevanceScore: result.relevanceScore,
          valueScore: result.valueScore,
          rankScore: result.rankScore,
          shadowSignalScore: result.shadowSignalScore,
          query: result.query,
          metadata: result.metadata,
          updatedAt: new Date()
        })
        .where(eq(contentEventExpansionEvidence.id, row.id));
      updated += 1;
    }
  }

  console.log("CREATOR_EVIDENCE_POLICY=" + CREATOR_PRACTICAL_POLICY_VERSION);
  console.log("CREATOR_EVIDENCE_REVALIDATE_TOTAL=" + rows.length);
  console.log("CREATOR_EVIDENCE_REVALIDATE_VALID=" + valid);
  console.log("CREATOR_EVIDENCE_REVALIDATE_INVALID=" + invalid);
  console.log("CREATOR_EVIDENCE_REVALIDATE_UPDATED=" + updated);
  console.log("CREATOR_EVIDENCE_REVALIDATE_DELETED=" + deleted);
  console.log("CREATOR_EVIDENCE_REVALIDATE_MODE=" + (apply ? "APPLY" : "DRY_RUN"));
}

main()
  .finally(() => closeDatabase())
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });

import { loadEnvConfig } from "@next/env";
import { eq, sql } from "drizzle-orm";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { contentSources, users, contentCollectionRuns } from "../lib/server/db/schema";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { listCurrentSystemCollectionSources, seedRadarSourcePortfolio } from "../lib/server/content/source-portfolio-runtime";
import { runSourceCollection } from "../lib/server/content/collection-runner";
import { classifySourceAssetForCleanup, applyDevelopmentSourceAssetCleanup } from "../lib/server/content/source-asset-cleanup";
import { withSourceCollectionCycleLock } from "../lib/server/content/source-runtime-governance-execution";
loadEnvConfig(process.cwd());
async function main() {
  const target = assertCurrentDatabaseTarget(); const db = getDatabase();
  const refreshBaseline = process.argv.includes("--refresh-baseline");
  const applyCleanup = process.argv.includes("--apply-cleanup"), backfill = process.argv.includes("--backfill");
  if ((applyCleanup || backfill || refreshBaseline) && target.environment !== "development") throw Error("QUALITY_WRITE_DEVELOPMENT_ONLY_UNTIL_PRODUCTION_MIGRATION_PASS");
  const all = await db.select().from(contentSources).where(eq(contentSources.status, "ACTIVE"));
  const decisions = all.map(source => ({ name: source.name, ...classifySourceAssetForCleanup(source) }));
  const quality = await db.execute(sql`
    select s.id, s.name, s.enabled, s.collection_method,
      count(r.id)::int as recent_items,
      count(r.id) filter (where length(trim(coalesce(r.title,'')))>0)::int as with_title,
      count(r.id) filter (where length(trim(coalesce(r.excerpt,'')))>=500)::int as with_long_excerpt,
      count(r.id) filter (where r.published_at is not null)::int as with_published_time,
      count(r.id) filter (where length(trim(coalesce(r.author,'')))>0)::int as with_author,
      count(r.id) filter (where r.original_url ~ '^https?://')::int as with_original_link
    from content_sources s left join content_raw_items r on r.source_id=s.id
      and r.collected_at>=now()-interval '7 days'
    where s.status='ACTIVE' group by s.id,s.name,s.enabled,s.collection_method order by s.id`);
  const performance = await db.execute(sql`
    select source_id,count(*)::int as runs,
      count(*) filter(where status='SUCCEEDED')::int as successes,
      sum(received_count)::int as received, sum(created_count)::int as created,
      sum(duplicate_count)::int as duplicates
    from content_collection_runs where started_at>=now()-interval '7 days'
      and source_id in (select id from content_sources where status='ACTIVE' and enabled=true)
      and metadata->>'collectionOrigin'='SYSTEM' and coalesce(metadata->>'qualificationOnly','false')!='true'
    group by source_id order by source_id`);
  console.log(JSON.stringify({ target, decisions, quality, performance,
    caveats: ["ORIGINALITY_NOT_INFERRED_FROM_SOURCE_TYPE", "LONG_EXCERPT_IS_NOT_VERIFIED_FULL_TEXT", "LOW_SAMPLE_REQUIRES_REVIEW_NOT_AUTO_DELETE"] }));
  if (!applyCleanup && !backfill && !refreshBaseline) return;
  return withSourceCollectionCycleLock(async () => {
    if (refreshBaseline) await seedRadarSourcePortfolio();
    if (applyCleanup) {
      const cleaned = await applyDevelopmentSourceAssetCleanup();
      console.log(JSON.stringify({ cleanupArchived: cleaned.archivedCount, ids: cleaned.archived.map(s => s.id) }));
    }
    if (!backfill) return;
    const [admin] = await db.select().from(users).where(eq(users.role, "ADMIN")).limit(1);
    if (!admin) throw Error("ADMIN_REQUIRED");
    const user = { id: admin.id, email: "collection-quality@opc.invalid", displayName: admin.displayName, role: "ADMIN" as const };
    const until = new Date(); const from = new Date(until.getTime()-168*3600000);
    const requested = process.argv.find(a=>a.startsWith("--sources="))?.slice(10).split(",");
    const sources = (await listCurrentSystemCollectionSources({ serverRuntimeOnly: true })).filter(s=>!requested || requested.includes(s.id));
    const results = [];
    for (const source of sources) {
      try {
        const run = await runSourceCollection(user, source.id, { backfillWindow: { from: from.toISOString(), to: until.toISOString() },
          provenance: { origin: "SYSTEM", collectionPurpose: "LATEST", runKind: "SYSTEM_BACKFILL_168H" } });
        const [stored] = await db.select({ metadata: contentCollectionRuns.metadata }).from(contentCollectionRuns).where(eq(contentCollectionRuns.id, run.id));
        const metadata = stored?.metadata as Record<string, unknown>;
        const result = { sourceId: source.id, status: "SUCCEEDED", created: run.createdCount, duplicates: run.duplicateCount, window: metadata?.backfillWindow ?? null };
        results.push(result); console.log(JSON.stringify({ backfillProgress: result }));
      } catch { const result = { sourceId: source.id, status: "FAILED" }; results.push(result); console.log(JSON.stringify({ backfillProgress: result })); }
    }
    console.log(JSON.stringify({ backfill: { from: from.toISOString(), to: until.toISOString(), sources: sources.length, results,
      historyCompleteness: "AVAILABLE_WINDOW_ONLY_NO_ARCHIVE_GUARANTEE" } }));
    if (results.some(r=>r.status==="FAILED")) process.exitCode=1;
  });
}
main().catch(()=>{console.error("COLLECTION_QUALITY_OPERATION_FAILED_NO_SECRET_OUTPUT");process.exitCode=1;}).finally(async()=>{await closeDatabase();});

import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import postgres from "postgres";
import { sql as query } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import { topicMomentumDueCondition, topicMomentumMetadataPatch, TOPIC_MOMENTUM_RUNTIME_VERSION } from "../lib/server/content/topic-momentum-runtime";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { requireDatabaseUrl } from "../lib/server/database-config";

if (!process.argv.includes("--local-admin-fixtures")) loadEnvConfig(process.cwd());
async function main() {
  assert.equal(assertCurrentDatabaseTarget().environment, "development", "DEVELOPMENT_ONLY");
  const db = process.argv.includes("--local-admin-fixtures")
    ? postgres({ host: "/var/run/postgresql", database: "opc_ai_dev", username: "postgres", max: 1, prepare: false })
    : postgres(requireDatabaseUrl(), { max: 1, prepare: false });
  try {
    await db.begin(async tx => {
      // Connection-local fixtures: no public business rows are inserted or updated.
      await tx`create temporary table content_events (id text, archived_at timestamptz, first_seen_at timestamptz, metadata jsonb) on commit drop`;
      const now = new Date("2026-10-15T04:00:00.000Z");
      const base = { version: TOPIC_MOMENTUM_RUNTIME_VERSION, status: "FOLLOWING", nextFollowUpAt: "2026-10-15T03:00:00.000Z" };
      const fixtures = [
        { id: "due", metadata: { topicMomentumRuntime: base } },
        { id: "new", metadata: {} },
        { id: "future", metadata: { topicMomentumRuntime: { ...base, nextFollowUpAt: "2026-10-16T03:00:00.000Z" } } },
        { id: "expired", metadata: { topicMomentumRuntime: { ...base, status: "EXPIRED" } } },
        { id: "blocked", metadata: { topicMomentumRuntime: base, eventPolicy: { aiRelevant: false } } },
        { id: "not-useful", metadata: { topicMomentumRuntime: base, eventPolicy: { operationalUsefulness: { eligible: false } } } },
        { id: "repair", metadata: { topicMomentumRuntime: { ...base, nextFollowUpAt: "invalid" } } }
      ];
      for (const fixture of fixtures) await tx`insert into content_events values (${fixture.id}, null, ${now.toISOString()}, ${tx.json(fixture.metadata)}::jsonb)`;
      await tx`insert into content_events values ('old',null,'2026-09-01', '{}'::jsonb), ('archived',now(),now(),'{}'::jsonb)`;
      const compiled = new PgDialect().sqlToQuery(query`select id from content_events where ${topicMomentumDueCondition(now)} order by id limit 10`);
      const rows = await tx.unsafe(compiled.sql, compiled.params as string[]);
      assert.deepEqual(rows.map(row => row.id), ["due", "new", "repair"]);
      const bounded = new PgDialect().sqlToQuery(query`select id from content_events where ${topicMomentumDueCondition(now)} order by id limit 1`);
      assert.equal((await tx.unsafe(bounded.sql, bounded.params as string[])).length, 1);
      const before = await tx`select metadata from content_events where id='future'`;
      await tx`update content_events set metadata=jsonb_set(metadata,'{concurrentOwner}','true'::jsonb) where id='due'`;
      const update = new PgDialect().sqlToQuery(query`update content_events set metadata=${topicMomentumMetadataPatch({ updated: true })} where id='due'`);
      await tx.unsafe(update.sql, update.params as string[]);
      const [patched] = await tx`select metadata from content_events where id='due'`;
      assert.equal(patched.metadata.concurrentOwner, true);
      assert.deepEqual(patched.metadata.topicMomentumRuntime, { updated: true });
      assert.deepEqual((await tx`select metadata from content_events where id='future'`)[0], before[0]);
    });
    console.log("COLLECTION_INCREMENTAL_REAL_POSTGRES_DUE_FILTER_AND_METADATA_PRESERVATION=PASS");
  } finally { await db.end({ timeout: 2 }); }
}
main().catch((error) => { console.error("COLLECTION_INCREMENTAL_ACCEPTANCE_FAILED_WITHOUT_SECRET_OUTPUT", { code: error?.code, actual: error?.actual, expected: error?.expected }); process.exitCode = 1; });

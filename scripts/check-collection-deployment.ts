import fs from "node:fs";
import { createHash } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import { getTableConfig } from "drizzle-orm/pg-core";
import postgres from "postgres";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { requireDatabaseUrl } from "../lib/server/database-config";
import * as schema from "../lib/server/db/schema";
import { evaluateCollectionDeployment, collectionIdentityBlockers, planCollectionMigrations } from "../lib/server/content/collection-deployment";

loadEnvConfig(process.cwd());
async function main() {
  const target = assertCurrentDatabaseTarget();
  const tables = [schema.users, schema.contentSources, schema.contentEntities,
    schema.contentRawItems, schema.contentRawItemObservations, schema.contentCollectionRuns,
    schema.contentRadarSnapshots, schema.contentEvents, schema.contentEventClusters,
    schema.contentEventClusterMembers, schema.contentEventClusterSignals,
    schema.contentExpansionRuns, schema.contentEventExpansionEvidence,
    schema.contentEventRawItems, schema.contentEventSignals,
    schema.contentCandidateDecisions, schema.contentEventClusterAnalyses, schema.aiRuns];
  const expected = tables.map(table => {
    const config = getTableConfig(table);
    return { table: config.name, columns: config.columns.map(column => column.name),
      requireWrite: !["users", "ai_runs", "content_event_cluster_analyses", "content_candidate_decisions"].includes(config.name) };
  });
  const sql = postgres(requireDatabaseUrl(), { max: 1, prepare: false, connect_timeout: 10 });
  try {
    // Server-enforced read-only transaction; introspection cannot mutate business data.
    const result = await sql.begin("read only", async tx => {
      const columns = await tx<{ table: string; column: string; readable: boolean; writable: boolean }[]>`
        select c.relname as table, a.attname as column,
          has_table_privilege(current_user, c.oid, 'SELECT') as readable,
          (has_table_privilege(current_user, c.oid, 'INSERT') and
           has_table_privilege(current_user, c.oid, 'UPDATE') and
           has_table_privilege(current_user, c.oid, 'DELETE')) as writable
        from pg_class c join pg_namespace n on n.oid=c.relnamespace
        join pg_attribute a on a.attrelid=c.oid and a.attnum>0 and not a.attisdropped
        where n.nspname='public' and c.relname=any(${expected.map(x => x.table)}::text[])`;
      const runtimeSchema = evaluateCollectionDeployment(expected, columns);
      const canReadAdminIdentity = columns.some(x => x.table === "users" && x.column === "role" && x.readable);
      const [role] = await tx<{ superuser: boolean }[]>`
        select rolsuper as superuser from pg_roles where rolname=current_user`;
      let adminExists: boolean | null = null;
      if (canReadAdminIdentity) {
        const [admin] = await tx<{ present: boolean }[]>`select exists(select 1 from users where role='ADMIN') as present`;
        adminExists = admin.present;
      }
      let migrationPlan: unknown = { status: "NOT_REQUESTED" };
      if (process.argv.includes("--migration-plan")) {
        const journal = JSON.parse(fs.readFileSync("drizzle/meta/_journal.json", "utf8")) as { entries: { tag: string; when: number }[] };
        const local = journal.entries.map(entry => {
          const source = fs.readFileSync("drizzle/" + entry.tag + ".sql", "utf8");
          return { ...entry, hash: createHash("sha256").update(source).digest("hex"),
            destructive: source.split("--> statement-breakpoint").filter(statement => /\b(?:DROP|TRUNCATE)\b|\bDELETE\s+FROM\b/i.test(statement)).map(statement => statement.trim()) };
        });
        const [history] = await tx<{ readable: boolean }[]>`
          select (has_schema_privilege(current_user, n.oid, 'USAGE') and has_table_privilege(current_user, c.oid, 'SELECT')) as readable
          from pg_class c join pg_namespace n on n.oid=c.relnamespace
          where n.nspname='drizzle' and c.relname='__drizzle_migrations'`;
        if (history?.readable) {
          const applied = await tx<{ hash: string; createdAt: string }[]>`select hash, created_at as "createdAt" from drizzle.__drizzle_migrations order by created_at, id`;
          migrationPlan = planCollectionMigrations(local, applied.map(row => ({ hash: row.hash, createdAt: Number(row.createdAt) })));
        } else migrationPlan = { status: "BLOCKED", blockers: ["MIGRATION_HISTORY_NOT_READABLE"] };
      }
      return { ...runtimeSchema, migrationPlan, adminExists, superuser: role.superuser,
        identityBlockers: collectionIdentityBlockers(adminExists, role.superuser) };
    });
    const migrationConfigured = Boolean(process.env.DATABASE_MIGRATION_URL?.trim());
    console.log(JSON.stringify({ version: "collection-deployment-preflight-v1", target,
      runtimeSchema: result, relayConfigured: Boolean(process.env.OVERSEAS_COLLECTOR_RELAY_URL && process.env.OVERSEAS_COLLECTOR_RELAY_SECRET),
      migrationConfigured, productionMigrationGate: "EXISTING_DB_MIGRATE_BACKUP_CONFIRMATION_REQUIRED",
      scope: "SCHEMA_COLUMN_AND_TABLE_PRIVILEGE_CHECK_ONLY_NOT_LIVE_COLLECTION_ACCEPTANCE"
    }, null, 2));
    if (result.status !== "READY" || result.identityBlockers.length || (result.migrationPlan as { status?: string }).status === "BLOCKED") process.exitCode = 1;
  } finally { await sql.end({ timeout: 2 }); }
}
main().catch((error: unknown) => { const code = error && typeof error === "object" && "code" in error ? String(error.code) : "UNKNOWN"; console.error("COLLECTION_DEPLOYMENT_PREFLIGHT_FAILED;CHECK_CONNECTION_OR_SCHEMA_WITHOUT_LOGGING_SECRETS", /^[A-Z0-9_]{1,40}$/.test(code) ? code : "UNKNOWN"); process.exitCode = 1; });

import { loadEnvConfig } from "@next/env";
import postgres from "postgres";

loadEnvConfig(process.cwd());

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("CONTENT_DISCOVERY_DB_ACCEPT_FAILED:" + code);
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL_REQUIRED");

  const sql = postgres(url, { max: 1 });

  try {
    const dbRows = await sql.unsafe("select current_database() as db");
    const db = String(dbRows[0]?.db ?? "");
    assert(Boolean(db), "DATABASE_UNAVAILABLE");

    const tables = await sql.unsafe(
      "select table_name from information_schema.tables where table_schema = 'public' and table_name in ('content_sources','content_raw_items','content_collection_runs','content_expansion_runs','content_events','content_event_clusters','content_event_cluster_members','content_event_cluster_signals','content_event_cluster_analyses','content_event_raw_items','content_event_signals','content_candidate_decisions','ai_runs')"
    );
    const names = new Set(tables.map((row) => String(row.table_name)));
    for (const name of [
      "content_sources",
      "content_raw_items",
      "content_collection_runs",
      "content_expansion_runs",
      "content_events",
      "content_event_clusters",
      "content_event_cluster_members",
      "content_event_cluster_signals",
      "content_event_cluster_analyses",
      "content_event_raw_items",
      "content_event_signals",
      "content_candidate_decisions"
      ,"ai_runs"
    ]) {
      assert(names.has(name), "TABLE_MISSING:" + name);
    }

    const sourceColumns = await sql.unsafe(
      "select column_name from information_schema.columns where table_schema = 'public' and table_name = 'content_sources'"
    );
    const columns = new Set(sourceColumns.map((row) => String(row.column_name)));
    for (const name of [
      "platform",
      "collection_method",
      "enabled",
      "authority_score",
      "topics",
      "collection_config",
      "signal_config",
      "last_collected_at"
    ]) {
      assert(columns.has(name), "SOURCE_COLUMN_MISSING:" + name);
    }

    const linkColumns = await sql.unsafe(
      "select column_name from information_schema.columns where table_schema = 'public' and table_name = 'content_event_raw_items'"
    );
    const linkColumnNames = new Set(linkColumns.map((row) => String(row.column_name)));
    for (const name of [
      "cluster_rule_version",
      "cluster_reason",
      "cluster_score",
      "cluster_metadata"
    ]) {
      assert(linkColumnNames.has(name), "EVENT_LINK_COLUMN_MISSING:" + name);
    }

    const expansionColumns = await sql.unsafe(
      "select column_name from information_schema.columns where table_schema = 'public' and table_name = 'content_expansion_runs'"
    );
    const expansionColumnNames = new Set(expansionColumns.map((row) => String(row.column_name)));
    for (const name of [
      "event_id",
      "query",
      "provider",
      "window_hours",
      "result_limit",
      "received_count",
      "created_count",
      "duplicate_count",
      "status"
    ]) {
      assert(expansionColumnNames.has(name), "EXPANSION_RUN_COLUMN_MISSING:" + name);
    }

    const clusterColumns = await sql.unsafe(
      "select column_name from information_schema.columns where table_schema = 'public' and table_name = 'content_event_clusters'"
    );
    const clusterColumnNames = new Set(clusterColumns.map((row) => String(row.column_name)));
    for (const name of [
      "canonical_title",
      "primary_event_id",
      "cluster_rule_version",
      "member_event_count",
      "raw_item_count",
      "source_count",
      "platform_count",
      "hotness_score",
      "velocity_score",
      "authority_score",
      "first_seen_at",
      "last_seen_at"
    ]) {
      assert(clusterColumnNames.has(name), "EVENT_CLUSTER_COLUMN_MISSING:" + name);
    }

    const clusterMemberColumns = await sql.unsafe(
      "select column_name from information_schema.columns where table_schema = 'public' and table_name = 'content_event_cluster_members'"
    );
    const clusterMemberColumnNames = new Set(clusterMemberColumns.map((row) => String(row.column_name)));
    for (const name of [
      "cluster_id",
      "event_id",
      "role",
      "cluster_rule_version",
      "merge_reason",
      "merge_score",
      "merge_metadata"
    ]) {
      assert(clusterMemberColumnNames.has(name), "EVENT_CLUSTER_MEMBER_COLUMN_MISSING:" + name);
    }

    const clusterSignalColumns = await sql.unsafe(
      "select column_name from information_schema.columns where table_schema = 'public' and table_name = 'content_event_cluster_signals'"
    );
    const clusterSignalColumnNames = new Set(clusterSignalColumns.map((row) => String(row.column_name)));
    for (const name of [
      "cluster_id",
      "signal_type",
      "score",
      "adapter_version",
      "raw_value",
      "breakdown",
      "calculated_at"
    ]) {
      assert(clusterSignalColumnNames.has(name), "EVENT_CLUSTER_SIGNAL_COLUMN_MISSING:" + name);
    }

    const clusterAnalysisColumns = await sql.unsafe(
      "select column_name from information_schema.columns where table_schema = 'public' and table_name = 'content_event_cluster_analyses'"
    );
    const clusterAnalysisColumnNames = new Set(clusterAnalysisColumns.map((row) => String(row.column_name)));
    for (const name of [
      "cluster_id",
      "ai_run_id",
      "analysis_version",
      "input_hash",
      "opc_relevance_score",
      "core_facts",
      "disagreements_or_uncertainties",
      "why_it_matters",
      "recommended_angles",
      "suggested_content_types",
      "human_review_flags",
      "calculated_at"
    ]) {
      assert(clusterAnalysisColumnNames.has(name), "EVENT_CLUSTER_ANALYSIS_COLUMN_MISSING:" + name);
    }

    const aiRunColumns = await sql.unsafe(
      "select column_name from information_schema.columns where table_schema = 'public' and table_name = 'ai_runs'"
    );
    const aiRunColumnNames = new Set(aiRunColumns.map((row) => String(row.column_name)));
    for (const name of [
      "task_type",
      "model_provider",
      "model",
      "skill_version",
      "prompt_version",
      "input_hash",
      "status",
      "error_code",
      "error_message",
      "completed_at"
    ]) {
      assert(aiRunColumnNames.has(name), "AI_RUN_COLUMN_MISSING:" + name);
    }

    console.log("CONTENT_DISCOVERY_DB=" + db);
    console.log("CONTENT_DISCOVERY_DB_SCHEMA=PASS");
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

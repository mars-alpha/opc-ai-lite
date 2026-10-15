import { loadEnvConfig } from "@next/env";
import path from "node:path";
import { inArray } from "drizzle-orm";
import { loadGroundTruthBenchmark } from "../lib/content/ground-truth";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { contentEvents } from "../lib/server/db/schema";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { runEventClustering, scoreEventClusterCandidate } from "../lib/server/content/event-clustering";

loadEnvConfig(process.cwd());

const CALIBRATED_CASE_IDS = new Set([
  "cluster-v2-gpt6-intelligent-ui",
  "cluster-v2-openai-eu-watermark",
  "cluster-v2-manus-funding-office",
  "cluster-v2-nous-funding-hermes-repo",
  "cluster-v2-nvidia-physical-ai-vs-ai-pc",
  "cluster-v2-gpt6-release-vs-arena"
]);

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("AI_CLUSTER_CALIBRATION_ACCEPT_FAILED:" + code);
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(target.environment === "development" && target.databaseName === "opc_ai_dev", "DEVELOPMENT_DATABASE_REQUIRED");

  const benchmark = loadGroundTruthBenchmark(path.join(process.cwd(), "data/content/ground-truth/benchmark-v2.json"));
  const calibratedCases = benchmark.clusterCases.filter((item) => CALIBRATED_CASE_IDS.has(item.caseId));
  assert(calibratedCases.length === CALIBRATED_CASE_IDS.size, "CALIBRATED_CASE_SET_DRIFT");
  const apply = process.argv.includes("--apply");
  if (apply) {
    for (const item of calibratedCases.filter((row) => row.expectedRelation === "SAME_EVENT")) {
      await runEventClustering(item.eventIds[0]!);
    }
  }
  const ids = [...new Set(calibratedCases.flatMap((item) => item.eventIds))];
  const events = await getDatabase().select().from(contentEvents).where(inArray(contentEvents.id, ids));
  const byId = new Map(events.map((event) => [event.id, event]));

  for (const item of calibratedCases) {
    const rows = item.eventIds.map((id) => byId.get(id)).filter(Boolean);
    assert(rows.length === item.eventIds.length, "EVENT_MISSING_" + item.caseId);

    const edges: Array<{ left: string; right: string; score: number | null; reason: string | null }> = [];
    for (let i = 0; i < rows.length; i += 1) {
      for (let j = i + 1; j < rows.length; j += 1) {
        const scored = scoreEventClusterCandidate(rows[i]!, rows[j]!);
        edges.push({
          left: rows[i]!.id,
          right: rows[j]!.id,
          score: scored?.score ?? null,
          reason: scored?.reason ?? null
        });
      }
    }

    if (item.expectedRelation === "SAME_EVENT") {
      const connected = new Set<string>([rows[0]!.id]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const edge of edges.filter((edge) => edge.score !== null)) {
          if (connected.has(edge.left) && !connected.has(edge.right)) { connected.add(edge.right); changed = true; }
          if (connected.has(edge.right) && !connected.has(edge.left)) { connected.add(edge.left); changed = true; }
        }
      }
      assert(connected.size === rows.length, "SAME_EVENT_NOT_CONNECTED_" + item.caseId + ":" + JSON.stringify(edges));
    } else {
      assert(edges.every((edge) => edge.score === null), "NON_SAME_EVENT_MERGE_RISK_" + item.caseId + ":" + JSON.stringify(edges));
    }
  }

  if (apply) console.log("AI_CLUSTER_CALIBRATION_APPLY=PASS");
  console.log("AI_CLUSTER_CALIBRATION_SAME_EVENT_CONNECTED=PASS");
  console.log("AI_CLUSTER_CALIBRATION_NEW_EVENT_GUARD=PASS");
  console.log("AI_CLUSTER_CALIBRATION_RELATED_EVENT_GUARD=PASS");
}

main()
  .then(async () => closeDatabase())
  .catch(async (error) => {
    try { await closeDatabase(); } catch {}
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
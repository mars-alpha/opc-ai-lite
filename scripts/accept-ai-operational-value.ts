import { loadEnvConfig } from "@next/env";
import { inArray } from "drizzle-orm";
import path from "node:path";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { contentEvents } from "../lib/server/db/schema";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { evaluateEventPolicy } from "../lib/server/content/event-policy";
import { loadGroundTruthBenchmark } from "../lib/content/ground-truth";

loadEnvConfig(process.cwd());

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("AI_OPERATIONAL_VALUE_ACCEPT_FAILED:" + code);
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

async function main() {
  const target = assertCurrentDatabaseTarget();
  assert(target.environment === "development" && target.databaseName === "opc_ai_dev", "DEVELOPMENT_DATABASE_REQUIRED");

  const benchmark = loadGroundTruthBenchmark(path.join(process.cwd(), "data/content/ground-truth/benchmark-v2.json"));
  const lowValueIds = new Set([
    "879666a2-8a74-43b6-93c0-4c7b0af71296",
    "cee723ae-9955-4f94-b33b-ce83ba8681ad",
    "fcacdc58-da71-47a1-b044-1c39dabfbba4",
    "bea17007-c05d-4730-b2c3-32d3d85957de",
    "735b66c7-d88b-4e7f-9801-21fe8c062616",
    "678895c2-048a-454d-b937-d8cb6fd69944"
  ]);
  const now = new Date("2026-10-08T18:50:00.000Z");

  for (const item of benchmark.eventCases) {
    await evaluateEventPolicy(item.eventId, now);
  }

  const ids = benchmark.eventCases.map((item) => item.eventId);
  const events = await getDatabase().select().from(contentEvents).where(inArray(contentEvents.id, ids));
  const byId = new Map(events.map((event) => [event.id, event]));

  for (const item of benchmark.eventCases) {
    const event = byId.get(item.eventId);
    assert(Boolean(event), "EVENT_MISSING_" + item.eventId);
    const policy = record(record(event!.metadata).eventPolicy);
    const usefulness = record(policy.operationalUsefulness);
    assert(typeof usefulness.eligible === "boolean", "USEFULNESS_MISSING_" + item.eventId);

    if (lowValueIds.has(item.eventId)) {
      assert(usefulness.eligible === false, "LOW_VALUE_STILL_ELIGIBLE_" + item.eventId);
      assert(
        ["OFFICIAL_CUSTOMER_STORY", "OFFICIAL_INITIATIVE", "MEDIA_OPINION_SINGLE_SOURCE"].includes(String(usefulness.reason ?? "")),
        "LOW_VALUE_REASON_WRONG_" + item.eventId
      );
    } else if (item.expectedDisposition !== "IGNORE") {
      assert(usefulness.eligible === true, "HIGH_VALUE_REGRESSED_" + item.eventId);
    }
  }

  console.log("AI_OPERATIONAL_VALUE_6_FALSE_POSITIVES=PASS");
  console.log("AI_OPERATIONAL_VALUE_OFFICIAL_GUARD=PASS");
  console.log("AI_OPERATIONAL_VALUE_MEDIA_GUARD=PASS");
  console.log("AI_OPERATIONAL_VALUE_HIGH_VALUE_RECALL=PASS");
}

main()
  .then(async () => closeDatabase())
  .catch(async (error) => {
    try { await closeDatabase(); } catch {}
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
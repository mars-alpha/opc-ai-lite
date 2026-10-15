import { loadEnvConfig } from "@next/env";
import { desc } from "drizzle-orm";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { contentEventExpansionEvidence } from "../lib/server/db/schema";
import { getEventExpansionDailyOutput } from "../lib/server/content/event-expansion-output";
import {
  eventExpansionOutputModelConfigured,
  runEventExpansionOutputSynthesis
} from "../lib/server/content/event-expansion-output-synthesis";

loadEnvConfig(process.cwd());

async function main() {
  const target = assertCurrentDatabaseTarget();
  if (target.environment !== "development" || target.databaseName !== "opc_ai_dev") {
    throw new Error("OUTPUT_REVIEW_014_SYNTHESIS_REQUIRES_DEVELOPMENT");
  }

  const [evidence] = await getDatabase()
    .select({ eventId: contentEventExpansionEvidence.eventId })
    .from(contentEventExpansionEvidence)
    .orderBy(desc(contentEventExpansionEvidence.createdAt))
    .limit(1);

  if (!evidence) {
    console.log("OUTPUT_REVIEW_014_SYNTHESIS_NO_REFERENCE_EVIDENCE=SKIP");
    return;
  }

  const output = await getEventExpansionDailyOutput(evidence.eventId);
  const referenceCount = output.sections
    .filter((section) => section.key !== "WHAT_HAPPENED")
    .reduce((sum, section) => sum + section.items.length, 0);

  if (!referenceCount) {
    throw new Error("OUTPUT_REVIEW_014_SYNTHESIS_REFERENCE_OUTPUT_MISSING");
  }

  if (!eventExpansionOutputModelConfigured()) {
    console.log("OUTPUT_REVIEW_014_SYNTHESIS_MODEL_NOT_CONFIGURED=SKIP");
    return;
  }

  const result = await runEventExpansionOutputSynthesis(output);
  for (const section of result.output.sections) {
    for (const item of section.items) {
      console.log("OUTPUT_REVIEW_014_SYNTHESIS=" + section.key + " | " + item.text);
    }
  }
  console.log("OUTPUT_REVIEW_014_SYNTHESIS_EVENT=" + output.eventTitle);
  console.log("OUTPUT_REVIEW_014_SYNTHESIS_VALIDATOR=PASS");
}

const keepAlive = setInterval(() => {}, 1000);
main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabase().catch(() => {});
    clearInterval(keepAlive);
  });

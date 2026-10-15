import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { getDatabase, closeDatabase } from "../lib/server/db";
import { contentSources } from "../lib/server/db/schema";
import { refreshRadarSnapshot } from "../lib/server/content/radar-snapshot";
import { isManagedPracticeSearchReady } from "../lib/server/content/collection-expansion";
import { isMultiNewsRoundup, isWorthPracticingEligible } from "../lib/server/content/practical-evidence-actionability";

loadEnvConfig(process.cwd());
async function main() {
  assert.equal(assertCurrentDatabaseTarget().environment,"development","DEVELOPMENT_ONLY");
  const sources = await getDatabase().select().from(contentSources);
  const snapshot = await refreshRadarSnapshot();
  assert(snapshot.currentHot.every(item => !isMultiNewsRoundup(item.title)));
  assert(snapshot.worthPracticing.every(item => isWorthPracticingEligible(item) && item.practiceTopic.parentEventIds.length > 0));
  assert.equal(snapshot.schemaVersion,"radar-snapshot-v11-practice-boundary");
  console.log(JSON.stringify({status:"PASS",schemaVersion:snapshot.schemaVersion,hotCount:snapshot.currentHot.length,practiceTopicCount:snapshot.worthPracticing.length,readyManagedSearchSourceCount:sources.filter(isManagedPracticeSearchReady).length,networkSearchValidated:false},null,2));
}
main().catch(error => { console.error(error instanceof Error ? error.message : "PRACTICE_ACCEPTANCE_FAILED"); process.exitCode=1; }).finally(closeDatabase);

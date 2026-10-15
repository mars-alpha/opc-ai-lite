import { loadEnvConfig } from "@next/env";
import { closeDatabase } from "../lib/server/db";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { buildSourceCapabilityAudit } from "../lib/server/content/source-capability-audit";

loadEnvConfig(process.cwd());

async function main() {
  const target = assertCurrentDatabaseTarget();
  if (target.environment !== "development" || target.databaseName !== "opc_ai_dev") {
    throw new Error("DEVELOPMENT_DATABASE_REQUIRED");
  }
  const rows = await buildSourceCapabilityAudit();
  console.log(JSON.stringify(rows, null, 2));
}

main().then(async () => closeDatabase()).catch(async (error) => {
  try { await closeDatabase(); } catch {}
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

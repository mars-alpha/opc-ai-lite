import { loadEnvConfig } from "@next/env";
import { closeDatabase } from "../lib/server/db";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import {
  reconcileSourceRuntimeQualifications
} from "../lib/server/content/source-qualification-runtime";

loadEnvConfig(process.cwd());

async function main() {
  const target = assertCurrentDatabaseTarget();
  if (target.environment !== "development" || target.databaseName !== "opc_ai_dev") {
    throw new Error("DEVELOPMENT_DATABASE_REQUIRED");
  }
  const results = await reconcileSourceRuntimeQualifications();
  console.log(JSON.stringify({
    evaluated: results.length,
    conditional: results.filter((item) => item.effectiveQualification === "CONDITIONAL").length,
    disabled: results.filter((item) => item.effectiveQualification === "DISABLED").length,
    results
  }, null, 2));
  console.log("SOURCE_QUALIFICATION_RUNTIME=PASS");
}

main()
  .then(async () => closeDatabase())
  .catch(async (error) => {
    try { await closeDatabase(); } catch {}
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });

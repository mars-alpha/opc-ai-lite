import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { users } from "../lib/server/db/schema";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { runDiscoveryExpansionCycle } from "../lib/server/content/collection-expansion";

loadEnvConfig(process.cwd());

async function main() {
  const target = assertCurrentDatabaseTarget();
  if (target.environment !== "development" || target.databaseName !== "opc_ai_dev") {
    throw new Error("DEVELOPMENT_DATABASE_REQUIRED");
  }

  const [admin] = await getDatabase()
    .select()
    .from(users)
    .where(eq(users.role, "ADMIN"))
    .limit(1);
  if (!admin) throw new Error("ADMIN_USER_REQUIRED");

  const result = await runDiscoveryExpansionCycle(
    {
      id: admin.id,
      email: "local-admin@opc.invalid",
      displayName: admin.displayName,
      role: "ADMIN"
    },
    { maxEvents: 3 }
  );

  console.log(JSON.stringify(result, null, 2));
  console.log("DISCOVERY_EXPANSION_RUN=PASS");
}

main()
  .then(async () => closeDatabase())
  .catch(async (error) => {
    try { await closeDatabase(); } catch {}
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });

import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { users } from "../lib/server/db/schema";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { refreshRadarSnapshot } from "../lib/server/content/radar-snapshot";
import { runTopicMomentumRuntime } from "../lib/server/content/topic-momentum-runtime";

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

  const startedAt = new Date().toISOString();
  const runtime = await runTopicMomentumRuntime({
    id: admin.id,
    email: "local-admin@opc.invalid",
    displayName: admin.displayName,
    role: "ADMIN"
  });
  const snapshot = await refreshRadarSnapshot();

  console.log(JSON.stringify({
    version: "topic-momentum-runtime-v1",
    environment: target.environment,
    databaseName: target.databaseName,
    startedAt,
    finishedAt: new Date().toISOString(),
    executionOwner: "SERVER_NATIVE_AUTOMATIC_CYCLE",
    minimumFollowUpHours: 6,
    adaptiveFollowUpHours: [6, 12, 24],
    windowDays: 7,
    runtime,
    snapshot: {
      generatedAt: snapshot.generatedAt,
      itemCount: snapshot.items.length
    }
  }, null, 2));
  console.log("TOPIC_MOMENTUM_LIVE_ACCEPTANCE=PASS");
}

main()
  .then(async () => closeDatabase())
  .catch(async (error) => {
    try { await closeDatabase(); } catch {}
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });

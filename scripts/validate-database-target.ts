import { loadEnvConfig } from "@next/env";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";

loadEnvConfig(process.cwd());

try {
  const target = assertCurrentDatabaseTarget();
  console.log("DATABASE_TARGET_ENVIRONMENT=" + target.environment);
  console.log("DATABASE_TARGET_DATABASE=" + target.databaseName);
  console.log("DATABASE_TARGET_HOST_CLASS=" + target.hostClass);
  console.log("DATABASE_TARGET_CURRENT=PASS");
} catch (error) {
  const code = error instanceof Error ? error.message : "DATABASE_TARGET_CHECK_FAILED";
  console.error("DATABASE_TARGET_CURRENT=FAIL:" + code);
  process.exit(1);
}
import { spawnSync } from "node:child_process";
import { loadEnvConfig } from "@next/env";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";

loadEnvConfig(process.cwd());

const args = new Set(process.argv.slice(2));
const target = assertCurrentDatabaseTarget();
const migrationUrl = process.env.DATABASE_MIGRATION_URL?.trim();
if (!migrationUrl) {
  throw new Error("DATABASE_MIGRATION_URL_REQUIRED");
}
const migrationTarget = assertCurrentDatabaseTarget({
  DATABASE_ENVIRONMENT: target.environment,
  DATABASE_URL: migrationUrl
});
const requiredConfirm = "--confirm=" + target.environment;

if (!args.has(requiredConfirm)) {
  throw new Error("DATABASE_MIGRATION_CONFIRM_REQUIRED:" + requiredConfirm);
}
if (target.environment === "production" && !args.has("--backup-confirmed")) {
  throw new Error("PRODUCTION_BACKUP_CONFIRMATION_REQUIRED");
}

console.log("DATABASE_MIGRATION_TARGET_ENVIRONMENT=" + target.environment);
console.log("DATABASE_MIGRATION_TARGET_DATABASE=" + target.databaseName);
console.log("DATABASE_MIGRATION_TARGET_HOST_CLASS=" + migrationTarget.hostClass);

const result = spawnSync(
  process.execPath,
  ["node_modules/drizzle-kit/bin.cjs", "migrate"],
  { stdio: "inherit", shell: false }
);
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
console.log("DATABASE_MIGRATION=PASS");
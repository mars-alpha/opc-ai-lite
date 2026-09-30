import { assertCurrentDatabaseTarget, inspectDatabaseTarget } from "../lib/server/database-target";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("DATABASE_TARGET_CONTRACT_FAILED:" + code);
}

const dev = assertCurrentDatabaseTarget({
  DATABASE_ENVIRONMENT: "development",
  DATABASE_URL: "postgresql://dev:secret@127.0.0.1:5432/opc_ai_dev"
});
assert(dev.environment === "development", "DEV_ENV");
assert(dev.databaseName === "opc_ai_dev", "DEV_DB_NAME");
assert(dev.hostClass === "LOCAL", "DEV_HOST_CLASS");

const prod = assertCurrentDatabaseTarget({
  DATABASE_ENVIRONMENT: "production",
  DATABASE_URL: "postgresql://prod:secret@postgres.tencent.internal:5432/opc_ai_prod"
});
assert(prod.environment === "production", "PROD_ENV");
assert(prod.databaseName === "opc_ai_prod", "PROD_DB_NAME");
assert(prod.hostClass === "TENCENT_OR_OTHER_POSTGRES", "PROD_HOST_CLASS");

let supabaseBlocked = false;
try {
  assertCurrentDatabaseTarget({
    DATABASE_ENVIRONMENT: "development",
    DATABASE_URL: "postgresql://legacy:secret@db.example.supabase.co:5432/opc_ai_dev"
  });
} catch (error) {
  supabaseBlocked = error instanceof Error && error.message === "LEGACY_SUPABASE_TARGET_BLOCKED";
}
assert(supabaseBlocked, "SUPABASE_MUST_BE_BLOCKED");

for (const [environment, databaseName] of [
  ["development", "opc_ai_prod"],
  ["production", "opc_ai_dev"]
] as const) {
  let mismatchBlocked = false;
  try {
    inspectDatabaseTarget({
      DATABASE_ENVIRONMENT: environment,
      DATABASE_URL: "postgresql://user:secret@db.internal:5432/" + databaseName
    });
  } catch (error) {
    mismatchBlocked =
      error instanceof Error && error.message.startsWith("DATABASE_NAME_ENVIRONMENT_MISMATCH:");
  }
  assert(mismatchBlocked, "ENVIRONMENT_DATABASE_MISMATCH_MUST_FAIL:" + environment);
}

console.log("DATABASE_TARGET_DEVELOPMENT_BOUNDARY=PASS");
console.log("DATABASE_TARGET_PRODUCTION_BOUNDARY=PASS");
console.log("DATABASE_TARGET_SUPABASE_BLOCK=PASS");
console.log("DATABASE_TARGET_ENVIRONMENT_ISOLATION=PASS");
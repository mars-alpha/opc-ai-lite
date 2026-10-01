import { loadEnvConfig } from "@next/env";
import postgres from "postgres";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";

const APP_ROLE = "opc_ai_dev_app";

function quoteIdentifier(value: string) {
  return '"' + value.replaceAll('"', '""') + '"';
}

loadEnvConfig(process.cwd());

async function main() {
const target = assertCurrentDatabaseTarget();
if (target.environment !== "development" || target.databaseName !== "opc_ai_dev") {
  throw new Error("DEVELOPMENT_DATABASE_REQUIRED");
}

const migrationUrl = process.env.DATABASE_MIGRATION_URL?.trim();
if (!migrationUrl) throw new Error("DATABASE_MIGRATION_URL_REQUIRED");

const migrationTarget = assertCurrentDatabaseTarget({
  DATABASE_ENVIRONMENT: process.env.DATABASE_ENVIRONMENT,
  DATABASE_URL: migrationUrl
});
if (migrationTarget.environment !== "development" || migrationTarget.databaseName !== "opc_ai_dev") {
  throw new Error("DEVELOPMENT_MIGRATION_DATABASE_REQUIRED");
}

const sql = postgres(migrationUrl, { max: 1 });
const appRole = quoteIdentifier(APP_ROLE);

try {
  await sql.unsafe("REVOKE CONNECT, TEMPORARY ON DATABASE opc_ai_dev FROM PUBLIC");
  await sql.unsafe("GRANT CONNECT ON DATABASE opc_ai_dev TO " + appRole);
  await sql.unsafe("REVOKE CREATE, TEMPORARY ON DATABASE opc_ai_dev FROM " + appRole);

  await sql.unsafe("REVOKE CREATE ON SCHEMA public FROM PUBLIC");
  await sql.unsafe("GRANT USAGE ON SCHEMA public TO " + appRole);
  await sql.unsafe("REVOKE CREATE ON SCHEMA public FROM " + appRole);

  await sql.unsafe("GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO " + appRole);
  await sql.unsafe("GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO " + appRole);

  await sql.unsafe(
    "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO " +
      appRole
  );
  await sql.unsafe(
    "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO " + appRole
  );

  const [check] = await sql.unsafe(
    "SELECT has_database_privilege($1, current_database(), 'CONNECT') AS can_connect, " +
      "has_schema_privilege($1, 'public', 'USAGE') AS can_use_schema, " +
      "has_schema_privilege($1, 'public', 'CREATE') AS can_create_schema_objects",
    [APP_ROLE]
  );

  if (!check?.can_connect || !check?.can_use_schema || check?.can_create_schema_objects) {
    throw new Error("DEVELOPMENT_APP_ROLE_PRIVILEGE_CHECK_FAILED");
  }

  console.log("DEVELOPMENT_APP_ROLE_CONNECT=PASS");
  console.log("DEVELOPMENT_APP_ROLE_SCHEMA_USAGE=PASS");
  console.log("DEVELOPMENT_APP_ROLE_NO_SCHEMA_CREATE=PASS");
  console.log("DEVELOPMENT_APP_ROLE_RUNTIME_DML=PASS");
  console.log("DEVELOPMENT_APP_ROLE_DEFAULT_PRIVILEGES=PASS");
} finally {
  await sql.end();
}
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

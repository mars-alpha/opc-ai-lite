export type DatabaseEnvironment = "development" | "production";

export type DatabaseEnvironmentSource = {
  DATABASE_ENVIRONMENT?: string;
  DATABASE_URL?: string;
};

export type DatabaseTarget = {
  environment: DatabaseEnvironment;
  databaseName: string;
  hostClass: "LOCAL" | "TENCENT_OR_OTHER_POSTGRES" | "LEGACY_SUPABASE";
  legacySupabase: boolean;
};

function assertEnvironment(value: string | undefined): DatabaseEnvironment {
  if (value === "development" || value === "production") return value;
  throw new Error("DATABASE_ENVIRONMENT_MUST_BE_DEVELOPMENT_OR_PRODUCTION");
}

export function inspectDatabaseTarget(env?: DatabaseEnvironmentSource): DatabaseTarget {
  const source = env ?? {
    DATABASE_ENVIRONMENT: process.env.DATABASE_ENVIRONMENT,
    DATABASE_URL: process.env.DATABASE_URL
  };
  const environment = assertEnvironment(source.DATABASE_ENVIRONMENT?.trim());
  const raw = source.DATABASE_URL?.trim();
  if (!raw) throw new Error("DATABASE_URL_REQUIRED");

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("DATABASE_URL_INVALID");
  }

  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error("DATABASE_URL_MUST_BE_POSTGRESQL");
  }

  const hostname = parsed.hostname.toLowerCase();
  const databaseName = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
  if (!databaseName) throw new Error("DATABASE_NAME_REQUIRED");

  const legacySupabase = hostname.includes("supabase.co") || hostname.includes("supabase.com");
  const hostClass = legacySupabase
    ? "LEGACY_SUPABASE"
    : hostname === "localhost" || hostname === "127.0.0.1"
      ? "LOCAL"
      : "TENCENT_OR_OTHER_POSTGRES";

  const expectedName = environment === "development" ? "opc_ai_dev" : "opc_ai_prod";
  if (databaseName !== expectedName) {
    throw new Error("DATABASE_NAME_ENVIRONMENT_MISMATCH:" + expectedName);
  }

  return { environment, databaseName, hostClass, legacySupabase };
}

export function assertCurrentDatabaseTarget(env?: DatabaseEnvironmentSource): DatabaseTarget {
  const target = inspectDatabaseTarget(env);
  if (target.legacySupabase) throw new Error("LEGACY_SUPABASE_TARGET_BLOCKED");
  return target;
}
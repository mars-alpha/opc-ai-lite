import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { requireDatabaseUrl } from "../database-config";
import * as schema from "./schema";

type PostgresClient = ReturnType<typeof postgres>;
const globalForDatabase = globalThis as typeof globalThis & {
  __opcPostgresClient?: PostgresClient;
};

let client: PostgresClient | null = globalForDatabase.__opcPostgresClient ?? null;

export function getDatabase() {
  if (!client) {
    client = postgres(requireDatabaseUrl(), {
      prepare: false,
      max: 5,
      idle_timeout: 300,
      max_lifetime: 60 * 30
    });

    if (process.env.NODE_ENV !== "production") {
      globalForDatabase.__opcPostgresClient = client;
    }
  }

  return drizzle(client, { schema });
}

export async function closeDatabase() {
  if (!client) return;
  await client.end();
  if (globalForDatabase.__opcPostgresClient === client) {
    delete globalForDatabase.__opcPostgresClient;
  }
  client = null;
}

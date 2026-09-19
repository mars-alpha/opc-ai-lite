export type DatabaseConfig = {
  databaseUrl: string | null;
  configured: boolean;
};

export function getDatabaseConfig(): DatabaseConfig {
  const databaseUrl = process.env.DATABASE_URL?.trim() || null;

  return {
    databaseUrl,
    configured: Boolean(databaseUrl)
  };
}

export function requireDatabaseUrl(): string {
  const { databaseUrl } = getDatabaseConfig();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for database-backed MVP features.");
  }
  return databaseUrl;
}


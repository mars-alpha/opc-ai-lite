import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { applyDevelopmentSourceAssetCleanup } from "../lib/server/content/source-asset-cleanup";
import { closeDatabase } from "../lib/server/db";

async function main() {
  const target = assertCurrentDatabaseTarget();
  if (target.environment !== "development") {
    throw new Error("SOURCE_ASSET_CLEANUP_DEVELOPMENT_ONLY");
  }
  const result = await applyDevelopmentSourceAssetCleanup();
  console.log(JSON.stringify({
    version: result.version,
    archivedCount: result.archivedCount,
    archived: result.archived.map((source) => ({
      sourceId: source.id,
      name: source.name,
      status: source.status,
      enabled: source.enabled,
      cleanup: (source.metadata as Record<string, unknown>).sourceAssetCleanup ?? null
    }))
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    try { await closeDatabase(); } catch {}
  });

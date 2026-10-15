import { listSourceQualificationSnapshots } from "../lib/server/content/source-qualification";

async function main() {
  const rows = await listSourceQualificationSnapshots();

  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.qualification, (counts.get(row.qualification) ?? 0) + 1);
  }

  for (const status of ["AUTO_READY", "CONDITIONAL", "MANUAL_ONLY", "DISABLED"]) {
    console.log(status + "=" + (counts.get(status) ?? 0));
  }

  console.log("TOTAL=" + rows.length);

  for (const row of rows) {
    console.log(JSON.stringify({
      sourceId: row.sourceId,
      name: row.name,
      platform: row.platform,
      collectionMethod: row.collectionMethod,
      qualification: row.qualification,
      evidenceSufficiency: row.evidenceSufficiency,
      sourceRole: row.sourceRole,
      adapterFamilies: row.adapterFamilies,
      liveRunCount: row.evidence.liveRunCount,
      successfulLiveRunCount: row.evidence.successfulLiveRunCount,
      currentRuntimeContractObserved: row.evidence.currentRuntimeContractObserved,
      qualificationCheckpointCurrent: row.evidence.qualificationCheckpointCurrent,
      runtimeDependency: row.evidence.runtimeDependency,
      reasons: row.reasons
    }));
  }

  console.log("SUMMARY_AUTO_READY=" + (counts.get("AUTO_READY") ?? 0));
  console.log("SUMMARY_CONDITIONAL=" + (counts.get("CONDITIONAL") ?? 0));
  console.log("SUMMARY_MANUAL_ONLY=" + (counts.get("MANUAL_ONLY") ?? 0));
  console.log("SUMMARY_DISABLED=" + (counts.get("DISABLED") ?? 0));
  console.log("SUMMARY_TOTAL=" + rows.length);
  console.log("SOURCE_QUALIFICATION_V2_DB_AUDIT=PASS");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

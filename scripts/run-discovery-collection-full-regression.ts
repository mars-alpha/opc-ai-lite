import { spawnSync } from "node:child_process";

const npm = "npm";
const quick = process.argv.includes("--quick");
const scripts = [
  "content:source-input-runtime:check",
  "scripts:current:check",
  "content:operations:check",
  "content:practice-access:check",
  "content:pixaroma:check",
  "content:practice-materials:check",
  "content:public-practice-content:check",
  "content:discovery-collection:boundary:check",
  "content:collection:deployment:check",
  "content:collection:reliability:check",
  "content:collection:quality-window:check",
  "content:overseas-deno:check",
  "content:overseas-relay:check",
  "content:ai-discovery-filter:check",
  "content:expansion:anchor-specificity:check",
  "content:delivery-localization:check",
  "content:understanding:check",
  "content:collection-current:check",
  "content:collection-architecture:check",
  "content:collection-realignment:check",
  "content:source-management:check",
  "content:source-acquisition-routing:check",
  "content:source-qualification:v2:check",
  "content:source-qualification-governance:011:check",
  "content:source-asset-cleanup:012:check",
  "content:source-portfolio:check",
  "content:domestic-discovery-aggregator:017:check",
  "content:source-management-console:018:check",
  "content:server-only-source-cleanup:019:check",
  "content:server-only-source-expansion:020:check",
  "content:source-stability-consolidation:021:check",
  "content:source-management-unification:022:check",
  "content:source-management-dashboard:023:check",
  "content:source-management-learning-style:025:check",
  "content:source-management-workspace-modes:027:check",
  "content:pending-source-production:028:check",
  "content:collection-runner:check",
  "content:raw-relevance-dedup:005:check",
  "content:event-seed-clustering:check",
  "content:event-clustering:check",
  "content:presentation-enrichment:006:check",
  "content:source-runtime-utility:008:check",
  "content:source-runtime-governance:009:check",
  "content:source-runtime-governance-execution:010:check",
  "content:collection-quality-gates:check",
  "content:expansion:check",
  "content:discovery-expansion:check",
  "content:source-coverage-precision:check",
  "content:topic-momentum:check",
  "content:intelligence-policy:check",
  "content:intelligence-read-model:check",
  "content:bole-daily-curation:check",
  "content:radar-collection:check",
  "content:radar-read-path:check",
  "content:radar-calendar:check",
  "content:practice-expansion:check",
  "content:ai-hotspot-practice:check",
  "typecheck",
  ...(!quick ? ["build"] : [])
];

const failures: string[] = [];
for (const script of scripts) {
  console.log("\n=== REGRESSION_START " + script + " ===");
  const result = spawnSync(npm + " run " + script, {
    cwd: process.cwd(),
    stdio: "inherit",
    env: process.env,
    shell: true
  });
  if (result.status !== 0) {
    console.error("DISCOVERY_COLLECTION_FULL_REGRESSION_FAILED=" + script);
    failures.push(script);
    continue;
  }
  console.log("=== REGRESSION_PASS " + script + " ===");
}

if (failures.length) {
  console.error("DISCOVERY_COLLECTION_FAILED_CHECKS=" + JSON.stringify(failures));
  process.exit(1);
}
console.log("\nDISCOVERY_COLLECTION_FULL_REGRESSION=PASS");

# Source to Hot Tracking Audit Fixes — Decision Brief and Plan

Task ID: SOURCE-HOT-AUDIT-FIXES-20261016
Goal: Close confirmed Source-to-Hot Tracking chain gaps while preserving the single SYSTEM runtime.
User Role: Platform administrator.
Product Surface: /admin/sources, /admin/intelligence, and the SYSTEM backend.
Problem: The HEAD audit found retry gaps, non-atomic evidence replacement, misleading health summaries, stale detail reads, a potential snapshot payload cost, raw error responses, and an unregistered Event writer.
Why Now: These gaps can hide collected items or mislead operations while the automatic cycle continues.
In Scope: M-01 through M-08 and M-11 where behavior is evidenced; deterministic validation and owner reconciliation.
Out of Scope: Rule thresholds, frozen UI layout, AI Daily production, historical source records, and Snapshot v17 WIP.
Code Responsibility: Deterministic data writes, health/read projections, safe errors, and API ownership.
AI Responsibility: None.
Skill Responsibility: None.
Workflow Responsibility: Keep the single SYSTEM cycle; no second scheduler.
Human Responsibility: Review changed visible interaction under AGENTS §11.
Data Read: Existing Source, Run, Raw, Observation, Event, Evidence, and Snapshot records.
Data Write: Existing operational tables only; no new schema.
Entitlement: Existing administrator checks stay required.
External Side Effect: No external calls added to the product. The user authorized independent Git submission and same-version Web/SYSTEM production release on 2026-10-16.
Options Considered: Patch dirty checkout, use isolated HEAD worktree, or add separate repair runtime.
Recommended Option: Isolated HEAD worktree and reuse current owners.
Why Recommended: Protects Snapshot v17 WIP and preserves one production chain.
Why Alternatives Rejected: Dirty checkout mixes unrelated edits; separate runtime violates the contract.
Acceptance: Focused validators, typecheck, build, governance checks, and UI experience review for changed interaction.
Deterministic Validation: Existing content validators plus failure-path assertions.
Human Review: Completed on 2026-10-16; the product owner explicitly replied “已体验，批准本次界面” after local experience on port 3001.
Rollback: Revert this branch or restore prior Web/SYSTEM release together; no migration.
Owner Files: discovery.ts, collection-runner.ts, collection-expansion.ts, source-management.ts, source-runtime-operations.ts, admin API/routes, collection contract and mapping.

## Steps

- [x] Establish isolated HEAD baseline and dependency runtime.
- [x] Close Raw/Observation/Event retry gap within the existing SYSTEM path.
- [x] Make Event evidence replacement atomic.
- [x] Correct source health projections and selected-detail refresh.
- [x] Measure snapshot delivery cost before changing its API; v17 storage WIP stays separate.
- [x] Sanitize errors and remove the unregistered Event POST.
- [x] Run focused regressions, typecheck, build, governance checks; record remaining UNKNOWNs.

## Validation and limits

- Development database acceptance: orphan Raw/Observation/Event recovery, repeated retry idempotence, Run-to-Raw lineage and invalid Run rollback passed. Fixtures are removed after the test; production data was not queried or modified.
- Targeted collection, runner, source-management, dashboard, architecture, radar-read and script-entrypoint validators passed. Final npm typecheck/build and CRLF-aware diff check passed. HTTP smoke confirmed both login gates and protected APIs returning 401, including malformed Cookie input. Local review server is ready on port 3001; it does not start the SYSTEM scheduler.
- Full quick regression ran all registered checks. Three failures were obsolete task-heading coupling, a CRLF-specific schema string assertion, and the previous READY/RUNNING healthy-count assertion. Each was corrected at its validator owner and passed individually; typecheck passed again. All remaining checks passed during the full run.
- Compact transport preserves Event order, featured curation and legacy full responses; missing references fail closed. A 400-item synthetic fixture measured JSON 1,125,231 → 923,826 bytes and gzip 11,101 → 9,770 bytes. Development snapshot has zero events; production payload benefit remains UNKNOWN.
- Event retry recovery is triggered when the existing SYSTEM Source Run re-observes the Raw. It does not scan or reclassify every historical orphan, and cannot reconstruct missing historical Run lineage.
- Snapshot storage remains v16 with an audit-specific schema revision; Snapshot v17 work in the primary checkout is excluded. No migration, additional timer or rule-threshold change is included.
- Changed interaction is IMPLEMENTED / USER_APPROVED under AGENTS §11, following explicit product owner approval on 2026-10-16.

## Authorized independent release

Goal: Commit the isolated fixes, build a Linux release, deploy Web/SYSTEM together and verify one real automatic cycle. Preserve the primary checkout WIP.
Data Read: Production runtime configuration, Source/Run/Raw/Observation/Event/Evidence/Snapshot, aggregate acceptance metrics.
Data Write: Normal existing SYSTEM cycle, versioned release directories, PM2 configuration and current SYSTEM symlink; no schema migration or historical data rewrite.
Recommended Option: Prebuild a new directory while the current release serves traffic, then switch the existing Web and SYSTEM owners together.
Validation: Fresh full quick regression, Linux build, deployment preflight, local production HTTP auth checks, snapshot invariants and one real scheduled SYSTEM cycle.
Acceptance: Correct process cwd and release identity, enabled single timer, successful cycle and current schema snapshot, no new persistence gaps in cycle observations.
Rollback: Restore Web cwd `/opt/opc-services/opc-admin-web-live-refresh-20261016`, SYSTEM current target `releases/20261016-live-refresh`, reload PM2/save, then regenerate the old-schema snapshot through the existing cycle. Keep database backup; no destructive migration to reverse.
Owner: Existing collection deployment/systemd files, CURRENT_SYSTEM_FACTS (actual deployment), PROJECT_STATUS (stage), TASKS (follow-up).

import fs from "node:fs";
import {
  assertPublishableContent,
  nextContentStatusForReview
} from "../lib/server/content/workbench-contract";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("CONTENT_WORKBENCH_ACCEPT_FAILED:" + code);
}

function read(file: string) {
  assert(fs.existsSync(file), "FILE_MISSING:" + file);
  return fs.readFileSync(file, "utf8");
}

const schema = read("lib/server/db/schema.ts");
const workbench = read("lib/server/content/workbench.ts");
const admin = read("lib/server/content/admin.ts");
const routing = read("lib/server/content/routing.ts");
const consoleUi = read("components/AdminContentConsole.tsx");
const lifecycleUi = read("components/ContentWorkbenchLifecyclePanel.tsx");
const platformWorkspaceUi = read("components/AdminPlatformContentWorkspace.tsx");
const analysisUi = read("components/AdminContentAnalysisPanel.tsx");
const knowledgeUi = read("components/KnowledgeRoutingPanel.tsx");
const knowledgeSources = read("lib/server/content/knowledge-sources.ts");
const adminPage = read("app/admin/content/page.tsx");
const migration = read("drizzle/0014_chunky_ricochet.sql");
assert(!/\bDROP\s+(TABLE|COLUMN|TYPE|INDEX)\b/i.test(migration), "DESTRUCTIVE_MIGRATION_DROP");
assert(!/\bRENAME\s+(TO|COLUMN)\b/i.test(migration), "DESTRUCTIVE_MIGRATION_RENAME");
assert(!/ALTER\s+TYPE/i.test(migration), "DESTRUCTIVE_MIGRATION_TYPE_CHANGE");

for (const table of [
  "content_sources",
  "content_evidence",
  "content_item_evidence",
  "content_reviews",
  "content_publish_records",
  "content_audit_records",
  "feishu_document_mappings",
  "ai_runs"
]) {
  assert(schema.includes('"' + table + '"'), "SCHEMA_TABLE_MISSING:" + table);
  assert(migration.includes('"' + table + '"'), "MIGRATION_TABLE_MISSING:" + table);
}

for (const route of [
  "app/api/admin/content/sources/route.ts",
  "app/api/admin/content/sources/[sourceId]/evidence/route.ts",
  "app/api/admin/content/evidence/[evidenceId]/verify/route.ts",
  "app/api/admin/content/items/[itemId]/evidence/route.ts",
  "app/api/admin/content/items/[itemId]/review/route.ts",
  "app/api/admin/content/items/[itemId]/publish/route.ts",
  "app/api/admin/content/items/[itemId]/audit/route.ts"
]) {
  assert(fs.existsSync(route), "WORKBENCH_ROUTE_MISSING:" + route);
}

assert(workbench.includes("recordContentAudit"), "AUDIT_AUTHORITY_MISSING");
assert(workbench.includes("reviewContentItem"), "REVIEW_ACTION_MISSING");
assert(workbench.includes("publishContentItem"), "PUBLISH_ACTION_MISSING");
assert(workbench.includes("CONTENT_VERIFIED_EVIDENCE_REQUIRED"), "VERIFIED_EVIDENCE_GATE_MISSING");
assert(admin.includes('status: "DRAFT"'), "AUTHORING_MUST_RESET_TO_DRAFT");
assert(admin.includes("existing.version + 1"), "CONTENT_VERSION_INCREMENT_MISSING");
assert(!admin.includes("createAdminKnowledgeItem"), "DIRECT_KNOWLEDGE_CREATE_MUST_BE_DISABLED");
assert(!admin.includes("updateAdminKnowledgeItem"), "DIRECT_KNOWLEDGE_UPDATE_MUST_BE_DISABLED");

assert(consoleUi.includes("ContentWorkbenchLifecyclePanel"), "WORKBENCH_UI_NOT_ATTACHED");
assert(!consoleUi.includes('updateDraft({ status:'), "DIRECT_CONTENT_STATUS_CONTROL_PRESENT");
assert(lifecycleUi.includes("标记已验证"), "EVIDENCE_VERIFY_UI_MISSING");
assert(lifecycleUi.includes("审核通过"), "HUMAN_REVIEW_UI_MISSING");
assert(lifecycleUi.includes("正式发布"), "PUBLISH_UI_MISSING");
assert(adminPage.includes("AdminPlatformContentWorkspace"), "PLATFORM_CONTENT_WORKSPACE_MISSING");
assert(platformWorkspaceUi.includes('type Stage = "LIBRARY" | "CANDIDATE" | "REVIEW"'), "PLATFORM_CONTENT_STAGE_MODEL_MISSING");
assert(platformWorkspaceUi.includes("<AdminContentAnalysisPanel />"), "SOURCE_ANALYSIS_ENTRY_MISSING");
assert(analysisUi.includes('fetch("/api/admin/content/sources"'), "SOURCE_LIBRARY_API_MISSING");
assert(analysisUi.includes('"/evidence"'), "SOURCE_EVIDENCE_API_MISSING");
assert(!lifecycleUi.includes('mode: "LIBRARY"'), "DUPLICATE_LIBRARY_MODE_MUST_BE_REMOVED");
assert(consoleUi.includes('mode="ITEM"'), "CANDIDATE_REVIEW_MODE_MISSING");
assert(!consoleUi.includes("<span>来源类型</span>"), "LEGACY_SOURCE_TYPE_UI_PRESENT");
assert(!consoleUi.includes("<span>来源标识</span>"), "LEGACY_SOURCE_REF_UI_PRESENT");
assert(!consoleUi.includes("<span>来源 URL</span>"), "LEGACY_SOURCE_URL_UI_PRESENT");

assert(routing.includes('content.status !== "PUBLISHED"'), "KNOWLEDGE_REQUIRES_PUBLISHED_CONTENT");
assert(routing.includes('status: "PUBLISHED"'), "DERIVED_KNOWLEDGE_NOT_PUBLISHED");
assert(knowledgeUi.includes('content.status !== "PUBLISHED"'), "KNOWLEDGE_UI_PUBLISH_GATE_MISSING");
assert(!knowledgeUi.includes("<span>Knowledge 状态</span>"), "DIRECT_KNOWLEDGE_STATUS_UI_PRESENT");
assert(knowledgeSources.includes("contentItemEvidence"), "KNOWLEDGE_PROVENANCE_EVIDENCE_LINK_MISSING");
assert(knowledgeSources.includes('content.status !== "PUBLISHED"'), "SUPPORTING_CONTENT_PUBLISH_GATE_MISSING");
assert(knowledgeSources.includes("CONTENT_VERIFIED_EVIDENCE_REQUIRED"), "SUPPORTING_CONTENT_EVIDENCE_GATE_MISSING");

assert(nextContentStatusForReview("APPROVED") === "REVIEW", "REVIEW_STATE_MACHINE");
assertPublishableContent({
  status: "REVIEW",
  evidenceCount: 1,
  verifiedEvidenceCount: 1,
  latestReviewDecision: "APPROVED",
  latestReviewVersion: 3,
  version: 3
});

const publicReader = read("lib/server/content/reader.ts");
assert(publicReader.includes('eq(contentItems.status, "PUBLISHED")'), "PUBLIC_CONTENT_MUST_READ_PUBLISHED_ONLY");
assert(publicReader.includes('eq(knowledgeItems.status, "PUBLISHED")'), "PUBLIC_KNOWLEDGE_MUST_READ_PUBLISHED_ONLY");

console.log("CONTENT_WORKBENCH_SCHEMA_MIGRATION=PASS");
console.log("CONTENT_WORKBENCH_SOURCE_EVIDENCE_API=PASS");
console.log("CONTENT_WORKBENCH_HUMAN_REVIEW_GATE=PASS");
console.log("CONTENT_WORKBENCH_PUBLISH_AUDIT=PASS");
console.log("CONTENT_WORKBENCH_UI_AUTHORITY=PASS");
console.log("CONTENT_WORKBENCH_KNOWLEDGE_DERIVATION=PASS");
console.log("CONTENT_WORKBENCH_PUBLICATION_BOUNDARY=PASS");

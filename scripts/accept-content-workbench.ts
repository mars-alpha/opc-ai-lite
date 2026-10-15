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
const studioUi = read("components/AdminContentStudioWorkspace.tsx");
const platformWorkspaceUi = read("components/AdminPlatformContentWorkspace.tsx");
const discovery = read("lib/server/content/discovery.ts");
const adoption = read("lib/server/content/adoption.ts");
const decisionRoute = read("app/api/admin/content/discovery/events/[eventId]/decision/route.ts");
const briefEnrichment = read("lib/server/content/content-brief-enrichment.ts");
const studioCss = read("app/admin/content/official-content.css");
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
  "app/api/admin/content/items/[itemId]/audit/route.ts",
  "app/api/admin/content/discovery/sources/route.ts",
  "app/api/admin/content/discovery/raw-items/route.ts",
  "app/api/admin/content/discovery/events/route.ts"
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

assert(studioUi.includes("审核通过"), "HUMAN_REVIEW_UI_MISSING");
assert(studioUi.includes("正式发布"), "PUBLISH_UI_MISSING");
assert(adminPage.includes("AdminPlatformContentWorkspace"), "PLATFORM_CONTENT_WORKSPACE_MISSING");
assert(platformWorkspaceUi.includes('type View = "INTELLIGENCE" | "WORKBENCH"'), "PLATFORM_CONTENT_OPS_VIEW_MODEL_MISSING");
assert(platformWorkspaceUi.includes('initialView = "WORKBENCH"'), "PLATFORM_CONTENT_WORKBENCH_DEFAULT_MISSING");
assert(platformWorkspaceUi.includes("<AdminContentStudioWorkspace"), "CONTENT_PRODUCTION_ENTRY_MISSING");
assert(platformWorkspaceUi.includes("内容工作台"), "WORKBENCH_ENTRY_MISSING");
assert(!platformWorkspaceUi.includes("采集策略"), "LEGACY_STRATEGY_ENTRY_PRESENT");
assert(!platformWorkspaceUi.includes("热点追踪"), "DUPLICATE_HOT_TRACKING_ENTRY_PRESENT");
assert(adminPage.includes('redirect("/admin/intelligence")'), "CONTENT_DEFAULT_REDIRECT_TO_INTELLIGENCE_MISSING");
assert(!platformWorkspaceUi.includes("开始整理"), "TOPIC_INTERMEDIATE_ACTION_PRESENT");
assert(adoption.includes("ensureContentDraftForEvent"), "DIRECT_ADOPT_DRAFT_MISSING");
assert(adoption.includes("autoLinked: true"), "AUTO_PROVENANCE_LINK_MISSING");
assert(decisionRoute.includes("enrichContentBriefAfterAdoption"), "ADOPT_BRIEF_AI_ORCHESTRATION_MISSING");
assert(briefEnrichment.includes("CONTENT_BRIEF_ENRICHMENT"), "CONTENT_BRIEF_AI_SKILL_MISSING");
assert(!discovery.includes("insert(contentItems)"), "DISCOVERY_CONTENT_WRITE_BOUNDARY_BROKEN");
assert(!platformWorkspaceUi.includes("AdminContentAnalysisPanel"), "LEGACY_ANALYSIS_ENTRY_PRESENT");
assert(!platformWorkspaceUi.includes("AdminContentCandidateGenerator"), "LEGACY_CANDIDATE_ENTRY_PRESENT");
assert(studioUi.includes("生成结果"), "GENERATED_RESULT_STAGE_MISSING");
assert(studioUi.includes("审核与发布"), "REVIEW_PUBLISH_PANEL_MISSING");
assert(studioUi.includes("content-result-editor"), "RESULT_EDITOR_MISSING");
assert(studioUi.includes("insertAsset"), "ASSET_EDITOR_INTERACTION_MISSING");
assert(studioUi.includes("showDirectoryPicker"), "OUTPUT_FOLDER_PICKER_MISSING");
assert(studioUi.includes("推送到飞书"), "FEISHU_RESULT_ACTION_MISSING");
assert(!studioUi.includes('id: "FEISHU"'), "FEISHU_MUST_NOT_BE_OUTPUT_TYPE");
assert(!studioUi.includes('id: "CAPCUT"'), "CAPCUT_MUST_NOT_BE_OUTPUT_TYPE");
assert(!studioUi.includes("content-studio-toolbar"), "DUPLICATE_TOP_ACTION_ROW_PRESENT");
assert(studioUi.includes("content-studio-audit-stream"), "AUDIT_STREAM_MISSING");
assert(studioUi.includes("hasReviewableResult"), "REVIEW_RESULT_GATE_MISSING");
assert(studioUi.includes("opc-content-output-plan:"), "LOCAL_PRODUCTION_PLAN_CACHE_MISSING");
assert(studioUi.includes('type="file"'), "LOCAL_ASSET_STAGING_MISSING");
assert(!studioUi.includes("确认预览无误"), "BRIEF_PREVIEW_GATE_REMAINS");
assert(!studioUi.includes("确认来源无误"), "SOURCE_CONFIRMATION_REMAINS");
for (const field of ["核心观点", "写给谁", "内容目的", "标签"]) {
  assert(studioUi.includes(field), "CONTENT_BRIEF_FIELD_MISSING:" + field);
}
assert(!studioUi.includes("<span>内容分类</span>"), "LEGACY_CONTENT_CATEGORY_VISIBLE");
assert(!studioUi.includes("<span>站内去向</span>"), "EARLY_DESTINATION_VISIBLE");
assert(studioCss.includes("max-height: 180px") && studioCss.includes("overflow-y: auto"), "AUDIT_INTERNAL_SCROLL_MISSING");

assert(routing.includes('content.status !== "PUBLISHED"'), "KNOWLEDGE_REQUIRES_PUBLISHED_CONTENT");
assert(routing.includes('status: "PUBLISHED"'), "DERIVED_KNOWLEDGE_NOT_PUBLISHED");
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

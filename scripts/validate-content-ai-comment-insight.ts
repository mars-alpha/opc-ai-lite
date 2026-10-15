import fs from "node:fs";
import {
  DEMAND_TYPES,
  cleanCommentCandidates,
  commentCollectorAvailability,
  groupCommentCandidates
} from "../lib/server/content/comment-insight";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("CONTENT_AI_COMMENT_INSIGHT_FAILED:" + code);
}

const cleaned = cleanCommentCandidates([
  { id: "1", platform: "HN", author: "a", text: "How do I deploy this Agent locally?", sourceRef: "r1", sourceUrl: null },
  { id: "2", platform: "HN", author: "b", text: "How do I deploy this Agent locally?", sourceRef: "r1", sourceUrl: null },
  { id: "3", platform: "HN", author: "c", text: "thanks", sourceRef: "r1", sourceUrl: null },
  { id: "4", platform: "REDDIT", author: "d", text: "Can this Agent run locally without a GPU?", sourceRef: "r2", sourceUrl: null }
]);
assert(cleaned.length === 2, "CLEAN_AND_DEDUPE");

const groups = groupCommentCandidates(cleaned);
assert(groups.length >= 1 && groups.length <= cleaned.length, "MECHANICAL_GROUPING");
assert(DEMAND_TYPES.length === 4, "DEMAND_ENUM_COUNT");
assert(
  DEMAND_TYPES.includes("QUESTION") &&
  DEMAND_TYPES.includes("PAIN_POINT") &&
  DEMAND_TYPES.includes("REQUEST") &&
  DEMAND_TYPES.includes("OPINION"),
  "DEMAND_ENUM_VALUES"
);

const availability = commentCollectorAvailability();
assert(availability.HACKER_NEWS === "PUBLIC", "HN_COMMENT_COLLECTOR");
assert(availability.GITHUB === "PUBLIC_ISSUE_COMMENTS", "GITHUB_COMMENT_COLLECTOR");
assert(availability.BILIBILI === "NO_SERVER_RUNNABLE_PUBLIC_ROUTE", "BILIBILI_SERVER_ONLY_BOUNDARY");
assert(availability.DOUYIN === "NO_SERVER_RUNNABLE_PUBLIC_ROUTE", "DOUYIN_SERVER_ONLY_BOUNDARY");
assert(availability.REDDIT === "NO_SERVER_RUNNABLE_PUBLIC_ROUTE", "REDDIT_SERVER_ONLY_BOUNDARY");

const core = fs.readFileSync("lib/server/content/comment-insight.ts", "utf8");
assert(core.includes("factEvidence: false"), "COMMENTS_MUST_NOT_BECOME_FACTS");
assert(core.includes("verificationAuthority: false") && core.includes("hotspotAuthority: false"), "DEMAND_AUTHORITY_ISOLATED");
assert(core.includes("COMMENT_INSIGHT_AI_FAILED"), "AI_FAIL_CLOSED_MISSING");
assert(!core.includes("await db.delete(contentDemandSignals)"), "OLD_SIGNAL_DELETION_REMOVED");
assert(core.includes("COMMENT_DEMAND_TRIGGER_REQUIRED"), "TRIGGER_GATE_REQUIRED");
assert(core.includes("commentFingerprint") && core.includes("demandClusterKey"), "IDEMPOTENCY_REQUIRED");

const ui = fs.readFileSync("components/AdminPlatformContentWorkspace.tsx", "utf8");
assert(ui.includes("需求信号 · 大家在问什么"), "DEMAND_SIGNAL_UI_MISSING");
assert(ui.includes("评论只用于需求判断，不作为事实依据"), "DEMAND_FACT_BOUNDARY_UI_MISSING");
assert(ui.includes("采集需求信号"), "DEMAND_MANUAL_TRIGGER_MISSING");

console.log("CONTENT_AI_COMMENT_INSIGHT_CLEAN=PASS");
console.log("CONTENT_AI_COMMENT_INSIGHT_GROUP=PASS");
console.log("CONTENT_AI_COMMENT_INSIGHT_ENUM=PASS");
console.log("CONTENT_AI_COMMENT_INSIGHT_COLLECTOR_BOUNDARY=PASS");
console.log("CONTENT_AI_COMMENT_INSIGHT_FAIL_CLOSED=PASS");
console.log("CONTENT_AI_COMMENT_INSIGHT_NOT_FACT=PASS");
console.log("CONTENT_AI_COMMENT_INSIGHT_TRIGGER_IDEMPOTENCY=PASS");
console.log("CONTENT_AI_COMMENT_INSIGHT_UI=PASS");

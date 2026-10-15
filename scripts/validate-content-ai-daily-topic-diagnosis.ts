import fs from "node:fs";
import { validateTopicDiagnosisPayload } from "../lib/server/content/artifact-contract";
import { presentTopicDiagnosisArtifact } from "../lib/server/content/topic-diagnosis-presentation";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("CONTENT_AI_DAILY_TOPIC_DIAGNOSIS_FAILED:" + code);
}

const schema = fs.readFileSync("lib/server/db/schema.ts", "utf8");
const workspace = fs.readFileSync("components/AdminPlatformContentWorkspace.tsx", "utf8");
const structuredContract = fs.readFileSync(
  "docs/content/CONTENT_AI_DAILY_STRUCTURED_OUTPUT_CONTRACT.md",
  "utf8"
);

assert(schema.includes('"content_artifacts"'), "ARTIFACT_TABLE_MISSING");
assert(schema.includes('artifactType: text("artifact_type").notNull()'), "ARTIFACT_TYPE_MISSING");
assert(schema.includes('contentId: text("content_id")'), "NULLABLE_CONTENT_ID_MISSING");
assert(structuredContract.includes("contentId: string | null"), "CONTRACT_CONTENT_ID_NOT_NULLABLE");
assert(workspace.includes("选题诊断"), "VISUAL_GATE_MISSING");
assert(workspace.includes("生成选题诊断"), "DIAGNOSIS_ACTION_MISSING");
assert(workspace.includes("为什么重要"), "WHY_IT_MATTERS_UI_MISSING");
assert(workspace.includes("对读者的价值"), "READER_VALUE_UI_MISSING");
assert(workspace.includes("建议写作角度"), "ANGLE_UI_MISSING");
assert(workspace.includes("证据充分度"), "EVIDENCE_READINESS_UI_MISSING");
assert(workspace.includes("重复风险"), "DUPLICATION_RISK_UI_MISSING");
assert(!fs.existsSync("app/api/admin/content/discovery/events/[eventId]/decision/route.ts"), "OLD_EVENT_DECISION_ROUTE_REMAINS");

const valid = validateTopicDiagnosisPayload(
  {
    verdict: "WATCH_RECOMMENDED",
    whyItMatters: "测试为什么重要。",
    readerValue: "测试读者价值。",
    suggestedAngle: "测试写作角度。",
    duplicationRisk: "LOW",
    timeliness: "HIGH",
    evidenceReadiness: "PARTIAL",
    differentiation: "MEDIUM",
    evidenceGaps: ["需要第二个来源。"],
    risks: [],
    supportingSourceIds: ["source_a"],
    reasoningSummary: "测试诊断依据。"
  },
  { allowedSourceIds: ["source_a"] }
);
assert(valid.supportingSourceIds[0] === "source_a", "VALID_PAYLOAD_REJECTED");

let rejected = false;
try {
  validateTopicDiagnosisPayload(
    { ...valid, supportingSourceIds: ["source_unknown"] },
    { allowedSourceIds: ["source_a"] }
  );
} catch {
  rejected = true;
}
assert(rejected, "UNKNOWN_SOURCE_MUST_FAIL");

const presentation = presentTopicDiagnosisArtifact({
  id: "artifact_test",
  version: 2,
  generatedMode: "AI",
  createdAt: new Date("2026-10-03T09:00:00Z"),
  payload: {
    ...valid,
    whyItMatters: "这是 Development Fixture，来源为 https://example.com，deterministic 中 evidenceReadiness=SUFFICIENT。",
    readerValue: "authorityScore=90，但对读者没有可核验价值。",
    suggestedAngle: "先看 https://github.com/example/visual-fixture 再判断。",
    evidenceGaps: [
      "缺少真实来源，https://example.com 为占位地址。",
      "deterministic 中 hasOfficialOrHighAuthority=true。",
      "需要第二个独立来源。"
    ],
    risks: [
      "authorityScore 来自内部规则。",
      "资料是测试夹具，不能作为正式事实。",
      "来源不独立，需要继续核对。"
    ]
  }
});
assert(Boolean(presentation), "PRESENTATION_MISSING");
const presentationText = JSON.stringify(presentation);
assert(!presentationText.includes("deterministic"), "PRESENTATION_LEAKS_DETERMINISTIC");
assert(!presentationText.includes("authorityScore"), "PRESENTATION_LEAKS_AUTHORITY_SCORE");
assert(!presentationText.includes("hasOfficialOrHighAuthority"), "PRESENTATION_LEAKS_INTERNAL_FLAG");
assert(!presentationText.includes("example.com"), "PRESENTATION_LEAKS_PLACEHOLDER_URL");
assert(!presentationText.includes("github.com/example"), "PRESENTATION_LEAKS_FIXTURE_URL");
assert(presentation?.payload.evidenceGaps.includes("需要第二个独立来源。"), "PRESENTATION_DROPPED_USEFUL_GAP");
assert(!("reasoningSummary" in (presentation?.payload ?? {})), "PRESENTATION_EXPOSES_REASONING_SUMMARY");
assert(!("supportingSourceIds" in (presentation?.payload ?? {})), "PRESENTATION_EXPOSES_INTERNAL_SOURCE_IDS");

console.log("CONTENT_AI_DAILY_ARTIFACT_FOUNDATION=PASS");
console.log("CONTENT_AI_DAILY_TOPIC_DIAGNOSIS_VALIDATOR=PASS");
console.log("CONTENT_AI_DAILY_TOPIC_DIAGNOSIS_VISUAL_GATE=PASS");
console.log("CONTENT_AI_DAILY_TOPIC_DIAGNOSIS_PRESENTATION_FILTER=PASS");

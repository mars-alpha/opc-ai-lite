import "server-only";

import { createHash } from "node:crypto";
import { and, desc, eq, inArray, lte } from "drizzle-orm";
import type { AuthUser } from "../auth/service";
import {
  cancelAdminCourseCandidate,
  getAdminCourseMaintenanceRegistry,
  publishAdminCourseCandidate,
  saveAdminCourseCandidate,
  startAdminCourseCandidate,
  submitAdminCourseCandidate,
  type AdminCourseSnapshot
} from "../admin/course-maintenance";
import {
  callConfiguredChatJson,
  getConfiguredChatModelConfig,
  type ConfiguredChatModelConfig
} from "../ai/configured-chat";
import { getDatabase } from "../db";
import { aiRuns, courseInsights, learningFeedback } from "../db/schema";
import { formalRuntimeLessonId } from "../learning/formal-identity";
import {
  buildLearningInsightTaskAInput,
  getCurrentLearningInsightTaskA
} from "./task-a";
import type { EffectiveEvidenceMode } from "./effective-evidence";
import { closeIssueCycleEvidence } from "./issue-cycle";

export const LEARNING_INSIGHT_TASK_B_VERSION = "learning-insight-task-b-v1";
export const LEARNING_INSIGHT_TASK_B_PROMPT_VERSION = "course-change-generator@2";
export const LEARNING_INSIGHT_TASK_B_SCHEMA_VERSION = "course_change_patch_v2";
export const LEARNING_INSIGHT_TASK_B_TASK_TYPE = "LEARNING_INSIGHT_TASK_B";

type PatchDecision = "PATCH_PROPOSED" | "NO_CHANGE_NEEDED" | "REQUIRES_MANUAL_STRUCTURE_CHANGE";

export type CourseChangePatchV2 = {
  schema_version: "course_change_patch_v2";
  course_id: string;
  decision: PatchDecision;
  changes: Array<{
    patch_id: string;
    action: "REPLACE";
    path: string;
    current_value: string;
    proposed_value: string;
    reason: string;
    evidence_refs: string[];
  }>;
  manual_structure_reason: string | null;
};

type MutablePath = { path: string; current_value: string };

type TaskBDependencies = {
  modelConfig?: ConfiguredChatModelConfig | null;
  evidenceMode?: EffectiveEvidenceMode;
  callModel?: (
    input: {
      systemPrompt: string;
      userPayload: unknown;
      temperature?: number;
      timeoutMs?: number;
    },
    dependencies: { config: ConfiguredChatModelConfig }
  ) => Promise<{ config: ConfiguredChatModelConfig; data: unknown }>;
};

function objectRow(value: unknown, code: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(code);
  return value as Record<string, unknown>;
}

function exactKeys(row: Record<string, unknown>, allowed: string[], code: string) {
  const actual = Object.keys(row).sort();
  const expected = [...allowed].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    throw new Error(code);
  }
}

function requiredString(value: unknown, code: string, max = 8000) {
  if (typeof value !== "string" || !value.trim()) throw new Error(code);
  return value.trim().slice(0, max);
}

function refs(value: unknown, code: string) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 30) throw new Error(code);
  const result = value.map((item) => requiredString(item, code, 200));
  if (new Set(result).size !== result.length) throw new Error(code);
  return result;
}

const ALLOWED_PATHS = [
  /^intro\.(situation|takeaway)$/,
  /^intro\.approaches\[\d+\]\.text$/,
  /^intro\.bottomDetails\[\d+\]\.text$/,
  /^example\.(situation|before|after|result)$/,
  /^example\.knowledgeDepth\[\d+\]\.text$/,
  /^checks\[\d+\]\.(question|explanation|correctFeedback|incorrectFeedback)$/,
  /^checks\[\d+\]\.options\[\d+\]\.label$/,
  /^practice\.(goal|referenceAnswer)$/,
  /^practice\.instructions\[\d+\]\.prompt$/,
  /^practice\.hints\[\d+\]$/,
  /^practice\.activity\.(instruction|prompt|reflection)$/,
  /^practice\.referenceFill\.[^.\[\]]+$/,
  /^review\.items\[\d+\]$/,
  /^review\.knowledgeDepth\[\d+\]\.text$/,
  /^review\.mistakes\[\d+\]$/,
  /^review\.related\[\d+\]$/,
  /^capability\.gain\[\d+\]$/,
  /^capability\.selfAssessment\[\d+\]$/,
  /^capability\.(triggerScenario|nextLessonValue)$/
];

const HUMAN_EDITABLE_PATHS = [
  /^courseHeader\.(title|catalogTitle|catalogSubtitle|lessonPageLead)$/,
  /^stepMeta\[\d+\]\.(title|objective|navigationDescription)$/,
  /^intro\.(title|situation|takeaway)$/,
  /^intro\.approaches\[\d+\]\.(label|text)$/,
  /^intro\.bottomDetails\[\d+\]\.(title|text)$/,
  /^example\.(title|situation|before|after|result)$/,
  /^example\.knowledgeDepth\[\d+\]\.(title|text)$/,
  /^checks\[\d+\]\.(question|explanation|correctFeedback|incorrectFeedback)$/,
  /^checks\[\d+\]\.options\[\d+\]\.label$/,
  /^practice\.(title|goal|referenceAnswer)$/,
  /^practice\.instructions\[\d+\]\.(label|prompt)$/,
  /^practice\.hints\[\d+\]$/,
  /^practice\.activity\.(title|instruction|prompt|reflection)$/,
  /^practice\.referenceFill\.[^.\[\]]+$/,
  /^review\.items\[\d+\]$/,
  /^review\.labels\.(primary|secondary)$/,
  /^review\.knowledgeDepth\[\d+\]\.(title|text)$/,
  /^review\.mistakes\[\d+\]$/,
  /^review\.related\[\d+\]$/,
  /^capability\.title$/,
  /^capability\.gain\[\d+\]$/,
  /^capability\.selfAssessment\[\d+\]$/,
  /^capability\.(triggerScenario|nextLessonValue)$/
];

function walkStrings(value: unknown, prefix = "", out: MutablePath[] = []) {
  if (typeof value === "string") {
    if (ALLOWED_PATHS.some((pattern) => pattern.test(prefix))) out.push({ path: prefix, current_value: value });
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkStrings(item, prefix + "[" + index + "]", out));
    return out;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      walkStrings(item, prefix ? prefix + "." + key : key, out);
    }
  }
  return out;
}

export function buildMutablePathCatalog(snapshot: AdminCourseSnapshot) {
  return walkStrings(snapshot);
}

export function buildHumanEditablePathCatalog(snapshot: AdminCourseSnapshot) {
  const out: MutablePath[] = [];
  function walk(value: unknown, prefix = "") {
    if (typeof value === "string") {
      if (HUMAN_EDITABLE_PATHS.some((pattern) => pattern.test(prefix))) {
        out.push({ path: prefix, current_value: value });
      }
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, prefix + "[" + index + "]"));
      return;
    }
    if (value && typeof value === "object") {
      for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
        walk(item, prefix ? prefix + "." + key : key);
      }
    }
  }
  walk(snapshot);
  return out;
}

function pathSegments(path: string) {
  const result: Array<string | number> = [];
  const regex = /([^.\[\]]+)|\[(\d+)\]/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(path))) result.push(match[2] === undefined ? match[1] : Number(match[2]));
  return result;
}

function setPath(snapshot: AdminCourseSnapshot, path: string, value: string) {
  const clone = snapshot as unknown as Record<string, unknown>;
  const segments = pathSegments(path);
  let cursor: any = clone;
  for (let index = 0; index < segments.length - 1; index++) cursor = cursor[segments[index] as any];
  cursor[segments[segments.length - 1] as any] = value;
}

function cloneSnapshot(snapshot: AdminCourseSnapshot) {
  return JSON.parse(JSON.stringify(snapshot)) as AdminCourseSnapshot;
}

function immutableBoundary(snapshot: AdminCourseSnapshot) {
  return {
    courseHeader: snapshot.courseHeader,
    stepMeta: snapshot.stepMeta,
    structure: {
      introApproaches: snapshot.intro.approaches.length,
      introBottomDetails: snapshot.intro.bottomDetails.length,
      exampleKnowledgeDepth: snapshot.example.knowledgeDepth.length,
      checks: snapshot.checks.map((item) => item.options.length),
      practiceInstructions: snapshot.practice.instructions.length,
      practiceHints: snapshot.practice.hints.length,
      practiceRubric: snapshot.practice.rubric.length,
      reviewItems: snapshot.review.items.length,
      reviewKnowledgeDepth: snapshot.review.knowledgeDepth.length,
      reviewMistakes: snapshot.review.mistakes.length,
      reviewRelated: snapshot.review.related.length,
      capabilityGain: snapshot.capability.gain.length,
      capabilitySelfAssessment: snapshot.capability.selfAssessment.length
    }
  };
}

function assertImmutableBoundary(before: AdminCourseSnapshot, after: AdminCourseSnapshot) {
  if (JSON.stringify(immutableBoundary(before)) !== JSON.stringify(immutableBoundary(after))) {
    throw new Error("TASK_B_IMMUTABLE_BOUNDARY_CHANGED");
  }
}

function structureBoundary(snapshot: AdminCourseSnapshot) {
  return immutableBoundary(snapshot).structure;
}

function assertStructureBoundary(before: AdminCourseSnapshot, after: AdminCourseSnapshot) {
  if (JSON.stringify(structureBoundary(before)) !== JSON.stringify(structureBoundary(after))) {
    throw new Error("TASK_B_MANUAL_STRUCTURE_CHANGED");
  }
}

export function applyValidatedPatches(
  snapshot: AdminCourseSnapshot,
  patch: CourseChangePatchV2,
  acceptedPatchIds?: string[]
) {
  const accepted = acceptedPatchIds ? new Set(acceptedPatchIds) : null;
  const next = cloneSnapshot(snapshot);
  for (const change of patch.changes) {
    if (accepted && !accepted.has(change.patch_id)) continue;
    setPath(next, change.path, change.proposed_value);
  }
  assertImmutableBoundary(snapshot, next);
  return next;
}

export function applyHumanTextEdits(
  snapshot: AdminCourseSnapshot,
  baseline: AdminCourseSnapshot,
  edits: Array<{ path: string; proposed_value: string }>
) {
  const allowed = new Set(buildHumanEditablePathCatalog(baseline).map((item) => item.path));
  const seen = new Set<string>();
  const next = cloneSnapshot(snapshot);
  for (const edit of edits) {
    const path = requiredString(edit?.path, "TASK_B_MANUAL_PATH_INVALID", 300);
    const value = requiredString(edit?.proposed_value, "TASK_B_MANUAL_VALUE_INVALID");
    if (!allowed.has(path)) throw new Error("TASK_B_MANUAL_PATH_NOT_ALLOWED");
    if (seen.has(path)) throw new Error("TASK_B_MANUAL_EDIT_DUPLICATE");
    seen.add(path);
    setPath(next, path, value);
  }
  assertStructureBoundary(baseline, next);
  return next;
}

export function describePatchPath(path: string) {
  if (path === "intro.title") return "第 1 步 · 小标题";
  if (path === "intro.situation") return "第 1 步 · 场景说明";
  if (path === "intro.takeaway") return "第 1 步 · 核心记忆";
  const introApproach = /^intro\.approaches\[(\d+)\]\.(label|text)$/.exec(path);
  if (introApproach) return "第 1 步 · 对照卡片 " + (Number(introApproach[1]) + 1) + (introApproach[2] === "label" ? " 标题" : " 正文");
  const introDetail = /^intro\.bottomDetails\[(\d+)\]\.(title|text)$/.exec(path);
  if (introDetail) return "第 1 步 · 底部说明 " + (Number(introDetail[1]) + 1) + (introDetail[2] === "title" ? " 标题" : " 正文");
  if (path === "example.title") return "第 2 步 · 小标题";
  if (path === "example.situation") return "第 2 步 · 场景说明";
  if (path === "example.before") return "第 2 步 · 修改前示例";
  if (path === "example.after") return "第 2 步 · 修改后示例";
  if (path === "example.result") return "第 2 步 · 示例结论";
  const depth = /^example\.knowledgeDepth\[(\d+)\]\.(title|text)$/.exec(path);
  if (depth) return "第 2 步 · 方法卡片 " + (Number(depth[1]) + 1) + (depth[2] === "title" ? " 标题" : " 正文");
  const check = /^checks\[(\d+)\]\.(question|explanation|correctFeedback|incorrectFeedback)$/.exec(path);
  if (check) {
    const names = { question: "题目", explanation: "解析", correctFeedback: "答对反馈", incorrectFeedback: "答错反馈" } as const;
    return "第 3 步 · 第 " + (Number(check[1]) + 1) + " 题 · " + names[check[2] as keyof typeof names];
  }
  const option = /^checks\[(\d+)\]\.options\[(\d+)\]\.label$/.exec(path);
  if (option) return "第 3 步 · 第 " + (Number(option[1]) + 1) + " 题 · 选项 " + (Number(option[2]) + 1);
  if (path === "practice.title") return "第 4 步 · 实操标题";
  if (path === "practice.goal") return "第 4 步 · 实操目标";
  if (path === "practice.referenceAnswer") return "第 4 步 · 参考答案";
  const instruction = /^practice\.instructions\[(\d+)\]\.(label|prompt)$/.exec(path);
  if (instruction) return "第 4 步 · 输入项 " + (Number(instruction[1]) + 1) + (instruction[2] === "label" ? " 标题" : " 提示");
  const hint = /^practice\.hints\[(\d+)\]$/.exec(path);
  if (hint) return "第 4 步 · 提示 " + (Number(hint[1]) + 1);
  if (path.startsWith("practice.activity.")) return "第 4 步 · 实操说明";
  if (path.startsWith("practice.referenceFill.")) return "第 4 步 · 一键填充内容";
  const reviewItem = /^review\.items\[(\d+)\]$/.exec(path);
  if (reviewItem) return "第 5 步 · 判断框架 " + (Number(reviewItem[1]) + 1);
  const reviewDepth = /^review\.knowledgeDepth\[(\d+)\]\.(title|text)$/.exec(path);
  if (reviewDepth) return "第 5 步 · 复盘说明 " + (Number(reviewDepth[1]) + 1) + (reviewDepth[2] === "title" ? " 标题" : " 正文");
  const mistake = /^review\.mistakes\[(\d+)\]$/.exec(path);
  if (mistake) return "第 5 步 · 容易踩坑 " + (Number(mistake[1]) + 1);
  const related = /^review\.related\[(\d+)\]$/.exec(path);
  if (related) return "第 5 步 · 关联说明 " + (Number(related[1]) + 1);
  if (path === "review.labels.primary") return "第 5 步 · 正向判断标题";
  if (path === "review.labels.secondary") return "第 5 步 · 边界判断标题";
  if (path === "capability.title") return "第 6 步 · 能力标题";
  const gain = /^capability\.gain\[(\d+)\]$/.exec(path);
  if (gain) return "第 6 步 · 能力获得 " + (Number(gain[1]) + 1);
  const selfAssessment = /^capability\.selfAssessment\[(\d+)\]$/.exec(path);
  if (selfAssessment) return "第 6 步 · 自我检查 " + (Number(selfAssessment[1]) + 1);
  if (path === "capability.triggerScenario") return "第 6 步 · 使用场景";
  if (path === "capability.nextLessonValue") return "第 6 步 · 下一课衔接";
  return "课程内容";
}

function assertPatchStepSemanticBoundary(path: string, proposed: string) {
  if (
    path.startsWith("example.") &&
    /(?:迁移练习|请你|请学员|作答|填写|提交答案|动手练习|完成一次练习)/.test(proposed)
  ) {
    throw new Error("TASK_B_STEP_SEMANTIC_VIOLATION");
  }
}
function hash(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

async function taskBContext(
  courseKey: string,
  evidenceMode: EffectiveEvidenceMode = "PRODUCTION"
) {
  const [taskA, taskAInput, maintenance] = await Promise.all([
    getCurrentLearningInsightTaskA(courseKey, evidenceMode),
    buildLearningInsightTaskAInput(courseKey, { evidenceMode }),
    getAdminCourseMaintenanceRegistry()
  ]);
  if (!taskA) throw new Error("TASK_B_TASK_A_REQUIRED");
  if (taskA.diagnosis.decision !== "CHANGE_RECOMMENDED") throw new Error("TASK_B_CHANGE_NOT_RECOMMENDED");

  const item = maintenance.items.find(
    (entry) => formalRuntimeLessonId(entry.runtimeCourseSlug, entry.runtimeLessonId) === courseKey
  );
  if (!item?.preview) throw new Error("TASK_B_COURSE_SNAPSHOT_NOT_FOUND");

  const approved = taskA.diagnosis.courses.find(
    (entry) => entry.course_id === item.lessonId && entry.action === "MODIFY"
  );
  if (!approved) throw new Error("TASK_B_COURSE_NOT_APPROVED");

  const evidenceRefs = new Set<string>();
  for (const root of taskA.diagnosis.root_causes) root.evidence_refs.forEach((ref) => evidenceRefs.add(ref));
  approved.evidence_refs.forEach((ref) => evidenceRefs.add(ref));
  for (const target of taskA.diagnosis.targets) {
    if (target.course_id === item.lessonId) target.evidence_refs.forEach((ref) => evidenceRefs.add(ref));
  }

  const evidence = taskAInput.evidence_catalog.filter((entry) => evidenceRefs.has(entry.evidence_ref));
  return {
    taskA,
    item,
    snapshot: item.preview as AdminCourseSnapshot,
    mutable: buildMutablePathCatalog(item.preview as AdminCourseSnapshot),
    evidence
  };
}

export function validateCourseChangePatchV2(
  value: unknown,
  input: { courseId: string; mutable: MutablePath[]; evidenceRefs: string[] }
): CourseChangePatchV2 {
  const row = objectRow(value, "TASK_B_OUTPUT_INVALID");
  exactKeys(row, ["schema_version", "course_id", "decision", "changes", "manual_structure_reason"], "TASK_B_EXTRA_FIELD");
  if (row.schema_version !== LEARNING_INSIGHT_TASK_B_SCHEMA_VERSION) throw new Error("TASK_B_SCHEMA_INVALID");
  if (row.course_id !== input.courseId) throw new Error("TASK_B_COURSE_INVALID");
  if (!["PATCH_PROPOSED", "NO_CHANGE_NEEDED", "REQUIRES_MANUAL_STRUCTURE_CHANGE"].includes(String(row.decision))) {
    throw new Error("TASK_B_DECISION_INVALID");
  }
  if (!Array.isArray(row.changes) || row.changes.length > 8) throw new Error("TASK_B_CHANGES_INVALID");

  const pathMap = new Map(input.mutable.map((entry) => [entry.path, entry.current_value]));
  const evidenceSet = new Set(input.evidenceRefs);
  const ids = new Set<string>();
  const paths = new Set<string>();
  const changes = row.changes.map((value) => {
    const item = objectRow(value, "TASK_B_CHANGE_INVALID");
    exactKeys(item, ["patch_id", "action", "path", "current_value", "proposed_value", "reason", "evidence_refs"], "TASK_B_CHANGE_EXTRA_FIELD");
    const patchId = requiredString(item.patch_id, "TASK_B_PATCH_ID_INVALID", 100);
    if (ids.has(patchId)) throw new Error("TASK_B_DUPLICATE_PATCH_ID");
    ids.add(patchId);
    if (item.action !== "REPLACE") throw new Error("TASK_B_ACTION_INVALID");
    const path = requiredString(item.path, "TASK_B_PATH_INVALID", 300);
    if (!pathMap.has(path)) throw new Error("TASK_B_PATH_NOT_ALLOWED");
    if (paths.has(path)) throw new Error("TASK_B_DUPLICATE_PATH");
    paths.add(path);
    const current = requiredString(item.current_value, "TASK_B_CURRENT_VALUE_INVALID");
    if (pathMap.get(path) !== current) throw new Error("PATCH_BASELINE_CONFLICT");
    const proposed = requiredString(item.proposed_value, "TASK_B_PROPOSED_VALUE_INVALID");
    if (proposed === current) throw new Error("TASK_B_NOOP_PATCH");
    assertPatchStepSemanticBoundary(path, proposed);
    const maxProposedLength = Math.max(current.length + 160, Math.ceil(current.length * 1.8));
    if (proposed.length > maxProposedLength) throw new Error("TASK_B_EXPANSION_EXCEEDED");
    const evidenceRefs = refs(item.evidence_refs, "TASK_B_EVIDENCE_INVALID");
    if (evidenceRefs.some((ref) => !evidenceSet.has(ref))) throw new Error("UNKNOWN_EVIDENCE_REF");
    return {
      patch_id: patchId,
      action: "REPLACE" as const,
      path,
      current_value: current,
      proposed_value: proposed,
      reason: requiredString(item.reason, "TASK_B_REASON_INVALID"),
      evidence_refs: evidenceRefs
    };
  });

  const decision = row.decision as PatchDecision;
  const manualReason =
    row.manual_structure_reason === null ? null : requiredString(row.manual_structure_reason, "TASK_B_MANUAL_REASON_INVALID");

  if (decision === "PATCH_PROPOSED" && changes.length === 0) throw new Error("TASK_B_PATCH_REQUIRED");
  if (decision !== "PATCH_PROPOSED" && changes.length !== 0) throw new Error("TASK_B_PATCH_FORBIDDEN");
  if (decision === "REQUIRES_MANUAL_STRUCTURE_CHANGE" && !manualReason) throw new Error("TASK_B_MANUAL_REASON_REQUIRED");
  if (decision !== "REQUIRES_MANUAL_STRUCTURE_CHANGE" && manualReason !== null) throw new Error("TASK_B_MANUAL_REASON_FORBIDDEN");

  return {
    schema_version: LEARNING_INSIGHT_TASK_B_SCHEMA_VERSION,
    course_id: input.courseId,
    decision,
    changes,
    manual_structure_reason: manualReason
  };
}

const SYSTEM_PROMPT =
  "你是 OPC AI 的 Course Change Generator。Human 已经确认当前课程需要进入具体修改方案阶段。你只能根据给定的 Task A 诊断、证据、当前课程和 mutable_path_catalog 生成现有字符串字段的替换方案。机械规则、路径合法性、版本、状态、正确答案和结构变化都由 Code 控制，不由你判断。课程标题、副标题、顶部学习目标、六步步骤名称、步骤卡片、步骤顺序和步骤数量均禁止修改，也不会进入 mutable_path_catalog。不得新增/删除 Step、卡片、题目、实操、字段或说明区，不得修改 ID、questionType、correctValues、passScore、权限、状态、版本。AI 的职责是修复已有课程正文中被反馈证明“没表达清楚、例子不贴任务、题目有歧义、实操指引不清”等具体问题，不是扩写课程，不是补充更多字段，不是为了显得更完整而增加说明。优先替换现有一句或一段即可解决问题的字段；无证据的问题不改，原本正确的内容不改。你必须先按六步教学语义判断问题属于哪一步，再决定是否修改该步：Step 1 建立直觉，只负责真实场景、为什么重要、基本边界，不讲复杂方法；Step 2 讲透方法，只负责方法解释、对照、讲解型案例迁移，不做测验或实操扩写；Step 2 的 proposed_value 禁止把讲解字段改造成“迁移练习、请你作答、填写、提交、动手练习”等要求学员执行的新活动；Step 3 检查理解，只负责题目、选项、解析和反馈是否准确清楚，不因错误率高就新增讲解内容；Step 4 实操，只负责实操指令、输入字段和参考答案是否可执行；评分标准 / 检查标准是内部评分字段，不在学员前台展示，禁止修改；不扩成新教学章节；Step 5 复盘判断框架，只负责形成可迁移的判断边界，不重复讲 Step 2；Step 6 能力获得，只负责学会了什么、何时使用和能力场景，不新增新知识点。修改某个 path 前必须确认：证据支持的问题确实属于该 Step 的教学职责，且该现有字段就是最小充分修复位置；如果问题与该 Step 语义不匹配，不允许修改该 Step。每项修改必须给出精确 path、原始 current_value、可以直接替换的 proposed_value、原因和 evidence_refs。只生成解决核心问题所需的最小充分修改，最多 8 项，避免同义重复润色。如果现有允许字段无法解决问题且确实需要结构变化，返回 REQUIRES_MANUAL_STRUCTURE_CHANGE。顶层必须且只能包含 schema_version、course_id、decision、changes、manual_structure_reason 五个字段；PATCH_PROPOSED 或 NO_CHANGE_NEEDED 时 manual_structure_reason 必须为 null。严格只返回 course_change_patch_v2 JSON，不得输出 Markdown 或额外字段。";

export async function runLearningInsightTaskB(courseKey: string, dependencies: TaskBDependencies = {}) {
  const evidenceMode = dependencies.evidenceMode ?? "PRODUCTION";
  const context = await taskBContext(courseKey, evidenceMode);
  const configured = dependencies.modelConfig === undefined ? getConfiguredChatModelConfig() : dependencies.modelConfig;
  if (!configured) throw new Error("AI_ANALYSIS_NOT_CONFIGURED");

  const input = {
    approved_course_id: context.item.lessonId,
    task_a_diagnosis: context.taskA.diagnosis,
    evidence_catalog: context.evidence,
    current_course_snapshot: context.snapshot,
    mutable_path_catalog: context.mutable,
    output_schema_version: LEARNING_INSIGHT_TASK_B_SCHEMA_VERSION
  };

  const [run] = await getDatabase().insert(aiRuns).values({
    taskType: LEARNING_INSIGHT_TASK_B_TASK_TYPE,
    modelProvider: configured.provider,
    model: configured.model,
    skillVersion: LEARNING_INSIGHT_TASK_B_VERSION,
    promptVersion: LEARNING_INSIGHT_TASK_B_PROMPT_VERSION,
    rulePackVersions: [LEARNING_INSIGHT_TASK_B_VERSION],
    contextIds: [
      courseKey,
      context.item.lessonId,
      context.taskA.aiRunId,
      "evidence-mode:" + evidenceMode
    ],
    evidenceIds: context.evidence.map((entry) => entry.evidence_ref),
    inputHash: hash(input),
    status: "RUNNING"
  }).returning();

  let raw: unknown = null;
  try {
    const caller = dependencies.callModel ?? callConfiguredChatJson;
    const basePayload = {
        CONFIRMED_ISSUE: context.taskA.diagnosis,
        EVIDENCE_CATALOG: context.evidence,
        CURRENT_COURSE: context.snapshot,
        MUTABLE_PATH_CATALOG: context.mutable,
        OUTPUT_REQUIREMENT: {
          return_json_only: true,
          schema: LEARNING_INSIGHT_TASK_B_SCHEMA_VERSION,
          allowed_top_level_fields: ["schema_version", "course_id", "decision", "changes", "manual_structure_reason"],
          decision_enum: ["PATCH_PROPOSED", "NO_CHANGE_NEEDED", "REQUIRES_MANUAL_STRUCTURE_CHANGE"],
          exact_top_level_shape: {
            schema_version: LEARNING_INSIGHT_TASK_B_SCHEMA_VERSION,
            course_id: context.item.lessonId,
            decision: "PATCH_PROPOSED | NO_CHANGE_NEEDED | REQUIRES_MANUAL_STRUCTURE_CHANGE",
            changes: "array，PATCH_PROPOSED 时最多 8 项，其它 decision 必须为空数组",
            manual_structure_reason: "PATCH_PROPOSED / NO_CHANGE_NEEDED 时必须为 null；只有 REQUIRES_MANUAL_STRUCTURE_CHANGE 时填写 string"
          },
          exact_change_shape: {
            patch_id: "string",
            action: "REPLACE",
            path: "mutable_path_catalog 中存在的 path",
            current_value: "与 mutable_path_catalog 完全一致",
            proposed_value: "具体可直接替换的新文本",
            reason: "string",
            evidence_refs: ["evidence_ref"]
          }
        }
      };
    let patch: CourseChangePatchV2 | null = null;
    let validationError: unknown = null;
    let attempts = 0;
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      attempts = attempt;
      const result = await caller({
        systemPrompt:
          attempt === 1
            ? SYSTEM_PROMPT
            : SYSTEM_PROMPT +
              " 上一次输出未通过确定性校验。必须缩小到现有 mutable path 的最小文本替换；不得扩写、不得新增结构、不得改变 Step 教学职责。",
        userPayload:
          attempt === 1
            ? basePayload
            : {
                ...basePayload,
                VALIDATION_RETRY: {
                  attempt,
                  validation_error:
                    validationError instanceof Error
                      ? validationError.message.slice(0, 200)
                      : "TASK_B_VALIDATION_FAILED",
                  instruction:
                    "只修正导致校验失败的 proposed_value/path；不要新增修改项。"
                }
              },
        temperature: 0.1,
        timeoutMs: 120000
      }, { config: configured });

      raw = result.data;
      try {
        patch = validateCourseChangePatchV2(result.data, {
          courseId: context.item.lessonId,
          mutable: context.mutable,
          evidenceRefs: context.evidence.map((entry) => entry.evidence_ref)
        });
        break;
      } catch (error) {
        validationError = error;
        if (attempt === 2) throw error;
      }
    }
    if (!patch) throw validationError ?? new Error("TASK_B_VALIDATION_FAILED");

    await getDatabase().update(aiRuns).set({
      status: "SUCCEEDED",
      rawOutput: patch,
      validatorResult: {
        valid: true,
        schemaVersion: LEARNING_INSIGHT_TASK_B_SCHEMA_VERSION,
        attempts
      },
      completedAt: new Date()
    }).where(eq(aiRuns.id, run.id));

    return {
      aiRunId: run.id,
      patch,
      beforeSnapshot: context.snapshot,
      afterSnapshot: applyValidatedPatches(context.snapshot, patch),
      changes: patch.changes.map((change) => ({ ...change, display_label: describePatchPath(change.path) }))
    };
  } catch (error) {
    await getDatabase().update(aiRuns).set({
      status: "FAILED",
      rawOutput: raw,
      validatorResult: { valid: false },
      errorCode: error instanceof Error ? error.message.slice(0, 200) : "TASK_B_FAILED",
      errorMessage: error instanceof Error ? error.message.slice(0, 1500) : String(error).slice(0, 1500),
      completedAt: new Date()
    }).where(eq(aiRuns.id, run.id));
    throw error;
  }
}

export async function getCurrentLearningInsightTaskB(
  courseKey: string,
  evidenceMode: EffectiveEvidenceMode = "PRODUCTION"
) {
  const rows = await getDatabase().select({
    id: aiRuns.id,
    rawOutput: aiRuns.rawOutput,
    contextIds: aiRuns.contextIds,
    modelProvider: aiRuns.modelProvider,
    model: aiRuns.model,
    createdAt: aiRuns.createdAt,
    completedAt: aiRuns.completedAt
  }).from(aiRuns).where(and(
    eq(aiRuns.taskType, LEARNING_INSIGHT_TASK_B_TASK_TYPE),
    eq(aiRuns.status, "SUCCEEDED")
  )).orderBy(desc(aiRuns.createdAt)).limit(100);

  const row = rows.find(
    (entry) =>
      Array.isArray(entry.contextIds) &&
      entry.contextIds.includes(courseKey) &&
      entry.contextIds.includes("evidence-mode:" + evidenceMode)
  );
  if (!row) return null;
  const context = await taskBContext(courseKey, evidenceMode);
  const patch = validateCourseChangePatchV2(row.rawOutput, {
    courseId: context.item.lessonId,
    mutable: context.mutable,
    evidenceRefs: context.evidence.map((entry) => entry.evidence_ref)
  });
  return {
    aiRunId: row.id,
    patch,
    beforeSnapshot: context.snapshot,
    afterSnapshot: applyValidatedPatches(context.snapshot, patch),
    changes: patch.changes.map((change) => ({ ...change, display_label: describePatchPath(change.path) })),
    modelProvider: row.modelProvider,
    model: row.model,
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null
  };
}

export async function applyLearningInsightTaskB(
  user: AuthUser,
  courseKey: string,
  acceptedPatchIds: string[]
) {
  const current = await getCurrentLearningInsightTaskB(courseKey);
  if (!current) throw new Error("TASK_B_PROPOSAL_NOT_FOUND");
  if (current.patch.decision !== "PATCH_PROPOSED") throw new Error("TASK_B_PATCH_NOT_AVAILABLE");

  const allIds = new Set(current.patch.changes.map((change) => change.patch_id));
  if (
    acceptedPatchIds.length === 0 ||
    new Set(acceptedPatchIds).size !== acceptedPatchIds.length ||
    acceptedPatchIds.some((id) => !allIds.has(id))
  ) throw new Error("TASK_B_ACCEPTED_PATCH_INVALID");

  const maintenance = await getAdminCourseMaintenanceRegistry();
  const item = maintenance.items.find(
    (entry) => formalRuntimeLessonId(entry.runtimeCourseSlug, entry.runtimeLessonId) === courseKey
  );
  if (!item?.preview) throw new Error("TASK_B_COURSE_SNAPSHOT_NOT_FOUND");
  if (item.maintenance?.activeCandidate) throw new Error("CANDIDATE_ALREADY_ACTIVE");

  const mutable = buildMutablePathCatalog(item.preview as AdminCourseSnapshot);
  validateCourseChangePatchV2(current.patch, {
    courseId: item.lessonId,
    mutable,
    evidenceRefs: current.patch.changes.flatMap((change) => change.evidence_refs)
  });

  const after = applyValidatedPatches(item.preview as AdminCourseSnapshot, current.patch, acceptedPatchIds);
  const candidate = await startAdminCourseCandidate(user, item.runtimeCourseSlug, item.runtimeLessonId, {
    updateReason: "学习洞察 AI 修正：" + acceptedPatchIds.length + " 项文本调整",
    sourceContext: {
      type: "LEARNING_INSIGHT",
      sourceCandidateId: current.aiRunId
    }
  });
  if (!candidate) throw new Error("CANDIDATE_CREATE_FAILED");
  const saved = await saveAdminCourseCandidate(candidate.id, {
    updateReason: "学习洞察 AI 修正：" + acceptedPatchIds.length + " 项文本调整",
    snapshot: after
  });
  return { candidate: saved, maintenanceKey: item.runtimeCourseSlug + "/" + item.runtimeLessonId };
}

export async function publishLearningInsightTaskB(
  user: AuthUser,
  courseKey: string,
  edits: Array<{ patch_id: string; proposed_value: string }>,
  manualEdits: Array<{ path: string; proposed_value: string }>,
  evidenceMode: EffectiveEvidenceMode = "PRODUCTION",
  options: { allowAcceptancePublish?: boolean } = {}
) {
  if (
    evidenceMode !== "PRODUCTION" &&
    !(
      evidenceMode === "ACCEPTANCE" &&
      options.allowAcceptancePublish &&
      process.env.NODE_ENV !== "production"
    )
  ) {
    throw new Error("SIMULATION_ACTION_DISABLED");
  }

  const current = await getCurrentLearningInsightTaskB(courseKey, evidenceMode);
  if (!current) throw new Error("TASK_B_PROPOSAL_NOT_FOUND");
  if (current.patch.decision !== "PATCH_PROPOSED") throw new Error("TASK_B_PATCH_NOT_AVAILABLE");

  const editMap = new Map<string, string>();
  for (const edit of edits) {
    if (
      !edit ||
      typeof edit.patch_id !== "string" ||
      typeof edit.proposed_value !== "string" ||
      !edit.patch_id.trim() ||
      !edit.proposed_value.trim()
    ) {
      throw new Error("TASK_B_FINAL_EDIT_INVALID");
    }
    if (editMap.has(edit.patch_id)) throw new Error("TASK_B_FINAL_EDIT_DUPLICATE");
    editMap.set(edit.patch_id, edit.proposed_value.trim());
  }

  if (editMap.size > current.patch.changes.length) {
    throw new Error("TASK_B_FINAL_EDIT_INVALID");
  }

  const knownPatchIds = new Set(current.patch.changes.map((change) => change.patch_id));
  for (const patchId of editMap.keys()) {
    if (!knownPatchIds.has(patchId)) throw new Error("TASK_B_FINAL_EDIT_UNKNOWN_PATCH");
  }

  const finalPatch: CourseChangePatchV2 | null = editMap.size > 0
    ? {
        ...current.patch,
        changes: current.patch.changes
          .filter((change) => editMap.has(change.patch_id))
          .map((change) => ({
            ...change,
            proposed_value: editMap.get(change.patch_id)!
          }))
      }
    : null;

  const maintenance = await getAdminCourseMaintenanceRegistry();
  const item = maintenance.items.find(
    (entry) => formalRuntimeLessonId(entry.runtimeCourseSlug, entry.runtimeLessonId) === courseKey
  );
  if (!item?.preview) throw new Error("TASK_B_COURSE_SNAPSHOT_NOT_FOUND");
  if (item.maintenance?.activeCandidate) throw new Error("CANDIDATE_ALREADY_ACTIVE");

  const baseline = item.preview as AdminCourseSnapshot;
  let after = cloneSnapshot(baseline);
  if (finalPatch) {
    const mutable = buildMutablePathCatalog(baseline);
    validateCourseChangePatchV2(finalPatch, {
      courseId: item.lessonId,
      mutable,
      evidenceRefs: current.patch.changes.flatMap((change) => change.evidence_refs)
    });
    after = applyValidatedPatches(baseline, finalPatch);
  }
  if (manualEdits.length > 0) {
    const aiPaths = new Set(finalPatch?.changes.map((change) => change.path) ?? []);
    if (manualEdits.some((edit) => aiPaths.has(edit.path))) {
      throw new Error("TASK_B_MANUAL_AI_PATH_CONFLICT");
    }
    after = applyHumanTextEdits(after, baseline, manualEdits);
  }
  if (!finalPatch && manualEdits.length === 0) throw new Error("TASK_B_FINAL_EDIT_INVALID");
  let createdCandidateId: string | null = null;
  try {
    const candidate = await startAdminCourseCandidate(
      user,
      item.runtimeCourseSlug,
      item.runtimeLessonId,
      {
        updateReason: "课程反馈更新",
        sourceContext: {
          type: "LEARNING_INSIGHT",
          sourceCandidateId: current.aiRunId
        }
      }
    );
    if (!candidate) throw new Error("CANDIDATE_CREATE_FAILED");
    if (candidate.status !== "DRAFT") throw new Error("CANDIDATE_ALREADY_ACTIVE");
    createdCandidateId = candidate.id;

    const saved = await saveAdminCourseCandidate(candidate.id, {
      updateReason: "课程反馈更新",
      snapshot: after
    });
    if (!saved) throw new Error("CANDIDATE_SAVE_FAILED");
    await submitAdminCourseCandidate(saved.id);
    const published = await publishAdminCourseCandidate(saved.id, user);

    const handledThrough = new Date(current.createdAt);
    let issueClosureWarning: string | null = null;
    try {
      await getDatabase().transaction(async (tx) => {
        const handledInsights = await tx
          .select({
            id: courseInsights.id,
            issueKey: courseInsights.issueKey,
            distinctUserCount: courseInsights.distinctUserCount,
            evidence: courseInsights.evidence
          })
          .from(courseInsights)
          .where(
            and(
              eq(courseInsights.lessonId, courseKey),
              inArray(courseInsights.status, [
                "OPEN",
                "ANALYSIS_READY",
                "UNDER_REVIEW",
                "REVIEW_REQUIRED"
              ]),
              lte(courseInsights.updatedAt, handledThrough)
            )
          );
        const closedAt = new Date();
        for (const insight of handledInsights) {
          await tx
            .update(courseInsights)
            .set({
              status: "REVIEWED",
              evidence: closeIssueCycleEvidence({
                evidence: insight.evidence,
                issueKey: insight.issueKey,
                state: "REVIEWED",
                sampleSize: insight.distinctUserCount,
                at: closedAt
              }),
              updatedAt: closedAt
            })
            .where(eq(courseInsights.id, insight.id));
        }

        await tx
          .update(learningFeedback)
          .set({ reviewStatus: "CLOSED", updatedAt: new Date() })
          .where(
            and(
              eq(learningFeedback.lessonId, courseKey),
              eq(learningFeedback.qualityRisk, true),
              inArray(learningFeedback.reviewStatus, ["OPEN", "UNDER_REVIEW"]),
              lte(learningFeedback.updatedAt, handledThrough)
            )
          );
      });
    } catch (error) {
      issueClosureWarning = "LEARNING_ISSUE_CLOSURE_FAILED";
      console.error("[OPC AI] course published but learning issue closure failed", error);
    }

    return {
      ok: true,
      version: published.version,
      courseSlug: published.courseSlug,
      lessonSlug: published.lessonSlug,
      updateReason: "课程反馈更新",
      issueClosureWarning
    };
  } catch (error) {
    if (createdCandidateId) {
      await cancelAdminCourseCandidate(createdCandidateId).catch(() => undefined);
    }
    throw error;
  }
}

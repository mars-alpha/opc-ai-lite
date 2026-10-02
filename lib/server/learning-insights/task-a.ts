import "server-only";

import { createHash } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { listAdminCourseRegistry } from "../admin/course-registry";
import { formalRuntimeLessonId } from "../learning/formal-identity";
import {
  callConfiguredChatJson,
  getConfiguredChatModelConfig,
  type ConfiguredChatModelConfig
} from "../ai/configured-chat";
import { getDatabase } from "../db";
import { aiRuns } from "../db/schema";
import {
  buildEffectiveLearningEvidenceSet,
  type EffectiveEvidenceMode,
  type EffectiveLearningEvidenceSet
} from "./effective-evidence";

export const LEARNING_INSIGHT_TASK_A_VERSION = "learning-insight-task-a-v1";
export const LEARNING_INSIGHT_TASK_A_PROMPT_VERSION = "learning-insight-task-a-prompt-v1";
export const LEARNING_INSIGHT_TASK_A_SKILL_VERSION = "learning-insight-task-a-skill-v1";
export const LEARNING_INSIGHT_TASK_A_SCHEMA_VERSION = "learning_issue_diagnosis_v2";
export const LEARNING_INSIGHT_TASK_A_TASK_TYPE = "LEARNING_INSIGHT_TASK_A";

const DECISIONS = new Set([
  "CHANGE_RECOMMENDED",
  "CONTINUE_OBSERVING",
  "NO_CHANGE_NEEDED",
  "INSUFFICIENT_EVIDENCE"
]);
const ROOT_CAUSE_TYPES = new Set([
  "EXPLANATION_GAP",
  "EXAMPLE_GAP",
  "BOUNDARY_CONFUSION",
  "PRACTICE_INSTRUCTION_GAP",
  "ASSESSMENT_WORDING_PROBLEM",
  "CONTENT_OUTDATED",
  "CONTENT_POSSIBLY_INCORRECT",
  "PREREQUISITE_GAP",
  "COURSE_OVERLAP",
  "OTHER"
]);
const COURSE_ACTIONS = new Set(["MODIFY", "REVIEW_ONLY", "NOT_RELEVANT"]);

export type LearningIssueDiagnosisV2 = {
  schema_version: "learning_issue_diagnosis_v2";
  decision:
    | "CHANGE_RECOMMENDED"
    | "CONTINUE_OBSERVING"
    | "NO_CHANGE_NEEDED"
    | "INSUFFICIENT_EVIDENCE";
  problem_summary: string;
  root_causes: Array<{
    type:
      | "EXPLANATION_GAP"
      | "EXAMPLE_GAP"
      | "BOUNDARY_CONFUSION"
      | "PRACTICE_INSTRUCTION_GAP"
      | "ASSESSMENT_WORDING_PROBLEM"
      | "CONTENT_OUTDATED"
      | "CONTENT_POSSIBLY_INCORRECT"
      | "PREREQUISITE_GAP"
      | "COURSE_OVERLAP"
      | "OTHER";
    description: string;
    evidence_refs: string[];
  }>;
  courses: Array<{
    course_id: string;
    action: "MODIFY" | "REVIEW_ONLY" | "NOT_RELEVANT";
    reason: string;
    evidence_refs: string[];
  }>;
  targets: Array<{
    course_id: string;
    step: number;
    area: string;
    problem: string;
    change_goal: string;
    evidence_refs: string[];
  }>;
  observation_note: string | null;
};

export type LearningInsightTaskAInput = {
  course_issue_bundle: {
    current_course_id: string;
    current_course_title: string;
    issue_count: number;
    open_issue_count: number;
    issues: Array<{
      issue_id: string;
      issue_type: string;
      status: string;
      occurred_at: string;
      updated_at: string;
      evidence_refs: string[];
    }>;
  };
  course_issue_timeline: Array<{
    issue_id: string;
    issue_type: string;
    status: string;
    occurred_at: string;
    updated_at: string;
  }>;
  deterministic_metrics: Record<string, number | null>;
  evidence_catalog: Array<{
    evidence_ref: string;
    source_type: string;
    human_readable_source: string;
    evidence_status: "VALID" | "SUPPORTING_ONLY";
    content: unknown;
    occurred_at: string | null;
    source_owner: string;
  }>;
  current_course_snapshot: unknown;
  curriculum_catalog: Array<{
    course_id: string;
    title: string;
    track: string;
    short_capability: string;
  }>;
  adjacent_course_summaries: Array<{
    relation: "PREVIOUS" | "NEXT";
    course_id: string;
    title: string;
    short_capability: string;
  }>;
  data_availability: EffectiveLearningEvidenceSet["data_availability"];
  prompt_version: string;
  output_schema_version: "learning_issue_diagnosis_v2";
};

type TaskADependencies = {
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

function exactKeys(row: Record<string, unknown>, allowed: string[], code: string) {
  const actual = Object.keys(row).sort();
  const expected = [...allowed].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    throw new Error(code);
  }
}

function requiredString(value: unknown, code: string, max = 4000) {
  if (typeof value !== "string" || !value.trim()) throw new Error(code);
  return value.trim().slice(0, max);
}

function stringRefs(value: unknown, code: string, max = 30) {
  if (!Array.isArray(value) || value.length > max) throw new Error(code);
  const refs = value.map((item) => {
    if (typeof item !== "string" || !item.trim()) throw new Error(code);
    return item.trim();
  });
  if (new Set(refs).size !== refs.length) throw new Error(code);
  return refs;
}

function objectRow(value: unknown, code: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(code);
  return value as Record<string, unknown>;
}

function assertTargetChangeGoalBoundary(step: number, area: string, value: string) {
  if (/(?:新增|增加|加入|添加|补一(?:个|道|次)|再做一(?:个|次)).{0,12}(?:练习|题目|测验|实操|卡片|步骤|说明区|字段)/.test(value)) {
    throw new Error("TASK_A_TARGET_STRUCTURE_EXPANSION_FORBIDDEN");
  }
  if (step === 2 && /(?:迁移练习|请你|请学员|作答|填写|提交答案|动手练习|完成一次练习)/.test(value)) {
    throw new Error("TASK_A_STEP2_ACTIVITY_FORBIDDEN");
  }
  if (step === 4 && /(?:评分标准|检查标准|rubric)/i.test(area + " " + value)) {
    throw new Error("TASK_A_HIDDEN_RUBRIC_TARGET_FORBIDDEN");
  }
}
export function validateLearningIssueDiagnosisV2(value: unknown): LearningIssueDiagnosisV2 {
  const row = objectRow(value, "TASK_A_OUTPUT_INVALID");
  exactKeys(
    row,
    ["schema_version", "decision", "problem_summary", "root_causes", "courses", "targets", "observation_note"],
    "TASK_A_EXTRA_FIELD"
  );
  if (row.schema_version !== LEARNING_INSIGHT_TASK_A_SCHEMA_VERSION) {
    throw new Error("TASK_A_SCHEMA_VERSION_INVALID");
  }
  if (typeof row.decision !== "string" || !DECISIONS.has(row.decision)) {
    throw new Error("TASK_A_ENUM_INVALID:decision");
  }
  const problemSummary = requiredString(row.problem_summary, "TASK_A_FIELD_INVALID:problem_summary");

  if (!Array.isArray(row.root_causes) || row.root_causes.length > 5) {
    throw new Error("TASK_A_LIMIT_EXCEEDED:root_causes");
  }
  const rootCauses = row.root_causes.map((value) => {
    const item = objectRow(value, "TASK_A_FIELD_INVALID:root_causes");
    exactKeys(item, ["type", "description", "evidence_refs"], "TASK_A_EXTRA_FIELD:root_causes");
    if (typeof item.type !== "string" || !ROOT_CAUSE_TYPES.has(item.type)) {
      throw new Error("TASK_A_ENUM_INVALID:root_causes.type");
    }
    const refs = stringRefs(item.evidence_refs, "TASK_A_FIELD_INVALID:root_causes.evidence_refs");
    if (refs.length === 0) throw new Error("TASK_A_FIELD_INVALID:root_causes.evidence_refs");
    return {
      type: item.type as LearningIssueDiagnosisV2["root_causes"][number]["type"],
      description: requiredString(item.description, "TASK_A_FIELD_INVALID:root_causes.description"),
      evidence_refs: refs
    };
  });

  if (!Array.isArray(row.courses) || row.courses.length > 5) {
    throw new Error("TASK_A_LIMIT_EXCEEDED:courses");
  }
  const courses = row.courses.map((value) => {
    const item = objectRow(value, "TASK_A_FIELD_INVALID:courses");
    exactKeys(item, ["course_id", "action", "reason", "evidence_refs"], "TASK_A_EXTRA_FIELD:courses");
    if (typeof item.action !== "string" || !COURSE_ACTIONS.has(item.action)) {
      throw new Error("TASK_A_ENUM_INVALID:courses.action");
    }
    const refs = stringRefs(item.evidence_refs, "TASK_A_FIELD_INVALID:courses.evidence_refs");
    if (item.action !== "NOT_RELEVANT" && refs.length === 0) {
      throw new Error("TASK_A_FIELD_INVALID:courses.evidence_refs");
    }
    return {
      course_id: requiredString(item.course_id, "TASK_A_FIELD_INVALID:courses.course_id", 100),
      action: item.action as LearningIssueDiagnosisV2["courses"][number]["action"],
      reason: requiredString(item.reason, "TASK_A_FIELD_INVALID:courses.reason"),
      evidence_refs: refs
    };
  });
  if (new Set(courses.map((item) => item.course_id)).size !== courses.length) {
    throw new Error("DUPLICATE_COURSE_ID");
  }

  if (!Array.isArray(row.targets) || row.targets.length > 12) {
    throw new Error("TASK_A_LIMIT_EXCEEDED:targets");
  }
  const targets = row.targets.map((value) => {
    const item = objectRow(value, "TASK_A_FIELD_INVALID:targets");
    exactKeys(
      item,
      ["course_id", "step", "area", "problem", "change_goal", "evidence_refs"],
      "TASK_A_EXTRA_FIELD:targets"
    );
    if (typeof item.step !== "number" || !Number.isInteger(item.step) || item.step < 1 || item.step > 6) {
      throw new Error("INVALID_STEP_NUMBER");
    }
    return {
      course_id: requiredString(item.course_id, "TASK_A_FIELD_INVALID:targets.course_id", 100),
      step: item.step,
      area: requiredString(item.area, "TASK_A_FIELD_INVALID:targets.area", 300),
      problem: requiredString(item.problem, "TASK_A_FIELD_INVALID:targets.problem"),
      change_goal: (() => { const area = requiredString(item.area, "TASK_A_FIELD_INVALID:targets.area", 300); const changeGoal = requiredString(item.change_goal, "TASK_A_FIELD_INVALID:targets.change_goal"); assertTargetChangeGoalBoundary(item.step as number, area, changeGoal); return changeGoal; })(),
      evidence_refs: stringRefs(item.evidence_refs, "TASK_A_FIELD_INVALID:targets.evidence_refs")
    };
  });

  let observationNote: string | null = null;
  if (row.observation_note !== null) {
    observationNote = requiredString(row.observation_note, "TASK_A_FIELD_INVALID:observation_note");
  }

  return {
    schema_version: LEARNING_INSIGHT_TASK_A_SCHEMA_VERSION,
    decision: row.decision as LearningIssueDiagnosisV2["decision"],
    problem_summary: problemSummary,
    root_causes: rootCauses,
    courses,
    targets,
    observation_note: observationNote
  };
}

export function validateLearningIssueDiagnosisReferences(
  diagnosis: LearningIssueDiagnosisV2,
  input: LearningInsightTaskAInput
) {
  const evidenceRefs = new Set(input.evidence_catalog.map((item) => item.evidence_ref));
  const courseIds = new Set(input.curriculum_catalog.map((item) => item.course_id));
  const declaredCourses = new Set(diagnosis.courses.map((item) => item.course_id));

  const validateRefs = (refs: string[]) => {
    for (const ref of refs) {
      if (!evidenceRefs.has(ref)) throw new Error("UNKNOWN_EVIDENCE_REF");
    }
  };

  for (const rootCause of diagnosis.root_causes) validateRefs(rootCause.evidence_refs);
  for (const course of diagnosis.courses) {
    if (!courseIds.has(course.course_id)) throw new Error("UNKNOWN_COURSE_ID");
    validateRefs(course.evidence_refs);
  }
  for (const target of diagnosis.targets) {
    if (!courseIds.has(target.course_id)) throw new Error("UNKNOWN_COURSE_ID");
    if (!declaredCourses.has(target.course_id)) throw new Error("TARGET_COURSE_NOT_DECLARED");
    if (target.evidence_refs.length === 0) throw new Error("UNKNOWN_EVIDENCE_REF");
    validateRefs(target.evidence_refs);
  }

  if (diagnosis.decision === "NO_CHANGE_NEEDED") {
    if (diagnosis.courses.some((item) => item.action === "MODIFY") || diagnosis.targets.length > 0) {
      throw new Error("DECISION_CONTRADICTION");
    }
  }
  if (diagnosis.decision === "INSUFFICIENT_EVIDENCE" && diagnosis.targets.length > 0) {
    throw new Error("DECISION_CONTRADICTION");
  }

  const serialized = JSON.stringify(diagnosis);
  for (const forbidden of ["current_value", "proposed_value", "patch_id"]) {
    if (serialized.includes('"' + forbidden + '"')) throw new Error("TASK_A_PATCH_CONTENT_FORBIDDEN");
  }
  return diagnosis;
}

function sanitizeEvidence(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeEvidence);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !/user|email|secret|api.?key|decidedby/i.test(key))
      .map(([key, item]) => [key, sanitizeEvidence(item)])
  );
}

function hashInput(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function errorCode(error: unknown) {
  if (error instanceof Error && /^[A-Z0-9_:-]+$/.test(error.message)) return error.message;
  if (error instanceof Error && error.message.includes(":")) return error.message.split(":")[0];
  return "LEARNING_INSIGHT_TASK_A_FAILED";
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 1500) : String(error).slice(0, 1500);
}

function findRegistryContext(courseKey: string) {
  const registry = listAdminCourseRegistry().items;
  const index = registry.findIndex(
    (item) => formalRuntimeLessonId(item.runtimeCourseSlug, item.runtimeLessonId) === courseKey
  );
  if (index < 0) throw new Error("TASK_A_FORMAL_COURSE_NOT_FOUND");
  const current = registry[index];
  const previous = index > 0 && registry[index - 1].trackSlug === current.trackSlug ? registry[index - 1] : null;
  const next = index + 1 < registry.length && registry[index + 1].trackSlug === current.trackSlug ? registry[index + 1] : null;
  return { registry, current, previous, next };
}

export async function buildLearningInsightTaskAInput(
  courseKey: string,
  options: { evidenceMode?: EffectiveEvidenceMode } = {}
): Promise<LearningInsightTaskAInput> {
  const { registry, current, previous, next } = findRegistryContext(courseKey);
  const effective = await buildEffectiveLearningEvidenceSet(courseKey, {
    mode: options.evidenceMode ?? "PRODUCTION"
  });

  if (effective.issues.length === 0) throw new Error("TASK_A_EFFECTIVE_ISSUES_NOT_FOUND");
  if (effective.evidence_catalog.length === 0) throw new Error("TASK_A_EFFECTIVE_EVIDENCE_EMPTY");

  const gateAuthorized = effective.issues.some(
    (item) => item.status === "ANALYSIS_READY" || item.status === "UNDER_REVIEW"
  );
  const gateIncomplete = effective.issues.some(
    (item) => item.status === "OPEN" || item.status === "REVIEW_REQUIRED"
  );
  if (!gateAuthorized || gateIncomplete) throw new Error("TASK_A_GATE1_NOT_AUTHORIZED");

  const availableFields = Array.from(
    new Set([
      ...effective.data_availability.available_fields,
      "current_course_snapshot",
      "curriculum_catalog"
    ])
  );

  return {
    course_issue_bundle: {
      current_course_id: current.lessonId,
      current_course_title: current.lessonTitle,
      issue_count: effective.issues.length,
      open_issue_count: effective.issues.length,
      issues: effective.issues
    },
    course_issue_timeline: effective.issues.map(({ evidence_refs: _refs, ...item }) => item),
    deterministic_metrics: effective.deterministic_metrics,
    evidence_catalog: effective.evidence_catalog,
    current_course_snapshot: current.preview,
    curriculum_catalog: registry.map((item) => ({
      course_id: item.lessonId,
      title: item.lessonTitle,
      track: item.trackIndex + " " + item.trackTitle,
      short_capability: item.learnerOutcome
    })),
    adjacent_course_summaries: [
      ...(previous
        ? [{
            relation: "PREVIOUS" as const,
            course_id: previous.lessonId,
            title: previous.lessonTitle,
            short_capability: previous.learnerOutcome
          }]
        : []),
      ...(next
        ? [{
            relation: "NEXT" as const,
            course_id: next.lessonId,
            title: next.lessonTitle,
            short_capability: next.learnerOutcome
          }]
        : [])
    ],
    data_availability: {
      ...effective.data_availability,
      available_fields: availableFields,
      source_owners: {
        ...effective.data_availability.source_owners,
        current_course_snapshot: "AdminCourseSnapshot",
        curriculum_catalog: "AdminCourseRegistry"
      }
    },
    prompt_version: LEARNING_INSIGHT_TASK_A_PROMPT_VERSION,
    output_schema_version: LEARNING_INSIGHT_TASK_A_SCHEMA_VERSION
  };
}

const SYSTEM_PROMPT =
  "你是 OPC AI 的 Learning Issue Diagnosis Skill。系统已经通过确定性 Effective Evidence Set 把当前课程允许用于 AI 判断的有效证据整理完成，并且 Human 已明确授权你分析这门课程。evidence_catalog 是唯一允许引用的事实证据；被排除、样本不足、测试或不可用的数据不在其中，不得自行补齐。你不是问题检测器，不负责阈值，不负责业务状态，不负责发布，也不能直接修改课程。你必须同时考虑输入中的全部累计问题，不得只基于单个 Issue 下结论。你只能使用本次请求实际读取到的确定性学习指标、evidence_catalog、当前正式课程内容、课程目录与相邻课程摘要；正式 PRODUCTION 分析不得沿用审核样例、演示数字、历史测试结果或写死统计值。任何人数、比例、日期、题号、通过率、错误率、提示使用率都必须能在当前输入中找到对应实际数据，否则不得写入结论。分析课程时必须按固定六步教学语义判断问题真正属于哪里：Step 1 建立直觉，负责真实场景、为什么重要、基本边界；Step 2 讲透方法，负责方法解释、对照和案例迁移，但案例迁移只能通过讲解型示例完成，不得建议新增练习、作答、填写、提交、测验或其它要求学员执行的新活动；Step 3 检查理解，负责确认核心概念是否真正理解，包括题目、选项、解析和反馈；Step 4 实操，负责让学员真实做一次，包括指令、输入和参考答案；评分标准 / 检查标准属于内部评分字段，不在学员前台展示，禁止把它列为修改目标；Step 5 复盘判断框架，负责形成可迁移的判断边界，不重复讲 Step 2；Step 6 能力获得，负责学会了什么、何时使用和能力场景，不引入新知识点。不能因为某一步有数据异常就机械建议修改该步，必须先判断问题是否属于该步的教学职责；跨 Step 的问题要说明真正归属。targets.change_goal 只能描述需要澄清的理解目标和现有字段应达到的表达效果，不得建议新增或增加卡片、题目、练习、实操、步骤、说明区或其它结构。你的任务是说明证据支持的问题、判断最可能根因、判断问题主要属于当前课程/前置课程/后续课程/证据不足、列出课程并区分 MODIFY/REVIEW_ONLY/NOT_RELEVANT、指出可能需要关注的 Step 和具体字段区域。所有根因和课程判断必须引用输入中存在的 evidence_ref。证据不足时返回 INSUFFICIENT_EVIDENCE 或 CONTINUE_OBSERVING。不得强行建议修改，不得输出不可执行的空泛结论，不得生成修改后的课程正文。problem_summary、root_causes.description、courses.reason、targets.problem、targets.change_goal 必须写成运营人员直接能看懂的中文人话，不得在这些展示文案中出现 DONT_UNDERSTAND、LOW_HELPFULNESS、Effective Evidence Set、Schema、Candidate、source_owner、文件路径、系统文件名、数据库字段名或其它内部实现术语；也不得直接输出 notHelpfulRate、hintUsageRate 等指标变量名、阈值代码、Evidence 编号或类似系统表达。课程编号如 T1-01 必须表达为“第1阶段第1课”；需要表达指标事实时，要翻译成“课程帮助度偏低、提示使用较多、学员没看懂、实操通过困难、检查题错误较多”等业务语言，并在有实际值时再补充具体数字。problem_summary 先说明是哪一课，再用 1～2 句概括最主要的问题，不堆砌代码、变量名和原始指标。禁止编造证据、引用输入外资料、推断学员身份、自动选择最终修改课程、创建 Candidate、改数据库业务状态、输出 Markdown。顶层只能返回 schema_version、decision、problem_summary、root_causes、courses、targets、observation_note 这 7 个字段，禁止任何额外字段。严格只返回 learning_issue_diagnosis_v2 JSON。";

export async function runLearningInsightTaskA(
  courseKey: string,
  dependencies: TaskADependencies = {}
) {
  const db = getDatabase();
  const evidenceMode = dependencies.evidenceMode ?? "PRODUCTION";
  const input = await buildLearningInsightTaskAInput(courseKey, { evidenceMode });
  const configured =
    dependencies.modelConfig === undefined
      ? getConfiguredChatModelConfig()
      : dependencies.modelConfig;
  const inputHash = hashInput({
    taskVersion: LEARNING_INSIGHT_TASK_A_VERSION,
    promptVersion: LEARNING_INSIGHT_TASK_A_PROMPT_VERSION,
    schemaVersion: LEARNING_INSIGHT_TASK_A_SCHEMA_VERSION,
    input
  });

  const [run] = await db
    .insert(aiRuns)
    .values({
      taskType: LEARNING_INSIGHT_TASK_A_TASK_TYPE,
      modelProvider: configured?.provider ?? "UNCONFIGURED",
      model: configured?.model ?? "UNCONFIGURED",
      skillVersion: LEARNING_INSIGHT_TASK_A_SKILL_VERSION,
      promptVersion: LEARNING_INSIGHT_TASK_A_PROMPT_VERSION,
      rulePackVersions: [LEARNING_INSIGHT_TASK_A_VERSION],
      contextIds: [
        courseKey,
        input.course_issue_bundle.current_course_id,
        "evidence-mode:" + evidenceMode
      ],
      evidenceIds: input.evidence_catalog.map((item) => item.evidence_ref),
      inputHash,
      status: configured ? "RUNNING" : "FAILED",
      errorCode: configured ? null : "AI_ANALYSIS_NOT_CONFIGURED",
      errorMessage: configured ? null : "AI analysis model is not configured.",
      completedAt: configured ? null : new Date()
    })
    .returning();

  if (!configured) throw new Error("AI_ANALYSIS_NOT_CONFIGURED");

  let rawModelOutput: unknown = null;

  try {
    const caller = dependencies.callModel ?? callConfiguredChatJson;
    const basePayload = {
          COURSE_ISSUE_BUNDLE: input.course_issue_bundle,
          COURSE_ISSUE_TIMELINE: input.course_issue_timeline,
          DATA_AVAILABILITY: input.data_availability,
          DETERMINISTIC_METRICS: input.deterministic_metrics,
          EVIDENCE_CATALOG: input.evidence_catalog,
          CURRENT_COURSE: input.current_course_snapshot,
          CURRICULUM_CATALOG: input.curriculum_catalog,
          ADJACENT_COURSES: input.adjacent_course_summaries,
          OUTPUT_REQUIREMENT: {
            return_json_only: true,
            schema: LEARNING_INSIGHT_TASK_A_SCHEMA_VERSION,
            allowed_top_level_fields: [
              "schema_version",
              "decision",
              "problem_summary",
              "root_causes",
              "courses",
              "targets",
              "observation_note"
            ],
            decision_enum: [
              "CHANGE_RECOMMENDED",
              "CONTINUE_OBSERVING",
              "NO_CHANGE_NEEDED",
              "INSUFFICIENT_EVIDENCE"
            ],
            root_cause_type_enum: Array.from(ROOT_CAUSE_TYPES),
            course_action_enum: Array.from(COURSE_ACTIONS),
            exact_shape: {
              schema_version: LEARNING_INSIGHT_TASK_A_SCHEMA_VERSION,
              decision: "CHANGE_RECOMMENDED | CONTINUE_OBSERVING | NO_CHANGE_NEEDED | INSUFFICIENT_EVIDENCE",
              problem_summary: "string",
              root_causes: [
                {
                  type: "root_cause_type_enum 中的一项",
                  description: "string",
                  evidence_refs: ["evidence_ref"]
                }
              ],
              courses: [
                {
                  course_id: "curriculum_catalog 中存在的 course_id",
                  action: "MODIFY | REVIEW_ONLY | NOT_RELEVANT",
                  reason: "string",
                  evidence_refs: ["evidence_ref"]
                }
              ],
              targets: [
                {
                  course_id: "courses 中已经声明的 course_id",
                  step: 1,
                  area: "string",
                  problem: "string",
                  change_goal: "string",
                  evidence_refs: ["evidence_ref"]
                }
              ],
              observation_note: null
            }
          }
        };
    let diagnosis: LearningIssueDiagnosisV2 | null = null;
    let validationError: unknown = null;
    let attempts = 0;
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      attempts = attempt;
      const result = await caller(
        {
          systemPrompt:
            attempt === 1
              ? SYSTEM_PROMPT
              : SYSTEM_PROMPT +
                " 上一次输出未通过确定性校验。必须修正为最小现有字段表达，不得新增任何结构、练习、卡片、题目、步骤或说明区；严格遵守输出 Schema。",
          userPayload:
            attempt === 1
              ? basePayload
              : {
                  ...basePayload,
                  VALIDATION_RETRY: {
                    attempt,
                    validation_error: errorCode(validationError),
                    instruction:
                      "只修正导致校验失败的部分；不要扩大修改范围，不要增加新结构。"
                  }
                },
          temperature: 0.1,
          timeoutMs: 120000
        },
        { config: configured }
      );
      rawModelOutput = result.data;
      try {
        diagnosis = validateLearningIssueDiagnosisV2(result.data);
        validateLearningIssueDiagnosisReferences(diagnosis, input);
        break;
      } catch (error) {
        validationError = error;
        if (attempt === 2) throw error;
      }
    }
    if (!diagnosis) throw validationError ?? new Error("TASK_A_VALIDATION_FAILED");

    await db
      .update(aiRuns)
      .set({
        status: "SUCCEEDED",
        rawOutput: diagnosis,
        validatorResult: {
          valid: true,
          taskVersion: LEARNING_INSIGHT_TASK_A_VERSION,
          schemaVersion: LEARNING_INSIGHT_TASK_A_SCHEMA_VERSION,
          attempts
        },
        completedAt: new Date()
      })
      .where(eq(aiRuns.id, run.id));

    return {
      diagnosis,
      aiRunId: run.id,
      inputHash
    };
  } catch (error) {
    await db
      .update(aiRuns)
      .set({
        status: "FAILED",
        rawOutput: rawModelOutput,
        errorCode: errorCode(error),
        errorMessage: errorMessage(error),
        validatorResult: { valid: false },
        completedAt: new Date()
      })
      .where(eq(aiRuns.id, run.id));
    throw error;
  }
}

export async function getCurrentLearningInsightTaskA(
  courseKey: string,
  evidenceMode: EffectiveEvidenceMode = "PRODUCTION"
) {
  const rows = await getDatabase()
    .select({
      id: aiRuns.id,
      modelProvider: aiRuns.modelProvider,
      model: aiRuns.model,
      rawOutput: aiRuns.rawOutput,
      validatorResult: aiRuns.validatorResult,
      createdAt: aiRuns.createdAt,
      completedAt: aiRuns.completedAt,
      contextIds: aiRuns.contextIds
    })
    .from(aiRuns)
    .where(
      and(
        eq(aiRuns.taskType, LEARNING_INSIGHT_TASK_A_TASK_TYPE),
        eq(aiRuns.status, "SUCCEEDED")
      )
    )
    .orderBy(desc(aiRuns.createdAt))
    .limit(100);

  const row = rows.find(
    (item) =>
      Array.isArray(item.contextIds) &&
      item.contextIds.includes(courseKey) &&
      item.contextIds.includes("evidence-mode:" + evidenceMode)
  );
  if (!row) return null;

  const diagnosis = validateLearningIssueDiagnosisV2(row.rawOutput);
  return {
    aiRunId: row.id,
    diagnosis,
    modelProvider: row.modelProvider,
    model: row.model,
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null
  };
}

# LEARNING-SPEC-002 — Multi-type Lesson Validation

Status: COMPLETE

## Goal

验证 `docs/LEARNING_SPEC.md` 是否能覆盖不同 Lesson Type，并识别 Course Builder Skill 之前必须补齐的确定性 Runtime 能力。

## Validation Samples

### CONCEPT — ai-literacy / memory-rag

```text
Explain → Example → Check → Review → Capability
```

- practiceMode = NONE
- realAiOperation = NONE
- completionGates = CHECK
- Spec: PASS
- Runtime: NEEDS_RUNTIME
- blocker: REQUIRED_CHECK_DATA_NOT_PROVISIONED

### APPLICATION — chatgpt-worker / writing-files

```text
Explain → Example → Check → Practice → Review → Capability
```

- practiceMode = INDEPENDENT
- realAiOperation = REQUIRED
- realAiEvidence = ARTIFACT
- completionGates = CHECK + PRACTICE + REAL_AI
- Spec: PASS
- Runtime: NEEDS_RUNTIME

Blockers:

```text
REQUIRED_CHECK_DATA_NOT_PROVISIONED
REQUIRED_PRACTICE_DATA_NOT_PROVISIONED
REAL_AI_COMPLETION_GATE_NOT_IMPLEMENTED
REAL_AI_EVIDENCE_NOT_IMPLEMENTED:ARTIFACT
GENERIC_PRACTICE_SUBMISSION_SCHEMA_NOT_IMPLEMENTED
```

### PRACTICE — ai-workflow / task-decomposition

```text
Explain → Example → Practice → Review → Capability
```

- practiceMode = INDEPENDENT
- realAiOperation = NONE
- completionGates = PRACTICE
- Spec: PASS
- Runtime: NEEDS_RUNTIME

Blockers:

```text
REQUIRED_PRACTICE_DATA_NOT_PROVISIONED
GENERIC_PRACTICE_SUBMISSION_SCHEMA_NOT_IMPLEMENTED
```

## Machine-readable Contract

新增 `lib/learning/lesson-spec.ts`、`lib/learning/lesson-spec-samples.ts`、`scripts/validate-learning-spec.ts` 与 `npm run learning:spec:check`。

Contract 固定：CONCEPT / APPLICATION / PRACTICE / PROJECT；NONE / GUIDED / REQUIRED；Real AI Evidence（NONE / USER_CONFIRMATION / ARTIFACT / SYSTEM_RESULT）；Completion Gate（CHECK / PRACTICE / DELIVERABLE / REAL_AI）；标准 Step 顺序；Lesson Type-specific deterministic validation；Spec Validity 与 Current Runtime Readiness 分离。

## Core Fix

验证发现正式 Completion Core 原来只执行 required Practice Gate，没有执行 required Check Gate。

本任务新增：`hasPassedRequiredChecks()` → `setLessonCompletion()` → `CHECK_REQUIRED` → Progress API 409 → LessonCompleteButton 明确提示。没有 required Check 的 Lesson 行为不变。

## Spec Refinement

`real_ai_operation = REQUIRED` 不能只是一句教学说明，必须同时定义 `real_ai_evidence != NONE`，并且 `completion_gates` 包含 `REAL_AI`。Evidence 类型固定为 USER_CONFIRMATION / ARTIFACT / SYSTEM_RESULT。当前 Runtime 尚未实现 REAL_AI Gate / evidence persistence。

## Main Finding

`docs/LEARNING_SPEC.md` 已能表达 CONCEPT / APPLICATION / PRACTICE 三种真实课程结构，说明课程建造规范可以继续作为未来 Course Builder Skill 的输入 Contract。

当前正式 Runtime 仍有两个基础缺口：

1. Practice Submission Runtime 只支持 `TASK_BRIEF_V1`，不能承载不同课程练习结构；
2. REQUIRED Real AI Operation 还没有统一 evidence + Completion Gate Runtime。

因此不能直接进入“一个 Skill 批量完善所有课程”。

## No Scope Expansion

- No DB Schema / Migration
- No remote data mutation
- No Access Core change
- No bulk course migration
- No Course Builder Skill implementation
- No fake external AI execution

## Validation

```text
npm run learning:spec:check PASS
npm run typecheck           PASS
npm run build               PASS
Production build            30 static pages
CHECK_HELPER                 PASS
CORE_GATE                    PASS
API_ERROR                    PASS
UI_ERROR                     PASS
```

现有非阻塞 autoprefixer warning 保持不变。

## Next

`LEARNING-RUNTIME-001 — Generic Lesson Runtime Foundation`

先让 Runtime 能稳定执行 Lesson Spec，再进入 Course Builder Skill。

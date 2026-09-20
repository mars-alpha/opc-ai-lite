# LEARNING-RUNTIME-001 — Generic Lesson Runtime Foundation

Status: COMPLETE

## Goal

把 `LEARNING_SPEC` 的 Lesson Contract 接到可复用 Runtime，移除 `task-brief` 五字段对正式 Practice Runtime 的硬绑定，并建立 Check / Practice / REAL_AI 的确定性服务端边界。

## Implemented

### Generic Lesson Runtime

- `lib/learning/lesson-runtime.ts`：Lesson Spec → Runtime Plan。
- `lib/learning/lesson-spec-registry.ts`：当前 Pilot Registry 只注册 `memory-rag` 与 `task-decomposition`。
- `/api/learning/runtime`：返回 Runtime Read Model、Gate 状态、configurationReady 与 blockers。
- `GenericLessonRuntimePanel`：按 Runtime Plan 组合 required Check / Practice / Real AI 验收。
- `task-brief` 保留 Reference Lesson 专用 Guided UX，不机械迁移。

### Generic Practice Contract

Practice Submission 当前支持 `TASK_BRIEF_V1` 与 `STRUCTURED_TEXT_V1`。后者支持 1–12 个结构化文本字段；字段定义和提交内容均做确定性校验。

`rulePracticeEvaluator` 已改为通用 `Record<string, string>` + string rubric key，旧 `TASK_BRIEF_V1` 保持兼容。

### Pilot Definitions

`memory-rag` 已新增 required SINGLE_CHOICE Check seed 定义；`task-decomposition` 已新增 required `STRUCTURED_TEXT_V1` Practice seed 定义。

本任务没有执行远程 `db:seed`。因此代码与 seed definition 已准备，但正式数据库 Interactive Data Provisioning 仍待下一阶段。

### Completion Core

已注册且 configurationReady 的 Lesson Spec 可由服务端确定性执行 CHECK / PRACTICE / REAL_AI Gate。未完成配置的 Spec 不会突然接管旧课程；Runtime Read Model 会暴露 blockers 并保持 staged rollout。

### Real AI Evidence Boundary

没有新增数据库表；Evidence 复用现有 `learning_events`。

当前支持：
- `USER_CONFIRMATION`：用户明确声明完成真实 AI 操作。
- `SYSTEM_RESULT`：只能由可信服务端 Runtime 写入。

`ARTIFACT` 保留在 Lesson Spec Contract，但当前 Runtime 明确不支持。仓库没有正式 Artifact Resolver / Artifact Source of Truth，所以不接受用户手填 URL / Artifact ID 作为完成证明，`writing-files` 也不会进入 Runtime Registry。

### Access Boundary

`/api/learning/interactive` 现在遵守 Lesson Access Core。只有既有 `chatgpt-worker/task-brief` Reference Preview 保留明确白名单体验。锁定课程不会通过 Interactive API 泄露 Check / Practice 内容。

## No Scope Expansion

- No DB Schema / Migration
- No remote seed / deploy / Provider call
- No Access Core modification
- No bulk lesson migration
- No Course Builder Skill

## Validation

```text
npm run learning:runtime:check PASS
TASK_BRIEF_V1                  PASS score=94
STRUCTURED_TEXT_V1             PASS score=98
MISSING_FIELD_REJECTED         PASS
MEMORY_RAG_PLAN                PASS
TASK_DECOMPOSITION_PLAN        PASS
WRITING_FILES_REAL_AI_PLAN     PASS
REAL_AI_EVIDENCE_BOUNDARY      PASS
RUNTIME_REGISTRY_BOUNDARY      PASS

npm run learning:spec:check    PASS
npm run typecheck              PASS
npm run build                  PASS
Production build               30 static pages

ARTIFACT_UNSUPPORTED           PASS
WRITING_NOT_REGISTERED         PASS
ARTIFACT_REJECTED              PASS
INTERACTIVE_ACCESS             PASS
INTERACTIVE_API_403            PASS
```

现有 autoprefixer `end` warning 保持非阻塞。

## Current Runtime Readiness

```text
memory-rag
→ code/seed ready
→ runtime data provisioning pending

task-decomposition
→ code/seed ready
→ runtime data provisioning pending

writing-files
→ Spec valid
→ ARTIFACT evidence resolver missing
→ intentionally not runtime-registered
```

## Next

`LEARNING-RUNTIME-001-A — Pilot Provisioning & Acceptance`

下一步需要在用户明确授权后，把两个 Pilot 的 seed 写入正式数据库，再做真实 Check / Practice / Completion Gate Runtime Acceptance。通过后再评估 Course Builder Skill。

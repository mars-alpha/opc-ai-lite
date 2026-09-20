# LEARNING-RUNTIME-001-A — Pilot Provisioning & Acceptance

Status: COMPLETE

## Goal

把 `memory-rag` 与 `task-decomposition` 两个 Generic Runtime Pilot 的正式 Interactive Data 写入当前生产数据库，并通过真实 HTTP Runtime 验收 Check / Practice / Completion Gate / Access 边界。

## Provisioning

新增窄范围、幂等工具：

- `scripts/provision-learning-runtime-pilots.ts`
- `npm run learning:runtime:pilots`

默认只读；只有同时提供：

```text
--apply
--confirm=LEARNING-RUNTIME-001-A
```

才允许写入。

没有运行全量 `db:seed`。

正式写入：

```text
memory-rag
check_memory_rag_source
→ SINGLE_CHOICE
→ required=true
→ PUBLISHED

task-decomposition
practice_task_decomposition_nodes
→ LESSON_PRACTICE
→ INHERIT
→ STRUCTURED_TEXT_V1
→ required=true
→ passScore=80
→ PUBLISHED
```

## Acceptance

新增：

- `scripts/accept-learning-runtime-pilots.ts`
- `npm run learning:runtime:accept`

Acceptance 通过 3001 的真实 HTTP API 执行，不绕过 Runtime。

### memory-rag

```text
registered=true
configurationReady=true
enforcementActive=true
required Check configured
未通过 Check → 409 CHECK_REQUIRED
答对 RAG → Check Gate PASS
完成 Lesson → PASS
```

### task-decomposition

使用一次性测试用户，仅为测试用户写入前置 Stage 完成状态。

```text
registered=true
configurationReady=true
enforcementActive=true
required Practice configured
未通过 Practice → 409 PRACTICE_REQUIRED
提交 STRUCTURED_TEXT_V1
→ Rule Evaluation PASSED
→ Practice Gate PASS
→ 完成 Lesson PASS
```

### Boundary Regression

```text
TASK_BRIEF_REFERENCE_COMPAT=PASS
ACCESS_BOUNDARY=PASS
WRITING_ARTIFACT_BOUNDARY=PASS
```

- anonymous `ai-workflow/task-decomposition` 仍被 Stage prerequisite 阻断；
- `task-brief` Reference Preview 保持可用；
- `writing-files` 仍未注册 Generic Runtime；
- ARTIFACT evidence 仍 unsupported。

## Test Data Cleanup

Acceptance 使用一次性测试用户 / identity / session。

删除测试用户后通过 FK cascade 清理其：

- lesson progress
- check response
- practice submission
- practice evaluation
- learning events
- session / identity

结果：

```text
TEST_DATA_CLEANUP=PASS
```

单个测试用户未达到 Course Insight 聚合阈值，不产生行为洞察污染。

## Validation

```text
Pilot remote precheck        PASS
Pilot provisioning           PASS
Pilot remote postcheck       PASS

npm run typecheck            PASS
npm run learning:runtime:check PASS
npm run build                PASS
Production build             30 static pages

MEMORY_RUNTIME_ACCEPTANCE    PASS
MEMORY_CHECK_GATE            PASS
WORKFLOW_RUNTIME_ACCEPTANCE  PASS
WORKFLOW_PRACTICE_GATE       PASS
STRUCTURED_TEXT_V1_REMOTE    PASS
TASK_BRIEF_REFERENCE_COMPAT  PASS
ACCESS_BOUNDARY              PASS
WRITING_ARTIFACT_BOUNDARY    PASS
TEST_DATA_CLEANUP            PASS
```

现有 autoprefixer `end` warning 保持非阻塞。

## Out of Scope

- No Schema / Migration
- No Access Core change
- No bulk course migration
- No writing-files ARTIFACT Runtime
- No deploy
- No Provider call
- No Course Builder Skill implementation

## Next

`COURSE-BUILDER-SKILL-001 — OPC Course Builder Skill v0.1`

下一步只建立最小 BUILD / IMPROVE Structured Draft Contract，并用少量现有课程验证；Skill 不直接发布 Production Course。

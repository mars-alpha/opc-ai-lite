# TRACK01-T11-T20-BATCH-START-001 — T1-11～T1-20 Batch Start

Status: **SUPERSEDED_BY_TRACK01-T11-T20-WORKFLOW-BATCH-001 / HISTORICAL_ONLY**

> Historical note: 本文件只记录 Workflow Batch 之前的 Formal Brief 启动阶段。当前状态必须读取 `docs/CURRENT_SYSTEM_FACTS.md` 与 `docs/task-results/TRACK01-T11-T20-WORKFLOW-BATCH-001.md`；不得从本文件恢复当前课程生产状态。

## Scope

一次性启动 Track 01 T1-11～T1-20 的 Formal Brief / Knowledge Boundary，不进入 Runtime，不修改前端 UI / Renderer / CSS。

## Result

新增：

- `docs/learning/TRACK01_T11_T20_FORMAL_BRIEFS_V1.md`
- `docs/learning/DEFERRED_KNOWLEDGE_LEDGER_V1.md`
- `scripts/validate-track01-t11-t20-batch.ts`

T1-11～T1-20 已覆盖：

- Phase 4：API / Structured Output & Schema / Function Calling & Tool Use / MCP
- Phase 5：Skill / Workflow & Automation / Agent
- Phase 6：Multimodal / Coding-Browser-Computer Use / Privacy-Permissions-HITL

每节均明确：

- Primary Knowledge Point
- Main Learner Question
- 必须教清
- 不得展开
- 六步教学责任
- 下一课连续性

## Frontend boundary

固定：

- USE_EXISTING_UNIFIED_LESSON_SHELL_ONLY
- NO_NEW_UI
- NO_NEW_RENDERER
- NO_CSS_CHANGE
- 不为知识表达新增交互控件

若当前基础课和现有 Shell 无法自然讲清，不扩展前端，而是进入 Deferred Knowledge Ledger。

## Deferred planning

Deferred Knowledge Ledger 使用：

- SUPPORTING_KNOWLEDGE
- DEFER_TO_LATER_TRACK
- OUT_OF_SCOPE

当前 Deferred 项已经规划到 Track 02～05，包括 API 工程、Schema 工程、Tool reliability、MCP implementation、Skill lifecycle、Workflow orchestration、Agent engineering、Multimodal pipeline、Browser/Computer Use automation、权限与企业安全治理。

Ledger 已加入 `COURSE_PRODUCTION_RULE_SOURCES`，Workflow 每次运行读取最新版本。

## Next

该下一阶段已经完成：T1-11～T1-20 已由 Workflow 一次性生成 Draft 并通过 Deterministic Validation。当前 Gate = Human Review；本段只保留历史过程。

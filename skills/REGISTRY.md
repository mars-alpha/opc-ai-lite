# OPC Skill Registry

Status: **ACTIVE_REGISTRY_V1**

本文件只登记已经实际落盘的 Skill。规划中的 Skill 不视为已实现。

## Registry

| Skill ID | Version | Status | Single Responsibility | Primary Output | Human Review | Implementation |
| --- | --- | --- | --- | --- | --- | --- |
| course-builder | 0.1.0 | HISTORICAL_PROVENANCE | 早期 Structured Draft / Improvement Proposal 契约 | Historical evidence only | N/A — not executable in current workflow | `skills/course-builder/_historical-v0.1.ts` |
| course-builder | 0.2.0 | HISTORICAL_PROVENANCE | 早期 Beginner Quality 对齐版本 | Historical evidence only | N/A — not executable in current workflow | `skills/course-builder/_historical-v0.2.ts` |
| course-builder | 1.0.0 | CURRENT_DEFAULT | 使用最新 Rule Sources 生成符合稳定 Course Builder Contract 的课程 Draft / Improvement Proposal | Quality-controlled Structured Lesson Draft / Improvement Proposal | Required before production use | `skills/course-builder/v1.ts` |

只有 `CURRENT_DEFAULT` 可以被 `skills/course-builder/index.ts` 解析为当前生产 Skill；`HISTORICAL_PROVENANCE` 文件仅用于追溯，不得被 Workflow、Orchestrator、validator 或新课程直接 import。

## Registry Rules

每个新 Skill / Version 落盘时必须登记：

- Skill ID
- Version
- Status
- Single Responsibility
- Primary Output
- Human Review Requirement
- Implementation path

Skill Registry 不拥有业务状态。正式课程生产的当前版本由 `skills/course-builder/index.ts` 解析；Stable Workflow 只依赖 Contract 与标准 Gate，不直接绑定具体 Skill version。

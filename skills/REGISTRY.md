# OPC Skill Registry

Status: **ACTIVE_REGISTRY_V1**

本文件只登记已经实际落盘的 Skill。规划中的 Skill 不视为已实现。

## Registry

| Skill ID | Version | Status | Single Responsibility | Primary Output | Human Review | Implementation |
| --- | --- | --- | --- | --- | --- | --- |
| course-builder | 0.1.0 | LEGACY_COMPATIBLE | 将受控课程上下文生成可校验的课程 Draft / Improvement Proposal | Structured Lesson Draft / Improvement Proposal | Required before production use | `skills/course-builder/v0.1.ts` |
| course-builder | 0.2.0 | HISTORICAL_PROVENANCE | 在 v0.1 边界上生成符合 Beginner Quality Profile 的课程 Draft / Improvement Proposal | Quality-controlled Structured Lesson Draft / Improvement Proposal | Required before production use | `skills/course-builder/v0.2.ts` |
| course-builder | 1.0.0 | CURRENT_DEFAULT | 使用最新 Rule Sources 生成符合稳定 Course Builder Contract 的课程 Draft / Improvement Proposal | Quality-controlled Structured Lesson Draft / Improvement Proposal | Required before production use | `skills/course-builder/v1.ts` |

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

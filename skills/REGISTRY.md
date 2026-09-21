# OPC Skill Registry

Status: **ACTIVE_REGISTRY_V1**

本文件只登记已经实际落盘的 Skill。规划中的 Skill 不视为已实现。

## Registry

| Skill ID | Version | Status | Single Responsibility | Primary Output | Human Review | Implementation |
| --- | --- | --- | --- | --- | --- | --- |
| course-builder | 0.1.0 | LEGACY_COMPATIBLE | 将受控课程上下文生成可校验的课程 Draft / Improvement Proposal | Structured Lesson Draft / Improvement Proposal | Required before production use | `skills/course-builder/v0.1.ts` |
| course-builder | 0.2.0 | CURRENT_DEFAULT_FOR_NEW_BEGINNER | 在 v0.1 边界上生成符合 Beginner Quality Profile 的课程 Draft / Improvement Proposal | Quality-controlled Structured Lesson Draft / Improvement Proposal | Required before production use | `skills/course-builder/v0.2.ts` |

## Registry Rules

每个新 Skill / Version 落盘时必须登记：

- Skill ID
- Version
- Status
- Single Responsibility
- Primary Output
- Human Review Requirement
- Implementation path

Skill Registry 不是运行时路由表，不拥有业务状态，也不自动决定使用哪个 Skill。

具体调用版本由对应 Workflow / 工程任务明确选择。

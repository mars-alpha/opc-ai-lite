# OPC Skill Registry

Status: **ACTIVE_REGISTRY_V1**

只登记 current 可执行 Skill。历史 Skill 通过 Git 追溯。

| Skill ID | Version | Status | Responsibility | Output | Human Review | Implementation |
| --- | --- | --- | --- | --- | --- | --- |
| course-builder | 1.0.0 | CURRENT_DEFAULT | 根据 Current Course Context + Rule Sources 生成课程 Draft / Improvement Proposal | Structured Lesson Draft / Improvement Proposal | Required | `skills/course-builder/v1.ts` |
| event-relation | 1.0.0 | CURRENT / RUNTIME_OPT_IN | 判断已采证据的跨事件关系，不拥有归并或事实权 | Typed relation pairs + evidence citations | Core validates; no per-event Human Gate | `skills/event-relation/v1.ts` |
| event-expression | 1.0.0 | CURRENT / RUNTIME_OPT_IN | canonical事件中文标题、摘要与理由；仅表达，无业务状态权 | Evidence-bound expression + uncertainty | Core validates; no per-event Human Gate | `skills/event-expression/v1.ts` |
| practice-draft | 0.1.0 | CURRENT | 把 Reviewed Knowledge 转成可审核的 LATEST_PRACTICE Draft | Structured Practice Draft | Required before publish | `skills/practice-draft/v0.1.ts` |

规则：
- Skill 必须版本化；
- Skill 不拥有业务状态；
- 新版本先验证，再切 current；
- 已退役实现不留 current 副本，使用 Git history 追溯；
- 具体治理见 `docs/SKILL_GOVERNANCE.md`。

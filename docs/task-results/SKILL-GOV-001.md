# SKILL-GOV-001 — Skill Responsibility & Orchestration Baseline

Status: COMPLETE_GOVERNANCE_BASELINE_V1

## Goal

固化 OPC 后续 Skill 开发、拆分、版本化和 Workflow 联动规则，使课程、AI 日报、进阶练习及未来内容生产 Skill 可以独立优化而不影响项目架构。

## Deliverables

新增：

- `docs/SKILL_GOVERNANCE.md`
- `skills/REGISTRY.md`

并更新：

- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/CURRENT_SYSTEM_FACTS.md`
- `PROJECT_STATUS.md`
- `TASKS.md`

## Locked Rules

1. 一个 Skill = 一个单一职责 + 一个主要输出。
2. 可独立验收的多个输出默认拆成多个 Skill。
3. Skill 是 Architecture-neutral / Content-only Intelligence Layer。
4. Skill 可以消费 Contract，但不得重定义 Schema / API / Runtime / DB / Workflow / Permission / Publish / Completion。
5. Skill 若发现架构能力不足，只能输出 Proposal / Unsupported，架构变化必须另开工程任务。
6. Skill 默认不直接调用 Skill；Workflow 负责顺序和 handoff。
7. 确定性采集、过滤、阈值、状态、权限等 Code First；语义理解/生成/判断才使用 Skill。
8. 每个开发任务实现前必须执行 Skill Decision Gate：CODE_ONLY / EXISTING_SKILL / NEW_SKILL_NEEDED。
9. NEW_SKILL_NEEDED 必须先形成 Mini Skill Proposal，与产品负责人讨论确认后才创建最小 v0.1。
10. Skill 必须 Schema First、版本化、可独立验收、可独立升级。
11. 自动化增加不改变后台审核与 Core Authority。

## Mini Skill Proposal

新 Skill 实现前必须定义：

- Skill ID / Version
- Single Responsibility
- Primary Output
- Input Schema
- Output Schema
- Forbidden Actions
- Acceptance Criteria
- Failure Strategy
- Human Review Requirement
- Called By Workflow
- Why Code Is Not Enough
- Why Existing Skill Cannot Be Reused

## Registry

当前只登记真实存在的：

- course-builder v0.1.0 — legacy compatible
- course-builder v0.2.0 — current default for new Beginner production

没有把未来 article-summary / article-image / article-to-ppt 等示例登记为已实现。

## Boundary

本任务没有：

- 新建通用 Skill Platform；
- 新增 Runtime；
- 新增 DB / Migration；
- 改现有 Workflow；
- 接入 Provider；
- 修改业务状态或发布逻辑。

## Validation

Governance / docs-only task：

- git diff --check
- full diff review
- no build required because no business code changed

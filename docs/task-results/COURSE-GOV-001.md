# COURSE-GOV-001 — Course Production Governance Baseline

Status: COMPLETE_GOVERNANCE_BASELINE_V1

## Goal

在 Foundation Stage 2 生产前，锁定正式课程从 Curriculum Brief 到 Human Review、Runtime Provisioning、AVAILABLE 的治理规则，防止 Catalog、Preview、Skill 与 Runtime 状态再次漂移。

## Deliverables

新增：
- `docs/learning/COURSE_PRODUCTION_GOVERNANCE_V1.md`
- `docs/learning/COURSE_PRODUCTION_PROVENANCE_TEMPLATE.md`

更新：
- `AGENTS.md`
- `docs/CURRENT_SYSTEM_FACTS.md`
- `PROJECT_STATUS.md`
- `TASKS.md`

## Locked lifecycle

```text
Curriculum / Knowledge Map
→ Formal Lesson Brief
→ Course Builder
→ Code Validation
→ Draft Preview
→ Human Review
→ Runtime Provisioning
→ Runtime Acceptance
→ AVAILABLE
```

现有 Catalog enum 不扩展：
- curriculumStatus = PLANNED / BRIEF_READY / IN_PRODUCTION / AVAILABLE
- availability = COMING_SOON / LOCKED / AVAILABLE

HUMAN_REVIEW_PASS 与 RUNTIME_READY 只是治理 Gate，不新增为 Catalog enum。

## Provenance

每节生产课程必须追溯：
- curriculum / brief source + version
- production batch
- 单一 Skill ID + Version
- quality standard/profile
- draft version
- Human Review status/reference
- Runtime contract/readiness
- Catalog state

明确禁止复合使用 course-builder v0.1 + v0.2；当前新 Beginner generation 默认使用 course-builder@0.2.0。

## Rework

Human Review FAIL：
- canonical lesson identity 不变
- 回到 IN_PRODUCTION
- 新 Draft version
- 重新 Code Validation / Preview / Human Review

Skill 输出不足：
- 独立 Skill improvement task
- 新 Skill version
- 不静默改 Prompt

Architecture gap：
- 独立 engineering task
- Skill 只提 Proposal
- 当前 Lesson 保持 IN_PRODUCTION

## Batch

继续沿用已锁定 Foundation 规则：
- Curriculum 可以完整定义 28 节
- Production Batch 默认 3–5 节
- Batch 不重新定义 Curriculum 范围
- Stage 2 的 4 节可作为一个完整 Production Batch

## Boundary

本任务没有：
- 生产 Stage 2 内容
- 修改 Catalog enum
- 修改 Runtime
- 修改 DB / migrations
- 接 Provider
- 把任何 Foundation Lesson 设为 AVAILABLE

## Validation

Docs/governance-only:
- git diff --check
- full diff review
- no build required

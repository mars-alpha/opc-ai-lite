# COURSE-PRODUCTION-003 — Foundation Stage 2 Collaboration Batch

Status: **TECHNICAL_ACCEPTANCE_PASS_HUMAN_REVIEW_PENDING**

## Scope

Foundation Stage 2 / F2-01～F2-04：

1. beginner-prompt — Prompt：怎样把想做的事情说清楚
2. beginner-context — Context：AI 只知道你这次给它看到的东西
3. beginner-iteration — 第一次结果不对，怎样继续让 AI 改好
4. beginner-result-check — AI 的结果什么时候能直接用，什么时候一定要检查

## Governance

Skill Decision: EXISTING_SKILL
Selected Skill: course-builder@0.2.0
Composite versions: forbidden
Quality: BEGINNER_LESSON_QUALITY_STANDARD_V1 / BEGINNER_QUALITY_V1
Human Review: required
Runtime provisioning: out of scope
Availability: remains COMING_SOON

## Implementation

新增：
- docs/learning/FOUNDATION_STAGE2_BRIEFS_V1.md
- docs/learning/FOUNDATION_STAGE2_PROVENANCE_V1.md
- fixtures/course-builder/beginner-foundation-stage2.ts
- scripts/accept-foundation-stage2.ts
- 四个 Draft Preview routes

共享 BeginnerFoundationDraftPreview 新增显式 skillVersion / batchLabel 参数；默认仍为 v0.1，Stage 1 历史 provenance 不被改写，Stage 2 显式传入 0.2.0。

Catalog F2-01～F2-04 已从 PLANNED 调整为 IN_PRODUCTION，availability 继续 COMING_SOON，无 Runtime mapping。

## Teaching boundaries

F2-01:
- Prompt = 把任务说清楚
- 不教万能模板 / System Prompt / Prompt Engineering

F2-02:
- Context = AI 当前任务真正看得到的信息
- 不教 Token / Context Window / Context Engineering

F2-03:
- 指出偏差 / 补信息 / 给参考 / 请求澄清
- 不教 Workflow / Agent 自动循环

F2-04:
- 按事实性 / 错误代价 / 可验证性决定检查力度
- 不教正式 Evaluation Framework / Test Set / Regression

## Validation

PASS:
- npm run course-builder:accept:foundation-stage2
- npm run course-builder:check
- npm run learning:shell:accept
- npm run typecheck
- npm run build
- Production build: 46 pages

No DB / migration / provider / Runtime provisioning / publish side effects.

## Human Review

Preview:
- /course-builder/preview/beginner-prompt
- /course-builder/preview/beginner-context
- /course-builder/preview/beginner-iteration
- /course-builder/preview/beginner-result-check

下一步只做 Human Review。通过后再决定 Runtime Provisioning，不自动 AVAILABLE。

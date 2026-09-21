# FOUNDATION-CONTINUITY-TRIAL-001-A — Learner-facing Language & Case Neutralization

Status: **COMPLETE_REVIEW_PENDING**

## Result

Refined learner-visible copy for the five Foundation Continuity Trial lessons without changing pacing, continuity architecture, Lesson IDs, Lesson Types, gates, Skill version, Runtime, Catalog status, or Artifact metadata.

## Learner-facing language rules applied

- Chinese-first learner copy.
- AI professional terms use Chinese（English） on first meaningful learner-facing occurrence, then Chinese is preferred.
- Internal production labels remain internal. Learner UI no longer uses English artifact labels such as AI First Draft / Better Draft / Task Brief / Context Pack / Context-enriched Draft / Iterated Draft as primary copy.
- Internal caseThread=OPC_SELF_MEDIA_AI_TOPIC remains unchanged.
- Learner-visible copy no longer repeatedly exposes OPC / 自媒体; the running case is expressed as a natural, portable real-content task.

Examples:
- 提示词（Prompt）
- 上下文（Context）
- 迭代（Iteration）
- AI 第一版草稿
- 改进后的草稿
- 任务说明
- 上下文资料包
- 补充资料后的草稿
- 迭代后的草稿

## Validation

PASS:
- course-builder:accept:continuity-trial
- learner-language acceptance
- case-neutralization acceptance
- course-builder:check
- beginner-quality
- unified lesson shell
- typecheck
- build
- 51 pages generated

## Boundary

No Skill code/schema changes.
No Runtime/DB/migration/catalog-state changes.
F1-03/F1-04/F2-04 remain outside this task.

Next: Human Review the same five Trial Preview routes with revised learner-facing language.

# TRACK01-T1-10-RUNTIME-001 — LessonSpec Registry, Runtime Provisioning & Acceptance

Status: **COMPLETE_RUNTIME_ACCEPTANCE_PASS / AVAILABLE**

Lesson: **T1-10 — 搜索（Search）与检索增强生成（RAG）**
Lesson ID: `t1-10-search-rag`
Reviewed Draft: **1.0.2-track01-t110-terminology**

## LessonSpec Registry

`lib/learning/track01-phase1-runtime.ts` 已接入：

- T1-10 Draft / Intro / Knowledge Depth / Reference Fill；
- `track01T110Spec`；
- `track01FormalLessonSpecs`；
- approved presentation；
- `track01T110RuntimeDefinition`；
- Phase 3 正式课程序列 T1-08 → T1-09 → T1-10。

Formal Registry validation:
- `FORMAL_LESSON_RUNTIME_REGISTRY=PASS`
- `FORMAL_LESSON_LEGACY_FALLBACK_FORBIDDEN=PASS`

## Database Runtime Provisioning

Provision command:

`npx tsx scripts/provision-track01-t110-runtime.ts --apply --confirm=TRACK01-PHASE3-T1-10-001`

Provisioned:
- runtime lesson: `lesson_foundation_ai_t1_10_search_rag`
- module: `phase3`
- lesson status: `PUBLISHED`
- order: `3`
- duration: `18`
- 3 required PUBLISHED Checks: SINGLE_CHOICE / TRUE_FALSE / MULTI_SELECT
- 1 optional PUBLISHED Practice: `practice_t1_10_search_rag`, `required=false`

Result: `T1_10_RUNTIME_PROVISION=PASS`

## Authenticated Runtime Acceptance

PASS:
- Runtime registered / configuration ready
- CONCEPT / CHECK-only Gate
- Check blocks Step 4 and Completion until mastery
- 3-question sequence
- optional Practice submission and evaluation
- Step 4 fields = 当前问题 / 检索范围 / 必须找到的证据 / 回答规则
- Reference Answer excludes field-title scaffolding
- currentStep resume
- completion persistence
- Search / RAG learner-facing presentation
- T1-09 → T1-10 navigation
- test data cleanup

Results:
- `T1_10_RUNTIME_REGISTERED=PASS`
- `T1_10_CHECK_ONLY_GATE=PASS`
- `T1_10_OPTIONAL_PRACTICE_RUNTIME=PASS`
- `T1_10_STANDARD_STEP4_FULL_FLOW=PASS`
- `T1_10_REFERENCE_ANSWER_WITHOUT_MAIN_TITLES=PASS`
- `T1_10_CURRENT_STEP_RESUME=PASS`
- `T1_10_COMPLETION_AFTER_CHECKS=PASS`
- `T1_10_PRESENTATION=PASS`
- `T1_09_TO_T1_10_NAVIGATION=PASS`
- `T1_10_RUNTIME_ACCEPTANCE=PASS`
- `T1_10_TEST_DATA_CLEANUP=PASS`

## Release decision

T1-10 has passed the full production chain and can be promoted to **AVAILABLE**.

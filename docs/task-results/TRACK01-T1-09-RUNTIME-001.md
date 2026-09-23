# TRACK01-T1-09-RUNTIME-001 — LessonSpec Registry & Runtime Provisioning

Status: **COMPLETE_RUNTIME_ACCEPTANCE_PASS / AVAILABLE**

Lesson: **T1-09 — 知识库（Knowledge Base）与事实源（Source of Truth）**
Lesson ID: `t1-09-knowledge-source`
Human Review source: `TRACK01-T1-09-HUMAN-REVIEW-001.md`

## Result

Human Review PASS 后，T1-09 已按正式生产链进入 LessonSpec Registry 与 Runtime Provisioning。

### LessonSpec Registry

`lib/learning/track01-phase1-runtime.ts` 已接入：
- T1-09 Draft / Intro / Knowledge Depth / Reference Fill；
- `track01T109Spec`；
- `track01FormalLessonSpecs`；
- approved presentation；
- `track01T109RuntimeDefinition`；
- Phase 3 正式课程序列 T1-08 → T1-09。

Formal Registry validation:
- `FORMAL_LESSON_RUNTIME_REGISTRY=PASS`
- `FORMAL_LESSON_LEGACY_FALLBACK_FORBIDDEN=PASS`

### Database Runtime Provisioning

Provision command:

`npx tsx scripts/provision-track01-t109-runtime.ts --apply --confirm=TRACK01-PHASE3-T1-09-001`

Provisioned:
- runtime lesson: `lesson_foundation_ai_t1_09_knowledge_source`
- lesson slug: `t1-09-knowledge-source`
- module: `phase3`
- lesson status: `PUBLISHED`
- 3 required PUBLISHED Checks:
  - SINGLE_CHOICE
  - TRUE_FALSE
  - MULTI_SELECT
- 1 optional PUBLISHED Practice:
  - `practice_t1_09_knowledge_source`
  - `required=false`

Provision script validation output:
- `T1_09_RUNTIME_PROVISION=PASS`

### Catalog

T1-09 Catalog mapping is now:
- `curriculumStatus=AVAILABLE`
- `availability=AVAILABLE`
- `runtimeCourseSlug=foundation-ai`
- `runtimeLessonId=t1-09-knowledge-source`

Runtime Acceptance 已通过，Catalog 已正式提升为 **AVAILABLE**。

## Runtime Acceptance

Authenticated Runtime Acceptance 已完成并 PASS：
- Runtime registered / configuration ready；
- Check-only Gate；
- 三题 Sequence；
- optional Practice；
- currentStep resume；
- Completion persistence；
- T1-08 → T1-09 navigation；
- test data cleanup。

结果：`T1_09_RUNTIME_ACCEPTANCE=PASS`。

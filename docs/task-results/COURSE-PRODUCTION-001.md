# COURSE-PRODUCTION-001 — Foundation Batch A Real Lessons

Status: TECHNICAL_ACCEPTANCE_PASS_HUMAN_REVIEW_PENDING

## Result

Foundation Batch A 的 4 节正式课程候选 Draft 已落盘并接入统一 Course Builder Preview：

1. foundation-ai-ml-generative-ai
2. foundation-llm-model-vs-product
3. foundation-training-inference
4. foundation-generation-retrieval-rules

四节全部：
- Lesson Type = CONCEPT
- 使用统一 EXPLAIN → EXAMPLE → CHECK → PRACTICE → REVIEW → CAPABILITY
- conceptMasteryBeforePractice = true
- Completion Gate = CHECK
- practiceMode = NONE
- Step 4 只做轻量参与，不增加正式 Gate
- Step 3 使用 SINGLE_CHOICE → TRUE_FALSE → MULTI_SELECT 三题 Mastery
- Preview 不写正式 Progress / Completion / Production DB

共享 Preview renderer：
- components/FoundationConceptDraftPreview.tsx

Draft fixture：
- fixtures/course-builder/foundation-batch-a.ts

Acceptance：
- scripts/accept-foundation-batch-a.ts

## Catalog

F1-01～F1-04 已从 BRIEF_READY 切换为 IN_PRODUCTION，但 availability 继续保持 COMING_SOON。
Human Review 未通过前不得切换 AVAILABLE。

## UI wording

学习路径页的“课程导航 / Course Navigation”已按 Human Review 改为“学习地图 / Learning Map”。

## Validation

- Foundation Batch A acceptance: PASS
- Course Builder contract: PASS
- Concept Mastery regression: PASS
- Three-question Mastery regression: PASS
- npm run typecheck: PASS
- npm run build: PASS
- no DB / migration / provider / publish side effect

## Human Review URLs

- /course-builder/preview/foundation-ai-ml-generative-ai
- /course-builder/preview/foundation-llm-model-vs-product
- /course-builder/preview/foundation-training-inference
- /course-builder/preview/foundation-generation-retrieval-rules

下一步先做 Human Review。通过后再决定逐节修订并进入正式化/Runtime provisioning，不直接批量发布。

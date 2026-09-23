# COURSE-PRODUCTION-001 — Foundation Batch A Real Lessons

Status: HISTORICAL_PEDAGOGY_REJECTED_ASSETS_REMOVED

## Historical result

该批次曾有 4 节课程候选 Draft 接入 Course Builder Preview，随后 Human Review 判定教学失败：

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

旧共享 Preview renderer、fixture 与 acceptance 均已删除，不再是可执行工程入口。

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

## Final disposition

对应 4 个旧 Preview URL 已删除。该批次不得继续 Human Review、Runtime Provisioning 或 AVAILABLE；不得通过本历史文档恢复旧实现。若主题重新进入正式课程，必须从当前 Curriculum / Formal Brief / Course Builder 重新生产。

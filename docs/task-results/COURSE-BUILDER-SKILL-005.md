# COURSE-BUILDER-SKILL-005 — Beginner Quality Alignment

Status: COMPLETE_V02_QUALITY_ALIGNED

## Goal

把已经通过 Human Review 的 Beginner Lesson Quality Standard 正式写回 Course Builder Skill，避免 Stage 2/3 后续课程重新出现结构正确但认知负担漂移的问题。

## Skill versioning

保留：
- skills/course-builder/v0.1.ts

新增：
- skills/course-builder/v0.2.ts

v0.2 继承 v0.1 的 BUILD / IMPROVE、Grounding、Six-Step、Three-Question Mastery、AI-tool-neutral 与 Core Authority Boundary，不删除历史兼容。

## Beginner Quality Profile

CourseBuilderPedagogy 新增可选 qualityProfile：

- id = BEGINNER_QUALITY_V1
- mainLearnerQuestion
- mainConcept
- allowedCoreTerms
- deferredTerms

v0.2 规则：
- audience=BEGINNER 的 BUILD 必须携带 qualityProfile；
- allowedCoreTerms 最多 2 个；
- Review 最多 3 条；
- Example 必须具备 Before / After；
- Capability 不得使用“理解了...”作为最终能力表达；
- deferredTerms 在用户可见课程内容中不得提前出现；
- 如果某术语就是当前课 Primary Knowledge Home，可以显式放入 allowedCoreTerms 后合法出现。

因此 Stage 1 可以阻止 Token / API / RAG 等术语泄漏，但 Stage 3 真正教授 Token 时可显式允许 Token，不会被全局禁词规则误杀。

## Deterministic validation

lib/learning/course-builder.ts 新增：
- CourseBuilderQualityProfile
- validateBeginnerQualityDraft()
- v0.2 BEGINNER profile requirement
- Review Packet skill version 0.1.0 / 0.2.0

质量校验只在 qualityProfile 存在时启用；旧 v0.1 fixtures 保持兼容。

## Skill prompt v0.2

v0.2 systemPrompt 固化：
- 1 个主问题
- 1 个主概念/判断
- 最多 1–2 个核心术语
- 1 个主要案例
- 第一屏从真实场景开始
- 示例先于定义
- CHECK 使用真实判断，不做术语考试
- APPLICATION 使用小而可完成的 Practice，适合时 COPY_TO_AI
- Review <= 3
- Capability 表达“现在能做什么”
- deferredTerms / allowedCoreTerms 按课程知识归属控制

## Acceptance

新增：
- scripts/accept-course-builder-beginner-quality.ts
- npm run course-builder:accept:beginner-quality

覆盖：
1. v0.2 BEGINNER 缺 qualityProfile → REJECT
2. Review > 3 → REJECT
3. deferred term 提前泄漏 → REJECT
4. 当前课显式 allowed core term → PASS
5. v0.1 legacy path → PASS

## Validation

- course-builder:accept:beginner-quality PASS
- course-builder:check PASS
- existing Beginner Batch acceptance PASS
- npm run typecheck PASS
- npm run build PASS
- 42 pages generated
- no DB / migration / provider / publish changes

## Next

后续新 Beginner 课程生产默认使用 Course Builder Skill v0.2 + BEGINNER_QUALITY_V1。

下一阶段可进入 Foundation Stage 2 课程生产，并以当前 Beginner Batch A 四节作为 Human Review 样板。

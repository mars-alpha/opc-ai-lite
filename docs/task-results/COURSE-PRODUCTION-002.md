# COURSE-PRODUCTION-002 — Beginner Batch A Rebuild

Status: TECHNICAL_ACCEPTANCE_PASS_HUMAN_REVIEW_PENDING

## Result

基于 CURRICULUM-005 Beginner Foundation Reframe，已重新生产 Foundation Stage 1 前四节：

1. beginner-ai-use-cases — AI 到底能帮我做什么
2. beginner-ai-result-quality — 为什么同一个 AI，有时好用、有时不好用
3. beginner-ai-can-be-wrong — AI 为什么会说错，而且还说得很像真的
4. beginner-ai-product-map — AI 软件里的模型、搜索、文件和记忆是什么关系

新 Draft 与旧 COURSE-PRODUCTION-001 失败 Draft 使用不同 lessonId，不做原地修补。

## Beginner-first constraints

四节固定遵守：
- 示例先于定义
- 一节只解决一个学习者问题
- 单节最多 1–2 个新核心术语
- 中文直觉优先
- 第一屏从日常工作/使用场景开始
- CHECK 检查判断，不检查术语背诵
- PRACTICE 只使用贴近日常工作的轻任务
- REVIEW 仅 2–4 条可复用判断
- CAPABILITY 使用“现在能做什么”表达

Beginner Batch A 开场禁止引入 Training / Inference / Token / Embedding / Deterministic Logic / MCP / Agent Runtime 等后置机制概念。

## Lesson Types / Gates

F1-01 APPLICATION:
- CHECK + PRACTICE
- GUIDED Practice

F1-02 APPLICATION:
- CHECK + PRACTICE
- GUIDED Practice

F1-03 CONCEPT:
- CHECK
- 非 Gate 轻量 Practice Step

F1-04 CONCEPT:
- CHECK
- 非 Gate 轻量 Practice Step

四节均继续使用统一六步：
EXPLAIN → EXAMPLE → CHECK → PRACTICE → REVIEW → CAPABILITY

## Preview

共享 renderer：
- components/BeginnerFoundationDraftPreview.tsx

Draft fixture：
- fixtures/course-builder/beginner-foundation-batch-a.ts

Preview routes：
- /course-builder/preview/beginner-ai-use-cases
- /course-builder/preview/beginner-ai-result-quality
- /course-builder/preview/beginner-ai-can-be-wrong
- /course-builder/preview/beginner-ai-product-map

Preview 不写正式 Progress / Completion / Production DB。

## Catalog

新 F1-01～F1-04 已切换为 IN_PRODUCTION + COMING_SOON。
Human Review 通过前不得 AVAILABLE。

旧 COURSE-PRODUCTION-001 四个 Draft 继续保持：
PEDAGOGY_REJECTED / RETIRE_AS_FAILED_DRAFT_REFERENCE。

## Validation

- Beginner Batch A acceptance: PASS
- Course Builder contract: PASS
- Unified Lesson Shell acceptance: PASS
- npm run typecheck: PASS
- npm run build: PASS
- no DB / migration / provider / publish side effect

## Human Review

本轮重点不是技术完整度，而是：
1. 零基础用户是否第一屏就能理解
2. 是否仍有理论感/术语负担
3. 六步是否自然，不像“上课背知识”
4. 学完是否真的产生一点能马上使用 AI 的获得感

## Next

先做 Human Review 四节新 Preview。
通过后再逐节优化，并决定是否进入正式 Runtime provisioning。


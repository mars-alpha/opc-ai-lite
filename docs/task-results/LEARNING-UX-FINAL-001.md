# LEARNING-UX-FINAL-001 — Unified Lesson Shell Freeze

Status: COMPLETE_FROZEN_V1

## Goal

把已通过多轮 Human Review 的统一课程体验冻结为 `Unified Lesson Shell v1`，从“样板验证”进入“正式课程可批量建设”的稳定基线。

## Frozen

- 单一 Generic Lesson Shell；
- 六步顺序：EXPLAIN → EXAMPLE → CHECK → PRACTICE → REVIEW → CAPABILITY；
- 四字标签：建立直觉 / 讲透方法 / 检查理解 / 动手实操 / 复盘框架 / 能力获得；
- Steps 1–3 概念理解，Step 4 应用、Step 5 判断框架、Step 6 能力迁移；
- 新课程 Step 3 三题 Mastery Sequence；
- Desktop / Mobile 底部导航布局；
- Preview / Runtime 权限边界；
- 禁止 lesson slug / name Renderer 分支；
- 可选展示能力必须数据驱动，不得演化成第二套课程产品。

## Code Contract

新增：
- `lib/learning/unified-lesson-shell.ts`
- `scripts/accept-unified-lesson-shell.ts`
- `npm run learning:shell:accept`

`GenericLessonRuntimePanel` 的底部教学标签改为读取冻结配置，避免文案继续散落在组件中。

## Spec

新增：`docs/learning/UNIFIED_LESSON_SHELL_V1.md`

状态：`FROZEN_V1 / 1.0.0`。

后续普通 Course Builder / curriculum / content 任务不得顺手改变 Shell。需要改变时另开显式 UX / Runtime follow-up task。

## Out of Scope

- 正式课程目录；
- 新增真实课程；
- AI Provider；
- Remote migration；
- PROJECT Deliverable Runtime；
- Course Builder 自动发布。

## Validation

- `npm run learning:shell:accept` PASS
- `npm run learning:spec:check` PASS
- `npm run learning:runtime:check` PASS
- `npm run course-builder:check` PASS
- `npm run course-builder:accept:three-question-mastery` PASS
- `npm run course-builder:accept` PASS
- `npm run course-builder:accept:application` PASS
- `npm run course-builder:accept:practice` PASS
- `npm run course-builder:accept:project` PASS
- `npm run typecheck` PASS
- `npm run build` PASS — 34 static pages
- `git diff --check` PASS

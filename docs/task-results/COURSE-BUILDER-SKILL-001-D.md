# COURSE-BUILDER-SKILL-001-D — Six-Step Beginner Experience & Visual Hierarchy

Status: COMPLETE

## Goal

根据 Human Review，恢复更强的 6 步学习体验，并改善初学者课程的视觉层级和参与感。

## Decisions

- 常见行业专有名词可保留英文或缩写，第一次出现时按需要补充中文说明；不再强制全面中文优先。
- 初学者 CONCEPT 优先使用 6 步：EXPLAIN → EXAMPLE → CHECK → PRACTICE → REVIEW → CAPABILITY。
- CONCEPT 的 PRACTICE 可以是非验收型参与，不自动成为 PRACTICE Completion Gate。
- 正式完成条件仍可只由 CHECK 等 Core Gate 决定。

## Skill Foundations Changes

- 新增第 4 步轻量 PRACTICE：把固定方法复制到用户自己的 AI 软件中体验。
- 保持 practiceMode=NONE、Completion Gate=CHECK；该 Practice 是教学参与，不是正式提交/评分。
- Explain 减少大字号和连续文字。
- 为什么值得学使用重点底色。
- 长说明改为卡片化重点。
- 卡片布局使用 auto-fit：1 个铺满、2 个平分、3/4 个按宽度均衡排列。
- 原 4 条“避免”改成 2×2 “容易误解 / 正确理解”对照卡。

## Validation

- npm run course-builder:check PASS
- npm run course-builder:accept PASS
- npm run typecheck PASS
- six-step composition PASS
- Practice remains non-gated
- Draft remains PENDING_REVIEW

## Boundary

未写数据库、未注册正式 Runtime、未发布课程、未改变 Access / Progress / Completion authority。

## Next

重新打开 /course-builder/preview/skill-foundations 做 Human Review。

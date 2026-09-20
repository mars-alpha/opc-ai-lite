# COURSE-BUILDER-SKILL-001-E — First Step Interactive Intro

Status: COMPLETE

## Goal

只重做 skill-foundations 的第一步 EXPLAIN，把长文入口改成短情境互动，不改第 4/5 步。

## Experience

第一步现在采用：

情境问题
→ 两个选择
→ 选择后揭示原因
→ Prompt（提示词）与 Skill（技能）两项对比
→ 一句核心结论

默认不展开长文和多卡片，用户先参与后理解。

## Implementation

- GenericLessonRuntimePanel 新增通用 previewIntroChoice prop。
- previewMode 下 EXPLAIN 有 introChoice 时使用互动入口；正式课程和其他课程仍走原通用 EXPLAIN。
- skill-foundations 提供独立的 intro preview data，不通过 lesson slug 分支。
- 不影响 Check / Practice / Review / Capability。

## Boundary

只读 Preview；不写数据库、不保存进度、不改变 Completion Gate、不注册正式 Runtime、不发布课程。

## Validation

- npm run typecheck PASS
- npm run course-builder:accept PASS
- npm run build PASS
- git diff --check PASS

## Next

重新打开 /course-builder/preview/skill-foundations，只重点体验第一步观感。

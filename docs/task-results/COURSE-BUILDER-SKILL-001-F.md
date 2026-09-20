# COURSE-BUILDER-SKILL-001-F — First Step Direct Comparison

Status: COMPLETE

## Goal

只调整 skill-foundations 第一节 EXPLAIN，移除没有学习价值的两个选择按钮，改为直接对比。

## Experience

第一节现在采用：

真实场景
→ 临时做法 / 可复用做法
→ Prompt（提示词） / Skill（技能）对比
→ 一句核心结论

不需要点击，不制造为了互动而互动的动作。

## Implementation

- previewIntroChoice 重命名为 previewIntroComparison。
- 移除 introChoice 本地状态和选项按钮逻辑。
- Preview 第一节直接渲染两组对比。
- 仍由 GenericLessonRuntimePanel 通用数据驱动，不按 lesson slug 分支。
- Step 3/4/5/6 未修改。

## Boundary

只读 Preview；不写数据库、不保存进度、不改变 Completion Gate、不注册正式 Runtime、不发布课程。

## Validation

- npm run typecheck PASS
- npm run course-builder:accept PASS
- npm run build PASS
- git diff --check PASS

## Next

重新打开 /course-builder/preview/skill-foundations，只看第一节的直接对比是否比按钮版本更自然。

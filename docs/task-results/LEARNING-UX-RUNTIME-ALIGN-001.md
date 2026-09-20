# LEARNING-UX-RUNTIME-ALIGN-001 — Reference UX Unification

Status: COMPLETE

## Goal

把已通过 Generic Runtime Acceptance 的不同 Lesson Type 接入同一套 task-brief Reference Lesson Shell，证明正式课程不需要按 Lesson Type 或课程名复制页面。

## First Round Implemented

- task-brief / APPLICATION、memory-rag / CONCEPT、task-decomposition / PRACTICE 共用 Generic Guided Lesson Shell。
- Lesson Page 只根据已注册且 configurationReady 的 Lesson Spec 进入 Guided Shell，不识别课程名。
- Generic Renderer 由 plan.steps 驱动单 Step 学习，按 Step Kind 组合 EXPLAIN / EXAMPLE / CHECK / PRACTICE / REVIEW / CAPABILITY。
- Completion Gate 继续由 Runtime / Completion Core 决定；CHECK、PRACTICE、REAL_AI 不由课程名决定。
- 课程侧栏、当前课位置、课程进度、Review、Capability、完成按钮、下一课与课程评分流程保持同一 Shell。
- task-brief 已纳入同一 Lesson Spec Registry，不再拥有独立页面 Renderer。
- 删除无调用方的旧 InteractiveLessonPanel，避免仓库继续维护第二套正式课程体验。
- Interactive Read / Check 取消 task-brief Reference Preview 白名单，统一遵守 Access Core。
- learning-insights 的课程帮助链接统一指向 #lesson-runtime，不再识别 task-brief。
- 静态 Runtime capability facts 已同步 LEARNING-RUNTIME-001-A 的真实 provisioning：task-brief、memory-rag、task-decomposition 均为 published interactive lessons。

## Architecture Boundary

允许：
- Lesson Type 改变 Step 组合；
- Step Kind 改变当前 Step 模块；
- Completion Gate 改变是否允许完成 / 前进；
- Lesson content 改变教学内容。

禁止：
- if (lessonSlug === "...") 选择 Renderer；
- 为 CONCEPT / APPLICATION / PRACTICE 复制课程页面；
- 建立独立 Preview / Lab 正式课程形态；
- 用客户端文案代替服务端 Completion Gate。

## Validation

- npm run typecheck
- npm run learning:spec:check
- npm run learning:runtime:check
- npm run build
- source search: app / components / lib/server 无 task-brief course-name Runtime branch

## APPLICATION Alignment

- `writing-files / APPLICATION` 已注册到同一 Lesson Spec Registry 和 Generic Guided Lesson Renderer。
- Registry registration 与 Runtime readiness 明确分离：注册只代表使用统一 UX，不代表 Completion Gate 已可执行。
- 当 `configurationReady=false` 时，正式 Lesson 仍保持课程侧栏、当前位置、Step 进度、Explain / Example 等统一体验；required Check / Practice 缺失时显示确定性 Runtime blocker，不伪造互动模块。
- REAL_AI evidence = ARTIFACT 继续显示可信证据链缺口，按钮不可提交手填链接或引用。
- configuration 未完成时不渲染正式 Lesson Complete 动作，避免 UX 误导为“可完成”。
- `writing-files` 当前仍为 `SPEC=PASS / RUNTIME=NEEDS_RUNTIME`，这与 APPLICATION UX 对齐完成不冲突。

## Final Validation

- `npm run typecheck` PASS
- `npm run learning:spec:check` PASS
- `npm run learning:runtime:check` PASS
- `npm run build` PASS
- Production build: 30 static pages generated
- app / components / lib 中无 writing-files lesson-name Renderer 分支
- app / components / lib/server 中无 chatgpt-worker course-name Runtime 分支

## Next

`COURSE-BUILDER-SKILL-001 — OPC Course Builder Skill v0.1`

Artifact Resolver 仍是后续 Runtime 能力缺口，不属于本 UX 对齐任务，也不得被 Course Builder Skill 绕过。

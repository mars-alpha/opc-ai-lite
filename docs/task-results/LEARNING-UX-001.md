# LEARNING-UX-001 — Guided Learning + Case Practice + Tiered Conversion MVP

Status: COMPLETE_WITH_MANUAL_UX_REVIEW_PENDING

## Goal

不一次迁移全部课程，只选择一个已有真实 Check + Practice + Evaluation + Completion Gate 的 Lesson 做 Guided Learning 样板，验证 OPC 是否应从长页阅读转向引导式学习。

Pilot：

```text
course = chatgpt-worker
lesson = task-brief
practice = practice_task_brief_structured
check = check_task_brief_constraint
```

## Guided Flow

样板课改为 6 步：

```text
1. 先理解
2. 看案例
3. 理解检查
4. 跟着做
5. 反馈与复习
6. 下一步 / 能力获得
```

每一屏只承担一个认知或操作任务，不再先展示整页长文章再到底部练习。

## Learning Gates

```text
理解检查未通过
→ 不允许进入下一学习步骤
→ 推荐复习 Stage 1《Context、Token 与提示词》

Practice 未通过
→ 不允许进入最终能力总结
→ 展示分项评价 / 怎么改
→ 回到实操修改
→ 必要时复习基础课程

Practice PASSED
→ 才进入“你现在会什么 / 接下来还能获得什么”
```

现有 Lesson Completion Gate 保持不变：required LESSON_PRACTICE 必须 PASSED 才能完成课程。

## Case / Feedback

加入模糊任务 vs 可执行任务对照案例，并继续复用现有：

```text
Lesson Check API
Canonical Practice Read Model
TASK_BRIEF_V1
RULE Evaluation
Practice Submission / Retry
Learning Event
Lesson Completion Gate
```

没有新增第二套学习状态系统。

## Tiered Conversion

最终步骤明确三层价值：

```text
免费体验
→ 基础 Guided Learning / 核心概念 / 案例 / 基础练习

关注公众号
→ 持续跟进 / 完整 AI Daily / 指定基础章节

OPC Membership
→ Knowledge 正文 / Deep Resource / 正式实操 / 进阶课程
```

同一学习路径决定用户学什么，权益决定深度；不为三类用户维护三套课程。

## Language

样板 Lesson 的系统型 UI 已改成中文，如：引导式学习、理解检查、反馈与复习、真实工具验证、学习进度等。AI 行业术语保留中英双语，例如 Prompt（提示词）、Constraint（约束）。

## Validation

```text
npm run typecheck                 PASS
npm run build                     PASS
Production build                  30 static pages generated
SIX_STEPS                         PASS
CHECK_GATE                        PASS
PRACTICE_GATE                     PASS
REVIEW_LINK                       PASS
TIER_BOUNDARY                     PASS
CHINESE_UI                        PASS
PILOT_ONLY                        PASS
```

独立 dev route smoke 在 Runner 中未成功启动可访问实例；production `next start` 也因 Runner 间不保留上一条 build 的 `.next` 产物而无法作为可靠验收。上述属于工具运行隔离，不是源码 build 失败。最终源码已重新通过 typecheck + build。

## Acceptance Fix — 2026-09-20

人工体验发现并修复四类问题：

```text
系统英文名词过多
→ 改为中文主标签 + 英文术语辅助

完成按钮统一报“保存失败”
→ 移除完成前的冗余 enroll 调用，避免前置阶段检查提前阻断
→ completion error 映射为具体中文原因

不知道怎样才算通过
→ 理解检查直接显示正确通过条件
→ 实操明确：总分 >= 80/100，且五项每项 >= 12/20

缺少引导与提示
→ 增加案例说明、提交前自查、可展开提示、失败后的复习路径
```

未登录用户现在可本地完成理解检查继续体验；正式 Check / Practice / Progress 仍需登录后由 Core 保存。

当前 `localhost:3000` 检测为异常旧 Next 进程并返回 500；当前仓库在独立 `3001` dev server 上返回 200，Interactive Read API 可正常读取 check / practice 数据。

## Acceptance Fix 2 — Pilot Preview / Access 解耦

第二次人工体验确认根因：样板分支被写在 `!access.allowed` 内部，同时 `InteractiveLessonPanel` 又依赖正式 Practice Read Model；当 Stage 前置条件未满足时，Practice `content=null`，面板直接消失，只剩外壳和完成按钮。

修复后：

```text
Guided Pilot 先于正式 Lesson Access 分支渲染
→ 无正式 Access 时进入 Preview Mode
→ 使用 Interactive 数据显示 Check / Practice / Hint / Rubric
→ Preview 评分与正式提交共用同一个 rulePracticeEvaluator
→ Preview 不写 Check / Practice / Progress
→ 正式 Lesson Completion 仍受原 Access / Prerequisite 控制
```

同时修复 `if (!data || !check || !practice) return null` 的空白体验：加载中或数据异常时会显示明确状态，不再整块消失。

Runtime 规则：不要在 `next dev` 运行时执行 `next build` 共用 `.next`；验收顺序固定为 `stop dev → clear .next → typecheck/build → clear .next → dev`。

## No Schema Expansion

本任务没有新增 Schema / Migration，没有建立复杂 Knowledge Point / Mastery / Recommendation Engine，也没有迁移其他 Lesson。

## Product Principle

```text
不要让用户一直读，要让用户一直完成。
学习路径一致，权益决定深度。
失败不是重新开始，而是告诉用户缺哪一步、该复习哪里。
```

## Next

先进行人工 UX Review：用户真实走完 task-brief 6 步样板，确认信息密度、节奏、案例、反馈、移动端与转化体验。

样板确认后，再决定是否进入：

```text
LEARNING-CORE-001 — Knowledge Point / Review Recommendation Foundation
```

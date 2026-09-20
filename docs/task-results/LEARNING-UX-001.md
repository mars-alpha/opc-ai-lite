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

## LEARNING-UX-001-C — Guided Learning Completion Loop

基于人工体验继续补齐样板：

```text
Step 切换不再 scrollTo 页面顶部
→ 保持 Guided Learning 当前视口位置

Lesson Pilot 进入沉浸学习模式
→ 移除常驻课程侧栏和重复 Help 区
→ 顶部仅保留退出学习 / 当前课程位置

主动“还是不懂”
→ 更简单解释
→ 补充例子 / 参考
→ 可跳转相关基础课程

参考答案脚手架
→ 查看参考
→ 一键带入
→ 继续编辑
→ 恢复用户自己的版本

真实 AI 验证
→ 复制任务简报
→ 用户在真实 AI 工具执行
→ 回来选择结果：符合预期 / 需调整 / 没理解 / 不知道如何判断
→ 不作为当前 Lesson 硬 Gate

课程完成
→ 先展示能力成长
→ 再引导可选多选反馈 + 可选文字
→ 可直接跳过，不影响 Completion
```

新增 Client Learning Event 白名单：`external_ai_outcome`、`still_confused`、`reference_viewed`、`reference_applied`、`reference_restored`、`lesson_feedback_skipped`。继续复用现有 `learning_events` / `learning_feedback`，没有新增 Schema / Migration。AI 后续可以聚合这些事实形成课程优化建议，但不能直接修改 Published Course。

Validation：

```text
npm run typecheck              PASS
npm run build                  PASS
Production build               30 static pages generated
NO_SCROLL_TOP                  PASS
REFERENCE_FLOW                 PASS
STILL_CONFUSED                 PASS
EXTERNAL_OUTCOME               PASS
OPTIONAL_FEEDBACK              PASS
IMMERSIVE_MODE                 PASS
EVENT_ALLOWLIST                PASS
```

## Acceptance Refinement — Course Context / Hint / Feedback Placement

人工体验确认“纯沉浸、移除侧栏”削弱了课程状态感，因此当前样板回调为：

```text
课程侧栏恢复
→ 显示当前第几课
→ 显示课程完成进度
→ 显示已完成 / 当前 / 后续 / 锁定课

Guided Step 主区保留
→ 上一步 / 下一步不滚回页面顶部

“还是不懂”
→ 只给当前 Step 明确提示
→ 不提醒记英文术语
→ 选择题作答前不泄露答案

第 6 步
→ 只展示能力成长与下一步价值
→ 不显示公众号 / 会员 CTA
→ 右下只保留“学习路径”

课程反馈
→ 移到上一课 / 下一课导航之后
→ 多选 + 可选文字 + 跳过
→ 不作为 Completion Gate

学习路径
→ 增加免费 / 公众号 / OPC 会员权益说明
→ 只说明当前 Access 事实，不改变 Access Core
```

Validation：

```text
COURSE_STATUS_VISIBLE  PASS
NO_ANSWER_LEAK         PASS
NO_PREQUESTION_HINT    PASS
DIRECT_CONFUSED_HINT   PASS
FEEDBACK_AFTER_NAV     PASS
FEEDBACK_OUTSIDE_STEP6 PASS
NO_FOLLOW_CTA_STEP6    PASS
LEARNING_PATH_ONLY     PASS
OPTIONAL_FEEDBACK      PASS
ACCESS_INFO_IN_PATH    PASS
npm run typecheck      PASS
npm run build          PASS
```

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


## LEARNING-UX-001-D — Reference Lesson Finalization

Status: COMPLETE

基于 `docs/LEARNING_SPEC.md`，`chatgpt-worker / task-brief` 已升级为第一份 OPC Reference Lesson。

### Step 4 — Practice Closure

```text
未检查
→ 检查我的答案

未通过
→ 原地显示具体分项反馈
→ 用户原地修改
→ 修改后重新检查

已通过
→ 继续学习
```

第 4 步不再同时出现 Practice 主按钮和竞争性的底部“下一步”。Practice 评分后保持在当前 Step，直到通过。

### Step 5 — 学习回顾

```text
核心知识回顾
→ 查看我的最终答案
→ 学习自评
   ├─ 我可以自己完成
   ├─ 我基本明白，但还需要参考
   └─ 我还需要再练一次
```

学习自评不是 Completion Gate。“再练一次”保留当前内容并回到 Practice。

本 Lesson 的学习目标不要求必须在外部 AI 产品运行才能证明学会，因此按 Spec 固定：

```text
real_ai_operation = NONE
```

已移除原“复制任务简报 → 外部 AI → outcome”流程。

### Step 6 — 能力获得

只展示：

```text
我现在会什么
我完成了什么
下一课能获得什么
学习路径 →
```

没有课程评分、公众号 CTA 或会员 CTA。

### Exit Course Rating

课程评分不再常驻 Lesson 页面。

```text
Core 已确认 Lesson COMPLETED
→ 用户点击继续下一课
→ 展开可选课程评分
→ 提交并进入下一课
   OR
   暂时跳过
→ 下一课
```

评分三档：

```text
没太学懂
基本有帮助
很有帮助
```

可继续选择原因和填写文字。评分永远不是 Completion Gate。

### Learning Events

新增现有事件白名单：

```text
learning_self_assessment
practice_retry_requested
```

没有新增 Schema / Migration。

### Validation

```text
npm run typecheck            PASS
npm run build                PASS
Production build             30 static pages generated
STEP4_SINGLE_FLOW            PASS
STEP4_STAYS_LOCAL            PASS
STEP5_REVIEW                 PASS
NO_EXTERNAL_AI_STEP5         PASS
STEP6_CAPABILITY_ONLY        PASS
SELF_ASSESS_NOT_GATE         PASS
RATING_ON_NEXT               PASS
RATING_REQUIRES_COMPLETION   PASS
RATING_NOT_STATIC            PASS
EVENTS_ALLOWED               PASS
```

现有非阻塞 warning 保持不变：`app/globals.css` 的 autoprefixer 提示 `end` 建议改为 `flex-end`。

### Next

```text
LEARNING-SPEC-002 — Multi-type Lesson Validation
```

从现有课程选择 2–3 节不同 Lesson Type 验证同一 Spec；不直接批量迁移。

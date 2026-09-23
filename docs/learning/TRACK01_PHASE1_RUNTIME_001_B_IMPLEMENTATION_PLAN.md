# TRACK01-PHASE1-RUNTIME-001-B — Implementation Plan

Status: **B1-B5 CORE IMPLEMENTED / MANUAL_BROWSER_ACCEPTANCE_PENDING**

## Goal

收敛 T1-01～T1-05 正式 Lesson Runtime 状态主链，停止围绕旧实现继续叠加局部 Bug patch。

最终主链：

```text
Lesson Runtime Snapshot
→ Current Step
→ Step 3 Check
→ Step 4 Practice
→ Step 6 Completion
→ Rating
→ Next Lesson
```

刷新、离开课程、访问其他页面、重新进入课程后，均由正式业务状态恢复，而不是由 React 临时状态或历史 fallback 猜测。

## Frontend UI freeze

001-B 只重写 Lesson Runtime 内核，不重新设计、删除或回滚当前已经确认的前端界面。

冻结范围：

- 首页
- 学习路径
- AI 日报
- 进阶练习
- 课程页六步视觉与课程侧栏
- Header / Footer
- 已确认的卡片、导航、按钮位置与响应式样式

实现时每个受影响文件必须按以下方式处理：

```text
UI KEEP
→ 已确认 JSX / CSS / 组件位置默认保留

Logic REWRITE
→ 重写 Runtime read/write、Gate、resume、completion、rating 等逻辑

State DELETE
→ 删除重复 local state、临时 context、fallback 与同步 effect
```

禁止通过整文件 restore / checkout 覆盖已确认 UI。若任何 Runtime 需求确实要求改变界面，必须先停止实施并由产品确认。

## Confirmed product behavior

- 用户重新进入课程时恢复到最后停留 Step。
- Step 1 / 2 / 5 可随时返回阅读。
- Step 3 必须完成 3 道 required Check 才能向后推进。
- Step 3 中断后重新进入时定位第一道未完成题。
- Step 3 全部完成后显示“重新学习”；重新学习由服务端正式 reset 当前 required Check 状态。
- Step 4 正式状态以最新正式 Submission / Evaluation 为准。
- Step 4 PASSED 后显示“重新练习”。
- Step 4 重新练习中未正式提交的草稿不持久化；重新进入时仍以最后一份正式 Submission 为准。
- Completion 保持 server-authoritative。
- Rating 只在 Step 6 显示；提交成功后隐藏。
- 评分后产生新的正式 Check / Practice 交互，再回 Step 6 可重新评分。
- 完成后的复习 / 重学不撤销历史 Lesson Completion。

## Canonical state ownership

```text
Lesson position / Completion → lesson_progress
Step 3 Check                 → lesson_check_responses
Step 4 Practice              → practice_submissions + practice_evaluations
Rating                       → learning_feedback
```

前端组件状态只允许承载尚未正式提交的输入、busy 与当前响应反馈，不再维护第二套 passed / completion / gate 事实。

## Runtime read model

正式 Lesson Runtime 收敛到单一服务器 Read Model / Snapshot，至少包含：

```text
lesson
currentStep
completed
checks
checkPassed
practice
practicePassed
canComplete
canRate
```

优先收敛现有 learning interactive/runtime API，不为本任务建设第二套 Runtime 平台。

Web / H5 / 后续原生微信小程序消费相同 Backend/API 业务规则，不复制 Gate 逻辑。

## Step 3 rewrite

当前正式模式应删除由多个本地状态共同决定 Gate 的方式。

当前题直接由服务端 Check 状态推导：

- 0 题完成 → 第 1 题
- 1 题完成 → 第 2 题
- 2 题完成 → 第 3 题
- 3 题完成 → Step 3 complete

“重新学习”调用正式 reset，成功后重新取得 Snapshot。

目标移除 / 收敛：

- highestStepReached
- localPassedCheckIds
- retakingStep
- LessonRuntimeUiContext
- currentCheckIndex 作为正式事实

## Step 4 rewrite

正式状态只认最新正式 Practice Submission / Evaluation。

PASSED 后“重新练习”进入新的本地编辑状态；未正式提交前不覆盖服务器 PASSED 历史，也不新增 Draft autosave。

新提交后等待服务器 Evaluation 返回，再更新 UI。

## Completion / rating / navigation

- Check / Practice Gate 未满足时 Completion 必须由服务器拒绝。
- Completion 成功后才点亮下一课。
- 下一课按钮独立于 Rating。
- Rating 只属于 Step 6。
- Rating POST 成功后刷新 Snapshot，使 canRate 变为 false。

## Component cleanup target

| File | Direction |
| --- | --- |
| GenericLessonRuntimePanel.tsx | UI KEEP / LOGIC REWRITE / STATE DELETE |
| LessonRuntimeUiContext.tsx | DELETE |
| LessonFeedbackPrompt.tsx | UI KEEP / LOGIC REWRITE / SIMPLIFY |
| LessonCompleteButton.tsx | KEEP；formal Runtime 由 AsyncLessonRuntimeShell 注入 completionControl；legacy 也继续复用 |
| ProgressProvider.tsx | KEEP；仅站点级完成进度 cache |
| progress-adapter.ts | KEEP；正式 foundation Runtime 只读取 canonical Runtime state |
| interactive/service.ts | REFACTOR 为 canonical runtime state |
| learning/service.ts | 增加 currentStep read/write |
| lesson-page/service.ts | 简化 foundation Runtime context |
| foundation-catalog.ts | T1-01～T1-05 metadata 去重 |
| track01-phase1-runtime.ts | KEEP，从 Human Review PASS Draft 派生 |
| FormalGuidedLessonView.tsx | KEEP；正式课程静态 Hero + Async Runtime 唯一入口 |
| LessonLockedView.tsx | KEEP；统一 Access Gate |
| components/legacy-learning/* | LEGACY ONLY；禁止正式课程 import |
| course-runtime-boundaries.ts | KEEP；Formal / Legacy slug 唯一边界 |
| lesson page.tsx | ROUTE DECISION ONLY；Formal / Locked / Legacy 分流，不承载内联课程 Renderer |

最多新增：

- LessonCheckStep.tsx
- LessonPracticeStep.tsx
- 0012 current_step migration

不建设额外 framework。

## Course metadata cleanup

T1-01～T1-05 教学正文唯一 canonical 来源继续是 Human Review PASS Course Builder Draft。

`track01-phase1-runtime.ts` 只做派生。

`foundation-catalog.ts` 对已生产课程只保留目录特有 metadata，例如 stage / order / badge / availability / prerequisites；title / duration / lesson type / outcome 能派生则不重复维护。

T1-06～T1-20 尚未正式生产，可继续保留规划 metadata。

## Future connection boundaries

### Skill / AI

Skill / AI 可以生成 Draft / Suggestion / Candidate，但不得拥有或修改：

- currentStep
- Check pass
- Practice pass
- Completion
- Entitlement
- Publication status

确定性状态继续 Code First。

### AI Daily / Knowledge

```text
AI Daily
→ Reviewed Knowledge
→ Practice / Course Impact Candidate
→ Human Review
→ Production
```

AI Daily 不直接修改 Lesson Runtime。

### Feishu / Obsidian / Official Account / WeCom

- Feishu = Knowledge-owned Deep Resource / long-form supplement
- Obsidian = Published Knowledge 单向 Markdown mirror
- Official Account = distribution / follow entitlement / deep link
- WeCom = reviewed Knowledge customer service / unresolved feedback
- 均不拥有 Course Progress / Check / Practice / Completion

### Mini Program

后续原生微信小程序作为新客户端，共用当前 Backend/API；不复制核心学习规则。

## Migration

计划新增 `lesson_progress.current_step`：

```text
INTEGER NOT NULL DEFAULT 1
CHECK current_step BETWEEN 1 AND 6
```

Migration 只先生成并 review；应用目标数据库前需单独确认。

不新增：

- lesson_attempts
- runtime_sessions
- step_progress
- generic state JSONB
- 第二套 Practice / Progress 系统

## Acceptance matrix

必须覆盖：

1. Step 3 中断恢复：完成第 1 题 → 离开 → 返回 → 第 2 题 → Gate blocked。
2. Step 3 重新学习：reset → 只完成第 1 题 → 离开 → 返回 → 第 2 题 → Gate blocked。
3. Step 4 PASSED 恢复。
4. Step 4 重新练习后按钮恢复“检查我的结果”，新提交由服务器重新评估。
5. Check 未完成 → Completion rejected。
6. Practice 未通过 → Completion rejected。
7. 全部 Gate 满足 → Completion success → 下一课点亮。
8. Step 1～5 不显示 Rating。
9. Step 6 Rating 提交后隐藏。
10. 新正式 Check / Practice 交互后 Step 6 Rating 再次开放。
11. Last Viewed Step 跨页面 / 刷新恢复。
12. T1-01～T1-05 full Runtime Acceptance。
13. Manual browser flow：Learning Path → Lesson → partial Check → leave/return → Practice → leave/return → Complete → Rate → Next Lesson。

## Validation

```text
npm run typecheck
npm run build
Interaction Parity
T1-01 focused Runtime Acceptance
T1-01～T1-05 full Runtime Acceptance
manual browser acceptance
```

## Implementation sequence — Runtime Consolidation & Interaction Performance

### B1 — Runtime Read Consolidation

目标：优化首次进入课程与正式恢复路径，不改变业务状态语义。

- Lesson Definition 与 User Runtime Facts 在服务层分层组合。
- 同一份 Check / Practice 正式状态只读取一次，再派生 Gate。
- Required Check / Practice 状态使用批量读取，移除逐条 N+1。
- Server-rendered Lesson 首次提供 Runtime Snapshot 后，客户端 mount 不重复 GET。
- 不新增 Runtime Session / Snapshot 表 / generic state JSONB。

### B2 — Check Command

目标：Step 3 的“检查答案 / 下一题 / 重新学习”只处理 Check 相关状态。

- `answer` Command 返回服务端权威的当前题结果与 Check Sequence 新状态。
- 正式模式下“下一题”仅由已返回的服务端 Check 状态决定展示，不因切题重新读取整课 Runtime。
- `reset` Command 返回 reset 后的服务端权威 Check 状态，不再依赖完整 Runtime refresh。
- 临时输入必须以当前 `check.id` 为边界；上一题答案不得进入下一题。
- 前端不得自行制造正式 Check pass / Gate。

### B3 — Practice Command

目标：Step 4 的“检查我的结果 / 修改后重新检查”收敛为单一提交-评估链。

- Submission 创建、规则 Evaluation、Submission status 更新在服务器服务链中完成。
- Command 直接返回正式 Submission / Evaluation / Practice Gate 新状态。
- 前端直接显示服务器返回的 Evaluation，不再提交后重新读取整课 Runtime。
- 不改变 Practice Canonical Model，不增加 Draft autosave。

### B4 — Completion / Rating Command

目标：Step 6 完成与 Rating 不再依赖整页刷新。

- Completion 继续由服务器重新验证 required Gates。
- Completion Command 返回 `completed / completedAt / canRate` 以及必要的下一课解锁结果。
- Foundation Runtime 完成后不得依赖 `router.refresh()` 才获得正式结果。
- Rating Command 返回服务器权威 `canRate=false`；提交后不整页 refresh。
- 下一课与 Rating 解耦。

### B5 — Runtime Hardening

目标：补足并发、性能和回归边界。

- currentStep 保存采用 latest-intent-wins 的串行/coalesced 写入策略，支持前进与后退。
- 审计 Learning Event / Behavior Signal：只有 Gate/正式写入所必需工作进入用户等待 critical path。
- 审计 Check / Practice 常用查询与索引，不新增缓存基础设施作为前置。
- 增加请求次数级 Acceptance：
  - 首次进入：Server Runtime Snapshot 一次；客户端 mount 0 次重复 Runtime GET。
  - Check answer：1 Command；Next question：0 request；Reset：1 Command。
  - Practice submit/retry：各 1 Command。
  - Completion：1 Command + 0 `router.refresh()`。
  - Rating：1 Command + 0 `router.refresh()`。
- T1-01～T1-05 full Runtime + manual browser flow 继续作为 correctness gate。

当前实施事实：B1～B5 核心代码已完成；`typecheck`、`learning:runtime:check`、T1-01～T1-05 Interaction Parity、production `build` 已通过。真实浏览器全流程仍需单独手工验收。Behavior Signal 聚合当前仍保持同步执行，因为项目尚未确认可靠的 durable queue / worker 边界；不使用不可靠的 fire-and-forget 伪异步。

### Performance architecture rule

正式状态必须继续来自 PostgreSQL / Server。性能优化允许：
- 服务端共享同一批 authoritative rows 派生 Gate；
- Command 返回本次操作产生的 authoritative partial state；
- 固定课程定义在安全边界内复用。

性能优化禁止：
- 前端根据响应自行推断/拼装正式 Check pass、Practice pass、Completion 或 Gate；
- 为减少查询新增第二套 Runtime 事实表；
- 用整页 refresh 作为细粒度 Command 的默认状态同步方式。

## Done definition

- currentStep 有单一正式事实源。
- Step 3 只有一套正式完成逻辑。
- Step 4 只有一套正式结果逻辑。
- Completion server-authoritative。
- Rating Step6-only。
- 恢复路径稳定。
- GenericLessonRuntimePanel 明显缩小。
- 临时 Context / 重叠 local state 删除。
- Phase1 metadata 去重。
- 无新增通用 Framework。
- T1-01～T1-05 full Runtime + manual acceptance PASS。
- 首页 / 学习路径 / AI 日报 / 进阶练习 / 课程页 / Header / Footer 已确认 UI 无回归。

## Out of scope

- T1-06～T1-20 内容生产
- AI Daily 实现
- 新 Skill
- AI Provider 接入
- Obsidian Export
- Feishu Publish Adapter
- Official Account message delivery
- Mini Program
- Payment
- RAG / Vector DB
- Agent / Workflow platform
- Practice Draft autosave
- generic Lesson Attempt model
- microservices

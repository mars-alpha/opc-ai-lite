# MVP-010-ACCEPTANCE — Practice / Project Runtime Acceptance & Closeout

Status: COMPLETE

## Goal

对 MVP-010 做最终总体验收，不再扩核心模型；确认三类 Practice、权限、会员、Submission、Evaluation、Event、Lesson Completion、历史记录与用户侧入口组成同一套真实闭环。

## Acceptance scope

```text
LESSON_PRACTICE
STAGE_PROJECT
LATEST_PRACTICE
```

统一核心：

```text
practices
practice_submissions
practice_evaluations
resolvePracticeAccess()
getPracticeReadModel()
getPracticeForSubmission()
validatePracticeSubmission()
submitPractice()
learning_events
```

没有建立平行 Project / Latest Submission 系统。

## Acceptance finding repaired

总体验收发现 D 阶段文档记录了：

```text
stageProjects.practiceId
contentDemo.practiceId
```

但两个产品数据文件中的映射实际上没有持久化成功。

Acceptance 已修正真实代码：

```text
lib/stageProjects.ts
personal-knowledge-assistant
→ practice_stage_personal_knowledge_assistant

lib/contentDemo.ts
evaluation-practice
→ practice_latest_evaluation_workflow
```

因此文档与代码事实重新一致。

## User-facing closeout

Acceptance 判断：只完成服务端样本不足以代表 “Practice / Project 正式化” 已形成用户可用闭环，因此在收口前补了一个最小通用 UI，而没有扩新领域模型。

新增：

```text
components/PracticeSubmissionPanel.tsx
```

它只消费 canonical API：

```text
GET  /api/learning/practices/:practiceId
POST /api/learning/practices/:practiceId/submissions
```

### Stage Project

`/projects/personal-knowledge-assistant` 已接正式：

```text
practice_stage_personal_knowledge_assistant
```

非会员：

```text
MEMBERSHIP_REQUIRED
content = null
```

页面只显示真实会员边界，并明确当前支付尚未接入，不伪造订阅入口。

有 active OPC Membership 时可直接在项目页填写、提交、查看 PASSED / Evaluation。

### Latest Practice

`/practice` 中 `evaluation-practice` 已接正式：

```text
practice_latest_evaluation_workflow
```

通过同一通用 Panel 展开填写和提交；未登录提交返回登录提示，不建立第二套前端逻辑。

## Runtime Acceptance

使用两个临时真实用户完成最终综合验证。

### A1 — Free Latest Practice read

```text
anonymous
→ LATEST_PRACTICE
→ allowed = true
→ content available
```

PASS。

### A2 — Stage Project membership gate

用户已满足 Stage 1 prerequisite，但没有 Membership：

```text
allowed = false
reason = MEMBERSHIP_REQUIRED
content = null
```

PASS。

### A3 — Membership unlock

授予：

```text
MEMBERSHIP + PRODUCT + OPC_MEMBER
```

结果：

```text
STAGE_PROJECT allowed = true
reason = MEMBERSHIP
```

PASS。

### A4 — Lesson completion guard

`chatgpt-worker / task-brief` 在 required Lesson Practice 未通过前：

```text
setLessonCompletion()
→ PRACTICE_REQUIRED
```

PASS。

### A5 — Three practice types submit

同一个真实用户分别提交：

```text
LESSON_PRACTICE → PASSED
STAGE_PROJECT   → PASSED
LATEST_PRACTICE→ PASSED
```

PASS。

### A6 — User isolation

第二个用户读取第一个用户的 Latest Practice latest submission：

```text
null
```

PASS。

### A7 — Lesson completion after pass

Lesson Practice PASSED 后：

```text
setLessonCompletion(... completed=true)
→ PASS
```

PASS。

### A8 — Event scope

三个 Practice 均产生：

```text
submission_created
evaluation_completed
practice_passed
```

Lesson Practice：

```text
lessonId = lesson_chatgpt_worker_task_brief
```

Stage Project / Latest Practice：

```text
lessonId = null
```

Lesson Completion 额外产生：

```text
lesson_completed
```

PASS。

### A9 — Membership expiry preserves history

将 Membership 设为已过期后再次读取 Stage Project：

```text
allowed = false
reason = MEMBERSHIP_REQUIRED
content = null
latestSubmission.status = PASSED
```

PASS。

确认：

```text
会员到期 ≠ 删除历史 Submission / Evaluation
```

### A10 — Submission integrity

本轮三个正式 Practice 各产生 1 条 Submission：

```text
count = 3
```

PASS。

临时用户、Entitlement、Progress、Submission、Evaluation、Event 已通过用户 cascade 清理。

## Final product truth

### LESSON_PRACTICE

```text
Lesson Page
→ canonical Practice Read
→ Submit
→ TASK_BRIEF_V1 validation
→ RULE Evaluation
→ PASSED / NEEDS_REVISION / EVALUATION_FAILED
→ Event
→ required Practice Completion Gate
```

### STAGE_PROJECT

```text
Project Page
→ Stage prerequisite
→ Membership Policy when MEMBER tier
→ canonical Practice Read
→ Submit / Evaluation / Event
```

### LATEST_PRACTICE

```text
AI Daily / Knowledge source
→ Published source validation
→ Practice Page
→ canonical Practice Read
→ Submit / Evaluation / Event
```

## Status vocabulary correction

MVP-010 最初规划里曾写：

```text
PASSED / RETRY / REVIEW_REQUIRED
```

当前真实 Practice Evaluation 状态为：

```text
SUBMITTED
NEEDS_REVISION
PASSED
EVALUATION_FAILED
```

`REVIEW_REQUIRED` 属于 MVP-009 Course Insight / 人工审核语义，不应混入当前 Practice Submission 状态。

因此 Closeout 以真实 Runtime vocabulary 为准，不为了对齐旧文案新增无需求状态。

## Out of scope remains

MVP-010 没有接：

```text
第二种正式 Submission Schema
AI Evaluator
文件 / 图片 / URL Submission
通用表单 Builder
大型考试系统
Subscription / Payment / Refund
AI 自动发布课程
```

其中真实订阅支付继续属于后续 Membership / Payment 阶段，不影响 MVP-010 完成。

## Final quality gate

```text
Comprehensive Runtime Acceptance PASS
User Isolation                  PASS
Membership Gate / Expiry        PASS
Frontend canonical wiring       COMPLETE
npm run typecheck               PASS
npm run build                   PASS
Next.js pages                   31
```

## Closeout result

`MVP-010 — Practice / Project 正式化`：**COMPLETE**。

三类 Practice 已从“概念 / 静态页面 / 单一 Lesson 试点”收敛为同一正式业务模型、同一访问策略、同一 Submission / Evaluation / Event Runtime，并至少各有一个正式样本；代表 Stage Project 与 Latest Practice 也已有用户侧入口。

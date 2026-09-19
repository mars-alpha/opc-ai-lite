# MVP-010-C — Vertical Slice

Status: COMPLETE

## Goal

选择一个已经真实存在、可代表正式学习闭环的 Practice，把它完整迁移到 MVP-010 的统一 Read / Submit / Evaluation / Event / Completion 链路，而不是只在底层服务中证明能力存在。

本轮代表 Practice：

```text
practice_task_brief_structured
course: chatgpt-worker
lesson: task-brief
type: LESSON_PRACTICE
accessTier: INHERIT
submissionSchema: TASK_BRIEF_V1
required: true
```

## Frontend vertical slice

`InteractiveLessonPanel` 仍保留理解检查 API：

```text
GET /api/learning/interactive
```

但 Practice 正式内容 / latest submission 已改为读取 canonical Practice API：

```text
GET /api/learning/practices/practice_task_brief_structured
```

Lesson page 明确向 panel 传入：

```text
practiceId = practice_task_brief_structured
```

因此代表 Practice 的前端链路现在是：

```text
Lesson Page
→ canonical Practice Read Model
→ Practice content / access / latestSubmission
→ POST Practice Submission
→ schema dispatch
→ Evaluation
→ refresh canonical Practice Read Model
→ PASSED state
```

不再依赖旧 interactive payload 中的 Practice state 作为正式数据源。

## Completion guard

该 Practice 继续保持：

```text
required = true
```

Lesson completion 使用正式服务端规则：

```text
setLessonCompletion()
→ hasPassedRequiredPractices()
```

并且 required Practice 查询现在明确限定：

```text
type = LESSON_PRACTICE
```

避免未来 Stage Project / Latest Practice 因关联字段存在而错误阻塞 Lesson Completion。

Interactive Lesson 的 Practice 查询也明确限定 `LESSON_PRACTICE`。

## Runtime vertical slice

使用临时真实用户完成完整纵向验证。

### Before Practice

```text
setLessonCompletion(chatgpt-worker / task-brief)
→ PRACTICE_REQUIRED
```

PASS。

### Canonical Read Before

```text
getPracticeReadModel()
→ access.allowed = true
→ latestSubmission = null
```

PASS。

### Submit / Evaluate

提交 TASK_BRIEF_V1：

```text
Goal
Context
Input
Constraint
Output
```

结果：

```text
status = PASSED
score = 96
attempt = 1
```

PASS。

### Canonical Read After

```text
latestSubmission.status = PASSED
latestSubmission.evaluation.passed = true
```

PASS。

### Lesson Completion After Practice

```text
setLessonCompletion(... completed=true)
→ PASS
```

说明服务端必做实操 gate 已被真实 PASSED Submission 解锁。

### Events

该用户真实写入并验证存在：

```text
submission_created
evaluation_completed
practice_passed
lesson_completed
```

因此当前代表性 Lesson 已形成：

```text
Read
→ Submit
→ Validate
→ Evaluate
→ Event
→ Completion Gate
→ Lesson Completed
```

完整纵向闭环。

测试用户及关联 Progress / Submission / Evaluation / Event 已通过 user cascade 清理。

## Scope intentionally not expanded

本轮没有：

```text
新增第二种 Submission Schema
新增 AI Evaluator
迁移全部 Lesson Practice
新增正式 Stage Project 样本
新增正式 Latest Practice 样本
接支付
```

C 阶段目标是证明一条正式纵向链路，而不是批量迁移。

## Validation

```text
Pre-practice completion guard  PASS
Canonical read before          PASS
Practice submit/evaluate       PASS
Canonical read after           PASS
Lesson completion after pass   PASS
Required server events         PASS
npm run typecheck              PASS
npm run build                  PASS
Next.js pages                  31
```

## Next

进入 `MVP-010-D — Stage Project + Latest Practice Samples`。

目标：不再修改底层核心模型，而是各放 1 个正式样本，证明 `STAGE_PROJECT` 和 `LATEST_PRACTICE` 可以使用同一套 Read / Submit / Evaluation / Membership / Event 基础设施。

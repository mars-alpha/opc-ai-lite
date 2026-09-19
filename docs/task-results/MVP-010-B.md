# MVP-010-B — Practice Read / Submit API normalization

Status: COMPLETE

## Goal

在不新增第二套 Practice API 的前提下，把统一 Practice Access Resolver 接入正式 read / submit service，使 LESSON_PRACTICE、STAGE_PROJECT、LATEST_PRACTICE 开始共享同一套：

```text
Practice Read
→ Access
→ Latest Submission
→ Submission
→ Evaluation
```

## Canonical service

新增：

```text
lib/server/practices/service.ts
```

提供：

```text
getPracticeReadModel(userId, practiceId)
getLatestPracticeSubmission(userId, practiceId)
getPracticeForSubmission(userId, practiceId)
```

原 `interactive/service.ts` 的 Submission 流程不再自己读取 / 判断 Practice，改为复用 `getPracticeForSubmission()`。

## Practice Read Model

`getPracticeReadModel()` 统一返回：

```text
id
type
accessTier
title
goal
ownership
access
content
latestSubmission
```

其中 ownership：

```text
lessonId
stageId
sourceContentId
sourceKnowledgeId
```

Access denied 时：

```text
content = null
```

避免 MEMBER / locked Practice 暴露 instructions / rubric / submission schema。

已登录用户仍可读取自己的历史 `latestSubmission`，符合既定规则：会员到期或权限回退不删除历史学习记录 / Submission。

## API normalization

新增：

```text
GET /api/learning/practices/:practiceId
```

- Session 可选
- 返回统一 Practice Read Model
- 不存在 → 404
- Access denied 仍返回 read model + access reason，供前端显示锁定状态

现有：

```text
/api/learning/practices/:practiceId/submissions
```

现在同时支持：

```text
GET  → 当前登录用户 latest submission
POST → 创建 submission + evaluation
```

GET 未登录返回 401。

POST 继续复用现有 Runtime 逻辑与 A2 Access Resolver。

## Non-Lesson Practice runtime

使用真实数据库临时样本验证：

```text
STAGE_PROJECT + FREE
→ submitPractice
→ PASSED
→ read model latestSubmission = PASSED

LATEST_PRACTICE + FREE
→ submitPractice
→ PASSED
→ read model latestSubmission = PASSED
→ evaluation 可读取
```

同时验证：

```text
LATEST_PRACTICE + MEMBER + anonymous
→ MEMBERSHIP_REQUIRED
→ content = null
```

临时用户 / Practice / Submission / Evaluation / Event 已清理。

## Existing architecture preserved

仍然只有：

```text
practices
practice_submissions
practice_evaluations
```

没有新增：

```text
stage_project_submissions
latest_practice_submissions
```

三类 Practice 已经开始真实共用 Submission / Evaluation 服务层。

## Current limitation

Submission validator / RULE evaluator 仍只支持：

```text
TASK_BRIEF_V1
Goal / Context / Input / Constraint / Output
```

因此当前非 Lesson Practice 只有在 `submission_schema = TASK_BRIEF_V1` 时可以真实提交。

这不是 B 阶段要隐式扩大的范围；通用 Submission Schema validator 应作为下一小步单独处理。

## Validation

```text
npm run typecheck           PASS
Practice read runtime       PASS
Stage Project submit        PASS
Latest Practice submit      PASS
Member content protection   PASS
Latest submission read      PASS
npm run build               PASS
Next.js pages               31
```

Build 已包含正式新路由：

```text
/api/learning/practices/[practiceId]
/api/learning/practices/[practiceId]/submissions
```

## Next

进入 `MVP-010-C — Vertical Slice / Submission Schema` 前，建议先做一个很小的 `MVP-010-B2`：把 `submission_schema` 从“只是字段”变成 validator dispatch，使 Practice 根据 schema 选择验证器，同时保持 TASK_BRIEF_V1 完全兼容。

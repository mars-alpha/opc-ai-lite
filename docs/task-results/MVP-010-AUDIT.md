# MVP-010-AUDIT — Practice / Project 正式化前置审计

Status: COMPLETE

## Goal

在不平行创建第二套 Practice 系统的前提下，确认 MVP-008 已有 `practices / practice_submissions / practice_evaluations` 是否可以直接承接：

```text
LESSON_PRACTICE
STAGE_PROJECT
LATEST_PRACTICE
```

## Existing reusable foundation

现有正式模型已经具备：

```text
practices
practice_submissions
practice_evaluations
```

并已验证：

```text
Submission 持久化
attempt 递增
RULE Evaluation
PASSED / NEEDS_REVISION / EVALUATION_FAILED
required Practice 阻止 Lesson 提前完成
服务端 practice_passed Event
跨用户 Submission isolation
```

结论：MVP-010 必须复用现有三张表与服务，不另建 ProjectSubmission / LatestPracticeSubmission 等平行体系。

## Current blockers

### 1. Practice 被强绑定到 Lesson

当前：

```text
practices.lesson_id NOT NULL
```

服务端 `getPracticeForUser()` 也通过：

```text
Practice → Lesson → Module → Stage
```

计算权限。

因此当前结构只能自然表示 `LESSON_PRACTICE`，不能正式表示 `STAGE_PROJECT` 或 `LATEST_PRACTICE`。

### 2. Submission payload 仍是试点专用结构

当前 `PracticeContent` 固定为：

```text
goal
context
input
constraint
output
```

这对 `task-brief` 试点成立，但不能作为所有 Stage Project / Latest Practice 的永久 Submission Schema。

当前数据库 `content JSONB` 可以承载扩展，但 service validator / rubric evaluator 仍是五字段专用实现。

### 3. 用户侧 Practice 页面仍是静态展示

`app/practice/page.tsx` 当前：

```text
Basic Practice → 本地 tasks[]
Latest Practice → lib/contentDemo.ts
```

尚未读取正式 `practices` 数据，也没有提交闭环。

### 4. Stage Project 仍是静态项目页

`app/projects/[slug]/page.tsx` 当前读取：

```text
lib/stageProjects
```

只展示 Goal / Deliverables / Acceptance，没有 Submission / Evaluation。

### 5. Interactive read 存在后续可优化 N+1

`getInteractiveLesson()` 对每个 Practice 分别读取 latest Submission 和 Evaluation。

`hasPassedRequiredPractices()` 也对 required Practice 逐个查询 PASSED。

当前试点数量小，不阻塞 MVP-010 Schema，但正式扩展时应合并查询。

## Minimal domain direction

MVP-010 不重建 Practice，而是在现有 `practices` 上补充最小正式类型与归属边界。

建议目标模型：

```text
Practice
├─ type: LESSON_PRACTICE | STAGE_PROJECT | LATEST_PRACTICE
├─ lesson_id nullable
├─ stage_id nullable
├─ source_content_id nullable
├─ source_knowledge_id nullable
├─ title / goal / instructions / hints / rubric
├─ pass_score / required / status
└─ submission_schema JSONB（后续支持非 task-brief 结构）
```

约束方向：

```text
LESSON_PRACTICE → lesson_id 必须存在
STAGE_PROJECT   → stage_id 必须存在
LATEST_PRACTICE→ source_content_id 或 source_knowledge_id 至少一个存在
```

MVP 第一轮可以先由 service 层校验，避免一次性引入复杂数据库 CHECK 组合。

## Submission / Evaluation direction

继续复用：

```text
practice_submissions
practice_evaluations
```

不要新增：

```text
stage_project_submissions
latest_practice_submissions
```

Evaluation Provider 继续保持：

```text
RULE
AI（后续）
```

AI Evaluation 不作为 MVP-010 前置条件。

## Recommended implementation order

### MVP-010-A1 — Schema normalization

- 新增 Practice Type
- 解除 `lesson_id NOT NULL`
- 新增 `stage_id`
- 新增 Latest Practice 来源字段
- 增加 `submission_schema JSONB` 或等价最小 Schema 描述
- 保证 MVP-008 现有 Lesson Practice 无行为回归

### MVP-010-A2 — Service access resolver

统一：

```text
resolvePracticeAccess(userId, practice)
```

按 type 判断 Lesson / Stage / Latest Practice 权限，不在 API 层分别实现。

### MVP-010-B — Read / Submit API normalization

继续复用现有 Submission API，只补充通用 Practice Read / latest submission read model。

### MVP-010-C — Vertical slice

先迁移当前 `chatgpt-worker / task-brief`，验证新模型对现有 Lesson Practice 完全兼容。

### MVP-010-D — Two additional samples

各跑一个：

```text
STAGE_PROJECT
LATEST_PRACTICE
```

证明三类 Practice 共用同一 Submission / Evaluation / Event 闭环。

## Stop rule

MVP-010 不在本阶段解决：

- 通用表单 Builder
- 文件 / 图片 / URL Submission
- AI Tutor / Chat
- 通用考试系统
- AI 自动发布课程
- 大规模 Practice 批量迁移

## Audit conclusion

当前架构不需要重做。

真正需要的最小改动是：**把 Practice 从“只能属于 Lesson”扩展成“同一 Practice 核心、不同正式归属类型”**，继续复用现有 Submission / Evaluation / Event。

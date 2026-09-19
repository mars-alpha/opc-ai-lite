# MVP-011-B — Content → Knowledge Routing

Status: COMPLETE

## Goal

把现有 `KNOWLEDGE_CAPSULE` destination 从标签升级为人工确认的正式业务动作：

```text
Content Item
→ 人工确认
→ Knowledge Item
→ sourceContentId 绑定
```

不自动修改课程，不进入 Practice Candidate / Course Update Candidate，不做自动采集与会员分层。

## Existing model reused

本任务没有新增数据库表，也没有重做 Knowledge CRUD。

继续复用：

```text
content_items
knowledge_items
knowledge_items.source_content_id
/api/admin/knowledge/items
```

## New routing endpoint

新增：

```text
GET  /api/admin/content/items/:itemId/knowledge
POST /api/admin/content/items/:itemId/knowledge
```

GET 用于读取当前 Content 是否已经绑定 Knowledge。

POST 用于人工确认并派生 Knowledge。

## Routing rules

只有：

```text
content.destination = KNOWLEDGE_CAPSULE
```

才允许生成 Knowledge。

其他 destination 调用会返回：

```text
CONTENT_NOT_KNOWLEDGE_CAPSULE
```

生成时默认继承：

```text
title
summary
category
readingMinutes
sourceContentId
```

管理员可以在生成前确认 / 编辑：

```text
title
summary
body
category
validity
stageId
lessonId
readingMinutes
status
```

注意：当前 `content_items` 没有 `stageId`，因此本任务没有猜测或伪造 Stage；Stage / Lesson 必须由管理员人工确认。

## Duplicate protection

同一 Content 再次执行 POST 时，会先按：

```text
knowledge_items.source_content_id
```

查找已有 Knowledge。

若已存在：

```text
created = false
→ 返回已有 Knowledge
→ 不再创建第二条
```

当前 MVP 使用应用层幂等检查；没有为 `source_content_id` 新增数据库唯一约束，因此没有引入 Schema Migration。

## Admin UI

`/admin/content` 中，当 Content 的 destination 为 `KNOWLEDGE_CAPSULE` 时显示：

```text
Knowledge Routing
→ 人工确认字段
→ 生成 Knowledge
```

若已经生成，则显示：

```text
已关联 Knowledge
Knowledge ID
Status
Validity
sourceContentId
```

不再重复出现生成表单。

## Boundaries

本阶段没有实现：

```text
自动采集
AI 自动生成 Knowledge
PRACTICE_CANDIDATE 派生
COURSE_UPDATE_CANDIDATE 派生
自动修改 Published Course
AI Daily FREE / MEMBER
Subscription / Payment
```

## Validation

```text
npm run typecheck   PASS
npm run build       PASS
```

Production build 已识别：

```text
/api/admin/content/items/[itemId]/knowledge
```

Build 仍只有既有 CSS autoprefixer `end` mixed-support warning，不阻塞。

## Next

建议下一任务：

```text
MVP-011-C — Knowledge → Practice / Course Candidate Bridge
```

但开始前应先读取当前 Git + 最新代码和文档，再决定是否把 Practice Candidate 与 Course Update Candidate 同一阶段完成或继续拆分。

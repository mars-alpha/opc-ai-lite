# MVP-011-A — Content Operations Console

Status: COMPLETE

## Goal

把 MVP-007 已存在的 Content / Knowledge 后端能力转成可实际运营的 Content 工作台，不重做 Schema / CRUD，不进入自动采集、会员分层、支付或 Knowledge 自动派生。

## Implemented

新增正式后台入口：

```text
/admin/content
```

管理员可以：

```text
查看 Content Queue
按 ALL / DRAFT / REVIEW / PUBLISHED / ARCHIVED 筛选
新建 Content Item
编辑标题 / 摘要 / 分类
编辑 sourceType / sourceRef / sourceUrl / sourcePublishedAt
编辑 readingMinutes / reviewer / reviewedAt / publishedAt
选择 destination
切换 DRAFT / REVIEW / PUBLISHED / ARCHIVED
```

复用现有 Admin API：

```text
GET  /api/admin/content/items
POST /api/admin/content/items
GET  /api/admin/content/items/:itemId
PUT  /api/admin/content/items/:itemId
```

没有新增第二套 Content 数据模型。

## Publish boundary

前台 AI Daily 仍保持既有正式读取规则：

```text
content_items.status = PUBLISHED
AND destination != IGNORE
→ AI Daily published reader
```

Content create / update 后现在会执行：

```text
revalidateTag("opc-published-content")
```

因此后台发布或撤下内容后，不再只依赖 60 秒自然缓存刷新。

## Admin navigation

三个后台入口已经互相可达：

```text
/admin/content
/admin/courses
/admin/learning
```

## Deliberately not included

本阶段没有实现：

```text
自动内容采集 / RSS / YouTube / B站 / 小红书
AI 自动摘要
Content → Knowledge 自动派生
Knowledge → Practice Candidate 自动派生
Course Update Candidate bridge
AI Daily FREE / MEMBER 分层
Subscription / Payment
```

这些应作为后续独立任务继续推进。

## Validation

```text
npm run typecheck   PASS
npm run build       PASS
/admin/content      production build route generated
```

Build 仍只有既有 CSS autoprefixer `end` mixed-support warning，不阻塞构建。

### Runtime smoke limitation

尝试启动独立 production server 做 HTTP smoke 时，当前工作目录存在一个已有 Next development 运行环境干扰 `.next`：请求到旧 development 实例返回 404，同时独立 `next start` 检测不到 production `.next/BUILD_ID`。

因此本任务**没有把 HTTP runtime smoke 记为 PASS**，也没有为了测试强行停止未知旧开发进程。

这不影响本次 typecheck / production build 证据，但后续若需要真实浏览器验收，应先清理或明确当前 Next dev 进程，再启动干净 runtime。

## Next

建议下一任务：

```text
MVP-011-B — Content → Knowledge Routing
```

目标是让 `KNOWLEDGE_CAPSULE` 不再只是 destination 标签，而是通过人工确认动作创建并绑定正式 Knowledge Item；仍禁止自动修改 Published Course。

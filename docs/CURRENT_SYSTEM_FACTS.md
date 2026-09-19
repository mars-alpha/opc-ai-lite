# CURRENT_SYSTEM_FACTS.md — OPC AI 当前系统事实

> 全仓审计来源基线：`main@5ea3981`
>
> 本文件只记录当前事实。历史过程看 `docs/task-results/*`，未来规划看 `TASKS.md`。

## 1. 仓库扫描基线

当前治理提交后的 Git 受控文件：

```text
TOTAL  178
TEXT   171
BINARY 7
```

主要目录：

```text
app/         48
components/  30
docs/        29
drizzle/     15
lib/         31
```

审计开始时完整盘点 176 个既有 Git 受控文件；本治理任务新增 `AGENTS.md` 与本文件，提交后共 178 个受控文件。二进制资源只做存在性与引用盘点，不作为业务事实源。

## 2. 当前正式 Runtime

```text
Next.js 15.5.25
React 19.1
TypeScript 5.8.3
npm
App Router
PostgreSQL
Drizzle ORM
postgres.js
```

当前正式应用入口是 `app/*`。根目录旧静态文件 `index.html / learning-path.html / ai-daily.html / practice.html / styles.css / script.js` 属于早期原型，不是正式 Runtime。

## 3. 当前健康状态

本次全仓事实审计：

```text
npm run typecheck  PASS
npm run build      PASS
Next production build: 31 pages/routes
Git working tree at audit start: clean
```

当前系统满足继续开发的基本条件。

## 4. 数据库事实

正式 Schema：`lib/server/db/schema.ts`

Migration：

```text
0000 → Learning / Course / Progress
0001 → Auth / Session
0002 → Content / Knowledge / Entitlement
0003 → Interactive Lesson / Practice
0004 → Feedback / Event / Course Insight
0005 → Practice normalization
0006 → Multi-source Course Update Candidate
```

当前重要限制：

```text
0006_square_sharon_carter.sql 已生成并提交
远程数据库尚未执行 0006 migration
因此 C2 代码完成，但远程真实 DB Runtime 尚未验证
```

## 5. 当前核心领域

### Course / Learning

已存在：

```text
Stage → Module → Lesson
Enrollment
Lesson Progress
Lesson Check
Lesson Resource
Admin Lesson edit / publish
```

正式 Lesson 优先从 PostgreSQL 读取；DB 读取失败或内容非法时仍存在静态课程 fallback。

### Auth

当前实现：

```text
Email identity
Password credential
Session
Admin allowlist via OPC_ADMIN_EMAILS
```

微信身份类型已在 Schema 预留，但真实 OAuth / Webhook 尚未完成。

### Entitlement / Membership

已实现：

```text
COURSE_ACCESS
CHAPTER_ACCESS
LESSON_ACCESS
MEMBERSHIP

OPC_MEMBER
¥39 / 月
¥299 / 年
```

当前代码已有 `getMembershipStatus()` 和 `resolveMembershipFeatureAccess()`。

当前真实产品权限仍未全面接入新规则：

- Official Account Follow 当前代码主要用于 Stage 1 指定章节解锁；
- AI Daily“Top3 免费 / 关注公众号解锁全部”尚未正式接入；
- Knowledge MEMBER-only 尚未正式接入；
- Feishu Deep Resource MEMBER-only 尚未正式接入；
- Latest Practice 卡片公开、正式详情/实操会员化尚未整体切换。

这些属于已批准目标，不得写成已实现。

### Content

已实现：

```text
/admin/content
Content CRUD / review / publish
Content → Knowledge 人工路由
Published Content reader
```

正式状态：

```text
DRAFT → REVIEW → PUBLISHED → ARCHIVED
```

当前自动采集、AI 初筛、自动摘要仍未实现。

### Knowledge

当前 `knowledge_items` 已有：

```text
sourceContentId
title / summary / body / category
validity
stageId / lessonId
readingMinutes
status / publishedAt
```

当前已实现：

```text
Content → Knowledge
Knowledge → Latest Practice
Knowledge → Course Update Candidate
```

Knowledge 仍未完成完整 Asset Model（Deep Resource / Obsidian / Skill / Media Asset 关系仍属下一阶段设计）。

### Practice

唯一正式核心：

```text
practices
practice_submissions
practice_evaluations
```

类型：

```text
LESSON_PRACTICE
STAGE_PROJECT
LATEST_PRACTICE
```

Access tier：

```text
INHERIT
FREE
MEMBER
```

当前唯一正式 Submission Schema：

```text
TASK_BRIEF_V1
Goal / Context / Input / Constraint / Output
```

当前默认 Evaluation 为 RULE。

### Feedback / Insight / Course Candidate

正式链：

```text
Learning Event / Feedback
→ Course Insight
→ AI Analysis（Provider 配置后）
→ Course Update Candidate
→ Human Review
```

Course Update Candidate 当前代码支持：

```text
sourceType = LEARNING_INSIGHT
sourceType = KNOWLEDGE
```

Knowledge 来源审核不会反向修改 Knowledge；任何 Candidate APPROVED 都不会自动覆盖 Published Lesson。

## 6. AI Provider

课程 AI Analysis 代码已存在，但当前环境未确认配置：

```text
OPC_AI_ANALYSIS_BASE_URL
OPC_AI_ANALYSIS_API_KEY
OPC_AI_ANALYSIS_MODEL
```

无 Provider 时保持 RULE / ANALYSIS_READY，不伪造 AI Diagnosis。

## 7. 当前内容资产长期边界

```text
External Signal
→ AI Assist / Human Review
→ Reviewed OPC Knowledge
→ Derived Assets
   ├─ Feishu Deep Resource
   ├─ Latest Practice
   ├─ Course Update Candidate
   ├─ Obsidian Note
   ├─ Skill
   └─ Media Asset
→ Published Experience
```

正式 Source of Truth 仍为 PostgreSQL / OPC Production Data。

## 8. 当前 fallback / legacy

仍存在且需要明确区分：

```text
lib/courses.ts
→ 静态课程内容 / fallback / generateStaticParams 依赖

lib/contentDemo.ts
→ Content / Latest Practice 开发 fallback

lib/stageProjects.ts
→ Stage Project 展示元数据

lib/learning/progress-adapter.ts
→ API 不可用时 localStorage fallback

根目录 *.html + styles.css + script.js
→ legacy prototype
```

新增业务不得默认把这些 fallback 当成正式数据源。

## 9. 当前已知未完成 / 阻塞

```text
1. remote DB 未执行 migration 0006
2. MVP-009 AI Provider Runtime 未配置/未验证
3. AI Daily 正式自动采集与审核未实现
4. Feishu Deep Resource bridge 未实现
5. Obsidian export 未实现
6. Skill 尚无正式落盘资产
7. 新权限策略尚未统一接入 Resource Access Resolver
8. Subscription / Order / Payment / WeChat Pay 未实现
9. 微信真实 OAuth / Official Account webhook 未实现
```

## 10. 当前下一阶段

当前只进入：

```text
MVP-011-D — Knowledge Asset Model
```

先审计现有 Content / Knowledge / Practice / Course Candidate 是否已足够表达：

```text
External Signal
→ Reviewed Knowledge
→ Derived Assets
```

目标是最小关系模型，不先建设 Feishu / Obsidian / Skill / Media 通用平台。

## 11. 每次任务后的事实同步

只有事实发生变化时才更新本文件，例如：

- 新增/删除正式领域模型；
- 正式数据源改变；
- Runtime / Access 行为改变；
- Migration 执行状态改变；
- 新外部系统真正接通；
- 已知阻塞解除或新增。

纯 UI 文案、局部样式等不影响系统事实的改动，不需要扩写本文件。

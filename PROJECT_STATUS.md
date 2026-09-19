# PROJECT_STATUS.md

> 本文件只保存当前真实状态，不保存历史长文。

## 当前阶段

OPC AI 第一版 MVP 已完成 MVP-001～010 的核心主链：PostgreSQL 学习状态、Auth / Session、Entitlement、Admin Course、Content / Knowledge、Interactive Practice，以及 Feedback / Event → Insight 最小数据闭环。

当前产品状态：

```text
MVP-010 — Practice / Project 正式化            COMPLETE
MVP-CLOSEOUT-AUDIT-001 — 一致性审计            COMPLETE
MVP-CLOSEOUT-FIX-001 — 一致性收口修复          COMPLETE
MVP-011-A — Content Operations Console         COMPLETE
UI-IA-001 — Front-end Navigation Refinement    COMPLETE
MVP-011-B — Content → Knowledge Routing        COMPLETE
MVP-011-C1 — Knowledge → Latest Practice       COMPLETE
MVP-011-C2 — Multi-source Course Candidate     COMPLETE*
NEXT: audit MVP-011-D access tier scope

* C2 migration generated; remote DB migration pending before runtime/deploy.
```

## 已完成主链

```text
MVP-001  Learning / DB boundary
MVP-002  PostgreSQL Schema / Migration / Seed
MVP-003  Learning State / Enrollment / Progress API
MVP-004  Email Auth / Session
MVP-005  Entitlement / Lesson Access
MVP-006  Admin Course Publish
MVP-007  Content / Knowledge
MVP-008  Interactive Lesson / Practice
MVP-009  Feedback / Event / Course Insight
MVP-010  Practice / Project 正式化
```

## MVP-009 当前真实状态

正式数据模型：

```text
learning_events
learning_feedback
course_insights
course_update_candidates
```

Migration：

```text
drizzle/0004_dapper_night_thrasher.sql
```

当前规则：

```text
客户端只能写入允许的低风险 Event
服务端结果事件由服务端产生
前端伪造 practice_passed 被拒绝
Feedback 按 lesson + issue_key 聚合独立用户
3 位独立用户 → ANALYSIS_READY
5 位独立用户或 quality risk → HIGH priority
单条 quality risk 可进入 REVIEW_REQUIRED
Candidate 只进入 PENDING_REVIEW，不自动更新课程
```

## MVP-009 Runtime Verification

```text
已有课程问题 → 返回课程入口且不调用 AI          PASS
合法低风险 Event                              201
前端伪造 practice_passed                     400
3 个独立用户同类反馈                         ANALYSIS_READY
单个“内容可能过时”反馈                       REVIEW_REQUIRED
测试用户 / 测试 Insight 清理                 PASS
```

## AI Analysis 边界

代码已经接通：

```text
ANALYSIS_READY
→ AI Analysis
→ Course Coverage Check
→ Course Update Candidate
→ Human Review
```

但当前开发环境没有配置：

```text
OPC_AI_ANALYSIS_BASE_URL
OPC_AI_ANALYSIS_API_KEY
OPC_AI_ANALYSIS_MODEL
```

因此当前没有真实模型 Runtime 证据。规则聚合仍保持 `RULE` / `ANALYSIS_READY`，不得冒充 AI Diagnosis。

独立后续验证项：

```text
MVP-009-AI-RUNTIME
Status: PENDING_EXTERNAL_CONFIG
```

它不阻塞 MVP-010。

## 当前产品数据闭环

```text
Lesson / Practice
↓
Learning Event / Feedback
↓
Rule Aggregation
↓
OPEN / REVIEW_REQUIRED / ANALYSIS_READY
↓
AI Analysis（仅 Provider 配置后）
↓
Course Update Candidate
↓
Human Review
↓
人工决定是否进入课程更新任务
```

AI 永远不能直接覆盖 Published Course。

## NOW

MVP-011-A 已完成：现有 Content / Knowledge 后端不再只是 API 能力，管理员现在可通过 `/admin/content` 完成 Content Queue、编辑、审核状态与发布管理。

当前正式发布边界保持：

```text
Content Item
→ DRAFT / REVIEW / PUBLISHED / ARCHIVED
→ PUBLISHED + destination != IGNORE
→ AI Daily reader
```

Content create / update 会主动失效 `opc-published-content` 缓存。

MVP-011-B 已完成 `Content → Knowledge` 正式人工路由：

```text
destination = KNOWLEDGE_CAPSULE
→ /admin/content 人工确认
→ POST /api/admin/content/items/:itemId/knowledge
→ Knowledge Item
→ sourceContentId 绑定
```

重复路由会先按 `sourceContentId` 返回已有 Knowledge，不重复创建。当前 `content_items` 没有 `stageId`，因此 Stage / Lesson 不做自动推断，由管理员人工确认。

MVP-011-C1 已完成正式 Knowledge → Latest Practice 闭环：

```text
Published Knowledge
→ /admin/content 人工定义 Latest Practice
→ sourceKnowledgeId / sourceContentId 绑定
→ PUBLISHED LATEST_PRACTICE
→ /practice / /practice/latest
→ /practice/latest/[id]
→ PracticeSubmissionPanel
→ Submission / Evaluation
```

未发布 Knowledge 可准备 DRAFT / REVIEW Practice，但不能发布可用 Practice。Latest Practice 以前台正式 Reader 为主数据源，`lib/contentDemo.ts` 只保留数据库不可用 / 无正式数据时的开发 fallback。

MVP-011-C2 已完成统一 Course Update Candidate 多来源代码链：

```text
Learning Insight → Candidate(sourceType=LEARNING_INSIGHT)
Published Knowledge → Human Proposal → Candidate(sourceType=KNOWLEDGE)
↓
/admin/learning
↓
APPROVED / NEEDS_REVISION / DISMISSED
```

Insight 来源审核继续同步 `course_insights.status`；Knowledge 来源审核只更新 Candidate，不改变 Knowledge 状态。两种来源批准后都不会自动修改或发布 Lesson。

Schema migration 已生成：`drizzle/0006_square_sharon_carter.sql`。当前数据库目标为 REMOTE，因此未自动执行 `db:migrate`；真实 C2 Runtime / 部署前需先执行并验证 migration。

UI-IA-001 已同步完成前端导航修正：

```text
学习路径 / 实操项目 / 查看更多 → /projects
进阶练习 / 最新技术实操 / 查看更多 → /practice/latest
最新技术文稿详情 → /practice/latest/[id]
有关联课程 → 明确「查看课程」
无关联课程 → 独立文稿详情
```

后续前端固定规则：当“查看更多”代表同一类内容的扩展集合时，应优先新建对应列表页；当单条知识需要独立阅读时，应建立详情页。是否新开页面以用户理解路径是否连续、语义是否一致为判断标准，不用已有但语义不同的页面硬接。

## Runtime / Quality Gate

MVP-011-A：`npm run typecheck` PASS；`npm run build` PASS；production build 已生成 `/admin/content`。Build 仅有既有 CSS autoprefixer `end` mixed-support warning。

UI-IA-001：`npm run typecheck` PASS；`npm run build` PASS；production build 当前 36 pages，已生成 `/projects`、`/practice/latest` 与 3 个 `/practice/latest/[id]` 静态详情页。

MVP-011-B：`npm run typecheck` PASS；`npm run build` PASS；production build 已生成 `/api/admin/content/items/[itemId]/knowledge`。

MVP-011-C1：`npm run typecheck` PASS；`npm run build` PASS；production build 已生成 `/api/admin/knowledge/items/[itemId]/practice`，并确认 `/practice`、`/practice/latest`、`/practice/latest/[id]` 为 dynamic server routes。

MVP-011-C2：`npm run db:generate` PASS；`npm run typecheck` PASS；`npm run build` PASS；production build 已生成 `/api/admin/knowledge/items/[itemId]/course-candidate`。远程 DB migration 尚未执行，因此未记真实 C2 DB Runtime PASS。

HTTP runtime smoke 未记为 PASS：当前目录存在旧 Next development 运行环境干扰 `.next`，独立 production start 无法取得稳定 BUILD_ID。未为了测试强行终止未知旧开发进程；详见 `docs/task-results/MVP-011-A.md`。

## Git

当前项目使用 Git 作为后续阶段事实基线。

```text
branch: main
MVP-011-C2 start baseline: 26ee932
working tree at task start: clean
```

`.gitignore` 已排除 `node_modules/`、`.next/`、`.env.local`、`.env.*.local`、`*.tsbuildinfo`、`*.log`。

每个后续任务要求：实现 → 验证 → 文档同步 → 原子 commit → 再读 Git / 当前文件确定下一任务。
## MVP-010 Checkpoint A Audit

已完成只读前置审计。现有 `practices / practice_submissions / practice_evaluations` 可继续作为唯一正式 Practice 核心。

当前主要结构缺口：`practices.lesson_id` 强制非空、Submission validator / RULE evaluator 仍绑定 task-brief 五字段、Practice / Stage Project 前台仍有静态数据入口。

下一步：MVP-010-A1 Schema normalization。只扩展 Practice 类型与归属，不新建平行 Submission / Evaluation 表。

## BIZ-AUDIT-001 — Membership Audit

Status: COMPLETE

审计确认：`entitlements` 可继续作为正式权限基础，但当前 `MEMBERSHIP` 类型没有实际 grant / access consumer。前台月卡 ¥39、年卡 ¥299 与权益对照目前是目标产品定义，尚没有 Subscription / Order / Payment / Webhook / Renewal / Refund 正式业务模型。

特别风险：当前 Entitlement 唯一键不包含 source，同一资源的公众号 / 会员 / Promotion 多来源授权不能简单用同 tuple upsert 覆盖。MVP 推荐保留独立 global Membership Entitlement，并由统一 Access Policy 与其它资源 Entitlement 组合判断。

下一步：`BIZ-FOUNDATION-001`，只固定 Membership Policy / Entitlement Matrix / Access Resolver，不接支付；完成后继续 MVP-010。

## BIZ-FOUNDATION-001 — Membership Foundation

Status: COMPLETE

已固定 canonical Membership：

```text
MEMBERSHIP + PRODUCT + OPC_MEMBER
月卡 ¥39 / 月
年卡 ¥299 / 年
```

会员 UI 与服务端共享同一 policy source。已增加 `getMembershipStatus()` 与 `resolveMembershipFeatureAccess()`；现有 Lesson Access 现在允许 `active Membership OR specific Chapter Entitlement`，同时继续保留 Stage prerequisite。

未接支付，也未新增 Subscription / Order / Payment。完整 Course / Practice / AI Daily 的会员分层将在各资源拥有正式 access metadata 后接入统一 resolver，不在页面散落判断。

质量门：`npm run typecheck` PASS；`npm run build` PASS；Next.js 生成 31 个页面。下一步恢复 MVP-010-A1 Practice Schema normalization；Practice Access 必须复用 Membership Policy。


## MVP-010-A1 — Practice Schema normalization

Status: COMPLETE

已完成：

```text
practice_type = LESSON_PRACTICE / STAGE_PROJECT / LATEST_PRACTICE
practice_access_tier = INHERIT / FREE / MEMBER
lesson_id nullable
stage_id nullable
source_content_id nullable
source_knowledge_id nullable
submission_schema JSONB
```

Migration：`drizzle/0005_icy_lily_hollister.sql`，已实际 migrate / seed。

现有 `practice_task_brief_structured` Runtime 验证继续为 `LESSON_PRACTICE + INHERIT + TASK_BRIEF_V1`，没有复制 Submission / Evaluation 系统。

质量门：typecheck PASS；build PASS；31 pages。

下一步：MVP-010-A2 Practice Access Resolver，统一 ownership validation + Lesson / Stage / Membership Policy。

## MVP-010-A2 — Practice Access Resolver

Status: COMPLETE

新增 `lib/server/practices/access.ts`，统一 `resolvePracticeAccess(userId, practiceId)`。

正式支持：

```text
LESSON_PRACTICE → Lesson Access
STAGE_PROJECT   → Stage prerequisite
LATEST_PRACTICE→ Published Content / Knowledge source
MEMBER tier     → 复用 OPC Membership Policy
```

Runtime：Lesson FREE / Stage FREE / Latest FREE 均 ALLOWED；Latest MEMBER 无会员返回 MEMBERSHIP_REQUIRED；错误 ownership 返回 PRACTICE_OWNERSHIP_INVALID。

现有 `practice_task_brief_structured` 使用临时测试用户真实提交，结果 PASSED / RULE 98，测试数据已清理。

质量门：typecheck PASS；build PASS；31 pages。

下一步：MVP-010-B Practice Read / Submit API normalization。

## MVP-010-B — Practice Read / Submit API normalization

Status: COMPLETE

新增 canonical Practice service：

```text
getPracticeReadModel()
getLatestPracticeSubmission()
getPracticeForSubmission()
```

新增正式 read API：

```text
GET /api/learning/practices/:practiceId
```

现有 submissions route 现在同时支持 latest GET + submit POST。

真实 Runtime 已证明 `STAGE_PROJECT` 与 `LATEST_PRACTICE` 可以共用现有 `practice_submissions / practice_evaluations` 完成 PASSED，并读取 latest submission / evaluation；MEMBER Practice 未授权时不暴露 content。

当前唯一明显限制：Submission validator / RULE evaluator 仍绑定 `TASK_BRIEF_V1` 五字段。下一小步建议 `MVP-010-B2` 做 submission_schema validator dispatch，然后进入正式 Vertical Slice。

质量门：typecheck PASS；build PASS；31 pages。

## MVP-010-B2 — Submission Schema Validator Dispatch

Status: COMPLETE

新增 `lib/server/practices/submission-schema.ts`，`submission_schema` 已真正参与 Runtime：

```text
Practice schema
→ parse
→ validator dispatch
→ normalized content
→ Submission
→ Evaluation
```

当前唯一正式 schema：`TASK_BRIEF_V1`。合法五字段正常提交；缺字段返回 `INVALID_PRACTICE_CONTENT`；未知 schema 返回 `UNSUPPORTED_SUBMISSION_SCHEMA`；非法 schema 返回 `INVALID_SUBMISSION_SCHEMA`。

Runtime 验证确认 unsupported schema 在创建 Submission 前失败，不会产生脏 Submission。

质量门：typecheck PASS；build PASS；31 pages。

下一步：MVP-010-C Vertical Slice，先继续使用 TASK_BRIEF_V1，不在同一阶段扩第二种 schema。

## MVP-010-C — Vertical Slice

Status: COMPLETE

正式代表 Practice：`practice_task_brief_structured`。

前端 Practice 已从旧 interactive practice state 切换到 canonical：

```text
GET /api/learning/practices/:practiceId
```

真实纵向 Runtime：

```text
Practice 前完成 Lesson → PRACTICE_REQUIRED
Canonical Read Before  → allowed / no submission
Submit + RULE Eval      → PASSED / 96
Canonical Read After   → latest PASSED
完成 Lesson             → PASS
Events                  → submission_created / evaluation_completed / practice_passed / lesson_completed
```

测试用户和关联数据已清理。

质量门：typecheck PASS；build PASS；31 pages。

下一步：MVP-010-D，分别建立 1 个正式 STAGE_PROJECT 与 1 个正式 LATEST_PRACTICE 样本，继续复用同一核心。

## MVP-010-D — Stage Project + Latest Practice Samples

Status: COMPLETE

正式样本：

```text
practice_stage_personal_knowledge_assistant
STAGE_PROJECT / MEMBER / stage_chatgpt_worker

practice_latest_evaluation_workflow
LATEST_PRACTICE / FREE
source = content_demo_evaluation-practice + knowledge_demo_evaluation-practice
```

两个样本均为 `TASK_BRIEF_V1 + PUBLISHED`，已写入正式 seed，并在 `stageProjects / contentDemo` 产品数据中记录对应 practiceId。

Runtime：Stage Project 非会员 → MEMBERSHIP_REQUIRED / content null；授予 OPC_MEMBER 后 → MEMBERSHIP；提交 PASSED / 98。Latest Practice → ALLOWED；提交 PASSED / 96。两类均产生 submission_created / evaluation_completed / practice_passed，且非 Lesson Event 的 lessonId 为 null。

质量门：typecheck PASS；db:seed PASS；build PASS；31 pages。测试用户及关联数据已清理。

当前 `/projects/[slug]` 与 `/practice` 仍主要是静态展示，没有在 D 阶段顺手扩正式提交 UI。下一步先做 MVP-010 总体验收，再决定收口前是否需要接 UI。

## MVP-010-ACCEPTANCE — Closeout

Status: COMPLETE

最终综合 Runtime 已通过：三类 Practice 共用同一 `practices / practice_submissions / practice_evaluations` 核心；Lesson Completion Gate、Stage prerequisite、Membership、Latest Published Source、User Isolation、Event scope 与会员到期历史记录保留均验证通过。

Acceptance 期间发现并修复一个事实偏差：D 阶段文档所写的 `stageProjects.practiceId / contentDemo.practiceId` 映射没有真实保存，现已修正，并将正式 Stage Project / Latest Practice 接入用户侧最小提交 UI：

```text
/projects/personal-knowledge-assistant
→ practice_stage_personal_knowledge_assistant

/practice
→ practice_latest_evaluation_workflow
```

最终质量门：`npm run typecheck` PASS；`npm run build` PASS；Next.js 31 pages。

当前真实边界：Practice Evaluation 状态为 `SUBMITTED / NEEDS_REVISION / PASSED / EVALUATION_FAILED`；不把 MVP-009 的 `REVIEW_REQUIRED` 人工审核语义混入 Practice 状态。

下一阶段尚未自动启动。真实 Subscription / Payment 仍未接入，继续属于后续会员付费阶段。

## MVP-CLOSEOUT-AUDIT-001 — Consistency Audit

Status: COMPLETE

数据库只读一致性检查 PASS：3 个正式 Practice ownership 正常；无 Published Latest Practice 断源；无 Submission 缺 Evaluation；无 PASSED / Evaluation 状态冲突；无 orphan Practice Event；当前 active Membership = 0。

需要在下一阶段前处理的主要一致性缺口：

```text
P0 会员权益文案超前于实际 Access Runtime
P0 /practice 的 Latest Practice 正式 Panel 当前未真正挂载
P1 Basic Practice 仍是静态展示双轨
P1 Stage Project 是否参与 Stage Completion 尚未决策
P1 Interactive / Completion 查询未显式限定 LESSON_PRACTICE
P1 TASKS / PROJECT_STATUS 治理状态存在漂移
P2 小规模 N+1 查询
```

建议下一步只做 `MVP-CLOSEOUT-FIX-001` 小修复，再确定 MVP-011。

## MVP-CLOSEOUT-FIX-001 — Consistency Fix

Status: COMPLETE

已完成以下一致性修复：

```text
/practice Latest Practice → 正式 PracticeSubmissionPanel
Basic Practice → 明确为自主练习，不保存正式进度
Interactive Lesson → 显式只读取 LESSON_PRACTICE
Lesson Completion Gate → 显式只检查 required LESSON_PRACTICE
Membership Benefits → 当前已开放与规划权益分开标识
Stage Project → 当前为可选项目，不阻塞 Stage progression
TASKS / PROJECT_STATUS → 当前状态同步
```

真实支付 / Subscription / Refund、AI Evaluator、第二 Submission Schema、N+1 优化均未进入本修复任务。


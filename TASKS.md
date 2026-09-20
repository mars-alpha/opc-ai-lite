# TASKS.md

> NOW / NEXT / BACKLOG。完成结果进入 `docs/task-results/`。

# COMPLETED

## MVP-007 — Content / Knowledge 基础模型与读取

Status: COMPLETE
Priority: P0

已完成 Content / Knowledge 正式 PostgreSQL 模型、Published 读取边界、AI Daily 正式读取与静态 fallback。

## MVP-008 — Interactive Lesson / Practice 最小学习闭环

Status: COMPLETE
Priority: P0

试点 `chatgpt-worker / task-brief` 已跑通理解检查、Practice Submission、规则 Evaluation、Retry、PASSED、Lesson Completion 防绕过与 Runtime Verification。

结果：`docs/task-results/MVP-008.md`。

## MVP-009 — Feedback / Event 最小数据闭环

Status: COMPLETE_WITH_EXTERNAL_RUNTIME_PENDING
Priority: P0

### Goal

建立用户学习反馈、关键学习事件、问题聚合、人工审核与课程更新候选的最小闭环；AI 只负责达到条件后的辅助分析，不允许规则聚合冒充 AI，也不允许 AI 自动覆盖 Published 课程。

### 已完成

- `learning_events`
- `learning_feedback`
- `course_insights`
- `course_update_candidates`
- Migration：`drizzle/0004_dapper_night_thrasher.sql`
- Event 写入白名单与服务端事件防伪
- Feedback issue_key 归一与独立用户聚合
- 3 位独立用户达到同类反馈阈值后进入 `ANALYSIS_READY`
- 质量风险反馈可直接进入 `REVIEW_REQUIRED`
- 已有课程问题优先返回课程入口，不调用 AI
- AI Analysis / Course Coverage / Candidate 代码链路已接通
- Candidate 必须人工审核；AI 输出只能是 Proposal

### Runtime 已验证

```text
已有课程问题 → 返回课程入口且不调用 AI          PASS
合法低风险 Event → 201                         PASS
前端伪造 practice_passed → 400                 PASS
3 个独立用户同类反馈 → ANALYSIS_READY           PASS
单个“内容可能过时”反馈 → REVIEW_REQUIRED        PASS
测试用户 / 测试 Insight 清理                    PASS
```

### External Runtime Pending

当前开发环境未配置：

```text
OPC_AI_ANALYSIS_BASE_URL
OPC_AI_ANALYSIS_API_KEY
OPC_AI_ANALYSIS_MODEL
```

因此未执行真实 Provider Runtime Validation。规则聚合结果不作为 AI 分析结果。

后续独立验证项：`MVP-009-AI-RUNTIME`，状态 `PENDING_EXTERNAL_CONFIG`，不阻塞产品主线。


## BIZ-AUDIT-001 — MVP 业务闭环与会员订阅 / 权益审计

Status: COMPLETE
Priority: P0

结果：`docs/task-results/BIZ-AUDIT-001.md`。

核心结论：Entitlement 基础方向正确，但当前 MEMBERSHIP 尚未被任何真实 Access Policy 使用；月卡 ¥39 / 年卡 ¥299 与会员权益目前仍是产品展示层。真实 Subscription / Order / Payment / Renewal / Refund 尚未实现。

下一步先做 `BIZ-FOUNDATION-001` 固定 Membership Policy 与统一 Access Resolver，不接真实支付；随后继续 MVP-010。

## BIZ-FOUNDATION-001 — Membership Policy / Access Foundation

Status: COMPLETE
Priority: P0

结果：`docs/task-results/BIZ-FOUNDATION-001.md`。

已统一月卡 ¥39 / 年卡 ¥299、会员权益矩阵与 global Membership Entitlement：`MEMBERSHIP + PRODUCT + OPC_MEMBER`。现有 Lesson Access 已识别 active Membership；Membership 不绕过 Stage prerequisite。

本任务不接支付、不新增 Subscription / Order / Payment Schema。下一步回到 MVP-010-A1，Practice Access 必须复用统一 Membership Policy。

## MVP-CLOSEOUT-AUDIT-001 — Product / Access / Data Consistency Audit

Status: COMPLETE
Priority: P0

结果：`docs/task-results/MVP-CLOSEOUT-AUDIT-001.md`。

审计结论：Practice / Submission / Evaluation 数据一致性 PASS；发现会员权益文案超前于真实 Runtime、`/practice` Latest Practice UI 文档与代码不一致、Stage Project Completion 规则未定、Basic Practice 静态双轨、Lesson-only type filter 未显式落实，以及治理文档状态漂移。

建议下一步：`MVP-CLOSEOUT-FIX-001`，只做小范围一致性修复，不扩支付 / AI Evaluator / 新 Schema。

## MVP-CLOSEOUT-FIX-001 — Product / Access / Data Consistency Fix

Status: COMPLETE
Priority: P0

结果：`docs/task-results/MVP-CLOSEOUT-FIX-001.md`。

已完成：`/practice` 正式 Latest Practice Panel 挂载；Lesson Interactive / Completion 显式限定 `LESSON_PRACTICE`；Basic Practice 明确为不保存进度的自主练习；会员权益矩阵区分当前已开放与规划能力；Stage Project 当前固定为可选项目、不阻塞 Stage progression；治理状态同步完成。
# COMPLETED — MVP-010

## MVP-010 — Practice / Project 正式化

Status: COMPLETE
Priority: P0

### Checkpoint A Audit

Status: COMPLETE

结果：`docs/task-results/MVP-010-AUDIT.md`。确认复用现有 Practice / Submission / Evaluation；下一步只做最小 Schema normalization，不新建第二套系统。

### MVP-010-A1 — Practice Schema normalization

Status: COMPLETE

结果：`docs/task-results/MVP-010-A1.md`。

已完成 `LESSON_PRACTICE / STAGE_PROJECT / LATEST_PRACTICE` 类型、ownership 字段、`access_tier`、`submission_schema` 与 Migration 0005；现有 MVP-008 Practice Runtime 数据兼容通过。

下一步：`MVP-010-A2 — Practice Access Resolver`。
### MVP-010-A2 — Practice Access Resolver

Status: COMPLETE

结果：`docs/task-results/MVP-010-A2.md`。

已完成统一 `resolvePracticeAccess()`，覆盖 Lesson / Stage / Latest ownership validation、Stage prerequisite、Lesson Access 与 Membership Policy。现有 task-brief Runtime 提交回归验证通过。

下一步：`MVP-010-B — Practice Read / Submit API normalization`。
### MVP-010-B — Practice Read / Submit API normalization

Status: COMPLETE

结果：`docs/task-results/MVP-010-B.md`。

已增加统一 Practice Read Model、latest submission read、GET `/api/learning/practices/:practiceId`，并让现有 Submission 流程复用 canonical Practice service。Stage Project / Latest Practice 使用同一 Submission / Evaluation Runtime 验证通过。

当前限制：Submission validator 仍为 `TASK_BRIEF_V1`。下一步建议 `MVP-010-B2` 做 schema-dispatched validator，再进入正式 Vertical Slice。
### MVP-010-B2 — Submission Schema Validator Dispatch

Status: COMPLETE

结果：`docs/task-results/MVP-010-B2.md`。

已将 `submission_schema` 接入 Runtime validator dispatch。当前正式注册 `TASK_BRIEF_V1`；unsupported / malformed schema 会在创建 Submission 前明确拒绝，不再静默按 task-brief 处理。

下一步：`MVP-010-C — Vertical Slice`。
### MVP-010-C — Vertical Slice

Status: COMPLETE

结果：`docs/task-results/MVP-010-C.md`。

代表 Practice `practice_task_brief_structured` 已正式改用 canonical Practice Read Model，并完成 Read → Submit → Evaluation → Event → Lesson Completion Gate Runtime。Practice 未通过前完成课程返回 `PRACTICE_REQUIRED`；通过后可完成 Lesson。

下一步：`MVP-010-D — Stage Project + Latest Practice Samples`。
### MVP-010-D — Stage Project + Latest Practice Samples

Status: COMPLETE

结果：`docs/task-results/MVP-010-D.md`。

已建立 1 个正式 MEMBER Stage Project 与 1 个正式 FREE Latest Practice。两者真实共用 canonical Read / Access / Membership / Submission / Evaluation / Event Runtime，分别提交 PASSED 98 / 96；非 Lesson Event 保持 `lessonId = null`。

下一步：`MVP-010-ACCEPTANCE — Practice / Project Runtime Acceptance & Closeout`。
### MVP-010-ACCEPTANCE — Practice / Project Runtime Acceptance & Closeout

Status: COMPLETE

结果：`docs/task-results/MVP-010-ACCEPTANCE.md`。

最终综合 Runtime 验证三类 Practice、会员门禁、用户隔离、历史 Submission 保留、Event scope 与 Lesson Completion Gate 全部通过。Acceptance 同时修复了 `stageProjects / contentDemo` 中未实际持久化的 practiceId 映射，并在 `/projects/[slug]` 与 `/practice` 接入最小 canonical Submission UI。

MVP-010 正式收口。
### Goal

把当前 Lesson 内已验证的 Practice 能力正式化为可复用业务模型，统一支撑：

```text
LESSON_PRACTICE
STAGE_PROJECT
LATEST_PRACTICE
```

形成稳定的：

```text
Practice
→ Submission
→ Evaluation
→ SUBMITTED / NEEDS_REVISION / PASSED / EVALUATION_FAILED
```

### 第一轮范围

- 复用 MVP-008 已有 Practice / Submission / Evaluation，不平行造新系统
- 明确 Practice Type / Status
- 先迁移 1 个代表性 Lesson 做纵向闭环
- PASSED 必须由服务端 Evaluation 产生，前端不可伪造
- Stage Project 与 Latest Practice 共用同一模型
- Event 继续复用 MVP-009，不另建 Analytics

### Out of Scope

- 通用 AI Tutor / Chat
- 大型考试系统
- 多媒体 Submission
- 自动发布课程
- AI 自动修改 Published
- 支付与新渠道

## MVP-011-A — Content Operations Console

Status: COMPLETE
Priority: P0

结果：`docs/task-results/MVP-011-A.md`。

已完成正式 `/admin/content` 工作台，复用现有 Content Schema / Admin API，支持 Content Queue、状态筛选、新建 / 编辑、来源信息、Destination 与 DRAFT / REVIEW / PUBLISHED / ARCHIVED 生命周期。Content 写入后会主动失效 `opc-published-content` 缓存，PUBLISHED 内容继续由既有 AI Daily reader 读取。

## UI-IA-001 — Learning / Practice Navigation Refinement

Status: COMPLETE
Priority: P0

结果：`docs/task-results/UI-IA-001.md`。

已完成前端信息架构修正：学习路径“实操项目 → 查看更多”进入独立 `/projects`；进阶练习“最新技术实操 → 查看更多”进入独立 `/practice/latest`；新增 `/practice/latest/[id]` 文稿详情；最新技术卡片有关联课程时右下角显示“查看课程”，无课程时进入独立文稿。

后续产品导航规则：`查看更多` 优先进入当前内容类型自己的完整列表页；单条知识内容需要独立理解时建立详情页；不要用语义相近但业务不同的已有页面代替正确路由。

## MVP-011-B — Content → Knowledge Routing

Status: COMPLETE
Priority: P0

结果：`docs/task-results/MVP-011-B.md`。

已完成 `KNOWLEDGE_CAPSULE` 的正式人工路由：`/admin/content` 可在确认字段后生成 Knowledge Item，并绑定 `sourceContentId`；重复执行会返回已有关联 Knowledge，不重复创建。当前 Content 没有 stageId，因此 Stage / Lesson 均保持人工确认，不自动猜测。

## MVP-011-C1 — Knowledge → Latest Practice Bridge

Status: COMPLETE
Priority: P0

结果：`docs/task-results/MVP-011-C1.md`。

已完成 Knowledge → LATEST_PRACTICE 的人工创建 / 更新与 sourceKnowledgeId 幂等查重；Practice 继承 Knowledge 的 sourceContentId / stageId / lessonId；未发布 Knowledge 不能发布可用 Latest Practice。`/practice`、`/practice/latest`、`/practice/latest/[id]` 已从静态 Demo 主读取切换为正式 Published Knowledge / Practice Reader，详情页有正式 Practice 时进入 Submission / Evaluation。

## MVP-011-C2 — Multi-source Course Update Candidate

Status: COMPLETE
Priority: P0

结果：`docs/task-results/MVP-011-C2.md`。

已完成 Course Update Candidate 多来源模型：旧 `LEARNING_INSIGHT` 链保持兼容；新增 `KNOWLEDGE` 来源、人工创建 Candidate、sourceKnowledgeId + lessonId 幂等约束、统一 `/admin/learning` 审核显示与 source-aware review。APPROVED 仍不会自动修改 Published Lesson。

Migration：`drizzle/0006_square_sharon_carter.sql` 已在 `RUNTIME-001` 应用到远程数据库；Knowledge → Course Candidate 创建与幂等 Runtime 已验证。

## GOV-FACTS-001 — Repository Fact Baseline & Development Governance

Status: COMPLETE
Priority: P0

已完成全仓 Git 受控文件盘点与当前运行事实同步；新增 `AGENTS.md` 与 `docs/CURRENT_SYSTEM_FACTS.md`，并将 `PROJECT_STATUS.md` 收敛为当前状态文件。后续任务必须先读当前事实与受影响代码，优先保证系统可运行，完成后同步事实 / 阶段 / Git，不因未来可能需求扩大当前任务。

固定事实源层级与收口流程见 `AGENTS.md`。

## MVP-011-D — Knowledge Provenance Foundation

Status: COMPLETE
Priority: P0

结果：`docs/task-results/MVP-011-D.md`。

已完成最小 Knowledge 多来源模型：保留 `knowledge_items.sourceContentId` 作为 Primary Source 快捷字段；新增 `knowledge_source_links` 支持 PRIMARY / SUPPORTING；旧 Primary Source 由 0007 migration 自动 backfill；同一 Knowledge + Content 唯一；Supporting Content 再进入 Content → Knowledge 时会识别已有 Knowledge，不重复创建。

新增 Admin 来源读取 / 添加 Supporting Source API 与最小 UI。没有进入 Feishu / Obsidian / Skill / Media / AI 自动选源。

Migration：`drizzle/0007_pink_spirit.sql` 已在 `RUNTIME-001` 应用到远程数据库；PRIMARY / SUPPORTING provenance 与幂等 Runtime 已验证。

## MVP-011-E — Deep Resource / Feishu Bridge

Status: COMPLETE
Priority: P0

结果：`docs/task-results/MVP-011-E.md`。

已完成最小 Knowledge-owned Deep Resource：新增 `knowledge_deep_resources`，Knowledge 必填，Lesson / Practice 可选；provider 固定 FEISHU，保存 title / summary / resourceRef / HTTPS URL / publication status。没有复用 `lesson_resources`，避免把 Knowledge 深度资料错误建模为 Lesson 附件。

Admin 已可在 Content → Knowledge 工作区查看、新建、编辑 Deep Resource。只有 Published Knowledge 才能把 Deep Resource 设为 PUBLISHED；未发布 Knowledge 只能保存 DRAFT / REVIEW 等不可用状态。

Migration：`drizzle/0008_overrated_triton.sql` 已在 `RUNTIME-001` 应用到远程数据库；Deep Resource 创建 / 幂等 / 更新 Runtime 已验证。

本阶段没有 Feishu API / OAuth / Bot / 自动发布 / 双向同步，没有用户侧 Deep Resource Reader，也没有 Membership Access 接入。

## MVP-011-F — Knowledge → Practice AI Draft Workflow

Status: COMPLETE_WITH_AI_RUNTIME_PENDING
Priority: P0

结果：`docs/task-results/MVP-011-F.md`。

已完成最小 Practice Draft 审核层：新增 `practice_drafts`，每个 Knowledge 最多一个 Draft，可选引用 Published Deep Resource。Draft 保存 generationMode / generationError / 结构化候选内容 / 审核状态 / 最终 resultPracticeId。

正式 `practices` 仍是唯一 Practice Source of Truth。APPROVED 只创建 `LATEST_PRACTICE` 且 status 固定 DRAFT；已有正式 Latest Practice 时拒绝覆盖，必须继续使用现有人工编辑入口。

首次真实 Skill 已落盘：`skills/practice-draft/v0.1.ts`，并被生成服务实际调用。当前环境 `AI_PROVIDER_CONFIGURED=NO`，因此本阶段真实验证的是 RULE Draft fallback；没有伪造 AI 结果。

Migration：`drizzle/0009_chief_marvex.sql` 已在 `RUNTIME-001` 应用到远程数据库；RULE Draft → APPROVED → LATEST_PRACTICE DRAFT 与 overwrite guard 已验证。真实 AI Provider 仍未配置。

## MVP-011-G — Knowledge → Course Impact Analysis

Status: COMPLETE
Priority: P0

结果：`docs/task-results/MVP-011-G.md`。

已完成最小课程影响分析层：Published / active Knowledge 会与当前 Published Lesson catalog 对比，返回 lessonId / disposition / affectedArea / proposedChange / rationale / confidence 建议。

分析结果只存在于当前 Admin 会话，不新增表、不新增 migration。管理员必须明确点击“采用”，再人工确认表单，最后才复用现有 Knowledge → Course Update Candidate API。已有 Knowledge + Lesson Candidate 继续由现有唯一约束与服务保持幂等。

Provider 配置存在时才调用真实 AI。当前 `AI_PROVIDER_CONFIGURED=NO`，因此已验证的是 conservative RULE 分析：只在 Knowledge 已关联 lessonId / stageId 时提供候选，否则返回空建议，不随意猜 Lesson。

Candidate 仍固定进入 PENDING_REVIEW；分析层没有 APPROVE 权限，不写 Lesson、不发布课程。

## RUNTIME-001 — Remote Migration 0006–0009 + End-to-End Runtime Verification

Status: COMPLETE
Priority: P0

结果：`docs/task-results/RUNTIME-001.md`。

已将 0006–0009 应用到远程 PostgreSQL，并完成真实 Admin API / Remote DB smoke：

```text
Content → Knowledge / PRIMARY + SUPPORTING provenance PASS
Knowledge → Course Candidate create / idempotency       PASS
Knowledge → Deep Resource create / idempotency / update PASS
Knowledge → Practice Draft RULE → APPROVED → Practice DRAFT PASS
Existing Latest Practice overwrite guard                PASS
RUNTIME001 test data cleanup                             PASS
```

本阶段没有新增产品功能或 Schema。

# NEXT PHASE

`ACCESS-001 — AI Daily / Knowledge / Practice Access Policy`

目标：把已经批准的用户权限规则接入统一 Access Resolver，使当前远程 Runtime 形成可验收的用户侧 MVP。暂不扩 Payment / WeChat OAuth / AI Daily 自动采集 / Obsidian / Media / Feishu 自动同步。

建议后续顺序：

```text
ACCESS-001           AI Daily / Knowledge / Practice Access Policy
AI-DAILY-001         最小自动采集 → 审核 → 发布
MVP-009-AI-RUNTIME   真实 Provider / Skill v0.1 质量迭代
KNOWLEDGE-SYNC-001   Reviewed Knowledge → Obsidian Export
SKILL-001            Skill v0.1 Review / Iteration
MEDIA-001            Skill-driven Media Asset Factory
```

Skill 固定原则：真实业务需要时版本化落盘并依据真实结果迭代；不提前建设通用 Skill Platform。

# BACKLOG

```text
MVP-009-AI-RUNTIME（等待真实 Provider 配置）
课程 Published 历史版本
复杂 Admin RBAC
真实微信 OAuth
公众号 Webhook / OpenID 绑定
AI Daily 正式采集与审核
公众号内容推送
企业微信 AI 客服
Obsidian Markdown 导出
会员与权益增强
微信小程序客户端
```





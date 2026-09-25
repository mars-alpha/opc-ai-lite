# TASKS.md

> NOW / NEXT / BACKLOG + 必要历史任务摘要。完成任务不再默认生成或永久保留独立 `docs/task-results/*`；只有当前 Runtime、Validator、可执行复现或唯一验收证据仍依赖时才保留。Current state 必须读取 `PROJECT_STATUS.md` / `docs/CURRENT_SYSTEM_FACTS.md` / current owner，不从旧任务条目恢复。

# NOW — TRACK02-NEXT-BATCH-PLANNING

Status: T2-04～T2-06 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE PASS

- T2-04 同样的信息，怎样讲给不同的人听：接收者与沟通目的。
- T2-05 一堆资料，怎么变成能交付的成品：有依据的交付物。
- T2-06 AI 已经写出来了，但“不好”，到底怎么改：诊断和定向修订。
- Formal Brief：`docs/learning/TRACK02_BATCH_B_T2_04_T2_06_FORMAL_BRIEFS_V1.md`；BUILD Draft：`fixtures/course-builder/track02-batch-b.ts`。
- Workflow / 校验：`scripts/run-track02-batch-b-workflow.ts`、`scripts/validate-track02-batch-b-drafts.ts`。三课 LessonSpec 与正式课程展示映射已注册；学员已确认正式课程，远端数据库 Provision、Runtime Acceptance 与公开目录均已完成。
- T2-07～T2-15 仍是批准目录；后续按「会处理复杂资料」T2-07～09、「会看数据」T2-10～12、「会积累知识」T2-13～14、「会复用方法」T2-15 分批准备 Brief，沿用同一 Workflow。不提前标为课件已输出。

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

Status: COMPLETE / HISTORICAL_ONLY / SUPERSEDED_BY_UI_IA_002
Priority: P0

结果：`docs/task-results/UI-IA-001.md`。

该任务记录的是当时真实历史实现，但其中“学习路径承载实操项目”“最新技术实操进入独立 `/practice/latest` 卡片列表页”的产品 IA 已被 UI-IA-002 替代，不得作为当前前端恢复依据。历史 task-result 仅保留追溯价值。

## UI-IA-002 — Current Frontend Information Architecture Freeze

Status: COMPLETE / FROZEN_CURRENT
Priority: P0

当前基线：学习路径只承载 Track 学习地图与课程入口；实操项目已移入进阶练习，作为多能力综合应用层；原“最新技术实操”前台概念废止，其数据能力合并到“AI 热点能力练习”。

AI 热点能力练习沿用原“一次只练一个能力”的纵向 `practice-list / practice-row` UI，不新增卡片式列表。来源边界为“AI 日报 / 热点采集 → 初步完整知识点 → 单项能力练习”，具体自动采集、整理、审核与生成流程留待后续 Content / Knowledge / Skill 任务。

列表交互固定：默认 3 条；“查看更多”位于底部居中、纯文字、当前页每次追加 3 条；测试阶段不足真实内容时由 fallback 补足至 7 条验证 3 → 6 → 7；全部展示后显示“— 已展示全部内容 —”；重新进入恢复 3 条。

清理：删除已被替代的 `app/practice/latest/page.tsx` 与仅服务该页面的 `LatestPracticeCard.tsx`；保留 `/practice/latest/[id]` 单条详情与正式 Practice Runtime，详情返回 `/practice#tasks`。

Membership / Follow：会员权益前台固定为 AI 基础认知课程、AI 日报、进阶练习、实操项目、进阶内容；公众号是解锁基础课程全章节 / 完整 AI 日报与学习助手推送入口，推送不等于会员资源 Access。

Validation：`practice:ia:check` 与 `access:membership-policy:check` 固化当前 IA / 权益；Course Production Workflow 与 Course Builder rule sources 不因本任务变化。

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

## ACCESS-001 — AI Daily / Knowledge / Practice Access Policy

Status: COMPLETE
Priority: P0

结果：`docs/task-results/ACCESS-001.md`。

已新增统一 `resolveResourceAccess()`，把 AI Daily、Knowledge、Deep Resource、Latest Practice 与进阶内容课程入口的用户权限收敛到 Deterministic Core。公众号关注只解锁完整 AI Daily，不等价于 Membership。

公开 Latest Practice Reader 已改成 safe-field query；非会员不会读取或在 Next RSC payload 中获得 Knowledge body、Feishu URL、正式 Practice / Course 私有关系。正式 LATEST_PRACTICE 即使历史 accessTier=FREE，也按当前产品政策要求 Membership。

匿名 / 普通 / FOLLOW / MEMBER 四身份 Runtime smoke 全部通过；无新 Schema / Migration，测试数据已清理。

## ACCESS-UX-001 — Locked Content Conversion UX

Status: COMPLETE
Priority: P0

结果：`docs/task-results/ACCESS-UX-001.md`。

已把“锁定即消失”改成“价值可发现、Access 仍受控”。AI Daily 第 4 条及以后继续显示标题 / 摘要 / 标签并进入锁定态；公众号关注与 OPC Membership 分别给出明确 CTA。Knowledge / Latest Practice / Deep Resource / 进阶课程保持会员 Access，但公开摘要与会员价值说明继续可见。

新增共享 `LockedAccessCta` 与首页公众号解锁说明区；未接入真实微信关注验证或支付，不提供假的“我已关注”或可用支付按钮。

## LEARNING-UX-001 — Guided Learning + Case Practice + Tiered Conversion MVP

Status: COMPLETE_WITH_MANUAL_UX_REVIEW_PENDING
Priority: P0

结果：`docs/task-results/LEARNING-UX-001.md`。

已选择 `chatgpt-worker / task-brief` 作为唯一 Guided Learning 样板，复用现有 Check / Practice / RULE Evaluation / Completion Gate，改成 6 步引导式学习：先理解 → 看案例 → 理解检查 → 跟着做 → 反馈与复习 → 下一步。

理解检查未通过不能继续；会推荐复习 `ai-literacy / context-token`。Practice 未通过不能进入最终能力总结；按分项反馈修改并重试。最终步骤明确免费 / 公众号 / OPC Membership 的学习深度与继续价值。

当前没有迁移其他 Lesson，没有新增 Schema / Migration，没有建立复杂 Mastery / Knowledge Point / Recommendation Engine。

## LEARNING-UX-001-C — Guided Learning Completion Loop

Status: COMPLETE
Priority: P0

在现有 task-brief Guided Learning 样板上补齐完整体验闭环：保留课程目录 / 当前课 / 完成进度，主区按 Step 学习；Step 切换保持当前视口；主动“还是不懂”只给当前提示；参考答案支持查看 / 一键带入 / 恢复；真实 AI 结果可确认；能力成长先于下一课；课程反馈位于下一课导航后且可跳过。

反馈不是 Completion Gate；参考答案是学习脚手架，不等于 Mastered。困难、提示、参考、真实 AI 结果等行为通过现有 Learning Event / Feedback 记录，不新增 Schema / Migration。

## LEARNING-SPEC-001 — OPC Course Construction Specification

Status: COMPLETE
Priority: P0

已新增 `docs/LEARNING_SPEC.md`，固定：六阶段课程能力地图、AI 基础必懂概念、CONCEPT / APPLICATION / PRACTICE / PROJECT 四类 Lesson Type、标准 Step Flow、Practice Closure、学习回顾、能力获得、真实 AI 操作 NONE / GUIDED / REQUIRED、学习自评与课程评分分离、Access CTA 位置、Lesson / Step Spec 草案与 Course Builder Skill BUILD / IMPROVE Contract。

本任务只固化规范，不改 Schema / Migration / Access Core，不批量迁移课程，不实现 Course Builder Skill。

## LEARNING-UX-001-D — Reference Lesson Finalization

Status: COMPLETE
Priority: P0

`chatgpt-worker / task-brief` 已按 `docs/LEARNING_SPEC.md` 完成 Reference Lesson：Step 4 Practice Closure 单一闭环；Step 5 学习回顾 + 最终答案 + 学习自评；Step 6 能力获得；正式完成后点击下一课才触发可跳过课程评分。该课不需要真实 AI 操作证明学会，因此当前 `real_ai_operation = NONE`，已移除原 copy / outcome 流程。新增 `learning_self_assessment` 与 `practice_retry_requested` 行为事件；未新增 Schema / Migration。

## LEARNING-SPEC-002 — Multi-type Lesson Validation

Status: COMPLETE
Priority: P0

已建立机器可读 Lesson Spec Contract 与 validator，并用 `memory-rag`（CONCEPT）、`writing-files`（APPLICATION）、`task-decomposition`（PRACTICE）三个真实课程样本验证：三种 Lesson Type 均 `SPEC=PASS`。本轮补齐 required Check Completion Core Gate，并将 `real_ai_operation=REQUIRED` 收紧为必须同时定义 `real_ai_evidence` 与 `REAL_AI` Completion Gate。

Runtime 验证暴露：当前 Interactive Data 只正式配置 `task-brief`；Practice Submission Schema 只支持 `TASK_BRIEF_V1`；Real AI Evidence / Completion Gate 尚未实现。因此不直接进入 Course Builder Skill。

## LEARNING-RUNTIME-001 — Generic Lesson Runtime Foundation

Status: COMPLETE
Priority: P0

已完成 Lesson Spec → Runtime Plan / Registry / Read Model / Generic Runtime Panel 的最小通用链路；Practice Submission 新增 `STRUCTURED_TEXT_V1`，`rulePracticeEvaluator` 不再绑定 task-brief 五字段；Completion Core 支持 CHECK / PRACTICE / REAL_AI Gate。Real AI Evidence 复用 `learning_events`：USER_CONFIRMATION 可由用户确认，SYSTEM_RESULT 只能由可信服务端写入；ARTIFACT 因没有正式 Artifact Resolver 明确不支持，`writing-files` 暂不注册 Runtime。

`memory-rag` required Check 与 `task-decomposition` required Practice 的 seed 定义已完成，但没有执行远程 `db:seed`，所以本任务只完成 Foundation，不声称两个 Pilot 已正式上线。

## LEARNING-RUNTIME-001-A — Pilot Provisioning & Acceptance

Status: COMPLETE
Priority: P0

已通过窄范围、幂等脚本正式 provision 两个 Pilot：`memory-rag` 的 required Check 与 `task-decomposition` 的 required `STRUCTURED_TEXT_V1` Practice。未运行全量 `db:seed`，未改 Schema / Migration / Access Core。

真实 HTTP Acceptance 使用一次性测试用户验证：`memory-rag` 未通过 Check 时 Completion 返回 `CHECK_REQUIRED`，答对后可完成；`task-decomposition` 未通过 Practice 时返回 `PRACTICE_REQUIRED`，提交有效结构化练习并通过 Rule Evaluation 后可完成。`task-brief` Reference Preview 保持兼容，匿名 workflow 仍受 Stage prerequisite 阻断，`writing-files` 仍未注册 Runtime，ARTIFACT 仍 unsupported。测试身份及其进度、响应、提交、评估、事件均已级联清理。

# NEXT PHASE

`LEARNING-UX-RUNTIME-ALIGN-001 — Reference UX Unification`

Status: COMPLETE
Priority: P0

最新 UX 决策：正式课程不再为 CONCEPT / APPLICATION / PRACTICE 各做独立页面形态。所有 Lesson 统一使用 `task-brief` 已确认的 Reference Lesson Shell：课程上下文 / 侧栏 / 当前课位置 + 单 Step Guided Learning。Lesson Type 只决定 Step 组合、内容、交互模块与 Completion Gate。

已完成：`task-brief`、`memory-rag`（CONCEPT）、`task-decomposition`（PRACTICE）与 `writing-files`（APPLICATION）均使用同一 Generic Guided Lesson Shell。页面不按 lesson 名分支；Lesson Type 只决定 Step 组合、内容、交互模块与 Completion Gate。

`writing-files` 用于验证“注册到统一 UX，但 Runtime 尚未 Ready”的边界：required Check / Practice 尚未 provision，REAL_AI evidence = ARTIFACT 且可信 Resolver 未实现，因此保持 configurationReady=false / enforcementActive=false；同一 Shell 显示 blocker，并不提供正式完成动作。UX 对齐不等于绕过 Runtime Gate。

此前 `/learning-preview` 三课型演示页因与 Reference Lesson 差异过大已删除，不作为后续实现基线。

## COURSE-BUILDER-SKILL-001 — OPC Course Builder Skill v0.1

Status: HISTORICAL_ONLY / SUPERSEDED_BY_COURSE_BUILDER_V1
Priority: P0

历史记录：v0.1 最小契约当时已完成；现文件归档为 `skills/course-builder/_historical-v0.1.ts`。当时由 lib/learning/course-builder.ts 提供 Structured Output parser + Code Validation；只有校验通过的结果才能形成 PENDING_REVIEW Review Packet。当前不接 Provider、不落 Draft 表、不实现自动 Publish，也不改 Access / Progress / Completion。

下一步：COURSE-BUILDER-SKILL-001-A — Real Lesson Draft Acceptance。选一个真实 Lesson Topic，用 v0.1 生成 BUILD Draft，人工审阅内容质量、Step 结构、Check / Practice 与 Unified Lesson Shell 适配；通过真实样本后再决定 Provider 接入、Draft persistence 与 Admin Review UI。

### COURSE-BUILDER-SKILL-001-A — Real Lesson Draft Acceptance

Status: TECHNICAL_ACCEPTANCE_PASS_HUMAN_REVIEW_PENDING

真实样本已选择 `ai-literacy/skill-foundations`：“Skill 是什么：把可复用方法交给 AI”。原因：现有目录已经有“API、Tool、MCP 与 Agent”，继续新增 Agent 基础课会重复；独立 Skill 概念课目前缺失，且符合已确认的基础课程方向。

验收结果：Course Builder Code Validation PASS；Lesson Type=CONCEPT；Step=EXPLAIN → EXAMPLE → CHECK → REVIEW → CAPABILITY；Completion Gate=CHECK；Practice=NONE；REAL_AI=NONE；Generic Runtime Plan PASS；Unified Lesson Shell compatibility PASS；curriculum fit PASS。

Draft 当前仅保存在 `fixtures/course-builder/skill-foundations.ts`，未进入 `lib/courses.ts`、Lesson Spec Registry 或 Production Data。Review Packet 仍为 `PENDING_REVIEW`。下一步先由 Human Review 判断内容、难度、位置与表达是否符合正式课程，再决定是否进入下一层 Runtime。

### COURSE-BUILDER-SKILL-001-B — Draft Preview & Human Review

Status: PREVIEW_READY

新增只读预览路由 `/course-builder/preview/skill-foundations`。它直接读取 acceptance fixture 并复用 Generic Lesson Runtime Renderer 的 Step 结构；`previewMode` 下 Check 只在浏览器本地判断，不读取/写入正式 Runtime API，也不产生 Progress、Completion、Feedback 或 Published Course 状态。

该路由用于非技术产品负责人直接体验课程。下一步不是继续开发，而是先完成 Human Review：看得懂 / 是否太技术 / 案例与 Check 是否有效 / 是否愿意继续下一课。

### COURSE-BUILDER-SKILL-001-C — Beginner Pedagogy & Knowledge Grounding

Status: COMPLETE

根据 Human Review，Course Builder 已新增四项规则：课程生成必须基于已审核 Knowledge 或研究资料包；术语表达以行业常用和易懂为先，常见专有名词保留原名并在首次出现时补充中文说明；通用课程保持 AI 软件中立；CONCEPT 也必须有参与活动和可感知获得感，参与活动与正式 Completion Gate 分离。

真实样本 `skill-foundations` 已重写为生活化“会议记录”场景，并加入“复制到你正在使用的 AI 软件”互动。研究资料包记录了 OpenAI 官方关于技能可复用工作流程、指令、配套资料与脚本的公开说明。下一步重新由产品负责人进行 Human Review。

### COURSE-BUILDER-SKILL-001-D — Six-Step Beginner Experience & Visual Hierarchy

Status: COMPLETE

根据 Human Review，初学者 CONCEPT 恢复优先 6 步体验：EXPLAIN → EXAMPLE → CHECK → PRACTICE → REVIEW → CAPABILITY。CONCEPT 的 PRACTICE 可以作为轻量参与步骤存在，即使 `practiceMode=NONE`，但不得设置 PRACTICE Completion Gate。

`skill-foundations` 新增第 4 步“把方法交给你的 AI 试一次”；视觉上缩小第一步标题字号，长内容改成重点底色和卡片，自适应卡片在桌面端按 1/2/3/4 项自动铺排；原 4 条“避免”改成误区/正确理解对照卡。

### COURSE-BUILDER-SKILL-001-E — First Step Interactive Intro

Status: COMPLETE

根据最新 Human Review，本任务只重做第一步，不改第 4/5 节。`skill-foundations` Step 1 现在先给会议记录重复场景，让学员在“每次重新说明 / 把方法保存下来”之间选择；选择后才显示简短解释、Prompt（提示词）/ Skill（技能）对比和一句核心判断。Preview 通过通用 `previewIntroChoice` 驱动，不新增独立课程模板，也不改变 Completion。

### COURSE-BUILDER-SKILL-001-F — First Step Direct Comparison

Status: COMPLETE

根据 Human Review，Step 1 的两个选择答案过于明显，属于“为了互动而互动”。现已移除按钮，改为直接显示真实场景、临时做法 / 可复用做法、Prompt / Skill 对比和一句核心结论。Renderer 使用通用 `previewIntroComparison`，Step 3/4/5/6 不变。

### COURSE-BUILDER-SKILL-002-A — Real APPLICATION Lesson Acceptance

Status: TECHNICAL_ACCEPTANCE_PASS_HUMAN_REVIEW_PENDING

新增真实 APPLICATION Draft：`ai-literacy/prompt-foundations`，题目“Prompt（提示词）怎么写，AI 才更容易理解你”。采用统一 6 步，Completion Gates 为 CHECK + PRACTICE；真实 AI 操作为 GUIDED，不进入 Completion Gate。Practice 让学员亲手填写任务 / 背景 / 限制 / 结果，通过本地规则检查后可复制自己的提示词到任意 AI 软件测试。

同时 Course Builder v0.1 的 Check / Practice 已从任意 Record 升级为最小明确 Schema。Preview：`/course-builder/preview/prompt-foundations`。下一步先做 Human Review，不正式发布。

Human Review 修复：Check / Practice 的底部反馈已改为步骤内有效，切换 Step 时会清除旧提示；Practice 未通过时显示完整参考答案，并提供“一键填充参考答案”与复制。填充会把参考内容分别写入任务 / 背景 / 限制 / 结果四个输入框并清除旧评分，但不会自动提交或通过。

### COURSE-BUILDER-SKILL-002-B — Knowledge Depth Expansion

Status: COMPLETE_HUMAN_REVIEW_PENDING

保留现有六步 APPLICATION 体验、Check / Practice Gate 和一键参考答案，不增加新交互。Prompt 课程知识从基础四部分扩展到 4 个核心知识点：基础结构、Example、Context、Iteration。Step 1 保持轻量；新增深度主要进入 Step 2 案例、Step 4 提示和 Step 5 回顾。APPLICATION acceptance 现在要求这 4 个知识层存在。

### COURSE-BUILDER-SKILL-002-C — Six-Step Knowledge Responsibility Contract

Status: COMPLETE

Course Builder BUILD 的 `pedagogy` 现在必须携带 `sixStepResponsibilities`，完整覆盖 EXPLAIN / EXAMPLE / CHECK / PRACTICE / REVIEW / CAPABILITY。固定职责分别为：建立核心直觉、展开方法与边界、验证理解、形成实际能力、建立可复用判断框架、明确能力/应用场景/下一步。每项必须有 purpose / include / avoid；缺失任意责任直接拒绝 Draft。CONCEPT 和 APPLICATION 两个真实样板均已通过回归。

### COURSE-BUILDER-SKILL-003-A — Real PRACTICE Lesson Acceptance

Status: TECHNICAL_ACCEPTANCE_PASS_HUMAN_REVIEW_PENDING

新增真实 PRACTICE Draft：`ai-literacy/meeting-action-list`，题目“把会议记录整理成可执行行动清单”。继续复用统一六步与六步职责 Contract；`practiceMode=INDEPENDENT`，Completion Gates 为 CHECK + PRACTICE，不新增 REAL_AI Gate。第 4 步要求学员从会议记录中填写行动 / 负责人 / 截止时间 / 未决问题，由本地确定性规则检查；失败后提供 Hint、参考答案和一键填充。Preview：`/course-builder/preview/meeting-action-list`。

Human Review 修复：共享 RULE evaluator 已从纯文字长度判断升级为字段语义优先。`owner` 一个明确负责人即可满分，不再要求凑多人；`deadline` 必须能判断是否逾期。标准答案只有“小林”一个负责人时，整份 Practice 必须通过并由 acceptance 自动锁定。PRACTICE 六步内容同步扩充，且 `MINI_TASK` 类型不再出现 Prompt 课专属的“放进 AI 软件试一下”区域。

Step 1 视觉层级继续调整：`摘要 / 行动清单` 的概念定义移到第一步最底部，复用轻量 knowledge-depth 样式；主对比区只展示“只有会议摘要 / 可执行行动清单”两种做法，避免概念定义与场景对比混淆。通过 `comparisonPlacement=BOTTOM` 数据驱动，不按 lesson slug 分支。

### COURSE-BUILDER-SKILL-002-D — Concept Mastery Before Practice Contract

Status: COMPLETE

四种 Lesson Type 的 BUILD Draft 现在必须 `conceptMasteryBeforePractice=true`。固定教学逻辑：Step 1 建立核心直觉和重要性；Step 2 展开方法、边界、易混淆点和常见错误；Step 3 用单选 / 判断 / 多选验证是否真正理解；Step 4 只应用前 3 步已经教过的核心知识，不在实操阶段首次补新核心概念。Check Contract 已升级为 `questionType + correctValues`，兼容旧 `correctValue`；MULTI_SELECT 使用集合完全一致判分。Draft Preview 已支持 checkbox 多选，正式 Runtime/DB 持久化暂不改变。

### COURSE-BUILDER-SKILL-002-E — Formal Check Types Runtime Completion

Status: CODE_COMPLETE_LOCAL_MIGRATION_READY_REMOTE_PENDING

正式 Runtime 已支持 SINGLE_CHOICE / TRUE_FALSE / MULTI_SELECT。数据库 Schema 保留旧 `correct_answer / answer` 并新增 `correct_answers / answers`，旧数据自动兼容；正式 Answer API 支持单答案与多答案，MULTI_SELECT 使用精确集合判分；Generic Lesson Runtime 正式模式可渲染 radio / checkbox 并恢复已保存答案。Course Builder 新增 Draft Check → Runtime Seed 转换。已生成 `drizzle/0010_famous_blockbuster.sql`，但未执行远程 migration，远程 PostgreSQL 仍为 0009。

### COURSE-BUILDER-SKILL-002-F — Three-Question Mastery Sequence

Status: COMPLETE_CODE_READY_REMOTE_MIGRATIONS_PENDING

新课程 Step 3 默认使用三题 Sequence：`SINGLE_CHOICE / BEST_JUDGMENT → TRUE_FALSE / MISCONCEPTION → MULTI_SELECT / BOUNDARY_CONDITIONS`，一次只显示一题。每题必须显式提供不同的正确反馈与错误反馈。交互固定为：选择 → 检测；答错解释误区并要求重新选择，不能下一题；答对解释判断依据后才允许下一题；三题全部答对后 CHECK Gate 才完成。Prompt APPLICATION 样板已升级为真实三题 Preview。旧单题 Check 继续兼容。正式 Runtime 复用现有 `lesson_checks + order`；新增本地 `0011_milky_sharon_carter.sql` 存储 `incorrect_explanation`。远程 PostgreSQL 仍为 0009，0010–0011 均未执行。

Human Review 继续优化 Prompt APPLICATION：Step 1 将“模糊 / 清楚”的概念解释移动到底部，主区只保留场景与两种做法；底部改成“模糊 = AI 还要猜 / 清楚 = AI 知道怎么做”的轻量解释。Step 5 按后续反馈改为 Prompt Preview 专用的等高填色布局：卡片高度不压缩，“正确理解”色块填满剩余空间；撤回通用卡片自适应高度修改，避免影响其他课程。

统一课程底部导航标签已固定为六个四字教学阶段：建立直觉 / 讲透方法 / 检查理解 / 动手实操 / 复盘框架 / 能力获得。导航只按 Step Kind 映射，不按课程内容或 slug 分支；正文中的具体 Step 标题不变。

底部导航布局继续统一：上一步 / 下一步主按钮恢复改版前的自然尺寸；四字阶段标签与页码固定居中。手机端改为两行导航：第一行“上一步｜阶段+页码｜下一步”，第二行单独居中“还是不懂”，避免缩放后右侧辅助操作造成错位。

### LEARNING-UX-FINAL-001 — Unified Lesson Shell Freeze

Status: COMPLETE_FROZEN_V1

统一 Lesson Shell 已冻结为 v1：六步顺序与四字教学标签、前 3 步概念掌握 / Step 4 实操 / Step 5 复盘框架 / Step 6 能力迁移、新课程三题 Mastery Sequence、Desktop / Mobile 底部导航、Preview / Runtime 边界和禁止 slug/name Renderer 分支均成为稳定契约。新增 `docs/learning/UNIFIED_LESSON_SHELL_V1.md`、`lib/learning/unified-lesson-shell.ts` 与 `learning:shell:accept`。以后普通课程内容任务不得顺手改变 Shell；结构变化必须单独立项。下一步转入 `CURRICULUM-001 — Formal Curriculum Definition`。

### CURRICULUM-001 — Formal Curriculum Definition

Status: COMPLETE_DEFINED_V1_MAINLINE_LOCKED

`docs/learning/FORMAL_CURRICULUM_V1.md` 已同步为长期主线：AI 基础认知 → AI 工作应用 → AI 推广运营与业务增长 → AI Workflow 与自动化 → FDE / AI 解决方案落地。基础课自身按 7 个学习阶段建立完整 AI 世界模型；工作应用覆盖研究/写作/文件/数据/知识/重复任务；业务层覆盖内容运营/获客/销售/客服/运营分析/渠道；Workflow 层覆盖任务拆解、Context Engineering、Code/Skill/Tool/Agent 分工、Integration、Human-in-the-loop、Evaluation；FDE 覆盖 Discovery → Design → Pilot → Evaluation → Adoption → Capstone。每个核心概念只允许一个 Primary Knowledge Home。完整目录与 Production Batch 分离，3–5 节仅代表一次制作批次。当前 static catalog / acceptance fixtures 仍非正式课程 Source of Truth。下一步：`CURRICULUM-002 — Foundation Knowledge Map & Lesson Briefs`。

### CURRICULUM-002 — Foundation Knowledge Map & Lesson Briefs

Status: COMPLETE_DEFINED_V1

新增 `docs/learning/FOUNDATION_KNOWLEDGE_MAP_V1.md`。AI 基础认知 7 个阶段已展开为 28 个 Lesson Brief：4 + 4 + 4 + 4 + 4 + 6 + 6。每节固定 Primary Knowledge Home、Supporting Concepts、Prerequisite、Lesson Type、Planning Gate、Grounding freshness、Learner Outcome 和 Anti-overlap；同时建立全局知识主归属矩阵，避免 Prompt/Context/Memory/RAG/API/Tool/MCP/Skill/Workflow/Agent/HITL/Evaluation 等重复定义。现有 prompt-foundations/skill-foundations 可 REUSE+FORMALIZE；task-brief MERGE；context-token/memory-rag SPLIT；api-agent 作为单一正式课 RETIRE 并拆分。下一步：`CURRICULUM-003 — Foundation Batch A Brief Finalization`。

### CURRICULUM-003 — Foundation Batch A Brief Finalization

Status: COMPLETE_BRIEF_READY_V1

该任务历史上完成了 pre-reframe F1-01～F1-04 Brief；后续 Beginner Reframe 已否决该方向，旧 `FOUNDATION_BATCH_A_BRIEFS_V1.md` 已删除。该任务只保留历史记录，不再提供 Course Builder 输入；后续不得从本任务恢复旧课程结构。

### CURRICULUM-004 — Foundation Catalog Metadata Completion

Status: COMPLETE_CATALOG_READY_V1

该任务历史上建立过 F-ID 7 Stage / 28 Lesson Catalog metadata；该旧文件现已被 `TRACK01_CATALOG_METADATA_V2.md` 的 T1-01～T1-20 / 6 Phase 目录取代并删除。本条只保留历史任务结论，不再作为当前 Catalog 输入。

### LEARNING-CATALOG-001 — Formal Curriculum Catalog UI

Status: COMPLETE_UI_V1

`/learning-path` 已接入正式 Foundation Catalog。新增 `lib/learning/foundation-catalog.ts` typed planning-data bridge 与 `components/FoundationCatalog.tsx`，展示完整 7 Stage / 28 Lesson；F1-01～F1-04 为“准备中 / 即将开放”，其余 24 节为“规划中 / 即将开放”。当前没有 AVAILABLE，所有 COMING_SOON 均不可进入空 Runtime。旧页面的六阶段、3 个开放阶段和 `lib/courses.ts` 派生 StageProgress 已从正式学习路径页移除，并对齐五大长期课程主线。typecheck/build PASS。下一步先 Human Review `/learning-path`，通过后进入 Foundation Batch A 正式课程生产。

### LEARNING-CATALOG-001-A — Navigation & Progress Refinement

Status: COMPLETE_UI_REFINEMENT_V1

Human Review 后将五大长期学习板块移到课程目录上方作为一级课程导航；当前 AI 基础认知高亮，其余板块标记后续开放。Foundation 区域桌面端采用左侧圆环进度 + 右侧 7 Stage / 28 Lesson 目录，移动端上下堆叠。新增 `LearningBlockProgress`，进度仅统计 AVAILABLE 且绑定正式 Runtime 标识的课程，再读取 ProgressProvider 完成状态；规划中/准备中/即将开放课程不进入分母。当前没有 AVAILABLE Foundation Lesson，因此显示 0%，不会使用旧课程 fallback 制造假完成率。typecheck/build PASS。下一步继续 Human Review `/learning-path`。

### COURSE-PRODUCTION-001 — Foundation Batch A Real Lessons

Status: PEDAGOGY_REJECTED_RETIRED_REFERENCE

该批次四节旧 CONCEPT Draft 虽曾技术 PASS，但已被 Human Review 判定为教学失败。旧 `FoundationConceptDraftPreview`、fixture、acceptance、4 个 Preview route 与 pre-reframe Brief 已删除；该任务仅保留历史失败证据，不得继续 Human Review、Runtime Provisioning、AVAILABLE，也不得恢复旧入口。

### CURRICULUM-005 — Beginner Foundation Reframe

Status: COMPLETE_REFRAMED_V1

Human Review 判定 COURSE-PRODUCTION-001 四节虽然技术 PASS，但对零基础用户理论过重、逻辑混乱，因此统一降级为 `PEDAGOGY_REJECTED / RETIRE_AS_FAILED_DRAFT_REFERENCE`，不再继续正式化。Foundation 开场改为“先使用世界观、后技术世界观”：Stage 1 先认识 AI 怎么用；Stage 2 学会和 AI 基本协作；Stage 3 再理解 Model / Training-Inference / Token / Context Window。新前 8 节依次解决 AI 能做什么、结果为什么变化、为什么会错、AI 软件能力地图、Prompt、Task Context、Iteration、基础结果检查。固定约束：示例先于定义、一节一个主问题、每节最多 1–2 个新核心术语。下一步：`COURSE-PRODUCTION-002 — Beginner Batch A Rebuild`。

### COURSE-PRODUCTION-002 — Beginner Batch A Rebuild

Status: CONTINUITY_REWORK_REQUIRED_RUNTIME_PAUSED

已重新生产新 F1-01～F1-04：`beginner-ai-use-cases`、`beginner-ai-result-quality`、`beginner-ai-can-be-wrong`、`beginner-ai-product-map`，不复用旧失败 Draft lessonId。前两节为 APPLICATION（CHECK + PRACTICE），后两节为 CONCEPT（CHECK；Step 4 非 Gate）。新增 `BeginnerFoundationDraftPreview` 共享 Preview 和 Beginner Batch 专项 acceptance，固定检查新手 ID、BEGINNER audience、统一六步、Three-Question Mastery、Review 数量以及开场禁止重术语。四节 Catalog 状态为 IN_PRODUCTION + COMING_SOON，未发布。Beginner acceptance、Course Builder、Unified Lesson Shell、typecheck、build 全部 PASS；历史单课 Human Review PASS 继续保留为质量证据。最新 CURRICULUM-CONTINUITY-001 判定 Stage 1 / Stage 2 需要按同一能力链重做 Formal Brief / Artifact Thread，因此当前暂停 Runtime，不直接 AVAILABLE。

### COURSE-PRODUCTION-002-A — Beginner Batch A Experience Restoration

Status: COMPLETE_EXPERIENCE_RESTORED_V1

在不改变 CURRICULUM-005 Beginner-first 内容方向的前提下，恢复此前已验证的课程体验增强层：四节均补回 Step 1 bottomDetails、Step 2 / Step 5 previewKnowledgeDepth、previewReviewCardFill；F1-01 / F1-02 增加参考答案一键填充，F1-02 恢复 COPY_TO_AI 让用户把补清楚后的任务复制到真实 AI 软件比较结果。BeginnerFoundationDraftPreview 只复用 Generic Lesson Runtime 既有数据接口，不改 Unified Lesson Shell、不按 lesson slug 分支。Beginner Experience acceptance、Course Builder、Unified Shell、typecheck、build 全部 PASS。后续 COURSE-UX-QUALITY-001 已完成最终质量打磨并获得 Human Review PASS。

### COURSE-UX-QUALITY-001 — Beginner Lesson Quality Pass

Status: COMPLETE_QUALITY_BASELINE_V1

以 Beginner Batch A 四节课作为后续零基础课程质量样板。新增 `BEGINNER_LESSON_QUALITY_STANDARD_V1.md`，固定 Cognitive Load Budget：1 个主问题、1 个主概念/判断、最多 1–2 个新术语、1 个主要案例、bottomDetails <= 2、example depth <= 2、主 Review <= 3、review depth <= 2。专项 acceptance 同步升级，除结构预算外还扫描整课用户可见内容，防止 Training / Inference / Token / Embedding / Vector Search / Deterministic Logic / API / Tool / MCP / Agent Runtime / RAG / Evaluation 等后置术语提前泄漏。F1-03 Review 从 4 条收敛为 3 条；F1-04 Check/正文/后续说明中的 API/RAG/Tool 改为自然语言。Beginner Quality、Course Builder、Unified Shell、typecheck、build 全部 PASS。Lesson ID / Type / Gate / Catalog 状态不变。当前质量样板已获 Human Review PASS；Stage 1 仍保持 IN_PRODUCTION + COMING_SOON，Runtime Provisioning / 发布是独立后续阶段。下一步进入 Stage 2 内容生产。

### COURSE-BUILDER-SKILL-005 — Beginner Quality Alignment

Status: HISTORICAL_ONLY / SUPERSEDED_BY_COURSE_BUILDER_V1

历史记录：当时新增的 v0.2 现归档为 `skills/course-builder/_historical-v0.2.ts`，仅保留 provenance；其后续规则已经由 Course Builder v1 + current Rule Sources 取代。v0.2 当时将 Beginner Quality Standard 写入生成 Prompt，并通过 `BEGINNER_QUALITY_V1` profile 下沉到 Code Validation：mainLearnerQuestion、mainConcept、allowedCoreTerms、deferredTerms。v0.2 Beginner BUILD 缺 profile 会拒绝；allowedCoreTerms 最多 2 个、主 Review 最多 3 条、Example 必须 Before/After、Capability 必须表达可执行能力，deferredTerms 不得在用户可见内容中提前泄漏。当前课 Primary Knowledge Home 的术语可通过 allowedCoreTerms 显式放行，因此 Stage 3 可合法教授 Token / Training，不受 Stage 1 禁词误杀。新增 `course-builder:accept:beginner-quality`，已验证 profile required / review budget / deferred term / allowed term / v0.1 compatibility 全部 PASS；typecheck/build PASS。下一步：Stage 2 新课程默认走 Course Builder Skill v0.2。

### SKILL-GOV-001 — Skill Responsibility & Orchestration Baseline

Status: COMPLETE_GOVERNANCE_BASELINE_V1

新增 `docs/SKILL_GOVERNANCE.md` 与 `skills/REGISTRY.md`，并把 Skill Decision Gate 写入 `AGENTS.md`。后续开发任务实现前必须先判断 `CODE_ONLY / EXISTING_SKILL / NEW_SKILL_NEEDED`；需要新 Skill 时必须先讨论 Mini Skill Proposal，再实现最小 v0.1。固定一个 Skill 只做一个可独立验收职责、只产出一个主要结果；Skill 为 Architecture-neutral Content / Intelligence Layer，不得修改 DB / Schema / API / Runtime / Workflow / Permission / Publish / Progress / Completion；Skill 默认不互调，联动由 Workflow 编排。Registry 只登记真实落盘的 course-builder v0.1.0 / v0.2.0。自动化可逐步提高，但后台审核与 Core Authority 不变。下一步：COURSE-GOV-001，再进入 Foundation Stage 2。

### COURSE-GOV-001 — Course Production Governance Baseline

Status: COMPLETE_GOVERNANCE_BASELINE_V1

新增 `docs/learning/COURSE_PRODUCTION_GOVERNANCE_V1.md` 与 `COURSE_PRODUCTION_PROVENANCE_TEMPLATE.md`，并把 Course Production Gate 接入 `AGENTS.md`。正式课程固定走 Curriculum/Knowledge Map → Formal Brief → Course Builder → Code Validation → Draft Preview → Human Review → Runtime Provisioning → Runtime Acceptance → AVAILABLE。现有 `curriculumStatus` / `availability` enum 不扩展；Human Review PASS 与 Runtime Ready 只作为治理 Gate。每个 generation attempt 只能选择一个明确 Skill Version；该段为历史阶段记录；当前 Course Builder 只由 `skills/course-builder/index.ts` 解析 `CURRENT_DEFAULT`，v0.1/v0.2 均仅保留历史追溯。Human Review FAIL 回到 IN_PRODUCTION，新 Draft version 继续沿用 canonical lesson identity；Preview 不写正式 Progress/Completion；Skill 问题单独升级 Skill，架构问题另开工程任务。继续沿用 Foundation 3–5 节 Production Batch 规则，Stage 2 四节可作为一个完整 Batch。下一步：Foundation Stage 2 F2-01～F2-04 课程生产。

### FACT-DRIFT-AUDIT-001 — Current Fact Drift Audit

Status: COMPLETE_DOCS_ALIGNED

完成 current/canonical 文档漂移审计并修正：Stage 1 Beginner Batch 已明确 HUMAN_REVIEW_PASS / RUNTIME_PENDING；旧 COURSE-PRODUCTION-001 标记为 PEDAGOGY_REJECTED_RETIRED_REFERENCE；最新业务代码验证基线更新为 `main@38b256f` / 42 pages；`FOUNDATION_KNOWLEDGE_MAP_V1.md` 的 Primary Knowledge Home、asset mapping、Batch sequencing 已对齐 CURRICULUM-005；`FORMAL_CURRICULUM_V1.md` 移除 pre-reframe 旧九课作为当前定义，并对齐新的 Preview→Human Review→Runtime→AVAILABLE 生产链。历史 task-results 保留当时事实，不改写。

### COURSE-PRODUCTION-003 — Foundation Stage 2 Collaboration Batch

Status: TECHNICAL_ACCEPTANCE_PASS_CONTINUITY_REWORK_REQUIRED

F2-01～F2-04 已按 current Brief 使用单一 `course-builder@0.2.0` 生产：`beginner-prompt`（APPLICATION）、`beginner-context`（CONCEPT）、`beginner-iteration`（APPLICATION）、`beginner-result-check`（APPLICATION）。全部使用 `BEGINNER_QUALITY_V1`、Three-Question Mastery 与 Unified Lesson Shell；APPLICATION 使用 GUIDED Practice + Reference Answer，Prompt / Iteration 使用 COPY_TO_AI。Catalog 四节从 PLANNED 切为 IN_PRODUCTION，availability 仍 COMING_SOON，无 Runtime mapping。专项 Stage2 acceptance、Course Builder、Unified Shell、typecheck、build 全部 PASS，build 46 pages。新增 Stage2 Formal Brief / Provenance / 四个 Preview。最新 CURRICULUM-CONTINUITY-001 已暂停当前 Human Review：先与 Stage 1 一起重做 Continuity Brief / Case Thread / Artifact Thread，再决定后续生产；不自动 Runtime / AVAILABLE。

### DEV-RUNTIME-FIX-001 — Windows Dev Startup

Status: COMPLETE_DEV_START_FIX

诊断 `npm run dev` 时确认项目代码、首页与 Stage 2 四个 Preview 在直接 Next dev 启动下均正常返回 HTTP 200；异常集中在 Windows 的 npm → `next.cmd` shim 启动层。将 `package.json` 的 dev script 从 `next dev` 改为 `node node_modules/next/dist/bin/next dev`，保持用户操作仍为 `npm run dev`，不改变业务代码、课程 Runtime 或 Catalog。

### CURRICULUM-CONTINUITY-001 — Five-Track Capability Continuity Baseline

Status: COMPLETE_BASELINE_V1

新增 `docs/learning/FIVE_TRACK_CAPABILITY_CONTINUITY_V1.md`，锁定五大板块为一条连续能力链。方法层必须行业通用，OPC / 自媒体 / 内容运营→推广→获客→业务转化为默认贯穿 Case Thread。后续 Formal Brief 必须明确 Inherited Capability / Inherited Artifact / Current Learner Job / New Capability / Artifact Output / Next Reuse / Do Not Re-teach / Case Thread。Stage 1 / Stage 2 当前技术成果保留，但因知识重复、案例断裂与 Artifact 不连续进入 CONTINUITY_REWORK_REQUIRED，暂停 Runtime。Course Builder v0.2 Gap Review 结论：v0.2 暂不升级；v0.3 Capability Continuity Alignment 有候选价值，但必须先用新的 Stage 1/2 Brief 验证真实缺口。下一步：`FOUNDATION-CONTINUITY-REWORK-001`。

### FOUNDATION-CONTINUITY-REWORK-001 — Stage 1 + Stage 2 Formal Brief / Artifact Thread Rework

Status: COMPLETE_BRIEF_READY_CONTINUITY_V1

新增 `docs/learning/FOUNDATION_STAGE1_STAGE2_CONTINUITY_BRIEFS_V1.md`。保留 F1-01～F2-04 全部 canonical lessonId / Primary Knowledge Home / Lesson Type / Gate，但把八节重构为一个 OPC / 自媒体贯穿 Artifact Thread：First Draft → Better Draft → Verification Flags → Source Plan → Task Brief → Context Pack → Iterated Draft → Verified Publishable Draft。明确每节 Inherited Capability / Artifact、Current Learner Job、New Capability、Artifact Action / Output、Next Reuse、Do Not Re-teach 与 Human Review Focus。F1-02 仅保留输入变化最小实验，Prompt 正式方法留 F2-01；F1-03 只负责发现风险，完整检查留 F2-04；F1-04 产品能力地图服务当前 Artifact；F2-02 转为建立 Context Pack。旧 Stage2 Brief 标记 superseded。下一步：`FOUNDATION-CONTINUITY-TRIAL-001`，先用 `course-builder@0.2.0` 重做 3–5 个代表样本，不立即升级 v0.3。

### FOUNDATION-CONTINUITY-TRIAL-001 — Course Builder v0.2 Continuity Trial

Status: TECHNICAL_PASS_HUMAN_REVIEW_PENDING

使用单一 `course-builder@0.2.0` + `BEGINNER_QUALITY_V1` 独立重做 F1-01 / F1-02 / F2-01 / F2-02 / F2-03 五个 Trial Draft，历史生产 Draft 不覆盖。五课保持同一 OPC / 自媒体 Case Thread，并通过 trial metadata 明确 inheritedArtifact / artifactOutput / nextReuse / doNotReteach。新增 5 个独立 Preview 与 `course-builder:accept:continuity-trial`。首次验收准确拦截 F1-02 主正文 Case Thread 表达变弱，修复内容后未放宽规则。最终 Continuity Trial、Course Builder Contract、Beginner Quality、Unified Shell、typecheck、build 全部 PASS，51 pages。结论：当前证据下 v0.2 技术上足够，v0.3 / COURSE-BUILDER-SKILL-006 暂不实现；下一步 Human Review 5 个 Trial Preview。F1-03/F1-04/F2-04 尚未 trial rework，Runtime 继续暂停。

### FOUNDATION-CONTINUITY-TRIAL-001-A — Learner-facing Language & Case Neutralization

Status: COMPLETE_REVIEW_PENDING

不改变 5 个 Trial 的节奏、连续性、Lesson ID/Type/Gate、Course Builder v0.2 或 Runtime 边界，只修学习者可见表达。固定新规则：中文优先；AI 专业词第一次有意义出现写“中文（English）”；内部 Artifact 英文名转为自然中文；OPC / 自媒体继续作为隐藏 Case Logic / metadata，但前台使用行业中性的真实内容任务，不反复显示 OPC / 自媒体。专项 acceptance 新增 LEARNER_LANGUAGE / CASE_NEUTRALIZATION 检查；全部回归、typecheck、build PASS。下一步继续 Human Review 同一 5 个 Preview。

### FOUNDATION-CONTINUITY-TRIAL-001-B — Six-Step Content Integrity

Status: TECHNICAL_PASS_TARGETED_HUMAN_REVIEW_PENDING

Human Review 发现 Step 3 仍继承旧 Draft mastery，以及 `beginner-context` Step 4 没有真正训练。根因确认：Continuity Trial 使用 spread 复用旧 Draft，只覆盖了部分字段；旧 `checkSequence` 静默保留。另一个长期缺口是 CONCEPT `practiceMode=NONE` 虽允许非 Gate PRACTICE Step，但旧 participation/UI 只保证“有字段”，不保证“有真实学习动作”。当前已重建 5 节的 Step 3 三题 Mastery；`beginner-context` Step 4 改为 MINI_TASK，Preview 支持本地输入完成；新增 SIX_STEP_CONTENT_INTEGRITY / CONCEPT_STEP4_ACTIONABLE 验收；课程治理固定“六步结构 PASS ≠ 六步内容 PASS”。正式 Runtime 的 CONCEPT 非 Gate participation 尚未 provision，因此 Runtime 继续暂停。下一步只需定向 Human Review：5 节 Step 3 + beginner-context Step 4。

### FOUNDATION-CONTINUITY-TRIAL-001-C — Six-Step Pedagogy Refinement

Status: TECHNICAL_PASS_TARGETED_HUMAN_REVIEW_PENDING

继续复盘六步教学职责，不改 Lesson ID/Type/Gate、Course Builder v0.2 或 Catalog/Runtime 状态。Step 5 改为以 `review` 表达真正可复用的复盘框架，2–3 项按课程需要，每项必须包含“结论｜解释”；误区只做辅助。Step 6 组合 capabilityGain / selfAssessment / nextLessonValue，补齐“会做什么、怎么知道会了、马上用在哪里、为什么继续”。`beginner-context` 非 Gate Step 4 新增完整辅助链：Hint、Reference Answer、一键填充、复制自己的练习、复制参考答案。新增 REVIEW_FRAMEWORK / CAPABILITY_EVIDENCE / GUIDED_SUPPORT 验收，全部回归、typecheck、build PASS（51 pages）。当前证据仍支持继续使用 Course Builder v0.2，不升级 Skill Schema。下一步定向 Human Review：5 节 Step 5/6 + beginner-context Step 4。

### FOUNDATION-CONTINUITY-TRIAL-001-D — Step Focus & Review Clarity

Status: TECHNICAL_PASS_TARGETED_HUMAN_REVIEW_PENDING

Step 5 Review budget 从 2–3 调整为 2–4 张卡，按课程知识密度决定，不固定 3 张；每张必须包含清晰结论与解释。`容易踩的坑` 改为独立白色卡片逐条排列，不再压缩成一行。新增 Every-step Clarity Gate：Step 1–6 必须分别讲清“为什么学 / 核心规律 / 会不会判断 / 能不能做 / 以后记住什么 / 现在真正会什么”，任何一步只有结构无清晰教学重点即 FAIL。专项 acceptance 新增 STEP_FOCUS，完整回归、typecheck、build PASS（51 pages）。下一步定向 Human Review Step 5/6 与 beginner-context Step 4。

### FOUNDATION-CONTINUITY-TRIAL-001-E — Numbered Guidance Readability

Status: TECHNICAL_PASS_TARGETED_HUMAN_REVIEW_PENDING

Step 4 多条提示改为独立整框编号 `1 / 2 / 3…`；Step 5 “容易踩的坑”白色卡片改为 `1 / 2 / 3…`，去掉重复“注意”标签。Beginner Quality 固定：当并列指导信息有顺序或分项阅读价值时，优先编号整框呈现，不压成连续段落、不重复相同标签。Continuity Trial、Course Builder、Beginner Quality、Unified Shell、typecheck、build、diff-check 全部 PASS（51 pages）。

### COURSE-GOV-SIX-STEP-001 — Mandatory Six-step Rule for All New Courses

Status: COMPLETE_GOVERNANCE_BASELINE

正式锁定：后续所有新课程，不限 Foundation / AI 工作应用 / 推广运营 / Workflow / FDE，不限 CONCEPT / APPLICATION / PRACTICE / PROJECT，统一使用 EXPLAIN → EXAMPLE → CHECK → PRACTICE → REVIEW → CAPABILITY。每一个正式 Primary Knowledge Point 在进入 Course Builder 前必须先通过六步知识点检验；无法自然完成六步时禁止硬凑内容，必须回到 Curriculum / Formal Brief 判断合并、拆分或降为 Supporting Knowledge。Lesson Type 只改变 Step 4 深度和 Completion Gate。六步负责“单课是否真正教会”，Continuity 负责“课程前后是否真正承接”，以后两者都是强制 Gate。

### CURRICULUM-SIX-STEP-PLANNING-001 — Core Curriculum Audit Direction

Status: COMPLETE_DIRECTION_LOCKED

将六步从单课生产 Gate 进一步提升为课程目录审计工具。后续不再按“专业名词 = 一节课”扩目录，而是先定义五大板块 Capability Map，再建立 Knowledge Map，并逐个使用六步检验候选知识点是否值得独立成课。审计结论限定为 KEEP / MERGE / SPLIT / SUPPORTING_KNOWLEDGE / DEFER / REMOVE。`FOUNDATION_KNOWLEDGE_MAP_V1.md` 当前 28 个 Lesson Brief 改为 candidate knowledge map / audit input，不视为最终固定课程数量。下一主任务：`CURRICULUM-SIX-STEP-AUDIT-001 — Five-Track Core Curriculum & Knowledge Point Audit`；审计完成前暂停继续批量生产 Stage 3+，F1-03/F1-04/F2-04 暂不推进完整生产。

### CURRICULUM-SIX-STEP-AUDIT-001 — Five-Track Core Curriculum & Knowledge Point Audit

Status: COMPLETE_AUDITED_V1

该任务是 Track 01 17 课第一版 Six-step Audit 历史记录；后续 R1 已基于 28 个正式候选重新审计并收敛为 20 课，因此旧 17 课 audit 文件已删除。当前 canonical audit 证据为 `docs/learning/TRACK01_28_CANDIDATE_SIX_STEP_AUDIT_V1.md`，目录 owner 为 `docs/learning/TRACK01_CATALOG_METADATA_V2.md`。

### CURRICULUM-SIX-STEP-AUDIT-001-R1 — Track 01 28-Candidate Six-step Re-audit

Status: COMPLETE_AUDITED_V1_20_LESSONS

按产品负责人确认的 28 个正式 AI 基础认知候选重新逐项执行六步审计，并明确排除 `task-brief`、`memory-rag`、`writing-files`、`task-decomposition` 四个历史 Runtime/UX 测试资产。最终得到 20 节 Track 01 canonical directory：KEEP 20、MERGE 6、SUPPORTING_KNOWLEDGE 1、DEFER 1、REMOVE 0。旧 17 节方案 superseded；Knowledge Base / Source of Truth、Structured Output / Schema、Coding / Browser / Computer Use 恢复为独立课程。详见 `docs/learning/TRACK01_28_CANDIDATE_SIX_STEP_AUDIT_V1.md`。下一步：`CURRICULUM-AUDIT-REALIGN-001-R1 — Track 01 20-Lesson Canonical Realignment`。

### CURRICULUM-AUDIT-REALIGN-001-R1 — Track 01 20-Lesson Canonical Realignment

Status: COMPLETE_REALIGNED_V1

T1-01～T1-20 已成为 Track 01 新课程生产唯一 canonical identity；旧 F IDs 仅作 historical alias。新增 canonical realignment、20-lesson Catalog metadata v2、T1-01～T1-05 Formal Briefs；旧 F Catalog 与 Continuity Brief 降级为 legacy / historical evidence。五课新 Artifact Thread 为 First Draft → Clear Task Brief → Minimum Context Pack → Iterated Draft → Verification Record / Verified Publishable Draft。现有 Trial 只迁移教学方法与交互经验，不直接继承旧 Check/Practice/Review/Capability。当前不改 UI/runtime/schema；下一步先 Human Review T1-01～T1-05 Brief，再决定 `COURSE-PRODUCTION-TRACK01-A-001`。

### TRACK01-BATCH-A-BRIEF-REVIEW-001 — T1-01～T1-05 Human Review Revision

Status: COMPLETE_HUMAN_REVIEW_PASS_BRIEF_LEVEL

已完成 targeted revision：Prompt = Task Instruction、Context = Task Information；T1-03 退出 Source of Truth；T1-01～T1-05 的 Step 4 均写明具体 learner action 与 retained output；T1-05 增加最低 Task-fit Evaluation，再进行 Reliability Verification，Hallucination 作为 supporting explanation。T1-05 明确不教授 HITL / Permissions / Approval / Core Authority，也不进入 Track 04 Evaluation Engineering。五课顺序、canonical ID、Artifact Thread 不变。下一步：`COURSE-PRODUCTION-TRACK01-A-001 — T1-01～T1-05 Course Builder Production`。

### COURSE-PRODUCTION-TRACK01-A-001 — T1-01～T1-05 Course Builder Production

Status: T1-01_HUMAN_REVIEW_PASS_SUPERSEDED_BY_A_002

T1-01 pilot 已完成技术验收与多轮 Human Review 修订；最终 Human Review PASS 由 `COURSE-PRODUCTION-TRACK01-A-002` 收口。T1-01 仍未进行正式 Runtime Provisioning / Runtime Acceptance，因此不标记 AVAILABLE。

### COURSE-BUILDER-SKILL-005-A — Lesson Output Contract v1

Status: COMPLETE_BASELINE_V1

不新增新 Skill；将 T1-01 Human Review 已验证的课程输出方式固化进现有 `course-builder@0.2.0`。新增 `docs/learning/LESSON_OUTPUT_CONTRACT_V1.md`，固定 Six-step 输出职责、Step 4 Hint / Artifact 规则、Step 5 2–4 卡与分层说明、边界类对比卡、Step 6 可执行自证、Case Thread 与 Stable Method Layer 边界。可确定性规则进入 Code Validation；教学自然度继续 Human Review。后续 T1-02～T1-20 必须继承该 Contract，若需要改变则先版本化 Contract，不在单课静默漂移。

### COURSE-PRODUCTION-TRACK01-A-002 — T1-01 Human Review Closure & T1-02 Prompt Pilot

Status: T1-01_HUMAN_REVIEW_PASS / T1-02_HUMAN_REVIEW_PASS_SUPERSEDED_BY_A_003

T1-01 已正式关闭 Human Review，但未进入 Runtime Ready / AVAILABLE。T1-02 已按 `course-builder@0.2.0` + `LESSON_OUTPUT_CONTRACT_V1` 生产 Pilot：只教 Prompt = Task Instruction，使用任务目标 / 使用对象 / 关键要求与限制 / 输出形式四项形成 `CLEAR_TASK_BRIEF`；不正式教授 Context，不要求回填外部 AI 回复。Preview：`/course-builder/preview/track01-batch-a/t1-02`。T1-03～T1-05 继续不扩产，等待 T1-02 Human Review。

### COURSE-PRODUCTION-TRACK01-A-003 — T1-02 Human Review Closure & T1-03 Context Pilot

Status: T1-02_HUMAN_REVIEW_PASS / T1-03_HUMAN_REVIEW_PASS

T1-02、T1-03 均已关闭 Human Review，但仍未 Runtime Ready / AVAILABLE。T1-03 最终版本按 `course-builder@0.2.0` + `LESSON_OUTPUT_CONTRACT_V1` 通过验收：学员可见名称为 `上下文（Context）`；Step 4 使用可直接复制验证的 `任务 + 必要信息`；Reference Answer 为完整 OPC / 自媒体案例；Step 5 按课程知识密度收束为 2 张上下对比卡。T1-04～T1-05 尚未扩产，下一步先讨论 T1-04 Iteration Pilot 范围。

### COURSE-PRODUCTION-TRACK01-A-004 — T1-04 Purposeful Iteration Pilot

Status: T1-04_HUMAN_REVIEW_PASS

T1-04 `迭代（Iteration）：把第一版结果改到可用` 已通过 Human Review。最终保持 Beginner 边界：问题由课程给定，Step 4 只填写 `我希望改成什么样` / `这次的具体要求`，只教一次有目的的定向修改。尚未 Runtime Ready / AVAILABLE。

### COURSE-PRODUCTION-TRACK01-A-005 — T1-04 Closure & T1-05 Reliability Pilot

Status: T1-04_HUMAN_REVIEW_PASS / T1-05_HUMAN_REVIEW_PASS

T1-05 `结果可靠性：什么时候必须核验` 已生产 Pilot：只建立最低可靠性判断——可查证事实 / 数字 / 日期 / 功能 / 来源要核验，会变化的信息要核对最新状态，错误后果越明显越优先核验。Step 4 只填写 `我准备核验的内容` / `我会去核对什么`；COPY_TO_AI 仅整理核验清单，不允许 AI 替学员判断真假。不教 HITL、权限/审批、Evaluation Engineering、RAG/Source of Truth、Agent/Workflow 或复杂证据研究。Preview：`/course-builder/preview/track01-batch-a/t1-05`。

T1-05 已通过 Human Review。T1-01～T1-05 当前全部 HUMAN_REVIEW_PASS，但 Runtime / AVAILABLE 状态保持独立。

### TRACK01-PHASE1-RUNTIME-001 — T1-01～T1-05 Runtime Provisioning & Acceptance

Status: HISTORICAL_BASELINE / SUPERSEDED_BY_TRACK01-PHASE1-RUNTIME-001-B

已建立 `foundation-ai` canonical Runtime course、5 节 LessonSpec、15 道 required CHECK、5 个 required Practice、Approved Presentation Bridge、provisioning 与真实 HTTP Runtime Acceptance 工具。后续正式 Check / Practice / Completion 已进入 server-authoritative 调试与 focused acceptance；原“0010/0011 schema blocker + 本地互动 fallback”描述只代表该任务早期历史阶段，不再作为当前开发方向。

第一轮 Human Review 后仅做三项定向修订：① 第一屏从一个极简单 OPC/自媒体 AI 内容整理任务开始，先体验再扩展任务边界判断；② Reference Answer / 一键填充只保留学习者实际产物，禁止混入“下一课继续”等内部编排文案；③ Batch A 默认连续 Case Thread 正式固定为 `OPC / 自媒体 AI 内容任务`，Stable Method Layer 仍行业中立并允许学员替换自己的业务任务。新增专项 acceptance 全部 PASS，typecheck/build PASS。继续等待 T1-01 Human Review，不扩产 T1-02～T1-05。

### TRACK01-PHASE1-RUNTIME-001-B — Lesson Runtime State Flow Consolidation

Status: B1-B5_CORE_IMPLEMENTED / MANUAL_BROWSER_ACCEPTANCE_PENDING

Goal：重写并收敛课程恢复、Step 3 Check、Step 4 Practice、Completion、Rating 与下一课主链；不再围绕当前旧状态流继续叠加局部 Bug patch。B1～B5 核心实现已完成，剩余真实浏览器手工全流程验收独立保留。

固定执行原则：

- Canonical facts：课程位置 / Completion → Lesson Progress；Step 3 → `lesson_check_responses`；Step 4 → Practice Submission / Evaluation；Rating → `learning_feedback`。
- 计划新增最小 `lesson_progress.current_step`，migration 只先生成并 review，应用目标数据库前需单独确认。
- 优先删除 `highestStepReached / localPassedCheckIds / retakingStep / LessonRuntimeUiContext` 等重复状态与同步 effect，而不是继续增加新状态。
- foundation-ai 正式 Runtime 与 legacy renderer 明确分流。
- 未来 Web / H5 / 小程序共用同一 Backend/API；Skill / AI、公众号、飞书、Obsidian 不拥有学习核心状态。
- 完成后必须用“进入课程 → 中断 → 返回 → Check 重学 → Practice 重练 → 完成 → 评分 → 下一课”的端到端场景整体验证。

Detailed plan: `docs/learning/TRACK01_PHASE1_RUNTIME_001_B_IMPLEMENTATION_PLAN.md`

Out of Scope：课程内容改写、T1-06 扩产、AI Daily、渠道自动化、新 Skill、通用状态框架、微服务化。

### TRACK01-RUNTIME-PERF-002 — Critical Path Reduction

Status: COMPLETE / BROWSER_ACCEPTANCE_PASS_WITH_INFRA_LIMITATION

Goal：在 `TRACK01-PHASE1-RUNTIME-001-B` 已完成主链收敛基础上，继续缩短进入课程、检查答案、重新学习、Practice 检查、Completion、Rating 的用户等待 critical path；不改变课程模型、不改 UI 版式、不把正式状态交给前端。`0013 background_jobs` 已应用当前开发数据库，Outbox enqueue + drain 已真实 PASS；Check / Reset / Practice / Completion / Rating 已完成多轮 DB round-trip 收敛与真实浏览器验收。最终体验约为：进入课程 3s、Check 3s、Reset 4s、Practice 6s、Practice Retry 5s、Completion 4s、Rating 3s。剩余主要瓶颈转为 DB locality 与 Auth/Session request overhead。

固定顺序：PERF-002-A Timing Instrumentation → B Durable Behavior Signal Outbox → C Command Internal Reread Reduction → D Runtime Lazy Reads → E Immediate UI Feedback → Acceptance。

关键约束：先测量后优化；Behavior / Insight 只有建立 durable PostgreSQL outbox/job 后才能移出同步请求，禁止 fire-and-forget 伪异步；不新增第二套 Runtime truth，不引入 Redis / MQ / 微服务。

Detailed plan: `docs/learning/TRACK01_RUNTIME_PERF_002_IMPLEMENTATION_PLAN.md`

### RUNTIME-INFRA-PERF-003 — Database Locality & Request Overhead Reduction

Status: PROPOSED / NOT_STARTED

Goal：承接 PERF-002 剩余基础设施瓶颈，不再继续复杂化课程 Runtime 业务代码。重点验证与优化 Backend↔PostgreSQL 同区域部署、连接建立成本、API Session/Auth 固定 DB 开销，以及可安全采用的短 TTL server-side session cache / request-scoped auth reuse。

边界：不改变 Check / Practice / Completion / Rating 权威模型；不引入 Redis 作为 MVP 前置依赖；不以缓存权限结果替代正式 Entitlement 校验；先测部署与请求开销，再决定是否增加缓存层。

### COURSE-BUILDER-SKILL-004-A — Real PROJECT Lesson Acceptance

Status: TECHNICAL_ACCEPTANCE_PASS_RUNTIME_BLOCKED_HUMAN_REVIEW_PENDING

新增真实 PROJECT Draft：`ai-literacy/ai-workflow-project`，题目“完成一份 AI 客户跟进工作流方案”。继续复用统一六步与六步职责 Contract；`practiceMode=PROJECT`，Completion Gates 为 CHECK + DELIVERABLE。第 4 步要求完成项目目标 / 触发输入 / 工作流步骤 / 人工确认 / 成功指标五部分项目草稿，本地 RULE evaluator 只验证草稿质量。Runtime Plan 已识别 `requiresDeliverable`，但正式 Deliverable Runtime 尚未接入，因此不会把本地草稿 PASS 写成正式项目完成。Preview：`/course-builder/preview/ai-workflow-project`。

Human Review 优化：PROJECT Step 1 底部新增三段轻量价值说明——临时 AI 使用为什么越来越难维护；工作流为什么能让方法被交接、检查和持续改进；为什么这是从“会用 AI”走向“用 AI 建工作方式”的关键一步。通过通用 Intro `bottomDetails` 数据驱动，不按课程 slug 分支。

进一步简化 Step 1：移除 PROJECT 样板中重复的“单次使用 / 工作流”底部概念栏，仅保留场景、两种做法、核心结论和 `bottomDetails` 价值说明。Generic renderer 对空 `comparison` 不渲染任何占位，其他课程保持原样。

建议后续顺序：

```text
AI-DAILY-001         最小自动采集 → 审核 → 发布
MVP-009-AI-RUNTIME   真实 Provider / Skill v0.1 质量迭代
KNOWLEDGE-SYNC-001   Reviewed Knowledge → Obsidian Export
SKILL-001            Skill v0.1 Review / Iteration
MEDIA-001            Skill-driven Media Asset Factory
```

Skill 固定原则：真实业务需要时版本化落盘并依据真实结果迭代；不提前建设通用 Skill Platform。

### FACT-ALIGN-002 — Runtime / Access / Course Production Fact Realignment

Status: COMPLETE_FACTS_ALIGNED

Goal：清除 001-B / PERF-002 / staging 后的当前事实漂移，并建立“每类事实只有一个 owner 文件”的治理方式。

Result：当前系统事实统一归属 `docs/CURRENT_SYSTEM_FACTS.md`；阶段摘要归属 `PROJECT_STATUS.md`；本文件只保留 Task 状态与边界。Course Builder v0.2 + Lesson Output Contract v1 保持当前课程生产基线。

Out of Scope：课程内容、前端视觉、Runtime 行为、数据库迁移、T1-06 扩产。

### ACCESS-RESUME-ACCEPTANCE-001 — Access + Resume Acceptance

Status: COMPLETE_PASS

Goal：对匿名 / FREE / FOLLOWER / MEMBER 权益与 foundation-ai Resume / Gate 做真实 HTTP + PostgreSQL 验收，不扩业务功能。

Result：匿名课程入口 307 登录门禁 PASS；FREE / FOLLOWER / MEMBER Access Matrix PASS；T1-01～T1-05 currentStep Resume、Check Gate、Practice Gate、Completion Persistence、Relearn / Repractice 全 PASS；一次性测试数据均已清理。可复用脚本：npm run access:resume:accept -- --base-url=http://127.0.0.1:3001。

Out of Scope：课程内容、视觉 UI、权益模型重构、T1-06、支付 / OAuth / 小程序。

### TRACK01-PHASE2-CURRICULUM-001 — Core Learning Path Freeze

Status: COMPLETE_FROZEN

Goal：冻结 Track 01 的 20 节核心学习路径，固定课程顺序、6 个 Phase、Lesson Type、Primary Knowledge Point 与 prerequisite，并明确单一 curriculum owner，防止后续 Brief / Course Builder 再次漂移。

Result：`docs/learning/TRACK01_CATALOG_METADATA_V2.md` 已升级为 **FROZEN_CORE_PATH_V1**，成为 Track 01 目录唯一 owner；20 节课程数量与顺序保持不变；T1-01～T1-20 均固定唯一 Primary Knowledge Point 与 Core Capability；Runtime / Access / Production 状态从 Catalog 职责中移除。下一课程生产入口为 T1-06 Formal Brief，小批次推进，不直接批量生成正文。

Out of Scope：课程正文、T1-06 Draft、前端目录迁移、Runtime / Access、数据库、AI Daily、Track 02～05 重构。

### TRACK01-PHASE2-T1-06-001 — T1-06 Formal Brief

Status: COMPLETE_HUMAN_REVIEW_PASS

Result：`docs/learning/TRACK01_T1_06_FORMAL_BRIEF_V1.md` Human Review PASS。

### TRACK01-PHASE2-T1-06-002 — T1-06 Course Builder v0.2 Draft Production

Status: COMPLETE_DRAFT_HUMAN_REVIEW_PASS

Result：T1-06 Course Builder v0.2 Draft 已完成 Code Validation + Human Review。

Validation：`npm run course-builder:check` PASS；`npx tsx scripts/validate-track01-t106-draft.ts` PASS；`npm run typecheck` PASS。

### TRACK01-PHASE2-T1-06-003 — T1-06 Runtime Provisioning & Acceptance

Status: COMPLETE_RUNTIME_ACCEPTANCE_PASS

Result：T1-06 已进入 `foundation-ai` Phase 2 Runtime，并完成 Runtime Acceptance。

### TRACK01-PHASE2-T1-06-004 — T1-06 Content & Step4 Experience Correction

Status: COMPLETE_ACCEPTANCE_PASS

Result：T1-06 当前课程内容与 Practice 已按 Lesson Output Contract / Course Builder v0.2 收敛并通过真实 Runtime Acceptance。

Validation：T1-06 Runtime Acceptance PASS；T1-01～T1-05 Interaction Parity PASS；`npm run typecheck` PASS。

### TRACK01-PHASE2-T1-07-001 — T1-07 Formal Brief

Status: COMPLETE_HUMAN_REVIEW_PASS

Result：`docs/learning/TRACK01_T1_07_FORMAL_BRIEF_V1.md` Human Review PASS。Primary Knowledge Point = Token / Probability Generation；Context Window 仅作 supporting intuition；Temperature / Top-p / Seed / Sampling、Memory / RAG 等保持在本课边界之外。

### TRACK01-PHASE2-T1-07-002 — T1-07 Course Builder v0.2 Draft Production

Status: COMPLETE_DRAFT_HUMAN_REVIEW_PASS

Result：新增 `fixtures/course-builder/track01-phase2-t107.ts`；T1-07 Course Builder v0.2 Draft 已完成 Code Validation + Human Review。

Validation：`npx tsx scripts/validate-track01-t107-draft.ts` PASS；`npm run course-builder:check` PASS；`npm run typecheck` PASS。

### TRACK01-PHASE2-T1-07-003 — T1-07 Runtime Provisioning & Acceptance

Status: COMPLETE_RUNTIME_ACCEPTANCE_PASS

Result：T1-07 已 Provision 到 `foundation-ai` Phase 2 Runtime，并完成真实 Runtime Acceptance。

Validation：T1-07 Runtime Acceptance PASS；T1-06 → T1-07 Navigation PASS；T1-06 Runtime Acceptance 回归 PASS；T1-01～T1-05 Interaction Parity PASS；`npm run typecheck` PASS。

### COURSE-INTERACTION-CLEANUP-001 — Formal / Legacy Interaction Isolation & Dead UI Removal

Status: COMPLETE_CODE_ACCEPTANCE_PASS

Result：课程页已收敛为 Formal / Locked / Legacy 三路决策。正式交互唯一主链为 `FormalGuidedLessonView → AsyncLessonRuntimeShell → GenericLessonRuntimePanel`；历史 static renderer 已物理隔离至 `components/legacy-learning/`；Formal / Legacy slug 唯一边界为 `lib/learning/course-runtime-boundaries.ts`。已删除零引用旧交互组件 `StageProgress.tsx`、`CourseProgress.tsx`、`CourseCompletionBadge.tsx`、`LessonStatus.tsx`，并移除顶层旧 `CopyableGuide.tsx` / `LessonHelpPanel.tsx`，legacy 专用版本只存在隔离目录。Course Builder Preview 继续仅服务 Human Review / regression，不写正式 Progress / Completion。

Validation：新增 `learning:course-interaction:check`；与 PERF-003、Sidebar UX、Formal Registry、Course Build Entry、typecheck、production build 联合验收。

### TRACK01-T1-09-PRODUCTION-001 — Knowledge Base / Source of Truth Formal Production

Status: COMPLETE_RUNTIME_ACCEPTANCE_PASS / AVAILABLE

Result：T1-09 Formal Brief + Course Builder v0.2 Draft 已完成 Human Review，Reviewed Draft 为 `1.0.1-track01-t109-review`。随后已接入 LessonSpec Registry 与正式 Runtime Definition，并完成数据库 provisioning：3 个 required PUBLISHED Checks + 1 个 optional PUBLISHED Practice（required=false）。Catalog 当前为 `AVAILABLE + AVAILABLE`，runtimeLessonId=`t1-09-knowledge-source`。authenticated Runtime Acceptance 已通过：Check Gate、三题 Sequence、optional Practice、currentStep、Completion 与 T1-08 → T1-09 Navigation 均 PASS；Catalog 已提升为 AVAILABLE。

Cleanup：删除旧 17-Lesson audit、旧 canonical realignment、旧 F-ID 7 Stage / 28 Lesson Catalog，当前 Track 01 只允许从 `TRACK01_CATALOG_METADATA_V2.md` 恢复目录。

### TRACK01-T1-10-PRODUCTION-001 — Search / RAG Formal Production

Status: COMPLETE_RUNTIME_ACCEPTANCE_PASS / AVAILABLE

Result：已按 COURSE_BUILD_START_HERE.md 重新读取正式课程入口与当前事实源，完成 T1-09 → T1-10 → T1-11 连续性、Primary Knowledge Point、Main Learner Question 与 Deferred Boundaries。新增 Research Packet、Formal Brief、Course Builder v0.2 Draft 与 T1-10 validator。

Boundary：T1-10 只教“问题 → 找到相关证据 → 交给 AI → 基于证据回答”的 Beginner RAG 直觉；Embedding / Vector Search / Vector Database / Chunk / Top-K / Reranking / Tool Use / Function Calling / MCP / Agent 不进入本课正文。Human Review、LessonSpec Registry、Runtime Definition、数据库 Provisioning 与 authenticated Runtime Acceptance 均已 PASS；Catalog 已提升为 AVAILABLE。

Validation：npm run learning:t110:check PASS；T1_10_RUNTIME_PROVISION=PASS；T1_10_RUNTIME_ACCEPTANCE=PASS。

### COURSE-BUILDER-SKILL-V1-WORKFLOW-001 — Stable Course Production Workflow

Status: COMPLETE_ARCHITECTURE_ACCEPTANCE_PASS

Result：课程生产已收敛为 Stable Contract + Course Builder Skill v1 + Orchestrator + Deterministic Validators + Human Review Gate + Runtime Pipeline。Workflow 固定生命周期，只绑定 Contract / Gate，不绑定具体 Skill version；Current Skill 由 skills/course-builder/index.ts 解析。

Rule Sync：Workflow 每次运行通过 COURSE_PRODUCTION_RULE_SOURCES 读取规则 owner 文件最新内容，不复制规则正文；因此后续 COURSE_BUILD_START_HERE、Lesson Output Contract、Beginner Quality、Governance 等规则变化会自动进入下一次课程生产。

Validation：learning:course-production-workflow:check PASS；learning:course-build-entry:check PASS；typecheck PASS。

## TRACK01-T11-T20-WORKFLOW-BATCH-001 — T1-11～T1-20 Workflow Batch Draft Generation

Status: COMPLETE_DETERMINISTIC_PASS
Priority: P0

已由 Course Production Workflow 一次性生成 T1-11～T1-20 共 10 个 Course Builder Skill v1 Draft；全部通过 Deterministic Validation，并统一停在 Human Review Gate。严格沿用 Unified Lesson Shell，不新增 UI / Renderer，不调整 CSS。生成过程中当前基础课不应展开的知识统一进入 DEFERRED_KNOWLEDGE_LEDGER_V1；现行架构中 Ledger 属于 Track-specific run Context，不属于 Global Rule Sources。

Human Review 已由 `TRACK01-T11-T20-HUMAN-REVIEW-001` 完成；Runtime Gate 不绕过。

历史结果已收敛到本任务摘要与 Current Facts，不再保留独立 Workflow Batch result 文件。

### TRACK01-T11-T20-HUMAN-REVIEW-001 — T1-11～T1-20 Batch Human Review

Status: COMPLETE_HUMAN_REVIEW_PASS
Priority: P0

Goal：直接承接已 Deterministic PASS 的 10 个 Workflow Draft，对 T1-11～T1-20 做真实教学 Human Review，不重新生成 Draft，不新增 UI / Renderer / CSS。

Result：10 课全部 HUMAN_REVIEW_PASS。Human Review 补齐 Step 6 的现实触发情境，并修正少量 Beginner learner-facing language：T1-12 去除代码式字段名示例；T1-13 用“商品编号”替代 SKU；T1-17 使用中文优先的目标 / 当前状态与观察 / 判断与行动 / 停止条件表达。Deferred 工程知识继续由 `docs/learning/DEFERRED_KNOWLEDGE_LEDGER_V1.md` 管理。

Next Gate：LessonSpec Registry → Runtime Provisioning → Runtime Acceptance。Human Review PASS 不等于 AVAILABLE。

历史 Human Review 结果已收敛到本任务摘要；当前是否 AVAILABLE 以 Current Facts / Runtime registry 为准。

### TRACK01-T11-T20-RUNTIME-001 — T1-11～T1-20 Batch Runtime Provisioning & Acceptance

Status: COMPLETE_RUNTIME_ACCEPTANCE_PASS / AVAILABLE
Priority: P0

Result：T1-11～T1-20 已批次接入现有 `foundation-ai` 正式主链：LessonSpec Registry → Phase 4～6 Runtime Provisioning → Runtime API → Check / Practice Gate → Completion → 实际课程页。10/10 Runtime Acceptance 全部 PASS；APPLICATION 课程继续使用 `CHECK + PRACTICE` Gate，CONCEPT 课程使用 `CHECK` Gate + optional Practice。没有新增 UI / Renderer / interaction type，也没有调整 CSS。

Validation：`T1_11_RUNTIME_ACCEPTANCE=PASS` ～ `T1_20_RUNTIME_ACCEPTANCE=PASS`；`T1_11_T1_20_LESSON_SPEC_REGISTRY=PASS`；`T1_11_T1_20_RUNTIME_PROVISIONED=PASS`；`T1_11_T1_20_CHECK_PRACTICE_GATES=PASS`；`T1_11_T1_20_PAGE_RENDERING=PASS`；测试数据清理 PASS。

当前 Runtime 事实直接由 Current Facts、Catalog runtime mapping、Runtime registry 与 acceptance script 校验，不再依赖独立 task-result。

### TRACK01-T11-T20-LEARNING-EXPERIENCE-REWORK-001 — T1-11～T1-20 Post-runtime Learning Experience Rework

Status: COMPLETE_QUALITY_REWORK / RUNTIME_ACCEPTANCE_PASS
Priority: P0

Result：根据真实学习体验重新审计 T1-11～T1-20，并把经验回写全局课程生产规则。Learner-facing 普通英文改为自然中文；Step 4 Reference Fill 现在按字段组合即可直接复制给 AI 并得到本课目标输出；Step 6 新增独立现实触发场景，不再拿下一课预告代替。该任务当时关于 Step 5“取消固定核心标题”的结论已被后续课程标准修订并明确废止；当前唯一标准为上方固定回答“AI适合做什么 / AI不应该替你做什么”，卡片数量不固定，下方说明使用“明确命题 + 回答/解释”，数量同样不固定。

Rule Sync：已同步 COURSE_BUILD_START_HERE、LESSON_OUTPUT_CONTRACT、BEGINNER_LESSON_QUALITY_STANDARD、COURSE_PRODUCTION_GOVERNANCE、Course Builder Skill v1、COURSE_PRODUCTION_WORKFLOW 与 Deterministic Validator；Workflow 继续通过 Rule Sources read-latest 自动消费最新规则。

Validation：Chinese-first / Copy-ready Reference Answer / Review Density Variation / Trigger Scenarios 四项新增质量门全部 PASS；重新 Provision 后 T1-11～T1-20 10/10 authenticated Runtime Acceptance PASS；无 UI / Renderer / CSS 改动。

质量规则已进入当前 Contract / Skill / Validator；不再保留独立 Learning Experience Rework result 文件。

### COURSE-WORKFLOW-GLOBAL-001 — Universal Course Production Baseline & Workspace Reconciliation

Status: COMPLETE_BASELINE_GLOBALIZED / GIT_RECONCILIATION

Result：课程生产标准已从 Track 01 局部经验提升为所有正式板块通用基线。全局 Rule Sources 只保存跨板块长期规则；Track / 板块 Catalog、上一课→本课→下一课连续性、Formal Brief、Deferred Knowledge Boundary 与 Grounding 作为每次运行 Context，并通过 `courseContextReady` 硬 Gate 后才能进入 Course Builder。六步责任、中文优先、Step 3 锁定交互、Step 4 Copy-ready、Step 5 固定双核心方向 + 数量灵活 + 下方命题解释层、Step 6 现实触发均由 Workflow / Skill / Validator / Human Review 共同约束。

Drift Cleanup：现行 owner 已移除 Track01 专属 Rule Source 绑定、固定 2–4 Review 数量、旧 Step 5 反向规则和 Current Facts 中的旧 Human Review 状态；历史设计文档仅保留历史角色并标记 superseded，不再声明 Current Next Task / Current Skill。

Workspace：执行 Git 工作区基线清场；保留当前正式 Runtime、课程数据、迁移、治理、验收与已确认前端基线，正式记录已淘汰旧 Preview / 旧组件 / 旧 Catalog / 旧 fixture 删除，不使用 reset/clean 回退当前成果。

### TRACK02-CURRICULUM-CONTEXT-001 — Track 02 Capability, Knowledge & Course Context Freeze

Status: COMPLETE_CONTEXT_FROZEN / SUPERSEDED_BY_DIRECTORY_APPROVED_V1
Priority: P0

Result：新建 `docs/learning/TRACK02_CATALOG_CONTEXT_V1.md` 作为 Track 02 当前唯一课程上下文 owner。冻结 Exit Capability、6 个结果型 Phase（会找答案 → 会做成品 → 会处理复杂资料 → 会看数据 → 会积累知识 → 会复用方法）、15 个 Core Baseline Candidate、18→15 Knowledge Mapping、Artifact Thread、Track 01/03/04/05 的知识归属与 Anti-repeat Boundary。

UI Boundary：Track 02 Core 继续严格复用 Unified Lesson Shell v1；不新增 Renderer / 课程专属 Component / UI / interaction type，不调整 CSS。文件、表格、知识库、多模态等真实工作场景使用 Sample Input / Practice Context / COPY_TO_AI 表达，不把产品功能当成课程学习目标。

Deferred Resolution：OCR / ASR / TTS 在 Track 02 仅作为应用场景，不把 pipeline 工程升级为 Core Lesson；Workflow / Agent / API/MCP engineering、权限与可靠执行继续归后续 Track / Advanced Technical。T2-15 只到 Template / Checklist / SOP-lite，不提前教学 Workflow Design。

后续 TRACK02-SIX-STEP-AUDIT-001 已完成并批准 15 KEEP；本条只保留 Context Freeze 的历史阶段说明。

Drift Guard：已对 CURRICULUM-001、CURRICULUM-CONTINUITY-001、LEARNING-CATALOG-001 增加 Historical scope notice；Track 02 owner 增加 Related-file authority map 与固定恢复顺序；新增 learning:track02-context:check，并同步旧 Track 01 baseline validator 的 current fact 断言，防止旧 Module 2.1～2.6、历史状态或 UI 扩张重新成为 current input。

### TRACK02-SIX-STEP-AUDIT-001 — Track 02 Fifteen-Lesson Knowledge Point Audit

Status: COMPLETE_PASS / 15_KEEP / DIRECTORY_APPROVED_V1
Priority: P0

Result：T2-01～T2-15 全部通过 Six-step Knowledge Point Gate；每节均具备独立现实问题、不可替代核心规律、可判定 CHECK、现有 Unified Lesson Shell 内可完成的最小真实 PRACTICE、明确 AI fit / boundary，以及可自证的 Capability / Trigger / Next Reuse。

Disposition：KEEP=15；MERGE=0；SPLIT=0；DEFER=0；REMOVE=0。Visualization / Numerical Verification 继续作为 T2-12 supporting；Knowledge Organization + Maintenance 共同归 T2-14；Reusable Method Extraction + Template / Checklist / SOP-lite 共同归 T2-15。

Boundary：不生成 Lesson Body、不接 Runtime、不改前端。文件上传器、Spreadsheet / chart editor、Knowledge Base UI 继续不进入 Track 02 Core；Workflow / Automation / HITL architecture 留 Track 04，业务 Funnel / Lead / CRM / Sales / Service 留 Track 03，Problem → Solution → Pilot → Adoption 留 Track 05。

Evidence：docs/learning/TRACK02_SIX_STEP_AUDIT_V1.md。

Next：先做 T2-01～T2-03「会找答案」Formal Brief，再进入 Course Production Workflow；不一次性生成 15 节 Lesson Draft。

### TRACK02-BATCH-A-BRIEF-001 — T2-01～T2-03 Formal Brief & Continuity Design

Status: COMPLETE_BRIEF_READY_V1 / COURSE_BUILDER_PENDING
Priority: P0

Result：完成 T2-01～T2-03「会找答案」Formal Brief。T2-01 固定为 Research Question / Scope，不重教 Prompt；T2-02 固定为 Source Quality / Evidence Judgment，不重复 T1-05“哪些必须核验”；T2-03 固定为 Multi-source Synthesis / Conflict Handling，不退化成来源权威度比较。

Continuity：Research Brief → Evidence Pack → Evidence Synthesis。三课均可单独完成 Practice；上一课 Artifact 只做自然复用，不作为下一课理解前提。

Practice Boundary：三课 Step 4 均必须形成完整 COPY_TO_AI 任务；无实时联网能力时使用 Sample Input 仍可完成；不新增 Search、citation、browser、upload、Renderer、UI 或 CSS。

Evidence：docs/learning/TRACK02_BATCH_A_T2_01_T2_03_FORMAL_BRIEFS_V1.md。

Next：只将 T2-01～T2-03 送入通用 Course Production Workflow / Current Course Builder Skill；不得扩大生产范围到 T2-04～T2-15。

### COURSE-PRODUCTION-WORKFLOW-TRACK02-ALIGN-001 — Track 02 Workflow Context Alignment & Drift Cleanup

Status: COMPLETE_GOVERNANCE_ALIGNED
Priority: P0

Result：Course Production Workflow 已按 Track 02 真实生产上下文重新对齐，但未新建 Skill。COURSE_BUILD_START_HERE 不再默认从 Track 01 恢复；每次运行必须从 Current Facts 解析 current Track/Board owner、current directory status、previous→current→next continuity、current Formal Brief/Batch、Deferred/Supporting Boundary 与 Grounding。Track switch = Context switch，不复制 Workflow、不 fork Skill。

Current owner cleanup：FORMAL_CURRICULUM 已从旧 Track 01 7 Stage 改为当前 20 节/6 Phase，并同步 Track 02 DIRECTORY_APPROVED + Batch A Brief Ready；FIVE_TRACK_CAPABILITY_CONTINUITY 删除旧 v0.2/v0.3 / CONTINUITY_REWORK_REQUIRED current 决策；TRACK01_CATALOG_METADATA_V2 的生产方式改为通用 Workflow + Current Course Builder Skill。

Historical cleanup：CURRICULUM-SIX-STEP-AUDIT-001 的 Track 02=8 能力明确为历史 superseded；TRACK01-T11-T20-WORKFLOW-BATCH-001 中 Deferred Ledger=Required Rule Source 的旧说法纠正为历史行为，现行 Deferred Ledger 为 Track-specific run Context。

Drift guard：validate-course-production-workflow.ts 新增 Track 02 / Formal Brief 不得进入 Global Rule Sources、Track switch 不得 fork Workflow/Skill、旧 7 Stage / Track 02 pending / old continuity current decision 不得重新出现等检查；validate-track02-curriculum-context.ts 同步当前 owner 状态。

Boundary：未新增 Skill，未修改前端/UI/CSS，未改变稳定 Workflow lifecycle/version。

Next：T2-01～T2-03 可直接进入通用 Course Production Workflow / Current Course Builder Skill。

### TRACK02-BATCH-A-PRODUCTION-001 — T2-01～T2-03 Course Production Workflow

Status: AVAILABLE / FORMAL_RUNTIME / RUNTIME_ACCEPTANCE_PASS
Priority: P0

Result：T2-01～T2-03 已通过通用 Course Production Workflow 解析当前 Track 02 owner、Formal Brief、Continuity、Deferred/Supporting Boundary 与 Grounding，并由 Current Course Builder Skill v1.0.0 生成 3 个 APPLICATION Draft。

Drafts：T2-01「问题太大？先把它变成真正能查清楚的问题」；T2-02「AI 给了来源，怎么判断这些证据真的靠得住」；T2-03「几个来源说法不一样，怎么判断差异到底在哪里」。

Validation：三课均通过 Course Builder schema / rules、六步结构、CHECK + PRACTICE Gate、三题 Mastery、中文优先、COPY_TO_AI Reference Answer、Track 01 Anti-repeat 与 Batch continuity 检查；TypeScript PASS。

Boundary：未新建 Skill，未调整课程六步 UI/CSS，未扩展生产范围到 T2-04～T2-15。当前 T2-01～T2-03 已完成 Runtime Provisioning 与 Acceptance；ai-work 正式 Runtime 只包含这 3 节。

Production files：`fixtures/course-builder/track02-batch-a.ts`、`scripts/run-track02-batch-a-workflow.ts`、`scripts/validate-track02-batch-a-drafts.ts`。

Human Review：PASS。T2-01 修正 Step 4 无联网边界，Reference Answer 只生成可执行研究任务说明，不假装已搜索；T2-01～T2-03 全部补齐 Step 5 主卡片下方 knowledgeDepth.review 解释层。三课 Step 1–3、Step 4、Step 5、Step 6 与 Batch continuity 均通过人工教学审查。

LessonSpec Registration：PASS。T2-01～T2-03 已进入正式 LessonSpec Registry；T2-04 仍未注册。后续 Runtime 已按独立 Gate 完成 Provisioning 与 Acceptance。

Next：Batch A 已完成至 AVAILABLE。后续只从新的小批次 Formal Brief 继续，不扩大当前 Runtime 到 T2-04～T2-15。

### TRACK02-LEARNING-PATH-ACCESS-001 — Multi-Track Learning Map, Navigation & Access Interaction Freeze

Status: COMPLETE_INTERACTION_FREEZE_PASS
Priority: P0

Result：学习地图已从 T1 专用视图升级为同页 Multi-Track 切换；T2 学习地图展示批准的 6 个能力分组 / 15 节完整目录。当前 T2-01～T2-03 已由真实 Runtime 切为 AVAILABLE，T2-04～T2-15 继续“即将开放”。

Navigation：从 T2 课程返回学习地图时自动回到 T2；T2-01 上一项固定为 ← 学习地图；由于 ai-work Runtime 已真实存在，T1-20 完成后的跨 Track Continue 当前真实指向 T2-01。Sidebar 继续只显示当前 Course / Track。

Access：学习顺序与 Entitlement 分离。`ai-work` Runtime 访问预设为 OPC Membership；有效会员不要求先完成 T1。T1 未完成只产生可选学习建议，不阻断 T2；完成 T1 也不会自动获得 T2 会员权限。

Implementation：新增通用 `track-catalog.ts`、`TrackCatalog.tsx`、`track-navigation.ts` 与专项 validator；复用现有学习地图、Sidebar、正式 Lesson Shell 与 CSS class，没有新增课程专属 Renderer，也没有修改 CSS。

Validation：学习地图、15 节目录、T2-01～03 Runtime Delivery、T2-04～15 Coming Soon、Membership/T1 prerequisite 分离、T2-01 返回地图、T1-20→T2-01 Continue 与 Sidebar 当前 Track-only 均由专项 validator 固化。

Next：该交互冻结继续作为后续 Track 02 Batch 的共享基线；不为新 Batch 重做学习地图或 Access。

### TRACK02-BATCH-A-RUNTIME-001 — T2-01～T2-03 Runtime Provisioning & Acceptance

Status: AVAILABLE / FORMAL_RUNTIME / RUNTIME_ACCEPTANCE_PASS
Priority: P0

Provisioning：ai-work 已进入 Formal Runtime，当前只包含 T2-01～T2-03；开发数据库写入 1 个 Published Stage、1 个 Published Research Module、3 个 Published Lesson。每课均 Provision 3 道 required Published Check（SINGLE_CHOICE / TRUE_FALSE / MULTI_SELECT）与 1 个 required Published STRUCTURED_TEXT_V1 Practice。

Runtime Acceptance：使用一次性测试用户真实验证 Access → Check → Practice → Completion。未完成 T1 不形成 Stage hard gate；非会员被 MEMBERSHIP_REQUIRED 拦截；授予 OPC_MEMBER 后可直接进入 T2。三课共 9 道 Check 全部正确写入、3 个 Practice 均真实 PASSED，Check Gate / Practice Gate / Completion 全部 PASS；测试用户及级联测试数据已清理。

Delivery：T2-01～T2-03 已切为 AVAILABLE / FORMAL_RUNTIME；T2-04～T2-15 仍为 PLANNED / COMING_SOON。T1-20 完成后的跨 Track Continue 现真实指向 T2-01；T2-01 上一项仍为学习地图；T2-03 结束后回 T2 学习地图，不暴露 T2-04。

Implementation：复用现有 FormalGuidedLessonView + AsyncLessonRuntimeShell + GenericLessonRuntimePanel、LessonSpec Registry、Check/Practice/Progress/Completion/Entitlement Core；没有新增课程专属 Renderer、CSS、Schema 或 Migration。

Validation：Provisioning PASS；Runtime Acceptance PASS；static Runtime validator PASS；Learning Path / Access validator PASS；LessonSpec validator PASS；TypeScript PASS。

Files：lib/learning/track02-batch-a-runtime.ts、scripts/provision-track02-batch-a-runtime.ts、scripts/accept-track02-batch-a-runtime.ts、scripts/validate-track02-batch-a-runtime.ts。

Next：Batch A 生命周期 COMPLETE。后续课程生产从下一小批次 Formal Brief 开始；不得把 T2-04～T2-15 直接 Provision 成 Runtime。

### COURSE-UX-QUALITY-001 — Six-step Responsibility & T2 Experience Correction

Status: COMPLETE / FROZEN_CURRENT
Priority: P0

来源：实际体验 T2-01～T2-03 后发现学习建议上移重叠、前置能力指代模糊、六步顶部进度卡片错误地直接渲染课程 step title 导致长文案、Step 1 与 Step 2 内容重复，以及市场分析地区范围漂移。后续复查又确认左侧课程标题重复带入 Track 名称前缀。

结论：T2-01～T2-03 的 Step 1 与 Step 2 内容已区分；学习建议、六步进度卡片和 Step 1 底部说明按课题补齐。T1-01～T1-20 的进度卡片采用逐课描述，课程教学正文不受此次文案调整影响。当前实现事实见 `docs/CURRENT_SYSTEM_FACTS.md`；后续第 3～5 板块的输出规则与验收以 `docs/learning/LESSON_OUTPUT_CONTRACT_V1.md` 和 `docs/learning/COURSE_PRODUCTION_WORKFLOW_V1.md` 为准。

Runtime：T2-01～T2-03 已重新幂等 Provision；真实 Access / 9 Check / 3 Practice / Completion Runtime Acceptance 全部 PASS。

Workflow：第 1～5 板块共用现行 Course Builder Skill、Workflow、Validators 与 Human Review；切换板块只替换 Context，不复制规则或新建前端。

## TRACK02-BATCH-C-T2-07-T2-09 — Formal Brief → Workflow Draft

Status: COMPLETE / AVAILABLE / RUNTIME_ACCEPTANCE_PASS
Priority: P0

Goal：按 Stable Course Production Workflow 完成 Track 02 Phase 3「会处理复杂资料」的 T2-07～T2-09，并在 Human Review PASS 后完成正式 Registry / Runtime / Acceptance。

Scope：T2-07 Targeted Document Reading → T2-08 Cross-document Comparison → T2-09 Information-to-Action Extraction。课程继续复用现有 Unified Lesson Shell / Course Builder Skill v1；文件能力只通过课程内 Sample Input / 外部 AI Practice Context 表达，不新增上传器、文件浏览器、Renderer、interaction type 或 CSS。

Result：三个 BUILD Draft 完成 Deterministic Validation 与 Human Review；随后已注册正式 LessonSpec、接入 `lib/learning/track02-batch-c-runtime.ts` Presentation、扩展 `ai-work` 为 9 节正式课程，并将 T2-07～T2-09 写入正式数据库 Runtime。每课 3 道 required Published Check + 1 个 required Published STRUCTURED_TEXT_V1 Practice。原 Draft / Workflow / Review / Registration 脚本已归档为 `_historical-*`。

Validation：Human Review PASS；Formal Registration PASS；Runtime Provisioning PASS；会员 Access / 9 Check / 3 Practice / Completion Runtime Acceptance PASS；正式 Registry / Learning Path / TypeScript / Build 继续作为上线后回归 Gate。

Boundary：T2-07～T2-09 已 AVAILABLE / FORMAL_RUNTIME / RUNTIME_ACCEPTANCE_PASS；T2-10～T2-15 仍未注册 LessonSpec、未 Provision Runtime、保持 COMING_SOON。

Next：进入 T2-10～T2-12 Formal Brief / Workflow 构建。

Human Review correction（2026-09-25）：T2-07～T2-09 按实际体验修正长期规则并同步全局生产基线。1）学员端保留正常课程序号 `07 / 08 / 09`，但标题不显示内部生产编号 `T2-07 / T2-08 / T2-09`；2）Step 5 固定“AI适合做什么 / AI不应该替你做什么”两个判断方向；该数量规则后续已由 Batch D Human Review 更新为“主卡片至少 2 张、上限不固定，超过两张只为让知识更清晰”；3）Step 6“遇到什么情况，我应该想到这节课？”必须显示本课适用场景与能力价值总结。已定位并修复 Preview Runtime 字段串位：previewMode 原先把 triggerScenario 置空并回退到 `lesson.related[0]`，所以错误显示 Next Lesson Value。现由独立 `previewTriggerScenario` 传入，Next Lesson Value 仍单独显示。对应 Draft、Preview、Lesson Output Contract、Beginner Quality、Governance 与 deterministic validators 已同步。

## TRACK02-BATCH-D-T2-10-T2-15 — Formal Brief → Workflow Draft

Status: HUMAN_REVIEW_PENDING
Priority: P0

Goal：按 Stable Course Production Workflow 一次性构建 Track 02 剩余 T2-10～T2-15，并在 Human Review Gate 停止，不提前注册或 Provision Runtime。

Scope：T2-10 Metric Definition → T2-11 Data Quality → T2-12 Data Analysis → T2-13 Knowledge Capture → T2-14 Knowledge Organization / Source Governance → T2-15 Reusable Method。继续复用 Unified Lesson Shell / Course Builder Skill v1，不新增 Spreadsheet Editor、Knowledge Base UI、Automation Builder、Renderer、interaction type 或 CSS。

Result：已建立 `docs/learning/TRACK02_BATCH_D_T2_10_T2_15_FORMAL_BRIEFS_V1.md`、`fixtures/course-builder/track02-batch-d.ts`、`lib/learning/track02-batch-d-review.ts`、Batch D Preview Route、Workflow 与 deterministic validators。6 个 BUILD Draft 均通过结构校验并进入 PENDING_REVIEW；T2-15 明确保留在 reusable method / template / checklist / SOP-lite，不提前教授 Track 04 的 Trigger / Node / State / Retry / Automation / Agent Design。

Validation：`learning:track02-batch-d:draft-check`、`learning:track02-batch-d:workflow`、`learning:track02-batch-d:review-check`、Current State、Course Governance、Course Production Workflow、Script Entrypoints、TypeScript、Production Build 全部 PASS。

Boundary：T2-10～T2-15 当前未 LessonSpec Registry、未 Runtime Provisioning、未 Runtime Acceptance、未 AVAILABLE。T2-01～T2-09 保持正式 AVAILABLE，不受本批 Preview 影响。

Next：人工体验并审阅 T2-10～T2-15；若 PASS，再进入 LessonSpec Registration → Runtime Provisioning → Runtime Acceptance。

Human Review Rework（2026-09-25）：已定位并删除两类 Batch D 自动模板污染：Step 1 从 Step 2 example 自动派生、Step 5 从 mistakes 自动派生说明层。六课现逐课显式定义 Step 1 / Step 5；Formal Brief 提供 must-retain judgments，current validator 同时检查 Step 1/2 overlap、Step 5 最低结构与知识覆盖。具体通用规则只以 current Rule Sources 为准；T2-10～T2-15 当前主 Review 为 2/2/3/2/3/2。

## COURSE-RULE-GOVERNANCE-001 — Cross-project Course Production Anti-drift

Status: COMPLETE / VALIDATION_PASS
Priority: P0

Goal：对所有会影响正式课程生产的 Rule Owners、Workflow、Current Course Builder Skill、current validators、Preview/Runtime presentation 做统一治理，消除已确认规则与旧文件之间的冲突，避免后续 Track 03～05 再次从历史资产恢复旧规则。

Result：课程生产事实源已收敛为三层：Bootstrap（Start Here）→ Current Context（Current Facts + current Track / Brief）→ Normative Rule Sources（Formal Curriculum / Lesson Output Contract / Beginner Quality / Governance / Unified Shell）。Current Skill 只由 registry 解析 v1；v0.1/v0.2 已归档为 historical provenance。Batch D validator 负责当前内容防漂移，已完成 Batch 的旧 validators 只作 historical evidence。

Validation：Course Governance / Production Workflow / Build Entry / Current State / Formal Registry / Track Baseline / Batch D Draft+Workflow+Review / Script Entrypoints / TypeScript / Build 作为当前统一 Gate。已完成 Batch 的旧 Draft / Workflow / Registration validator 归档为 `_historical-*`，不再作为 current gate。

## SCRIPT-ENTRYPOINT-GOVERNANCE-001 — Current Scripts Cleanup

Status: COMPLETE / VALIDATION_PASS
Priority: P0

Goal：减少 `scripts/` 中旧任务脚本对后续开发的误导，让“最新可运行脚本”只通过 `package.json` 暴露，并隔离仍有历史恢复价值的单课脚本。

Result：删除 15 个已退役 pilot / sample validator / early Course Builder acceptance；累计移除 27 个过时、单课旧入口或已完成 Batch 的 package scripts；27 个仍有追溯/恢复价值的单课或已完成 Batch 生产脚本统一归档为 `_historical-*` 并取消当前入口。当前 scripts 中 34 个 current TypeScript 脚本全部有 package entrypoint；27 个 historical TypeScript 脚本不暴露 package command，historical 暴露数为 0。新增 `scripts/README.md` 与 `scripts:current:check`。规则：普通根目录 `.ts` 必须有 package entrypoint；未暴露脚本只能是 `_historical-*`；已退役脚本重新出现即验证失败。

Validation：`npm run scripts:current:check`、Course Governance、Course Production Workflow、Course Build Entry、Current State、Track 01 Baseline、Batch C Draft / Review、`typecheck`、`build` 全部 PASS。

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
\n

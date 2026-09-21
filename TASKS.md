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

Status: CONTRACT_COMPLETE_RUNTIME_PENDING
Priority: P0

v0.1 最小契约已完成：skills/course-builder/v0.1.ts 固定 BUILD / IMPROVE Prompt 边界；lib/learning/course-builder.ts 提供 Structured Output parser + Code Validation；只有校验通过的结果才能形成 PENDING_REVIEW Review Packet。当前不接 Provider、不落 Draft 表、不实现自动 Publish，也不改 Access / Progress / Completion。

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

新增 `docs/learning/FOUNDATION_BATCH_A_BRIEFS_V1.md`。F1-01～F1-04 已提升为 Course Builder-ready Formal Brief，分别覆盖 AI/ML/Generative AI、LLM Model vs Product、Training vs Inference、Generation vs Retrieval vs Deterministic Logic。每节已固定最终标题、Catalog subtitle/outcome、预计时长、Prerequisite、Lesson Type/Gate、Learning Objectives、Canonical Knowledge、Misconceptions、Scenario、六步教学意图、Three-Question Mastery focus、Grounding 与 Anti-overlap。新增 Catalog Display Contract，明确 curriculumStatus 与 availability 分离；PLANNED/BRIEF_READY 可展示但不可进入空课程页。下一步：`LEARNING-CATALOG-001 — Formal Curriculum Catalog UI`。

### CURRICULUM-004 — Foundation Catalog Metadata Completion

Status: COMPLETE_CATALOG_READY_V1

新增 `docs/learning/FOUNDATION_CATALOG_METADATA_V1.md`。AI 基础认知完整 7 Stage / 28 Lesson 均已补齐前端目录元数据，包括 lessonId、title、subtitle、learnerOutcome、lessonType、estimatedMinutes、curriculumStatus、availability、stage/module/order、prerequisites、badge，以及 Stage title/promise/count。F1-01～F1-04 为 BRIEF_READY + COMING_SOON，其余 24 节为 PLANNED + COMING_SOON；当前没有 AVAILABLE。目录可完整展示，但所有未发布课程不得进入空 Lesson Runtime。下一步：`LEARNING-CATALOG-001 — Formal Curriculum Catalog UI`。

### LEARNING-CATALOG-001 — Formal Curriculum Catalog UI

Status: COMPLETE_UI_V1

`/learning-path` 已接入正式 Foundation Catalog。新增 `lib/learning/foundation-catalog.ts` typed planning-data bridge 与 `components/FoundationCatalog.tsx`，展示完整 7 Stage / 28 Lesson；F1-01～F1-04 为“准备中 / 即将开放”，其余 24 节为“规划中 / 即将开放”。当前没有 AVAILABLE，所有 COMING_SOON 均不可进入空 Runtime。旧页面的六阶段、3 个开放阶段和 `lib/courses.ts` 派生 StageProgress 已从正式学习路径页移除，并对齐五大长期课程主线。typecheck/build PASS。下一步先 Human Review `/learning-path`，通过后进入 Foundation Batch A 正式课程生产。

### LEARNING-CATALOG-001-A — Navigation & Progress Refinement

Status: COMPLETE_UI_REFINEMENT_V1

Human Review 后将五大长期学习板块移到课程目录上方作为一级课程导航；当前 AI 基础认知高亮，其余板块标记后续开放。Foundation 区域桌面端采用左侧圆环进度 + 右侧 7 Stage / 28 Lesson 目录，移动端上下堆叠。新增 `LearningBlockProgress`，进度仅统计 AVAILABLE 且绑定正式 Runtime 标识的课程，再读取 ProgressProvider 完成状态；规划中/准备中/即将开放课程不进入分母。当前没有 AVAILABLE Foundation Lesson，因此显示 0%，不会使用旧课程 fallback 制造假完成率。typecheck/build PASS。下一步继续 Human Review `/learning-path`。

### COURSE-PRODUCTION-001 — Foundation Batch A Real Lessons

Status: PEDAGOGY_REJECTED_RETIRED_REFERENCE

F1-01～F1-04 四节真实 CONCEPT Draft 已落盘并接入统一 Course Builder Preview。四节全部保持 EXPLAIN→EXAMPLE→CHECK→PRACTICE→REVIEW→CAPABILITY、conceptMasteryBeforePractice=true、Completion Gate=CHECK、practiceMode=NONE、Three-Question Mastery；Step 4 仅做轻量参与，不增加 Gate。新增共享 `FoundationConceptDraftPreview`，不按 lesson slug 改 Generic Runtime。Catalog 状态更新为 IN_PRODUCTION + COMING_SOON，未发布。学习路径页 Human Review 文案已将“课程导航”改为“学习地图”。Foundation Batch A acceptance、Course Builder contract、Concept Mastery、Three-Question Mastery、typecheck、build 全部 PASS。下一步：Human Review 四个 Preview，通过后逐节修订并进入正式化。

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

Status: COMPLETE_V02_QUALITY_ALIGNED

新增 `skills/course-builder/v0.2.ts`，保留 v0.1 历史兼容。v0.2 将 Beginner Quality Standard 写入生成 Prompt，并通过 `BEGINNER_QUALITY_V1` profile 下沉到 Code Validation：mainLearnerQuestion、mainConcept、allowedCoreTerms、deferredTerms。v0.2 Beginner BUILD 缺 profile 会拒绝；allowedCoreTerms 最多 2 个、主 Review 最多 3 条、Example 必须 Before/After、Capability 必须表达可执行能力，deferredTerms 不得在用户可见内容中提前泄漏。当前课 Primary Knowledge Home 的术语可通过 allowedCoreTerms 显式放行，因此 Stage 3 可合法教授 Token / Training，不受 Stage 1 禁词误杀。新增 `course-builder:accept:beginner-quality`，已验证 profile required / review budget / deferred term / allowed term / v0.1 compatibility 全部 PASS；typecheck/build PASS。下一步：Stage 2 新课程默认走 Course Builder Skill v0.2。

### SKILL-GOV-001 — Skill Responsibility & Orchestration Baseline

Status: COMPLETE_GOVERNANCE_BASELINE_V1

新增 `docs/SKILL_GOVERNANCE.md` 与 `skills/REGISTRY.md`，并把 Skill Decision Gate 写入 `AGENTS.md`。后续开发任务实现前必须先判断 `CODE_ONLY / EXISTING_SKILL / NEW_SKILL_NEEDED`；需要新 Skill 时必须先讨论 Mini Skill Proposal，再实现最小 v0.1。固定一个 Skill 只做一个可独立验收职责、只产出一个主要结果；Skill 为 Architecture-neutral Content / Intelligence Layer，不得修改 DB / Schema / API / Runtime / Workflow / Permission / Publish / Progress / Completion；Skill 默认不互调，联动由 Workflow 编排。Registry 只登记真实落盘的 course-builder v0.1.0 / v0.2.0。自动化可逐步提高，但后台审核与 Core Authority 不变。下一步：COURSE-GOV-001，再进入 Foundation Stage 2。

### COURSE-GOV-001 — Course Production Governance Baseline

Status: COMPLETE_GOVERNANCE_BASELINE_V1

新增 `docs/learning/COURSE_PRODUCTION_GOVERNANCE_V1.md` 与 `COURSE_PRODUCTION_PROVENANCE_TEMPLATE.md`，并把 Course Production Gate 接入 `AGENTS.md`。正式课程固定走 Curriculum/Knowledge Map → Formal Brief → Course Builder → Code Validation → Draft Preview → Human Review → Runtime Provisioning → Runtime Acceptance → AVAILABLE。现有 `curriculumStatus` / `availability` enum 不扩展；Human Review PASS 与 Runtime Ready 只作为治理 Gate。每个 generation attempt 只能选择一个明确 Skill Version；当前新 Beginner 默认 `course-builder@0.2.0`，v0.1 仅保留历史追溯。Human Review FAIL 回到 IN_PRODUCTION，新 Draft version 继续沿用 canonical lesson identity；Preview 不写正式 Progress/Completion；Skill 问题单独升级 Skill，架构问题另开工程任务。继续沿用 Foundation 3–5 节 Production Batch 规则，Stage 2 四节可作为一个完整 Batch。下一步：Foundation Stage 2 F2-01～F2-04 课程生产。

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





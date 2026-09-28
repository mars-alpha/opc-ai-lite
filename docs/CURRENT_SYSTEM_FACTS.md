# CURRENT_SYSTEM_FACTS.md — OPC AI 当前系统事实

> 当前事实基线以本文件 Section 0「Current Course Production Snapshot」+ 当前代码 / Schema / Runtime 最新验证为准；历史任务名只用于追溯，不代表当前课程生产阶段。
>
> 本文件只记录当前事实。历史过程看 `docs/task-results/*`，未来规划看 `TASKS.md`。

## 0. Current Course Production Snapshot

> 新开 Chat / Agent / Codex 对话恢复课程状态时，先以本节为当前课程生产状态摘要；历史 task-result 只能解释过程，不得覆盖本节与后续当前事实。

```text
Track 01 canonical path          T1-01～T1-20 / 6 Phases
T1-01～T1-10                    AVAILABLE / FORMAL_RUNTIME
T1-11～T1-20                    AVAILABLE / FORMAL_RUNTIME
T2-01～T2-15                    AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS
Track 03 canonical path          T3-01～T3-15 / 6 Phases / DIRECTORY_APPROVED_V1
Track 03 T3-01～T3-15          AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS
Track 04 canonical path          T4-01～T4-15 / 6 Phases / DIRECTORY_APPROVED_V1 / 15 KEEP
Track 04 T4-01～T4-15          AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS
Current Course Builder Skill    course-builder@1.0.0
Frontend boundary               EXISTING UNIFIED LESSON SHELL / NO NEW UI / NO CSS CHANGE
Track 05 canonical path          T5-01～T5-16 / 6 Phases / DIRECTORY_APPROVED_V1 / 6 PRODUCTION BATCHES
Track 05 T5-01～T5-16          AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS
Track 05 Learning Map            16 LESSON DIRECTORY / 6 PHASES / ALL AVAILABLE
Deferred knowledge              DEFERRED_KNOWLEDGE_LEDGER_V1 → Track 05 planning input
Next Gate                       Track 05 COMPLETE / READY FOR GIT COMMIT
```

T1-11～T1-20 已完成 Stable Course Production Workflow 全链路：10 个结构化 Draft、Deterministic Validation、Human Review、LessonSpec Registry、Runtime Provisioning 与 authenticated Runtime Acceptance 全部 PASS。10 节课均已进入 `foundation-ai` Phase 4～6 正式 Runtime，并继续复用现有 Unified Lesson Shell；本批次没有新增 UI / Renderer / interaction type，也没有调整 CSS。未展开知识继续由 `DEFERRED_KNOWLEDGE_LEDGER_V1.md` 作为 Track 02～05 规划输入。

Track 03 Batch A T3-01～T3-03 曾先完成 Human Review PASS → LessonSpec Registry → Runtime Provisioning → Runtime Acceptance → AVAILABLE，建立了 `ai-growth` 正式 Runtime Course 与首批验收基线。该“仅前三节开放”的阶段状态现已被后续 T3-04～T3-15 全量正式上线覆盖；Batch A 的 9 道 required Check + 3 个 required STRUCTURED_TEXT_V1 Practice 验收结果仍作为历史发布证据保留。前置 Track 02 继续只作学习建议，不作为会员硬门槛。

Track 03 T3-04～T3-15 已完成产品负责人 Human Review PASS → LessonSpec Registry → Runtime Provisioning → Runtime Acceptance → AVAILABLE。Track 03 现已 15/15 正式上线；新增 12 节均为 PUBLISHED，每课 3 道 required Check + 1 个 required STRUCTURED_TEXT_V1 Practice，共 36 道 Check + 12 个 Practice，会员访问、Check Gate、Practice Gate 与 Completion 全部真实 Acceptance PASS。全程复用 Unified Lesson Shell，不新增 UI / Renderer / interaction type，不调整 CSS；学员可见语言继续遵守中文优先与跨 Track 污染 Gate。

Track 05 T5-01～T5-16 已完成 Capability Map → Knowledge Map → Six-step Audit → Product Human Review → 6 个 Production Batch → Formal Brief → Course Builder Draft → Deterministic Validation → Human Review → LessonSpec Registry → `fde` Formal Runtime → Runtime Provisioning → authenticated Runtime Acceptance → AVAILABLE。16 节均为 PUBLISHED，每课 3 道 required Check + 1 个 required STRUCTURED_TEXT_V1 Practice，共 48 道 Check + 16 个 Practice；正式 Runtime 与课程 Sidebar 统一为 6 个阶段，课数分布 3 / 3 / 3 / 3 / 3 / 1。会员访问、Track 04 仅学习建议、Check Gate、Practice Gate 与 16 个 Completion 全部真实 Acceptance PASS。T5-16 只做 Capstone Integration，不新增 Primary Knowledge Home。全程复用 Unified Lesson Shell，不新增 UI / Renderer / interaction type，不调整 CSS。上线前临时 Preview 已退出 current path；正式 owner 为 `lib/learning/track05-runtime.ts` / `lib/learning/track05-specs.ts`，课程目录与知识边界以 `TRACK05_CATALOG_CONTEXT_V1.md` 为唯一 owner。

Track 04 T4-01～T4-15 已全部完成 Human Review PASS → LessonSpec Registry → `ai-workflow` Formal Runtime → Runtime Provisioning → authenticated Runtime Acceptance → AVAILABLE。正式 Runtime 统一由 `lib/learning/track04-runtime.ts` 管理，15 节均为 PUBLISHED，每课 3 道 required Check + 1 个 required STRUCTURED_TEXT_V1 Practice，共 45 道 Check + 15 个 Practice；会员访问、Track 03 仅学习建议、Check Gate、Practice Gate 与 15 个 Completion 全部真实 Acceptance PASS。学习地图与课程 Sidebar 统一为 6 个阶段、15/15 AVAILABLE，阶段标题不带“阶段 1：”等前序。数据库旧 `task-decomposition / context-engineering / hitl / evaluation` 及旧模块已从 `ai-workflow` 正式空间清理；课程生产 Preview/批次 Runtime 入口退出 current path。

2026-09-23 真实学习体验复核后，T1-11～T1-20 又完成 `TRACK01-T11-T20-LEARNING-EXPERIENCE-REWORK-001`：学员可见语言中文优先、Step 4 Reference Fill 可直接复制给 AI 形成完整任务、Step 5 改为按知识密度组织的课题化判断卡片、Step 6 使用独立现实触发场景并与 Next Lesson Value 分离。修改后重新 Provision，10/10 authenticated Runtime Acceptance 再次 PASS。规则已回写 Course Build Entry / Lesson Output Contract / Beginner Quality / Governance / Course Builder Skill v1 / Workflow read-latest owner；Unified Lesson Shell 与 CSS 未改变。

## 1. 仓库治理基线

仓库文件数量会随课程、Runtime 与治理资产持续变化，不再在 Current Facts 中维护容易腐化的静态文件计数。当前工程事实以 Git 工作区、当前代码、Schema、Runtime 验收与本文件 Section 0 为准；需要文件级盘点时直接读取当前 Git，而不是引用历史统计。

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

当前最近验证：

```text
npm run typecheck          PASS
npm run build              PASS
npm run course-builder:check PASS
Phase 1 Runtime Acceptance PASS
T1-11～T1-20 Batch Runtime Acceptance PASS
T1-11～T1-20 Learning Experience Rework Runtime Acceptance PASS
PERF-002 Browser Acceptance PASS_WITH_INFRA_LIMITATION
Tencent staging course auth guard PASS（no-cookie /courses/... → HTTP 307 /auth）
```

当前系统满足继续开发的基本条件。

### MVP 维护治理事实

当前仓库后续开发已明确采用“整体主链优先于补丁修复”的治理方式：当旧代码、历史 fallback、重复状态或兼容逻辑开始影响当前 MVP 主线时，先审计并收敛状态模型 / 模块边界，必要时直接删除或重写旧实现；不通过不断增加本地状态、fallback 或特殊判断维持旧结构。业务行为以单一事实源与端到端 Runtime Acceptance 为准。

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
0007 → Knowledge Provenance / Multi-source Content Links
0008 → Knowledge Deep Resource / Feishu Bridge
0009 → Knowledge → Practice Draft Workflow
0010 → Check multi-select / correct_answers
0011 → Check incorrect_explanation
0012 → Lesson Progress current_step (1–6)
0013 → Durable background_jobs outbox
```

数据库验证事实：

```text
0000 → 0009  历史远程 Runtime smoke VERIFIED
0010 → 0011  Formal Check Runtime schema 已进入后续 Phase 1 acceptance
0012          lesson_progress.current_step，用于 001-B Resume / currentStep
0013          background_jobs durable outbox，PERF-002 当前开发数据库已应用并真实 PASS
```

旧的“remote migration rows = 10 / only 0000→0009”只保留历史意义，不再作为当前部署事实。每个独立 release / staging / production 目标都必须核对自己的 migration journal；不能从历史远程 smoke 或开发数据库状态推断另一部署目标已应用同一 migration。

RUNTIME-001 已完成：

```text
Content → Knowledge → PRIMARY / SUPPORTING provenance    PASS
Knowledge → Course Candidate create / idempotency        PASS
Knowledge → Deep Resource create / idempotency / update  PASS
Knowledge → Practice Draft RULE → APPROVED → Practice DRAFT PASS
Existing Latest Practice overwrite guard                 PASS
RUNTIME001 test data cleanup                              PASS
```

0006–0009 不再是 Runtime blocker。

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

正式课程交互当前只有一条主链：Lesson route → `FormalGuidedLessonView` → `AsyncLessonRuntimeShell` → `GenericLessonRuntimePanel` → Completion / Rating / 下一课。正式 Runtime course 与历史 static course 的边界统一由 `lib/learning/course-runtime-boundaries.ts` 管理；当前 `foundation-ai`、`ai-work`、`ai-growth`、`ai-workflow` 与 `fde` 属于 FORMAL_RUNTIME；历史 `ai-literacy / chatgpt-worker` 才能进入 `components/legacy-learning/LegacyStaticLessonView`，不得作为新课程 fallback。正式课程缺少 LessonSpec、Presentation 或数据库 Runtime 时必须直接暴露配置错误。

`foundation-ai` T1-01～T1-20、`ai-work` T2-01～T2-15、`ai-growth` T3-01～T3-15、`ai-workflow` T4-01～T4-15 与 `fde` T5-01～T5-03 已进入正式六步 Runtime。核心状态流统一为 currentStep / Completion → Lesson Progress；Step 3 → `lesson_check_responses`；Step 4 → Practice Submission / Evaluation；Rating → `learning_feedback`。PostgreSQL / Server 是正式学习状态唯一事实源。六步教学规则不在本文件复制，统一读取当前 `COURSE_PRODUCTION_RULE_SOURCES`。

### COURSE_RUNTIME_PERF-003 — Static Shell / Dynamic State Split

正式 `foundation-ai` 首屏采用“静态 Hero / 动态学习区”拆分：Server 不等待个人 Runtime；先稳定显示 OPC 引导式课程 Hero，并显示轻量“正在读取学习进度…”；客户端 `/api/learning/runtime` 恢复 currentStep、Check、Practice、Completion 与 Rating 后，`引导式学习` 整体一次展开到正确 Step。缓存只用于预定位，不得提前展开学习区。Server / PostgreSQL 仍是个人学习状态唯一事实源。

### COURSE-INTERACTION-CLEANUP-001 — Formal / Legacy Interaction Isolation

课程页已完成物理隔离：主 route 只做 Formal / Locked / Legacy 决策；正式视图在 `FormalGuidedLessonView.tsx`；Access Gate 在 `LessonLockedView.tsx`；历史 static renderer 与其复制/帮助交互均移动到 `components/legacy-learning/`。已删除零引用旧交互组件 `StageProgress.tsx`、`CourseProgress.tsx`、`CourseCompletionBadge.tsx`、`LessonStatus.tsx` 以及顶层旧 `CopyableGuide.tsx` / `LessonHelpPanel.tsx`。后续正式课程禁止 import `legacy-learning`。验收命令：`npm run learning:course-interaction:check`。


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

当前代码已有 `getMembershipStatus()`、`resolveMembershipFeatureAccess()`，并由 ACCESS-001 新增统一资源级 `resolveResourceAccess()`。

当前面向用户的权益模型已收敛为：

```text
Anonymous Course Runtime       DENY → /auth
AI 基础认知课程全章节           FOLLOWER OR OPC_MEMBER
AI 日报部分内容                 FREE
AI 日报完整内容                 FOLLOWER OR OPC_MEMBER
进阶练习                       OPC_MEMBER
实操项目                       OPC_MEMBER
进阶内容                       OPC_MEMBER
```

AI 基础认知课程前三章节继续保持现有免费开放功能，但不作为会员权益表的独立展示项。

公众号关注不等价于 Membership。FOLLOWER = FREE + OFFICIAL_ACCOUNT_FOLLOW entitlement：用于解锁 AI 基础认知课程全章节与完整 AI 日报；未来公众号同时承担“学习助手”角色，推送新更新的实操项目、进阶练习等学习内容。消息推送权与内容使用权必须分离：FOLLOWER 可以收到会员内容更新通知，但进阶练习、实操项目、进阶内容仍必须按实时 OPC Membership / Resource Access 判断；非会员点击此类推送时进入价值预览 / 订阅引导，不得因已关注公众号直接放行。真实微信关注验证尚未接入，因此当前不提供手动“我已关注”确认，也不伪造 FOLLOWER 状态。

会员权益表只展示长期稳定的用户价值，不再把 Knowledge 正文、Feishu Deep Resource、Latest Practice 等内部内容模型当作独立权益。现有 Knowledge / Deep Resource / Latest Practice 数据与 Reader 仍可作为内容生产、实操项目和进阶练习的内部来源；其底层 Access 继续由统一 `resolveResourceAccess()` / Practice Access 控制，避免敏感正文或链接在未授权时进入 RSC payload。

ACCESS-UX-001 原则继续有效：受限内容可以保持可发现，但内部 Access 规则不直接暴露给普通用户；页面优先解释“可以继续获得什么”。

### 当前前端信息架构

当前已确认前端基线如下，属于产品展示与 Access UX，不进入 Course Builder / Course Production Workflow authority：

```text
学习路径
→ Track 01 / Track 02 学习地图与正式课程入口
→ 不再承载“实操项目”

进阶练习
→ 实操项目：多个能力的综合应用层
→ AI 热点能力练习：AI 日报 / 热点采集 → 初步完整知识点 → 单项能力练习

AI 热点能力练习列表
→ 继续复用原 practice-list / practice-row 展示
→ 默认展示 3 条
→ “查看更多”在当前页底部居中，以纯文字形式每次追加 3 条
→ 当前测试数据补足 7 条，用于验证 3 → 6 → 7 交互
→ 展示完后显示“— 已展示全部内容 —”
→ 每次重新进入页面恢复默认 3 条
```

旧 `/practice/latest` 独立列表页与 `LatestPracticeCard` 已删除；不再维护第二套卡片列表 UI。单条 `/practice/latest/[id]` 详情继续保留，因为它仍承载公开预览、会员 Access、正式 Practice Submission / Evaluation 与关联资料；详情返回统一回到 `/practice#tasks`。

`Latest Practice`、Knowledge、Deep Resource 等名称继续可以作为内部数据模型 / Reader / Bridge 名称，不再作为前台信息架构名称。真实 AI 日报热点如何生成、审核、整理并进入“AI 热点能力练习”的自动化流程尚未实现；当前仅固定产品归属与交互边界。

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
sourceContentId   兼容 Primary Source 快捷字段
title / summary / body / category
validity
stageId / lessonId
readingMinutes
status / publishedAt
```

当前已新增：

```text
knowledge_source_links
knowledgeId
contentId
role = PRIMARY | SUPPORTING
UNIQUE(knowledgeId, contentId)
```

旧 `sourceContentId` 会在 0007 migration 中回填为 PRIMARY link；一个 Knowledge 可以保留一个 Primary Source，并关联多个 Supporting Content。

当前已实现：

```text
Content → Knowledge
Knowledge → Latest Practice
Knowledge → Course Update Candidate
```

Knowledge Provenance Foundation 已完成代码与 migration。

当前已新增 Knowledge-owned Deep Resource：

```text
knowledge_deep_resources
knowledgeId required
lessonId nullable
practiceId nullable
provider = FEISHU
title / summary
resourceRef / url
status
createdAt / updatedAt
UNIQUE(knowledgeId, url)
```

只有 Published Knowledge 才允许把 Deep Resource 设为 PUBLISHED；DRAFT / REVIEW 可以先人工维护。Admin 仍负责创建 / 更新引用；ACCESS-001 已增加 MEMBER-only 用户读取，非会员不会获得 Published Feishu URL。真实 Feishu API 自动发布、OAuth、机器人或双向同步仍未实现。

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

当前已新增 Practice Draft 审核层：

```text
practice_drafts
sourceKnowledgeId required
sourceDeepResourceId nullable
generationMode = RULE | AI
generationError nullable
draft JSONB
status = PENDING_REVIEW | NEEDS_REVISION | APPROVED | DISMISSED
reviewNote / reviewedBy / reviewedAt
resultPracticeId nullable
UNIQUE(sourceKnowledgeId)
```

正式 `practices` 仍是唯一 Practice Source of Truth。Practice Draft APPROVED 只会创建 `LATEST_PRACTICE` 的 DRAFT；不会直接 PUBLISHED，也不会覆盖已有正式 Latest Practice。

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

当前已新增 Knowledge → Course Impact Analysis：

```text
Published + active Knowledge
→ analyze against Published Lesson catalog
→ AI (configured) or conservative RULE suggestion
→ transient suggestions only
→ Admin selects / edits
→ existing Course Update Candidate API
→ PENDING_REVIEW
```

Impact Analysis 本身不落新表、不生成新 migration。RULE 模式只在 Knowledge 已明确关联 lessonId 或 stageId 时给建议；没有课程关联时返回空建议，不随意猜测 Lesson。

当前 Course Builder 唯一生产基线为 `course-builder@1.0.0`：BUILD / IMPROVE 只生成结构化 Draft / Proposal，不拥有 publish、access、progress、completion 或 production data 权限。正式课程必须读取 current Rule Sources + current Track Context + Formal Brief，经过 Deterministic Validators 与 Human Review 后才能注册 Runtime。

课程批量生产已固定 anti-template / cross-lesson separation：共享 helper 只复用类型、数据装配和确定性逻辑；Step 1 / 3 / 4 / 5 / 6 learner-facing 文案必须由本课 Primary Knowledge Home 驱动。整批模板化判定 `LESSON_TEMPLATE_DRIFT_FAIL`，相邻课程重复教授同一核心判断判定 `CROSS_LESSON_KNOWLEDGE_OVERLAP_FAIL`。

Course Builder acceptance fixtures / Preview 只用于局部开发验证，不属于正式课程 Source of Truth，也不得作为新课程恢复入口。Track 04 发布后已移除其 Batch Preview current route；正式课程统一走 LessonSpec Registry → GenericLessonRuntimePanel → Runtime Gates。

Unified Lesson Shell 当前底部导航规则：教学标签可以作为独立元素保留；页码行只显示 `1 / 6`～`6 / 6`，不得在页码前后拼接 navigationDescription、Step 摘要或课程专属描述。顶部六张进度卡片继续使用每课自己的 `navigationDescription`。

`LEARNING-UX-FINAL-001` 已将当前课程体验冻结为 `Unified Lesson Shell v1 / FROZEN_V1`。代码契约位于 `lib/learning/unified-lesson-shell.ts`，规范位于 `docs/learning/UNIFIED_LESSON_SHELL_V1.md`，并由 `npm run learning:shell:accept` 防止六步顺序/标签、三题 Mastery、slug Renderer 分支、Preview 边界和移动端导航发生无意漂移。普通课程内容任务不得顺手改变 Shell；结构变化必须另开明确 UX / Runtime 任务。

`COURSE-SIDEBAR-UX-001` 已冻结课程页左侧目录为唯一 `LessonCourseSidebar`：学习阶段默认展开；各阶段可独立折叠并允许同时展开；折叠状态只保存到当前会话 `sessionStorage`；当前课程所属阶段始终强制展开；阶段标题持续显示“已完成 / 总课时”摘要。该交互不新增服务端请求，不允许新增第二套 Sidebar、slug-specific Sidebar 或以旧静态目录替代。验收命令：`npm run learning:sidebar-ux:check`。

`CURRICULUM-001` 已将正式课程主线锁定为：AI 基础认知 → AI 工作应用 → AI 推广运营与业务增长 → AI Workflow 与自动化 → FDE / AI 解决方案落地。Track 01 当前唯一目录 owner 为 `docs/learning/TRACK01_CATALOG_METADATA_V2.md`，冻结基线为 T1-01～T1-20 / 6 Phases；旧 7 Stage / 28 Lesson F-ID 目录已删除，不再作为当前课程输入。完整目录与内容生产批次继续分离；每个核心概念只设一个 Primary Knowledge Home。

早期 Foundation F-ID、7 Stage / 28 Lesson candidate map、Beginner Reframe、Stage 1/2 Trial、v0.2 production provenance 与旧 Preview 只属于已完成的历史演进，相关重复文档已清理。当前 Track 01 身份、顺序、Phase、Primary Knowledge Home 与 prerequisite 只以 `TRACK01_CATALOG_METADATA_V2.md` 为准；为什么 28 candidates 收敛为 20 课的唯一保留审计依据为 `TRACK01_28_CANDIDATE_SIX_STEP_AUDIT_V1.md`。当前课程规则只从 `COURSE_BUILD_START_HERE.md` → Course Production Workflow → current owners / Rule Sources / Context 恢复，不从旧 task-result 或旧 F-ID 文档恢复。

Track 01 当前 T1-01～T1-20 已全部完成正式课程生产、Human Review、LessonSpec Registry、Runtime Provisioning 与 Runtime Acceptance，并全部进入 AVAILABLE。T1-11～T1-20 的早期 Workflow Batch / Human Review Gate 状态只属于当时阶段，不再是当前状态。现有 Unified Lesson Shell 为冻结前端边界；后续 Track 02～05 与未来板块课程默认复用，不因课程内容新增 UI 或调整 CSS。

Track 02 当前课程上下文唯一 owner 为 `docs/learning/TRACK02_CATALOG_CONTEXT_V1.md`；目录状态为 DIRECTORY_APPROVED_V1。T2-01～T2-15 当前全部为 AVAILABLE / FORMAL_RUNTIME / RUNTIME_ACCEPTANCE_PASS，`ai-work` 正式课程共 15 节。Batch A～D 均已完成 Course Production Workflow、Deterministic Validation、Human Review、LessonSpec Registration、Runtime Provisioning 与 Runtime Acceptance。数据库中 15 节均为 PUBLISHED，每课 3 道 required Check + 1 个 required `STRUCTURED_TEXT_V1` Practice。

Track 02 当前状态：T2-01～T2-15 全部为 AVAILABLE / FORMAL_RUNTIME / RUNTIME_ACCEPTANCE_PASS。Batch D T2-10～T2-15 已完成 Human Review、LessonSpec Registration、Runtime Provisioning 与 authenticated Runtime Acceptance；正式课程继续复用 Unified Lesson Shell，没有新增 UI、Renderer、interaction type 或 CSS。

`TRACK02-LEARNING-PATH-ACCESS-001` 继续作为冻结交互基线：`/learning-path` 使用 `?track=foundation-ai|ai-work` 切换 T1/T2；T2 完整展示 15 节课程，当前 T2-01～T2-15 均为真实 AVAILABLE Runtime。Track Progress 统计全部 15 节正式课程。Access 与 Learning Prerequisite 分离：`ai-work` 正式访问由有效 OPC Membership 决定，T1 完成度不是会员进入 T2 的硬 Gate；未完成 T1 只生成非阻断学习建议。T2-01 上一项固定为“学习地图”；T1-20 完成后的跨 Track Continue 当前真实指向 T2-01；Sidebar 继续只显示当前 Course/Track。

`COURSE-BUILDER-SKILL-V1-WORKFLOW-001` 当前稳定课程生产基线适用于所有正式课程板块，不仅 Track 01。架构固定为 `Course Production Contract → Orchestrator → Current Course Builder Skill → Deterministic Validators → Human Review Gate → LessonSpec Registry → Runtime Provisioning → Runtime Acceptance → AVAILABLE`。Workflow 生命周期不绑定具体 Skill version。

Course Production Workflow 当前已按 Track 02 验证为真正跨 Track 通用：Global Rule Sources 只保留跨板块长期规则；每次运行必须从 Current Facts 解析 current Track/Board owner + directory status、previous→current→next continuity、current Formal Brief/Batch + brief status、Deferred/Supporting Boundary 与 Grounding/Research Packet。Track 切换只替换 Context references，不复制 Workflow，也不新建 Track-specific Course Builder Skill。COURSE_BUILD_START_HERE 已取消默认 Track 01 恢复；FORMAL_CURRICULUM 已对齐 Track 01 20节/6 Phase 与 Track 02 15节批准目录；FIVE_TRACK_CAPABILITY_CONTINUITY 只维护当前跨 Track 连续性，不再保存旧生产阶段或 Skill 版本决策。

课程生产规则治理当前边界：`COURSE_PRODUCTION_RULE_SOURCES` 只包含规范 owner（Formal Curriculum / Lesson Output Contract / Beginner Quality / Course Production Governance / Unified Lesson Shell）；`COURSE_BUILD_START_HERE.md` 是 Bootstrap Entry，`CURRENT_SYSTEM_FACTS.md` 是当前 Context，不再注册为规则正文。Current Course Builder 只由 `skills/course-builder/index.ts` 解析；v0.1/v0.2 已归档为 historical provenance。`learning:course-governance:check` 与 `learning:course-production-workflow:check` 负责阻止旧规则、历史 Skill 或重复规则重新进入 current Workflow。

Scripts 入口治理保持有效：current TypeScript 脚本必须有明确 package entrypoint；`scripts/_historical-*` 不得暴露为 current command，已退役 pilot / acceptance 不得恢复。

Course Builder BUILD 的 `pedagogy` 当前还必须包含 `conceptMasteryBeforePractice=true`。四种 Lesson Type 均固定以前 3 步完成概念理解：EXPLAIN 讲清“是什么 / 为什么重要 / 解决什么问题”，EXAMPLE 展开方法 / 边界 / 易混淆点 / 常见错误，CHECK 验证是否真正理解；PRACTICE 原则上不得首次引入新的核心概念。

`CourseBuilderCheck` 当前支持 `SINGLE_CHOICE | TRUE_FALSE | MULTI_SELECT`。旧 Draft 未提供 `questionType` 时默认 SINGLE_CHOICE，旧 `correctValue` 会归一为 `correctValues`。MULTI_SELECT 使用答案集合完全一致的确定性判分。旧 `check` 单题仍兼容；新课程默认使用 `checkSequence` 三题理解闭环。Sequence 固定顺序为 SINGLE_CHOICE / BEST_JUDGMENT → TRUE_FALSE / MISCONCEPTION → MULTI_SELECT / BOUNDARY_CONDITIONS，每题必须显式提供不同的 `correctFeedback` / `incorrectFeedback`，三题问题不得完全相同。`courseBuilderCheckSequenceToRuntimeSeeds()` 可将三题按 order=0/1/2、required=true 转成正式 Runtime seeds。

正式学习 Runtime 代码支持三种题型和三题 Sequence。`lesson_checks` 继续以多行 + `order` 表达题组，不新增题组表。Answer API 接受 `answer` 或 `answers`；单选/判断只允许一个答案，多选去重后精确集合判分。Interactive API 在答题前只返回题型、题目、选项和已有作答状态，不返回正确答案；答题后返回对应解释。Generic Lesson Runtime 一次只显示一题：答错显示错误反馈并要求重新选择，答对后才允许下一题；三题全部答对才满足 Sequence CHECK Gate。Legacy 单题仍保持“该题答对才通过”。

`drizzle/0010_famous_blockbuster.sql` 与 `drizzle/0011_milky_sharon_carter.sql` 已进入仓库。0010 增加 TRUE_FALSE / MULTI_SELECT 与 `correct_answers / answers`；0011 增加 `lesson_checks.incorrect_explanation`。当前 Phase 1 acceptance 数据库已能运行对应正式 Check Runtime；任何独立 release / deploy 目标仍需在发布前核对 migration journal，不把历史“remote=0009”记录当成当前部署事实。

`TRACK01-PHASE1-RUNTIME-001-B` 的 B1～B5 核心实现已完成并已进入后续 PERF-002 验收链：Runtime Read Model 已减少 Check / Practice 重复读取并移除主要 N+1；Step 3 Answer / Reset Command 直接返回服务端权威 Check 状态，正式“下一题”不再重读整课 Runtime；Step 4 Submission / Evaluation 直接返回正式 Practice 状态，不再提交后全量 refresh；Completion / Rating 已取消 `router.refresh()`；currentStep 使用 latest-intent-wins 串行/coalesced 保存。PostgreSQL / Server 继续是正式状态唯一事实源。Behavior Signal 已在 PERF-002 中迁移到 durable PostgreSQL Outbox / drain runner，不再以同步聚合阻塞 learner-facing Command。详细计划与状态见 `docs/learning/TRACK01_PHASE1_RUNTIME_001_B_IMPLEMENTATION_PLAN.md` 与 PERF-002 结果。

`TRACK01-RUNTIME-PERF-002 — Critical Path Reduction` 已正式 COMPLETE，状态为 BROWSER_ACCEPTANCE_PASS_WITH_INFRA_LIMITATION。开发数据库 warm 基础 RTT 实测约 270–276ms（均值约273ms），首次连接约2.2s；DB pool 已从 max=3 / idle_timeout=20s 调整为 max=5 / idle_timeout=300s，消除了看题超过20秒后频繁重建连接导致的尖峰。`0013 background_jobs` 已应用当前开发数据库；Outbox enqueue + drain 已真实 PASS。Check / Reset / Practice / Completion / Rating 已完成多轮 critical-path 与 round-trip 收敛。最终真实浏览器体验约为：进入课程3s、Check3s、Reset4s、Practice6s、Practice Retry5s、Completion4s、Rating3s；对应最新服务端核心 timing 约为 Check 1.7–2.2s、Reset1.9s、Practice3.8s、Completion3.1s、Rating1.66s。继续在课程业务层通过复杂 SQL 换取小幅收益不再划算；剩余主要瓶颈转为 Backend↔PostgreSQL locality、连接建立成本与每个 API 的 Session/Auth DB overhead。下一任务入口：`RUNTIME-INFRA-PERF-003 — Database Locality & Request Overhead Reduction`，当前仅 PROPOSED / NOT_STARTED。详细计划见 `docs/learning/TRACK01_RUNTIME_PERF_002_IMPLEMENTATION_PLAN.md`。

## 6. AI Provider

课程 AI Analysis 代码已存在，但当前环境未确认配置：

```text
OPC_AI_ANALYSIS_BASE_URL
OPC_AI_ANALYSIS_API_KEY
OPC_AI_ANALYSIS_MODEL
```

当前环境检测 `AI_PROVIDER_CONFIGURED=NO`。Course Insight 继续保持 RULE / ANALYSIS_READY 边界；Practice Draft 在 Provider 未配置或调用失败时明确生成 `generationMode=RULE` 的模板草稿并记录 `generationError`；Course Impact Analysis 同样明确返回 `generationMode=RULE` 与 `AI_PROVIDER_NOT_CONFIGURED`，不会冒充 AI 输出。

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
1. MVP-009 AI Provider Runtime 未配置/未验证
2. AI Daily 正式自动采集与审核未实现
3. Feishu Deep Resource Admin + MEMBER 用户读取已验证；Feishu API 自动同步未完成
4. Obsidian export 未实现
5. 首个正式 Skill 已落盘：`skills/practice-draft/v0.1.ts`；真实 AI Provider 输出质量尚未验证
6. Subscription / Order / Payment / WeChat Pay 未实现
7. 微信真实 OAuth / Official Account webhook 未实现
```

## 10. 当前下一阶段

当前已完成代码阶段：

```text
MVP-011-D — Knowledge Provenance Foundation
MVP-011-E — Deep Resource / Feishu Bridge
MVP-011-F — Knowledge → Practice AI Draft Workflow
MVP-011-G — Knowledge → Course Impact Analysis
```

RUNTIME-001 已完成：0006–0009 已应用到远程数据库，并完成 C2 / D / E / F 真实 Runtime smoke 与测试数据清理。

ACCESS-001 已完成统一资源级 Access Policy 与匿名 / 普通 / 公众号关注 / 会员四身份 Runtime 验收。

ACCESS-UX-001 已完成 Locked Content Conversion UX：内容可锁定，但价值不隐藏；公众号关注与 Membership 保持两条独立转化路径。

LEARNING-UX-001 + LEARNING-UX-001-C 已完成单 Lesson Guided Learning 与 Completion Loop 样板实现；`chatgpt-worker / task-brief` 是第一份 Reference Lesson。LEARNING-SPEC-001 / 002 已固定 Lesson Spec。LEARNING-RUNTIME-001 进一步建立 Generic Lesson Runtime Foundation：`TASK_BRIEF_V1` 与 `STRUCTURED_TEXT_V1` 共用 Practice Submission / Evaluation Runtime；Completion Core 可执行 CHECK / PRACTICE / REAL_AI Gate；Runtime Read Model 暴露 configurationReady / blockers。Interactive Read / Check 现统一遵守 Access Core，不再为 task-brief 保留 lesson-name Preview 白名单。Real AI Evidence 复用 `learning_events`，当前只把 USER_CONFIRMATION 与可信 SYSTEM_RESULT 视为 Runtime 支持；ARTIFACT 因没有正式 Resolver 保持 unsupported。没有新增数据库 Schema / Migration，也未改变 Access Core。

当前阶段边界：

```text
TRACK01-PHASE1-RUNTIME-001-B      COMPLETE_CORE_IMPLEMENTATION_ACCEPTED
TRACK01-RUNTIME-PERF-002          COMPLETE_BROWSER_ACCEPTANCE_PASS_WITH_INFRA_LIMITATION
Tencent Cloud staging            AUTH / COURSE GUARD VERIFIED
Course Builder v1.0              CURRENT COURSE PRODUCTION BASELINE
Lesson Output Contract v1        CURRENT APPROVED OUTPUT CONTRACT
T1-01～T1-20                     AVAILABLE / FORMAL_RUNTIME
Track 02 Context                 T2-01～T2-15 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS
Track 02 Batch B                 T2-04～T2-06 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS
Track 02 Batch C                 T2-07～T2-09 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS
Track 03                        T3-01～T3-15 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS
Track 04                        T4-01～T4-15 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS
RUNTIME-INFRA-PERF-003            PROPOSED / NOT_STARTED
```

当前 Course Builder Current Skill = v1.0.0，由 `skills/course-builder/index.ts` registry 解析；旧版本不作为 current input。Course Builder / Lesson Output Contract 只负责“怎样把一节课教会与输出成 Draft”；Auth / Access / Progress / Completion / Resume 继续属于 Runtime / Entitlement，不进入 Course Builder authority。未来 Web / H5 / 小程序继续复用同一 Backend/API。

2026-09-24 课程展示数据与生产规则已对齐：
- T1-01～T1-20 和 T2-01～T2-09 的正式课进度卡片从各课 `navigationDescription` 读取，不使用统一短句；T2 前三课的学习建议各自说明本课目标与准备动作，第 1 步 takeaway 下方各有两条本课说明。课程正文和已确认的 UI / CSS / 交互没有因本轮规则收敛而改变。
- `LESSON_OUTPUT_CONTRACT_V1.md` 维护跨板块输出规则；Workflow 在启动时读取最新 owner，Skill v1 按最新规则生成。Track 03/04 已用同一 Workflow 完成正式生产并验证“只切换 Context、不复制 Workflow / Skill”可行；Track 05 继续沿用该链路，并在每批 Draft 进入 Human Review 前执行 Batch anti-template 与 cross-lesson knowledge separation。

当前产品工程顺序固定为：

```text
真实 Runtime
→ 用户权限闭环
→ 内容供给自动化
→ AI / Skill 真实质量迭代
→ 再增加 Obsidian / Media / Feishu 自动化 / Payment 等增强能力
```

G 已完成最小 Impact Analysis → Human Confirm → Existing Candidate 链；AI/RULE 分析结果不直接落课程，也不会自动 APPROVE Candidate。

## 11. 每次任务后的事实同步

只有事实发生变化时才更新本文件，例如：

- 新增/删除正式领域模型；
- 正式数据源改变；
- Runtime / Access 行为改变；
- Migration 执行状态改变；
- 新外部系统真正接通；
- 已知阻塞解除或新增。

纯 UI 文案、局部样式等不影响系统事实的改动，不需要扩写本文件。
\n

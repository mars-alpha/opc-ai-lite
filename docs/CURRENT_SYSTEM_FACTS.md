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
T2-01～T2-09                    AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS
T2-10～T2-15                    PREVIEW_READY / DETERMINISTIC_PASS / HUMAN_REVIEW_PENDING
Current Course Builder Skill    course-builder@1.0.0
Frontend boundary               EXISTING UNIFIED LESSON SHELL / NO NEW UI / NO CSS CHANGE
Deferred knowledge              DEFERRED_KNOWLEDGE_LEDGER_V1 → Track 02～05 planning input
Next Gate                       Track 02 Batch D Human Review / T2-10～T2-15
```

T1-11～T1-20 已完成 Stable Course Production Workflow 全链路：10 个结构化 Draft、Deterministic Validation、Human Review、LessonSpec Registry、Runtime Provisioning 与 authenticated Runtime Acceptance 全部 PASS。10 节课均已进入 `foundation-ai` Phase 4～6 正式 Runtime，并继续复用现有 Unified Lesson Shell；本批次没有新增 UI / Renderer / interaction type，也没有调整 CSS。未展开知识继续由 `DEFERRED_KNOWLEDGE_LEDGER_V1.md` 作为 Track 02～05 规划输入。

2026-09-23 真实学习体验复核后，T1-11～T1-20 又完成 `TRACK01-T11-T20-LEARNING-EXPERIENCE-REWORK-001`：学员可见语言中文优先、Step 4 Reference Fill 可直接复制给 AI 形成完整任务、Step 5 改为按知识密度组织的课题化判断卡片、Step 6 使用独立现实触发场景并与 Next Lesson Value 分离。修改后重新 Provision，10/10 authenticated Runtime Acceptance 再次 PASS。规则已回写 Course Build Entry / Lesson Output Contract / Beginner Quality / Governance / Course Builder Skill v1 / Workflow read-latest owner；Unified Lesson Shell 与 CSS 未改变。

## 1. 仓库扫描基线

当前治理提交后的 Git 受控文件：

```text
TOTAL  209
TEXT   202
BINARY 7
```

主要目录：

```text
app/         54
components/  35
docs/        37
drizzle/     21
lib/         36
skills/      1
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

正式课程交互当前只有一条主链：Lesson route → `FormalGuidedLessonView` → `AsyncLessonRuntimeShell` → `GenericLessonRuntimePanel` → Completion / Rating / 下一课。正式 Runtime course 与历史 static course 的边界统一由 `lib/learning/course-runtime-boundaries.ts` 管理；当前 `foundation-ai` 与 `ai-work` 属于 FORMAL_RUNTIME，历史 `ai-literacy / chatgpt-worker / ai-workflow` 只能进入 `components/legacy-learning/LegacyStaticLessonView`，不得作为新课程 fallback。正式课程缺少 LessonSpec、Presentation 或数据库 Runtime 时必须直接暴露配置错误。

`foundation-ai` T1-01～T1-20 与 `ai-work` T2-01～T2-09 已进入正式六步 Runtime。核心状态流统一为 currentStep / Completion → Lesson Progress；Step 3 → `lesson_check_responses`；Step 4 → Practice Submission / Evaluation；Rating → `learning_feedback`。PostgreSQL / Server 是正式学习状态唯一事实源。六步教学规则不在本文件复制，统一读取当前 `COURSE_PRODUCTION_RULE_SOURCES`。

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

当前已落地 Course Builder Skill v0.1 契约层：BUILD / IMPROVE Structured Output → lib/learning/course-builder.ts Code Validation → PENDING_REVIEW Review Packet。BUILD 复用 Lesson Spec validator，并校验课程正文、required Check / Practice 对齐；IMPROVE 只生成修改 Proposal。两种模式都拒绝 Skill 携带 publish/status/access/entitlement/progress/completion 等 Core Authority 字段。当前不落数据库、不调用真实 Provider、不写 Published Course。

首个真实 BUILD acceptance draft 已落盘于 `fixtures/course-builder/skill-foundations.ts`：`ai-literacy/skill-foundations`，题目“Skill 是什么：把可复用方法交给 AI”。它已通过 Code Validation、CONCEPT rules、Generic Runtime Plan、Unified Lesson Shell compatibility 与 curriculum fit 检查，但仍是 `PENDING_REVIEW` acceptance fixture，不属于正式课程 Source of Truth，也未注册到 Runtime。

当前存在只读 Draft Preview：`/course-builder/preview/skill-foundations`。页面直接读取上述 fixture；Generic Lesson Runtime Panel 的 `previewMode` 禁止正式 Runtime fetch / submission，只允许本地 Step 导航与本地 Check，用于 Human Review。该 Preview 不等于 Runtime registration，不写 Progress / Completion / PostgreSQL，也不进入正式课程目录。

Course Builder BUILD 当前新增教学治理契约：`grounding.status=REVIEWED`，来源只能是 `APPROVED_KNOWLEDGE` 或 `RESEARCH_PACKET`；`pedagogy.languagePolicy=TERM_READABILITY`，学员可见的普通 AI / 技术专业术语首次出现采用“中文（English）”，例如“词元（Token）”“概率（Probability）”“提示词（Prompt）”，后续正文优先使用中文简称；RAG、API、MCP 等行业常用技术缩写使用“中文解释（缩写）”，例如“检索增强生成（RAG）”，不展开英文全称；通用课程必须 `aiToolNeutral=true`；同时必须提供 `pedagogy.participation`。该 participation 是教学参与层，不自动成为 Completion Gate。Course Builder 本身仍不具备网络爬取能力；正式流程应先由独立研究/知识流程产出经审核资料包，再交给 Course Builder 生成课程。

Lesson Spec 当前允许 CONCEPT 在 `practiceMode=NONE` 时包含一个非验收型 PRACTICE Step，用于参与式学习；此时禁止 PRACTICE Completion Gate。`skill-foundations` 当前采用 6 步 `EXPLAIN → EXAMPLE → CHECK → PRACTICE → REVIEW → CAPABILITY`，正式 Gate 仍只有 CHECK。Preview Renderer 会在该 PRACTICE Step 展示 Course Builder participation，而不会调用正式 Practice API。

`skill-foundations` Preview 的 EXPLAIN 当前支持通用 `previewIntroComparison`：直接显示真实场景、临时做法 / 可复用做法、Prompt / Skill 对比与核心结论，不需要额外点击。该能力只属于 Preview 教学呈现，不改变 Lesson Spec、Runtime Gate、Progress 或正式课程状态。

第二个真实 BUILD acceptance draft 已落盘于 `fixtures/course-builder/prompt-foundations.ts`：`ai-literacy/prompt-foundations`，类型 APPLICATION。它使用 `EXPLAIN → EXAMPLE → CHECK → PRACTICE → REVIEW → CAPABILITY`，Completion Gates 为 CHECK + PRACTICE，`realAiOperation=GUIDED`、`realAiEvidence=NONE`。只读 Preview 路由为 `/course-builder/preview/prompt-foundations`，可本地完成 Check / Practice 规则验收并复制用户自己填写的提示词，但不会写正式 Progress / Completion。

Course Builder BUILD 的 `check` / `practice` 当前已从任意对象升级为最小明确 Schema。Check 必须包含 id/question/options/correctValue/explanation；Practice 必须包含 id/title/goal/instructions/hints/rubric/passScore，并校验正确答案存在、Rubric key 与输入字段一致、分数范围合法。

Generic Lesson Preview 的互动反馈当前会在 Step 切换时清除，避免上一节 Check / Practice 消息污染后续步骤。`prompt-foundations` 的 Practice 开启 `referenceAnswerEnabled=true`；仅当本地 Practice 评估未通过时显示完整参考答案，并支持结构化“一键填充”到任务 / 背景 / 限制 / 结果输入框以及复制。填充只更新本地表单并清除旧评分，不会自动提交、不会设置 Practice Passed，也不是可信完成证据。

`prompt-foundations` 当前知识深度已扩为 4 个核心点：任务 / 背景 / 限制 / 结果基础结构、Example（示例）的使用时机、Context（上下文）必须真实提供的场景、Iteration（迭代）根据具体偏差修正结果。新增知识主要通过 Preview 的 `previewKnowledgeDepth` 分散到 EXAMPLE 与 REVIEW，PRACTICE 仅增加轻量提示；六步结构、CHECK + PRACTICE Gate、Runtime 边界均未改变。

Course Builder BUILD 的 `pedagogy` 当前必须包含 `sixStepResponsibilities`，键固定为 EXPLAIN / EXAMPLE / CHECK / PRACTICE / REVIEW / CAPABILITY。每一项必须包含 `purpose` / `include` / `avoid`。职责固定为：EXPLAIN 建立单一核心直觉；EXAMPLE 展开方法、边界与更深知识；CHECK 验证理解并解释原因；PRACTICE 用分层辅助把知识变成能力且不偷偷增加 Gate；REVIEW 形成可复用判断 / 诊断框架；CAPABILITY 明确已获得能力、真实应用场景与下一步。缺少任一责任会被 Course Builder Code Validation 拒绝。

第三个真实 BUILD acceptance draft 已落盘于 `fixtures/course-builder/meeting-action-list.ts`：`ai-literacy/meeting-action-list`，类型 PRACTICE。它使用统一 `EXPLAIN → EXAMPLE → CHECK → PRACTICE → REVIEW → CAPABILITY`，`practiceMode=INDEPENDENT`，Completion Gates 为 CHECK + PRACTICE，`realAiOperation=NONE`、`realAiEvidence=NONE`。只读 Preview 为 `/course-builder/preview/meeting-action-list`。Practice 使用行动 / 负责人 / 截止时间 / 未决问题四字段和本地确定性 Rubric 验收，失败后可使用 Hint、参考答案与一键填充；不会写正式 Progress / Completion。该 Lesson 不替代独立 Practice / 进阶练习领域。

`rulePracticeEvaluator` 当前对 meeting-action-list 需要的短字段采用语义评分：`owner` 只要是一个明确人名 / 角色即可满分，`大家 / 相关同事 / 待定` 等模糊责任人不会满分；`deadline` 要包含可判断时间表达。行动与未决问题仍要求足够具体。PRACTICE acceptance 直接使用结构化参考答案做回归，固定验证单一负责人“小林”可满分且整份答案通过。

Generic Lesson Preview 的 required PRACTICE 扩展区当前只在 `participation.kind=COPY_TO_AI` 时显示“放进你的 AI 软件试一下”；`MINI_TASK` 不再渲染该 Prompt 专属区域。`meeting-action-list` 还复用 `previewKnowledgeDepth`，在 EXAMPLE / REVIEW 增加更深知识，但不增加新的 Gate。

`PreviewIntroComparison` 当前支持可选 `comparisonPlacement=MIDDLE|BOTTOM`。`meeting-action-list` 使用 `BOTTOM`：EXPLAIN 主区只保留场景与两种做法，核心 takeaway 后再以轻量 knowledge-depth 样式展示“摘要 = 回顾发生了什么 / 行动清单 = 帮助下一步执行”。默认仍为 MIDDLE，因此现有 Prompt Preview 不变。

第四个真实 BUILD acceptance draft 已落盘于 `fixtures/course-builder/ai-workflow-project.ts`：`ai-literacy/ai-workflow-project`，类型 PROJECT。它使用统一六步，`practiceMode=PROJECT`，Completion Gates 为 CHECK + DELIVERABLE，`realAiOperation=NONE`、`realAiEvidence=NONE`。只读 Preview 为 `/course-builder/preview/ai-workflow-project`。项目草稿包含目标 / 触发输入 / 工作流步骤 / 人工确认 / 成功指标五部分，并复用本地 RULE evaluator、Hint、参考答案和一键填充。

`LessonRuntimePlan` 当前新增 `requiresDeliverable`，可显式识别 PROJECT 的 DELIVERABLE Completion Gate。Generic Lesson Preview 在 PROJECT 下允许对结构化项目草稿做本地质量检查并继续体验后续 Step，但 Preview Runtime 会加入 `DELIVERABLE_RUNTIME_NOT_SUPPORTED` blocker。当前没有正式 Deliverable Resolver / Submission / Completion 状态，因此本地项目草稿 PASS 不等于正式 PROJECT 完成，也不会写正式 Progress / Completion。

`PreviewIntroComparison` 当前还支持可选 `bottomDetails`，用于在 Step 1 takeaway 和底部概念区之后增加轻量价值说明。`ai-workflow-project` 已使用该能力，明确临时 AI 使用的维护成本、工作流的可交接/可检查/可改进价值，以及“会用 AI → 用 AI 建工作方式”的能力跃迁。该扩展不改变 Step 结构或 Completion Gate。

`PreviewIntroComparison` 当前在 `comparison` 为空时完全不渲染概念对比区。`ai-workflow-project` 已移除“单次使用 / 工作流”概念栏，因此 Step 1 当前只显示场景、两种做法、takeaway 和 `bottomDetails` 价值说明；其他 Preview 若提供 comparison 仍按原规则显示。

`prompt-foundations` 当前也使用 `comparisonPlacement=BOTTOM`：Step 1 主区只显示“只说一句要求 / 把关键条件说出来”，takeaway 之后才以轻量 knowledge-depth 样式解释“模糊 = AI 还要猜 / 清楚 = AI 知道怎么做”。Prompt Preview 单独启用 `previewReviewCardFill`：REVIEW 卡片仍保持同排等高，但“正确理解”区域会自动填满剩余高度；其他课程沿用原有通用 Review 布局。

统一 Lesson Shell 底部导航不再重复具体 Step 标题，而是按 Step Kind 显示固定四字教学标签：EXPLAIN=建立直觉、EXAMPLE=讲透方法、CHECK=检查理解、PRACTICE=动手实操、REVIEW=复盘框架、CAPABILITY=能力获得。具体课程 Step 标题在正文中保持不变。

底部导航当前采用三列稳定布局：左侧“上一步”和右侧“下一步”恢复原有 `.btn` 自然尺寸；中间固定显示四字教学标签 + 当前页码，并保持视觉居中；“还是不懂”作为辅助操作，不参与中间定位。手机端（≤640px）第一行固定为“上一步｜阶段+页码｜下一步”，第二行单独居中显示“还是不懂”，避免右侧辅助操作破坏中间对齐。

`LEARNING-UX-FINAL-001` 已将当前课程体验冻结为 `Unified Lesson Shell v1 / FROZEN_V1`。代码契约位于 `lib/learning/unified-lesson-shell.ts`，规范位于 `docs/learning/UNIFIED_LESSON_SHELL_V1.md`，并由 `npm run learning:shell:accept` 防止六步顺序/标签、三题 Mastery、slug Renderer 分支、Preview 边界和移动端导航发生无意漂移。普通课程内容任务不得顺手改变 Shell；结构变化必须另开明确 UX / Runtime 任务。

`COURSE-SIDEBAR-UX-001` 已冻结课程页左侧目录为唯一 `LessonCourseSidebar`：学习阶段默认展开；各阶段可独立折叠并允许同时展开；折叠状态只保存到当前会话 `sessionStorage`；当前课程所属阶段始终强制展开；阶段标题持续显示“已完成 / 总课时”摘要。该交互不新增服务端请求，不允许新增第二套 Sidebar、slug-specific Sidebar 或以旧静态目录替代。验收命令：`npm run learning:sidebar-ux:check`。

`CURRICULUM-001` 已将正式课程主线锁定为：AI 基础认知 → AI 工作应用 → AI 推广运营与业务增长 → AI Workflow 与自动化 → FDE / AI 解决方案落地。Track 01 当前唯一目录 owner 为 `docs/learning/TRACK01_CATALOG_METADATA_V2.md`，冻结基线为 T1-01～T1-20 / 6 Phases；旧 7 Stage / 28 Lesson F-ID 目录已删除，不再作为当前课程输入。完整目录与内容生产批次继续分离；每个核心概念只设一个 Primary Knowledge Home。

早期 Foundation F-ID、7 Stage / 28 Lesson candidate map、Beginner Reframe、Stage 1/2 Trial、v0.2 production provenance 与旧 Preview 只属于已完成的历史演进，相关重复文档已清理。当前 Track 01 身份、顺序、Phase、Primary Knowledge Home 与 prerequisite 只以 `TRACK01_CATALOG_METADATA_V2.md` 为准；为什么 28 candidates 收敛为 20 课的唯一保留审计依据为 `TRACK01_28_CANDIDATE_SIX_STEP_AUDIT_V1.md`。当前课程规则只从 `COURSE_BUILD_START_HERE.md` → Course Production Workflow → current owners / Rule Sources / Context 恢复，不从旧 task-result 或旧 F-ID 文档恢复。

Track 01 当前 T1-01～T1-20 已全部完成正式课程生产、Human Review、LessonSpec Registry、Runtime Provisioning 与 Runtime Acceptance，并全部进入 AVAILABLE。T1-11～T1-20 的早期 Workflow Batch / Human Review Gate 状态只属于当时阶段，不再是当前状态。现有 Unified Lesson Shell 为冻结前端边界；后续 Track 02～05 与未来板块课程默认复用，不因课程内容新增 UI 或调整 CSS。

Track 02 当前课程上下文唯一 owner 为 docs/learning/TRACK02_CATALOG_CONTEXT_V1.md；目录状态为 DIRECTORY_APPROVED_V1。T2-01～T2-09 当前均为 AVAILABLE / FORMAL_RUNTIME / RUNTIME_ACCEPTANCE_PASS，`ai-work` 正式课程包含 9 节。Batch A/B/C 均已完成 Course Production Workflow、Deterministic Validation、Human Review、LessonSpec Registration、Runtime Provisioning 与 Runtime Acceptance。数据库中 T2-01～T2-09 均为 PUBLISHED，每课 3 道 required Check + 1 个 required STRUCTURED_TEXT_V1 Practice。T2-10～T2-15 仍未注册 LessonSpec、未 Provision Runtime、保持 COMING_SOON。

Track 02 当前状态：T2-01～T2-09 为 AVAILABLE / FORMAL_RUNTIME / RUNTIME_ACCEPTANCE_PASS；T2-10～T2-15 为 PREVIEW_READY / DETERMINISTIC_PASS / HUMAN_REVIEW_PENDING，尚未注册 LessonSpec、未 Provision Runtime、未 AVAILABLE。Batch D 当前 deterministic validators 已阻止 Step 1/2 自动互相派生、Step 5 少于 2 张主 Review、must-retain judgments 缺失，以及 `mistakes` 自动替代 Review 说明层。具体教学规范只由 current Rule Sources + current Formal Brief 定义，本文件不再复制规则正文或历史 Batch 过程。

`TRACK02-LEARNING-PATH-ACCESS-001` 继续作为冻结交互基线：`/learning-path` 使用 `?track=foundation-ai|ai-work` 切换 T1/T2；T2 完整展示 15 节批准目录，当前 T2-01～T2-09 已切为真实 AVAILABLE Runtime，T2-10～T2-15 保持“即将开放”。Track Progress 只统计真实已开放课程。Access 与 Learning Prerequisite 分离：`ai-work` 正式访问由有效 OPC Membership 决定，T1 完成度不是会员进入 T2 的硬 Gate；未完成 T1 只生成非阻断学习建议。T2-01 上一项固定为“学习地图”；T1-20 完成后的跨 Track Continue 当前真实指向 T2-01；Sidebar 继续只显示当前 Course/Track。

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

LEARNING-RUNTIME-001-A 已完成正式 Pilot Provisioning 与真实 Runtime Acceptance：`check_memory_rag_source` 已绑定 `lesson_ai_literacy_memory_rag`，required + PUBLISHED；`practice_task_decomposition_nodes` 已绑定 `lesson_ai_workflow_task_decomposition`，required + PUBLISHED + `STRUCTURED_TEXT_V1` + passScore 80。Acceptance 确认两个 Pilot 都已 `configurationReady=true / enforcementActive=true`，且 Completion Core 会在 required Gate 未满足时阻断、通过后放行。一次性测试用户及其所有关联数据已清理。没有新增 Migration / Schema，也没有改变 Access Core。

LEARNING-UX-RUNTIME-ALIGN-001 已完成 Reference UX 对齐：`task-brief`、`memory-rag`（CONCEPT）、`task-decomposition`（PRACTICE）与 `writing-files`（APPLICATION）均进入同一 Generic Guided Lesson Shell。Core 只依据 Lesson Spec、Step Kind、Runtime configuration 与 Completion Gate 组合行为，不按课程名选择 Renderer。`writing-files` 已注册用于统一 APPLICATION UX，但仍保持 `configurationReady=false / enforcementActive=false`：required Check / Practice 尚未 provision，REAL_AI evidence = ARTIFACT 仍缺可信 Resolver；同一 Shell 会明确显示 blocker，并隐藏正式完成动作，不允许手填引用绕过 Gate。此前 `/learning-preview` 三课型演示页与旧 `InteractiveLessonPanel` 均已删除。

当前阶段边界：

```text
TRACK01-PHASE1-RUNTIME-001-B      COMPLETE_CORE_IMPLEMENTATION_ACCEPTED
TRACK01-RUNTIME-PERF-002          COMPLETE_BROWSER_ACCEPTANCE_PASS_WITH_INFRA_LIMITATION
Tencent Cloud staging            AUTH / COURSE GUARD VERIFIED
Course Builder v1.0              CURRENT COURSE PRODUCTION BASELINE
Lesson Output Contract v1        CURRENT APPROVED OUTPUT CONTRACT
T1-01～T1-20                     AVAILABLE / FORMAL_RUNTIME
Track 02 Context                 BATCH_C_AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS
Track 02 Batch B                 T2-04～T2-06 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS
Track 02 Batch C                 T2-07～T2-09 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS
RUNTIME-INFRA-PERF-003            PROPOSED / NOT_STARTED
```

当前 Course Builder Current Skill = v1.0.0，由 `skills/course-builder/index.ts` registry 解析；旧版本不作为 current input。Course Builder / Lesson Output Contract 只负责“怎样把一节课教会与输出成 Draft”；Auth / Access / Progress / Completion / Resume 继续属于 Runtime / Entitlement，不进入 Course Builder authority。未来 Web / H5 / 小程序继续复用同一 Backend/API。

2026-09-24 课程展示数据与生产规则已对齐：
- T1-01～T1-20 和 T2-01～T2-09 的正式课进度卡片从各课 `navigationDescription` 读取，不使用统一短句；T2 前三课的学习建议各自说明本课目标与准备动作，第 1 步 takeaway 下方各有两条本课说明。课程正文和已确认的 UI / CSS / 交互没有因本轮规则收敛而改变。
- `LESSON_OUTPUT_CONTRACT_V1.md` 维护跨板块输出规则；Workflow 在启动时读取最新 owner，Skill v1 按最新规则生成，LessonSpec 和正式 Registry 校验两行卡片、一句话学习建议；T2 Draft Validator 额外校验第 1 步底部说明。第 3～5 板块沿用相同 Workflow，仅替换当前板块 Context，尚未生产对应新课程。

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

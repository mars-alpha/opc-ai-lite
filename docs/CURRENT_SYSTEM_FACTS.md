# CURRENT_SYSTEM_FACTS.md — OPC AI 当前系统事实

> 业务代码验证基线：`main@605d231`
>
> 本文件只记录当前事实。历史过程看 `docs/task-results/*`，未来规划看 `TASKS.md`。

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

本次全仓事实审计：

```text
npm run typecheck  PASS
npm run build      PASS
Next production build: 30 static pages generated
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
0007 → Knowledge Provenance / Multi-source Content Links
0008 → Knowledge Deep Resource / Feishu Bridge
0009 → Knowledge → Practice Draft Workflow
```

当前远程数据库状态：

```text
DATABASE_TARGET = REMOTE
Drizzle migration rows = 10
0000 → 0009 已全部应用
0006 Course Candidate source-aware schema   VERIFIED
0007 Knowledge Source Links                 VERIFIED
0008 Knowledge Deep Resources               VERIFIED
0009 Practice Drafts                        VERIFIED
```

RUNTIME-001 已完成真实远程 Runtime smoke：

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

正式 Lesson 优先从 PostgreSQL 读取；DB 读取失败或内容非法时仍存在静态课程 fallback。

LEARNING-UX-001 已实现 1 个真实 Guided Learning 样板：`chatgpt-worker / task-brief`。该 Lesson 不再使用长页阅读作为主要体验，而是复用现有 Lesson Check / Practice / RULE Evaluation / Completion Gate，拆成 6 步“理解 → 案例 → 检查 → 实操 → 反馈复习 → 能力总结”。LEARNING-UX-001-C 当前验收版保留课程侧栏、当前课位置、完成进度和后续课程可见性，主内容区按单 Step 推进；Step 切换保持当前位置；“还是不懂”只给当前 Step 明确提示；选择题不会在作答前泄露答案；实操支持查看参考、一键带入、恢复自己的版本；真实 AI 操作结果可记录。课程完成后先展示能力成长，第 6 步不放公众号 / 会员 CTA，仅提供“学习路径”；可选课程反馈移动到上一课 / 下一课导航之后。学习路径页新增免费 / 公众号 / 会员权益说明。上述行为继续复用 learning_events / learning_feedback，不新增 Schema。其他 Lesson 尚未迁移。

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

当前真实用户 Access 已实现：

```text
AI Daily Top3                  FREE
AI Daily 全部                  Official Account Follow OR OPC_MEMBER
Knowledge 正文                 MEMBER
Feishu Deep Resource           MEMBER
Latest Practice 卡片           PUBLIC VISIBLE
Latest Practice 详情 / 正式实操 MEMBER
由进阶内容进入的正式课程入口     MEMBER
```

公众号关注不等价于 Membership；关注权益只额外解锁完整 AI Daily。普通 Learning Path / Course 的既有访问规则未被全局改成会员制。

公开 Latest Practice Reader 只读取卡片 / Preview 安全字段；Knowledge body、Deep Resource URL、Practice / Course 关联只在 MEMBER Access 通过后读取，避免 Next RSC payload 泄露会员数据。

ACCESS-UX-001 已固定转化原则：受限内容保持可发现，Access 仍受控。AI Daily 第 4 条及之后继续展示公开标题 / 摘要并标记锁定，Follow / Membership CTA 明确；Knowledge / Latest Practice 等会员内容显示公开摘要与会员 CTA，但不读取受限正文或链接。

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

Course Builder BUILD 当前新增教学治理契约：`grounding.status=REVIEWED`，来源只能是 `APPROVED_KNOWLEDGE` 或 `RESEARCH_PACKET`；`pedagogy.languagePolicy=TERM_READABILITY`，术语以行业常用和易懂为先，常见专有名词可保留英文或缩写并在首次出现时补充中文说明；通用课程必须 `aiToolNeutral=true`；同时必须提供 `pedagogy.participation`。该 participation 是教学参与层，不自动成为 Completion Gate。Course Builder 本身仍不具备网络爬取能力；正式流程应先由独立研究/知识流程产出经审核资料包，再交给 Course Builder 生成课程。

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

下一阶段候选：

```text
COURSE-BUILDER-SKILL-001 — OPC Course Builder Skill v0.1
```

统一 Reference UX 已覆盖 CONCEPT / PRACTICE / APPLICATION 三类验证样本。下一步进入 `COURSE-BUILDER-SKILL-001`：基于已稳定的 Lesson Spec + Generic Runtime + Unified Lesson Shell 生成受控 Structured Draft / Improvement Proposal；Skill 不得直接 Publish、改 Access、改 Progress 或绕过 Runtime blocker。`writing-files` 的 ARTIFACT Resolver 仍是独立 Runtime 缺口，不因 UX 对齐完成而视为已解决。

AI-DAILY-001 保持排队，不在本阶段扩展。

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

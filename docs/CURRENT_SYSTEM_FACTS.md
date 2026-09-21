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

`prompt-foundations` 当前也使用 `comparisonPlacement=BOTTOM`：Step 1 主区只显示“只说一句要求 / 把关键条件说出来”，takeaway 之后才以轻量 knowledge-depth 样式解释“模糊 = AI 还要猜 / 清楚 = AI 知道怎么做”。Prompt Preview 单独启用 `previewReviewCardFill`：REVIEW 卡片仍保持同排等高，但“正确理解”区域会自动填满剩余高度；其他课程沿用原有通用 Review 布局。

统一 Lesson Shell 底部导航不再重复具体 Step 标题，而是按 Step Kind 显示固定四字教学标签：EXPLAIN=建立直觉、EXAMPLE=讲透方法、CHECK=检查理解、PRACTICE=动手实操、REVIEW=复盘框架、CAPABILITY=能力获得。具体课程 Step 标题在正文中保持不变。

底部导航当前采用三列稳定布局：左侧“上一步”和右侧“下一步”恢复原有 `.btn` 自然尺寸；中间固定显示四字教学标签 + 当前页码，并保持视觉居中；“还是不懂”作为辅助操作，不参与中间定位。手机端（≤640px）第一行固定为“上一步｜阶段+页码｜下一步”，第二行单独居中显示“还是不懂”，避免右侧辅助操作破坏中间对齐。

`LEARNING-UX-FINAL-001` 已将当前课程体验冻结为 `Unified Lesson Shell v1 / FROZEN_V1`。代码契约位于 `lib/learning/unified-lesson-shell.ts`，规范位于 `docs/learning/UNIFIED_LESSON_SHELL_V1.md`，并由 `npm run learning:shell:accept` 防止六步顺序/标签、三题 Mastery、slug Renderer 分支、Preview 边界和移动端导航发生无意漂移。普通课程内容任务不得顺手改变 Shell；结构变化必须另开明确 UX / Runtime 任务。

`CURRICULUM-001` 已将正式课程主线锁定为：AI 基础认知 → AI 工作应用 → AI 推广运营与业务增长 → AI Workflow 与自动化 → FDE / AI 解决方案落地。AI 基础认知内部按 7 个学习阶段组织：认识 AI、模型工作方式、AI 沟通、记忆与知识、外部能力连接、复用与执行方式、现代 AI 能力与边界。完整目录与内容生产批次明确分离；3–5 节只代表单次 Production Batch，不代表基础知识范围。每个核心概念只设一个 Primary Knowledge Home，后续课程只应用或深化，禁止从定义开始重复教学。当前 `lib/courses.ts` 与 Course Builder acceptance fixtures 仍不是正式 Curriculum Source of Truth。

`CURRICULUM-002` 的产品级课程基线仍是 28 个 AI 基础认知 Lesson candidates。仓库中后来额外保留的 4 个测试/冗余课程资产不属于正式 Curriculum，不得因为代码或文档中仍可见就纳入课程数量。该旧 Map 继续保留 Primary Knowledge Home、前置依赖、Lesson Type、Planning Gate、Grounding freshness、Anti-overlap 与资产迁移记录，并作为 pre-audit candidate map 使用。工程实现类内容继续属于 Advanced Technical Track。

`CURRICULUM-003` 的 `docs/learning/FOUNDATION_BATCH_A_BRIEFS_V1.md` 属于 pre-reframe 旧 F1-01～F1-04 Brief，当前状态为 `RETIRED_FAILED_REFERENCE`，仅保留历史证据，不再作为当前 Course Builder 输入。当前 Stage 1 以 Beginner Reframe / current fixtures 为准；Stage 2 正式 Brief 为 `docs/learning/FOUNDATION_STAGE2_BRIEFS_V1.md`。

`docs/learning/FOUNDATION_CATALOG_METADATA_V1.md` 当前仍定义完整 7 Stage / 28 Lesson。F1-01～F1-04 为 `IN_PRODUCTION + COMING_SOON` 且 Human Review PASS / Runtime Pending；F2-01～F2-04 已进入 `IN_PRODUCTION + COMING_SOON` 并等待 Human Review；F3-01～F7-06 共 20 节保持 `PLANNED + COMING_SOON`。当前没有 Foundation Lesson 标记 AVAILABLE。

`LEARNING-CATALOG-001` 已将正式 Foundation Catalog 接入 `/learning-path`。该页面通过 `lib/learning/foundation-catalog.ts` 的 typed planning bridge 渲染 7 Stage / 28 Lesson，不再使用 `lib/courses.ts` 作为正式目录来源。F1-01～F1-04 显示“准备中 / 即将开放”，其余 24 节显示“规划中 / 即将开放”；所有 COMING_SOON Lesson 均为非链接展示，当前没有 Foundation Lesson 可进入正式 Runtime。页面旧“六阶段 / 当前开放 3 阶段 / fallback StageProgress”已移除并对齐五大长期课程主线。

`LEARNING-CATALOG-001-A` 已将五大长期学习板块移动到 Foundation 目录上方作为一级课程导航；当前板块为 AI 基础认知，其余板块保持后续开放。Foundation 主区在桌面端采用左侧圆环进度 + 右侧 7 Stage / 28 Lesson 目录，移动端改为上下堆叠。进度只统计 availability=AVAILABLE 且已绑定正式 runtimeCourseSlug/runtimeLessonId 的课时，并读取 ProgressProvider 完成状态；PLANNED / BRIEF_READY / COMING_SOON 不进入分母。当前没有 AVAILABLE Foundation Lesson，因此显示 0%，不会用旧课程数据制造假进度。

`COURSE-PRODUCTION-001` 已完成 Foundation Batch A 四节真实 CONCEPT Draft 的技术验收：F1-01 AI/ML/Generative AI、F1-02 Model vs Product、F1-03 Training vs Inference、F1-04 Generation/Retrieval/Deterministic Logic。四节均使用统一六步、conceptMasteryBeforePractice、Three-Question Mastery，正式 Completion Gate 仅 CHECK；Step 4 只做非 Gate 参与。Preview 复用 `FoundationConceptDraftPreview` + `GenericLessonRuntimePanel`，不写正式 Progress / Completion。F1-01～F1-04 Catalog 状态现为 IN_PRODUCTION + COMING_SOON，Human Review 通过前不得 AVAILABLE。学习路径页“课程导航”已改名为“学习地图”。

`CURRICULUM-005` 已根据 Human Review 重构 Foundation 新手开场。COURSE-PRODUCTION-001 四个旧 Draft 虽技术 PASS，但教学状态改为 `PEDAGOGY_REJECTED / RETIRE_AS_FAILED_DRAFT_REFERENCE`，不得继续正式化或 AVAILABLE。Foundation 前三阶段现固定为：Stage 1“先认识 AI 怎么用” → Stage 2“学会和 AI 基本协作” → Stage 3“再理解 AI 背后的基本机制”。新前 8 节先解决 AI 能做什么、结果为什么变化、为什么会错、AI 软件能力地图、Prompt、Task Context、Iteration、基础结果检查；Model / Training-Inference / Token / Context Window 后移 Stage 3。新手课固定“示例先于定义、一节一个主问题、每节最多 1–2 个新核心术语”。

`COURSE-PRODUCTION-002` 已按 Beginner-first 规则重新生产新 F1-01～F1-04：`beginner-ai-use-cases`、`beginner-ai-result-quality`、`beginner-ai-can-be-wrong`、`beginner-ai-product-map`。前两节为 APPLICATION，正式 Gate 为 CHECK + PRACTICE；后两节为 CONCEPT，正式 Gate 为 CHECK，Step 4 仅做非 Gate 轻量参与。四节均通过 Beginner Batch 专项验收、Course Builder Contract、Unified Lesson Shell、typecheck 与 build。Catalog 状态现为 IN_PRODUCTION + COMING_SOON；Human Review 通过前不得 AVAILABLE。旧 COURSE-PRODUCTION-001 四个失败 Draft 继续保留为历史参考，不再作为当前生产候选。

COURSE-PRODUCTION-002-A 已恢复 Beginner Batch A 之前丢失的教学体验增强层，但未改变 Beginner-first 内容方向。四节 Preview 现通过 Generic Lesson Runtime 的既有数据接口恢复 Step 1 bottomDetails、Step 2 / Step 5 previewKnowledgeDepth 与 previewReviewCardFill；F1-01 / F1-02 增加 previewReferenceFill 一键填充参考答案，F1-02 恢复 COPY_TO_AI 真实软件对比体验。所有增强均为数据驱动，未修改 Unified Lesson Shell、未按 lesson slug 分支，也未重新引入 Training / Inference / Token / API / Tool / MCP / Agent 等后置理论。

`COURSE-UX-QUALITY-001` 已将 Beginner Batch A 四节课固化为后续 Beginner Lesson 的质量样板，并新增 `docs/learning/BEGINNER_LESSON_QUALITY_STANDARD_V1.md`。Cognitive Load Budget 固定为：一节 1 个主问题、1 个主概念/判断、最多 1–2 个新核心术语、1 个主要案例、Step 1 bottomDetails 最多 2 条、Step 2 example depth 最多 2 条、主 Review 最多 3 条、review depth 最多 2 条。Stage 1 新增整课用户可见术语泄漏检查，禁止提前出现 Training / Inference / Token / Embedding / Vector Search / Deterministic Logic / API / Tool / MCP / Agent Runtime / RAG / Evaluation。F1-03 Review 已由 4 条收敛为 3 条，F1-04 提前出现的 API/RAG/Tool 等用户可见术语已改为自然语言。四节 Lesson ID / Type / Gate / IN_PRODUCTION + COMING_SOON 状态均未变化。

Beginner Batch A 的单课质量体验曾获得 Human Review PASS，但最新跨课 Continuity Review 发现 Stage 1 / Stage 2 之间存在知识重复、案例断裂与 Artifact 不连续。当前 F1-01～F1-04 仍保持 `IN_PRODUCTION + COMING_SOON`，但治理状态改为 **CONTINUITY_REWORK_REQUIRED / RUNTIME_PAUSED**；历史 Human Review PASS 只保留为当时的单课质量证据，不再代表当前可进入 Runtime。

`COURSE-BUILDER-SKILL-005` 已新增 `skills/course-builder/v0.2.ts`，把 Beginner Lesson Quality Standard 正式写回 Course Builder Skill。v0.1 保留用于历史兼容；后续新 Beginner BUILD 默认使用 v0.2。`CourseBuilderPedagogy` 新增可选 `qualityProfile=BEGINNER_QUALITY_V1`，包含 mainLearnerQuestion / mainConcept / allowedCoreTerms / deferredTerms。v0.2 的 BEGINNER BUILD 强制要求该 profile；Code Validation 确定性检查 allowedCoreTerms<=2、Review<=3、Example 必须有 Before/After、Capability 必须是可执行能力表达，并阻止 deferredTerms 在用户可见内容中提前泄漏。若某术语就是当前课 Primary Knowledge Home，可显式加入 allowedCoreTerms 后合法教授，因此不会用 Stage 1 禁词误杀 Stage 3 的 Token / Training 等正式主题。新增 `course-builder:accept:beginner-quality` acceptance，已验证缺 profile / Review 超预算 / deferred term 泄漏会拒绝，allowed core term 与 v0.1 legacy path 均通过。

`SKILL-GOV-001` 已固化 Skill Responsibility & Orchestration Baseline。新增 `docs/SKILL_GOVERNANCE.md` 与 `skills/REGISTRY.md`。后续任何开发任务实现前必须先归类为 `CODE_ONLY / EXISTING_SKILL / NEW_SKILL_NEEDED`；若需要新 Skill，必须先提交并讨论 Mini Skill Proposal，再实现最小 v0.1。一个 Skill 只允许一个可独立验收的职责与一个主要输出；Skill 固定为 Architecture-neutral Content / Intelligence Layer，只消费既有 Contract，不得自行修改 DB / Schema / API / Runtime / Workflow / Permission / Publish / Progress / Completion。Skill 默认不直接调用 Skill，多 Skill 联动由 Workflow 编排。当前 Registry 只登记真实存在的 `course-builder` v0.1.0 与 v0.2.0，不把未来文章整理、配图、文章转 PPT 等设想登记为已实现。

`COURSE-GOV-001` 已新增 `docs/learning/COURSE_PRODUCTION_GOVERNANCE_V1.md` 与 `COURSE_PRODUCTION_PROVENANCE_TEMPLATE.md`，锁定课程正式生产链：Curriculum / Knowledge Map → Formal Brief → Course Builder → Code Validation → Draft Preview → Human Review → Runtime Provisioning → Runtime Acceptance → AVAILABLE。现有 Catalog enum 不扩展：`curriculumStatus=PLANNED/BRIEF_READY/IN_PRODUCTION/AVAILABLE` 与 `availability=COMING_SOON/LOCKED/AVAILABLE` 继续独立；`HUMAN_REVIEW_PASS` 与 `RUNTIME_READY` 只是治理 Gate。每次 generation attempt 必须记录单一 Skill ID / Version，禁止 `course-builder v0.1 + v0.2` 复合使用；当前新 Beginner 课程默认 `course-builder@0.2.0`。Human Review FAIL 保持 canonical lesson identity，回到 IN_PRODUCTION 形成新 Draft version；Preview 不写正式 Progress/Completion；Human Review PASS 不等于 Runtime Ready，Runtime Ready 也不自动发布。

`FACT-DRIFT-AUDIT-001` 曾对齐 CURRICULUM-005 后残留的文档漂移；其“Stage 1 Human Review PASS / Runtime Pending”结论已被后续 CURRICULUM-CONTINUITY-001 / FOUNDATION-CONTINUITY-REWORK-001 supersede。历史 task-results 继续保留当时状态，不作为当前事实源。

`COURSE-PRODUCTION-003` 已完成 Foundation Stage 2 F2-01～F2-04 技术生产，技术 acceptance / Course Builder / Unified Shell / typecheck / build 均 PASS；但最新 Continuity Review 认定 Stage 1 / Stage 2 需要作为一条能力链重新设计。F2-01～F2-04 继续保持 `IN_PRODUCTION + COMING_SOON`，当前状态为 **TECHNICAL_ACCEPTANCE_PASS / CONTINUITY_REWORK_REQUIRED**，Human Review 与 Runtime 均暂停到新的 Formal Brief 完成。

`DEV-RUNTIME-FIX-001` 已修正 Windows 本地开发启动链：`npm run dev` 不再通过 `next.cmd` shim 启动，而直接调用 `node node_modules/next/dist/bin/next dev`。诊断确认项目本身与 Stage 2 四个 Preview 在 Next dev 下均可返回 HTTP 200；问题位于 npm → Windows `.cmd` 包装启动层，而非课程 Runtime / Preview 代码。

`CURRICULUM-CONTINUITY-001` 已新增 `docs/learning/FIVE_TRACK_CAPABILITY_CONTINUITY_V1.md`，将五大长期板块锁定为一条连续能力链：AI 基础认知 → AI 工作应用 → 推广运营与业务增长 → Workflow 与自动化 → FDE。课程方法层必须行业通用；OPC / 自媒体 / 内容运营→推广→获客→业务转化只作为默认 Case Thread。Formal Brief 后续必须明确 inherited capability / inherited artifact / current learner job / new capability / artifact output / next reuse / do-not-reteach / case thread。Stage 1 + Stage 2 当前进入 Continuity Rework。Course Builder v0.2 暂不升级；`course-builder@0.3.0` 仅作为候选，必须先用新的 Stage 1/2 Brief 真实验证 v0.2 后再决定。

`FOUNDATION-CONTINUITY-REWORK-001` 已新增 `docs/learning/FOUNDATION_STAGE1_STAGE2_CONTINUITY_BRIEFS_V1.md`。F1-01～F2-04 canonical lessonId / Primary Knowledge Home / Type / Gate 全部保留，但重构为同一 OPC / 自媒体 Artifact Thread：AI First Draft → Selected Better Draft → Verification Flags → Source/Capability Plan → Clear Task Brief → Context Pack → Iterated Draft → Verification Record → Verified Publishable Draft。Stage 1 负责“第一次把 AI 真正用起来 + 最低必要世界观”，Stage 2 负责“把同一个结果做到可用”。旧 `FOUNDATION_STAGE2_BRIEFS_V1.md` 已标记为 pre-continuity production evidence，不再作为新 Course Builder 输入。下一步不是立即升级 Skill，而是 `FOUNDATION-CONTINUITY-TRIAL-001`：用 `course-builder@0.2.0` 重做 3–5 个代表样本，验证 Formal Brief 是否足够保持 Continuity，再决定是否需要 v0.3。

`FOUNDATION-CONTINUITY-TRIAL-001` 已用单一 `course-builder@0.2.0` 重做 5 个独立 Trial Draft：F1-01、F1-02、F2-01、F2-02、F2-03；历史 Draft 未覆盖。Trial 明确维护 OPC / 自媒体 Case Thread 与 Artifact handoff，并新增 deterministic continuity acceptance。首次 acceptance 曾正确拦截 F1-02 主正文 Case Thread 表达变弱，修正 Draft 后未放宽规则。最终 Continuity Trial、Course Builder Contract、Beginner Quality、Unified Shell、typecheck、build 全部 PASS，build 生成 51 pages。当前证据表明 v0.2 技术上足以在 Formal Brief + controlled metadata + deterministic acceptance 下保持 Continuity，因此 `course-builder@0.3.0` / COURSE-BUILDER-SKILL-006 暂不实现；等待 5 个 Trial Preview Human Review。F1-03/F1-04/F2-04 尚未 trial rework，Runtime 继续暂停，无 Foundation Lesson AVAILABLE。

FOUNDATION-CONTINUITY-TRIAL-001-A 已完成 5 个 Trial Preview 的学习者语言修正：前台中文优先；AI 专业词首个有意义出现使用“中文（English）”；AI First Draft / Better Draft / Task Brief / Context Pack / Context-enriched Draft / Iterated Draft 等内部生产标签改为自然中文；内部 caseThread=OPC_SELF_MEDIA_AI_TOPIC 保留，但学习者正文不再反复显示 OPC / 自媒体。专项 acceptance 同时验证“内部 Case Thread 保留 + 前台 Case Neutralization + 内部英文 Artifact 不泄漏”。Course Builder v0.2、Lesson ID/Type/Gate、Runtime/Catalog 边界均未改变；当前仍等待 Human Review。

`FOUNDATION-CONTINUITY-TRIAL-001-B` 已确认并修正 Six-step Content Integrity 缺口。根因不是 Preview 偶发，而是 Trial 通过 spread 继承历史 Draft 时，`checkSequence` 未显式重建，导致 Step 3 仍显示旧课题；同时 CONCEPT 允许 `practice=null`，但旧 participation / Preview 表达不足以保证 Step 4 真正可操作。当前 5 个 Trial 的 Step 3 已全部重建为当前 Continuity 三题 Mastery；`beginner-context` Step 4 改为 MINI_TASK，并在 Preview 支持本地输入/完成。专项 acceptance 新增 `SIX_STEP_CONTENT_INTEGRITY` 与 `CONCEPT_STEP4_ACTIONABLE`，均 PASS。长期治理已固定：Six-step structure PASS 不等于 Six-step content PASS；任何 Rework 都必须逐步重新确认 Check / Practice / Participation / Review / Capability。正式 Runtime 对 CONCEPT 非 Gate Step 4 participation 尚无完整 provisioning 数据通道，因此该类课程在正式 participation Runtime 接入前不得 RUNTIME_READY。

`FOUNDATION-CONTINUITY-TRIAL-001-C` 已进一步明确 Step 4 / 5 / 6 的长期教学职责。Step 5 以 `review` 作为复盘框架主体，2–3 项按课程需要生成，每项必须是“核心结论 + 解释”；`mistakes` 降为辅助纠偏，不再主导复盘页面。Step 6 组合 `capabilityGain + selfAssessment + nextLessonValue`，明确“会做什么 / 怎么知道自己会了 / 马上能用在哪里 / 下一步为什么继续”。`beginner-context` Step 4 继续保持非 Gate MINI_TASK，但新增 Reference Answer、一键填充、复制自己的练习、复制参考答案；Preview 通用组件已支持该辅助链。专项 acceptance 新增 REVIEW_FRAMEWORK / CAPABILITY_EVIDENCE / GUIDED_SUPPORT，全部 PASS。当前判断：这些问题可用现有 Course Builder v0.2 字段解决，暂不需要升级 Skill Schema。

`FOUNDATION-CONTINUITY-TRIAL-001-D` 已将 Step 5 复盘框架预算调整为 2–4 项，按课程真实需要决定，不机械固定 3 张卡。每张 Review 卡仍必须包含“核心结论 + 怎么理解”。`容易踩的坑` 从压缩的一行文字改为独立白色卡片逐条排列，每项同时展示误区与正确理解。Beginner Quality 新增 Every-step Clarity Gate：六步分别必须讲清“为什么学 / 核心规律 / 会不会判断 / 能不能做 / 以后记住什么 / 现在真正会什么”，不能只完成版式或交互。专项 acceptance 新增 `STEP_FOCUS`，当前 5 个 Trial 全部 PASS。Course Builder v0.2 Schema 仍无需升级。

`FOUNDATION-CONTINUITY-TRIAL-001-E` 已统一多条指导信息的编号可读性：Step 4 多条 Hint 改为完整白色编号块 `1 / 2 / 3…`；Step 5 “容易踩的坑”白色卡片同样按 `1 / 2 / 3…` 排列，并移除每项重复“注意”标签。Beginner Lesson Quality Standard 已固定：并列指导信息在顺序有助理解时优先使用编号整框，不压缩成连续段落、不重复相同标签。所有回归、typecheck、build PASS，仍为 51 pages。

`COURSE-GOV-SIX-STEP-001` 已把当前六步教学方式从 Foundation Trial 经验升级为所有新正式课程的强制生产规则。五大板块、所有 Lesson Type、后续进阶图文/代码/实验/项目课均必须使用 EXPLAIN → EXAMPLE → CHECK → PRACTICE → REVIEW → CAPABILITY。每一个正式 Primary Knowledge Point 在进入 Course Builder 前必须先通过 Six-step Knowledge Point Gate；如果无法自然完成六步，不允许为了填 Shell 强行生成，而必须回到 Curriculum / Formal Brief 判断合并、拆分或降为 Supporting Knowledge。Lesson Type 只改变 Step 4 深度与 Completion Gate，不改变六步。后续课程同时受两条强制轴控制：Six-step 保证单课真正教会，Continuity 保证前后课程真正承接。

`CURRICULUM-SIX-STEP-AUDIT-001-R1` 已按产品负责人确认的 28 个正式 AI 基础认知候选逐项完成 Six-step re-audit。明确排除 `task-brief`、`memory-rag`、`writing-files`、`task-decomposition` 四个历史 Runtime/UX 测试资产。Track 01 canonical audit 为 `docs/learning/TRACK01_28_CANDIDATE_SIX_STEP_AUDIT_V1.md`，最终目录为 20 节：KEEP 20、MERGE 6、SUPPORTING_KNOWLEDGE 1、DEFER 1、REMOVE 0。旧 17 节方案被 supersede，原因是过度合并了 Knowledge Base / Source of Truth、Structured Output / Schema、Coding / Browser / Computer Use 三项可独立形成六步能力闭环的知识。

`CURRICULUM-AUDIT-REALIGN-001-R1` 已完成 Track 01 canonical realignment。T1-01～T1-20 现在是新课程生产唯一允许的 Track 01 identity；旧 F1/F2/F3…只作为 historical alias。新增 `TRACK01_CANONICAL_REALIGNMENT_V1.md`、`TRACK01_CATALOG_METADATA_V2.md` 与 `TRACK01_BATCH_A_T1_01_T1_05_FORMAL_BRIEFS_V1.md`。T1-01～T1-05 = BRIEF_READY + COMING_SOON；T1-06～T1-20 = PLANNED + COMING_SOON。旧 `FOUNDATION_CATALOG_METADATA_V1.md` 与 `FOUNDATION_STAGE1_STAGE2_CONTINUITY_BRIEFS_V1.md` 已降级为 legacy / historical evidence。当前前端 typed catalog bridge 仍可能显示旧 F metadata；这是已知 implementation drift，本任务没有修改 UI/runtime/schema/code。

`TRACK01-BATCH-A-BRIEF-REVIEW-001` 已完成 T1-01～T1-05 Formal Brief targeted Human Review revision，Brief-level Human Review PASS。固定 Prompt = AI 要做什么 / Task Instruction，Context = AI 完成任务需要知道什么 / Task Information；T1-03 不教授 Source of Truth。五课 Step 4 均已明确 learner action + retained output。T1-05 现在包含最低 Task-fit Evaluation + Reliability Verification：先对照 Clear Task Brief 判断任务是否完成，再按事实性、时效性、可验证性、错误后果决定核验强度；Hallucination 只作为原因解释。T1-05 不教授 HITL / Permissions / Approval / Core Authority（T1-20），也不教授 Evaluation Engineering（Track 04）。

Course Builder BUILD 的 `pedagogy` 当前还必须包含 `conceptMasteryBeforePractice=true`。四种 Lesson Type 均固定以前 3 步完成概念理解：EXPLAIN 讲清“是什么 / 为什么重要 / 解决什么问题”，EXAMPLE 展开方法 / 边界 / 易混淆点 / 常见错误，CHECK 验证是否真正理解；PRACTICE 原则上不得首次引入新的核心概念。

`CourseBuilderCheck` 当前支持 `SINGLE_CHOICE | TRUE_FALSE | MULTI_SELECT`。旧 Draft 未提供 `questionType` 时默认 SINGLE_CHOICE，旧 `correctValue` 会归一为 `correctValues`。MULTI_SELECT 使用答案集合完全一致的确定性判分。旧 `check` 单题仍兼容；新课程默认使用 `checkSequence` 三题理解闭环。Sequence 固定顺序为 SINGLE_CHOICE / BEST_JUDGMENT → TRUE_FALSE / MISCONCEPTION → MULTI_SELECT / BOUNDARY_CONDITIONS，每题必须显式提供不同的 `correctFeedback` / `incorrectFeedback`，三题问题不得完全相同。`courseBuilderCheckSequenceToRuntimeSeeds()` 可将三题按 order=0/1/2、required=true 转成正式 Runtime seeds。

正式学习 Runtime 代码支持三种题型和三题 Sequence。`lesson_checks` 继续以多行 + `order` 表达题组，不新增题组表。Answer API 接受 `answer` 或 `answers`；单选/判断只允许一个答案，多选去重后精确集合判分。Interactive API 在答题前只返回题型、题目、选项和已有作答状态，不返回正确答案；答题后返回对应解释。Generic Lesson Runtime 一次只显示一题：答错显示错误反馈并要求重新选择，答对后才允许下一题；三题全部答对才满足 Sequence CHECK Gate。Legacy 单题仍保持“该题答对才通过”。

本地 migrations `drizzle/0010_famous_blockbuster.sql` 与 `drizzle/0011_milky_sharon_carter.sql` 已生成。0010 增加 TRUE_FALSE / MULTI_SELECT 与 `correct_answers / answers`；0011 增加 `lesson_checks.incorrect_explanation`。**均未执行远程 migration**。当前远程 DB 仍为 0009，正式环境启用三题 Mastery 前必须按顺序授权执行 0010、0011。

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

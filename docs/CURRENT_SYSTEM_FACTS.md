# CURRENT_SYSTEM_FACTS.md — OPC AI 当前系统事实

> 本文件只记录“现在真实存在什么”。历史过程只通过 Git 追溯；未来计划只放 TASKS / DEVELOPMENT_ROADMAP。

## 1. 当前产品阶段

- 正式学习路径已完成并冻结：Track 01～05 共 81 节正式课程。
- 当前课程目录、六步课程壳层、正式 Runtime 与学习路径展示均作为已确认基线。
- 当前开发重点转向统一内容后台、AI 日报、进阶练习、移动端以及后续多端接入。
- 正式域名：`https://opcai.fun`。
- 当前生产服务器：`1.14.180.16`。
- 生产链路：Nginx → PM2 `opc-ai` → Next.js:3000。
- HTTP 已跳转 HTTPS；Let’s Encrypt 自动续期已配置。
- 当前生产应用代码基线：`0b5f0b0`；部署事实治理提交：`4a8155d`。

## 2. 技术基线

```text
Frontend / Web        Next.js 15 App Router
Runtime               Node.js 20
Database              PostgreSQL + Drizzle
DB target             TencentDB for PostgreSQL (Supabase target blocked)
Process manager       PM2
Reverse proxy         Nginx
Production OS         Ubuntu 22.04
Production server     Tencent Cloud 2C2G / 40G
```

正式应用入口是 `app/*`。根目录早期静态 HTML/CSS/JS 原型不属于正式 Runtime，并已退出 current tree。

## 3. 学习平台事实

```text
Track 01  AI Foundation   20 lessons   AVAILABLE / FORMAL_RUNTIME
Track 02  AI Work         15 lessons   AVAILABLE / FORMAL_RUNTIME
Track 03  AI Growth       15 lessons   AVAILABLE / FORMAL_RUNTIME
Track 04  AI Workflow     15 lessons   AVAILABLE / FORMAL_RUNTIME
Track 05  FDE             16 lessons   AVAILABLE / FORMAL_RUNTIME
Total                     81 lessons
```

正式课程：
- 共用 Unified Lesson Shell；
- 统一六步；
- 正式 LessonSpec Registry；
- Check / Practice 由服务端拥有最终状态权威；
- Completion / Rating / Resume 已接入正式 Runtime；
- 未登录进入课程需要登录；
- 课程是否可进入由统一 Access / Entitlement 判断。

课程目录结构与六步 Runtime 继续冻结；课程正文采用正式版本受控更新。所有正文修改必须从 `/admin/courses` 发起 Candidate，经 Human Review 后发布为新正式版本，不能直接覆盖当前正式版本。

## 4. 课程生产 current owners

唯一入口：
`docs/learning/COURSE_BUILD_START_HERE.md`

规范 owners：
- `docs/learning/COURSE_BUILD_STANDARD_V1.md`
- `docs/learning/COURSE_PRODUCTION_WORKFLOW_V1.md`
- `docs/learning/UNIFIED_LESSON_SHELL_V1.md`
- `docs/learning/FORMAL_CURRICULUM_V1.md`
- `docs/learning/FIVE_TRACK_CAPABILITY_CONTINUITY_V1.md`
- `docs/learning/TRACK_CONTEXTS_V1.md`
- `skills/course-builder/index.ts`
- `lib/learning/course-production-contract.ts`
- `lib/learning/course-content/*`：81 节正式课程的冻结生产内容源；不是规则 owner，只有具体课程实现/Runtime 问题才读取。

已完成的 Formal Brief、Batch Human Review、一次性 provisioning / acceptance 不属于 current owner。

## 5. Current Course Production Snapshot

```text
Course Builder Skill      course-builder@1.0.0
Workflow                  STABLE_WORKFLOW_V1
Unified Lesson Shell      FROZEN / PASS
Formal Registry           ACTIVE
Track 01～05              ALL AVAILABLE
Learning Path             FROZEN
Course content            VERSIONED / CONTROLLED UPDATE
Next course gate          NONE — reopen only by explicit product decision
```

## 6. 当前产品入口

### PC Web
当前主要入口：
- 首页
- 学习路径
- AI 日报
- 进阶练习
- 登录 / Access

PC 当前已确认版式视为冻结基线。

### Mobile
尚未进入正式实现。已确认未来 Mobile 只重点承载：
- 学习：基础课程、AI 热点能力练习、实操项目；
- AI 日报。

Mobile 与未来微信/抖音小程序共享同一业务后台、用户、课程、进度、权限、日报与练习数据，不复制业务事实。

## 7. 用户工作台 / 管理后台当前事实

### 用户工作台

个人 AI 工作台是未来独立会员产品，不属于 OPC AI 前台或 `/admin`；当前状态为 PLANNED，不暴露正式 `/workspace` 页面。用户只使用任务、素材、Studio、自动化、产物、连接和个人设置，不看到平台 Registry、Provider、数据库、审计或管理员配置。用户素材与 AI 产物第一阶段默认保存在浏览器 IndexedDB，可导出；平台不长期保存普通用户媒体。

### 管理后台

`/admin` 当前正式导航：
- 平台：运营总览、内容采集、课程维护、学习洞察；
- 用户：用户与权益。

AI 能力配置与系统域仅保留产品边界，底层能力未完成前不暴露正式页面或导航。兼容路由 `/admin/platform`、`/admin/memberships` 只做重定向。

`/admin/content` 对外统一称“内容采集”，固定三个视图：**采集策略 / 今日情报 / 内容工作台**。
- 采集策略 owner：`AdminCollectionStrategyPanel`；Strategy 与 Source Registry 分离。当前可真实执行的 Collector 为 RSS / HTTP / Manual URL / HN Algolia / GitHub Search；RSSHub、Creator / Comment、MediaCrawler 类能力仍是扩展位。
- Collector 固定 `REFERENCE_ONLY`，只返回引用、文本、指标与 metadata，不拥有长期保存媒体的权限。
- Raw Item 有 URL 时按 canonical URL 全局去重，Observation 保存多 Source / Platform 发现事实。
- Event Seed / Expansion / Cluster / Signal 由确定性 Core 运行；复杂分数只用于排序与审计，不作为普通管理员主界面。
- 今日情报由 Human 执行 ADOPT / WATCH / IGNORE；Discovery 不直接写 Content。
- ADOPT 由 `lib/server/content/adoption.ts` 幂等建立 Content DRAFT、关联 Evidence，并进入 `AdminContentStudioWorkspace`。
- Content Brief Enrichment 是 ADOPT 后的可选 AI 能力，只补核心观点 / 受众 / 目的 / 标签；AI 不拥有 Event Decision、Content 状态或发布权，未配置模型时 Core 流程仍可运行。
- 内容工作台唯一 UI owner 为 `AdminContentStudioWorkspace`；旧 AdminContentConsole / Lifecycle / Knowledge Routing 展示层已退出 current tree。
- 审核状态固定为 DRAFT → REVIEW → PUBLISHED；没有实际结果不得审核通过。

`/admin/courses` 以 `learningTracks` + `formalLessonSpecs` 作为 Track 01～05 共 81 节正式课程的身份源，并使用 Development DB 持久化课程更新 Candidate 与正式版本历史。当前链路为 `DRAFT → REVIEW → 审核通过并上线 → PUBLISHED`；审核与发布是一次 Human 决策，没有中间 `APPROVED` 确认步骤。Candidate 支持刷新恢复、差异对比、最近 6 个正式版本、上一版本对照与恢复历史版本；编辑动作固定为“对比当前 / 保存草稿 / 退出修改 / 提交审核”，“退出修改”结束当前 Candidate 且不影响正式课程；正式发布使用事务并做基础版本冲突保护。发布后课程正文 Runtime、课程目录 · 导航卡片（标题 / 副标题）和最近更新时间读取最新正式 snapshot。旧 `AdminCourseEditor`、`listAdminCourseTree` 与 `/api/admin/lessons/[lessonId]` GET/PUT 直接编辑链已退出 current path。Course Builder Workflow 未接入也未修改；新增/删减课程未实现。

Formal Learning Identity 已收敛为共享 owner `lib/server/learning/formal-identity.ts`：81 节 Formal LessonSpec 均可解析到现有正式课程源并生成确定性的 stage / module / lesson ID。Development DB 已执行可重跑 provision 并验收 81/81。这里的 DB 记录是 Runtime Materialization，不取代 Code/Formal Registry 的课程基线事实源；使用 `onConflictDoNothing`，不会覆盖已有课程版本。Identity provision 只建立 stage / module / lesson materialization，不批量生成 Check / Practice，因此不会伪造学习交互数据；Check / Practice 仍只在真实正式内容已经 provision 时参与行为洞察。

课程维护可编辑 snapshot 已从 T1-01 特例收敛为共享 owner `lib/server/admin/course-snapshot.ts`。Track 01～05 共 81 节均直接复用已有正式 CourseBuilder Draft + Runtime Presentation 解析为同一 `AdminCourseSnapshot`，保留正式 Check ID、Practice ID、六步 metadata、讲解与复盘内容；不调用 Course Builder Workflow，也不重新生成课程内容。`Admin Course Registry` 已校验 81/81 均有六步可编辑 snapshot。

学习洞察已接通 `Insight / Knowledge Proposal → Human 发起课程更新 → Course Maintenance DRAFT Candidate`。批准动作必须先成功创建课程维护 DRAFT，再把来源 Proposal 记为已处理；Candidate 保存 `sourceContext` 追踪来源，前端把课程 key 交给 `/admin/courses` 并直接进入对应草稿。洞察层不得直接提交审核或发布。若同一课程已有 DRAFT / REVIEW，Bridge 返回冲突并保留原 Proposal 待处理，不把不同问题静默合并进已有 Candidate。该闭环已有可重跑 validator 与 Development DB acceptance，测试记录自动清理。

学习洞察 V2 current owners 固定为 `docs/learning-insight/` 下四份契约：`LEARNING_INSIGHT_WORKBENCH_V2_PRODUCT_CONTRACT.md`、`LEARNING_INSIGHT_AI_PROMPT_CONTRACT.md`、`LEARNING_INSIGHT_STRUCTURED_OUTPUT_CONTRACT.md`、`LEARNING_INSIGHT_DETERMINISTIC_VALIDATOR_CONTRACT.md`。Repository Governance 只允许这四份 current owner。

V2 的职责边界固定为：机械代码负责采集、聚合、阈值、去重、课程定位、状态和 Validator；Human 拥有三次 Gate；AI 只做 Task A“诊断问题 + 列课程”和 Task B“针对 Human 批准的单一课程生成文本替换 Patch”。Task A / Task B 均使用固定 Prompt 与纯 JSON Schema，所有 evidence_ref / course_id / path / current_value 必须通过确定性校验；AI 不直接拥有 Learning Issue 状态、不直接写正式课程、不直接提交审核或发布。

Learning Insight 数据边界已增加 Source Matrix：当前确定性自动聚合只包括 Step 3 Check 异常、Step 4 Practice 困难、提示使用率高和帮助度低；`still_confused` 当前属于“已有事件采集但尚未形成聚合规则”。内容疑似错误 / 内容待更新核查当前没有统一自动入口，必须来自管理员、知识更新、内容采集或可信来源 Evidence，不能由学员反馈直接生成，也不能由 AI 凭模型常识自行声明。Task A 输入已收敛为课程级 `course_issue_bundle + course_issue_timeline + data_availability`，必须一次分析当前课程累计问题；缺失数据明确 unavailable，不允许补造。

Learning Insight Workbench 已按 V2.1「学习洞察」重构 Phase 1：左侧为课程健康队列，一行只代表一门课程；右侧为主工作区，按“课程抬头 → 01 问题汇总 → 02 真实数据 → 03 课程处理”组织，不再把原始 Issue 时间线作为主要运营视图。01 问题汇总现在只做课程级统计，不可点击、不保存问题选中状态，也不再驱动 02。02 固定读取当前课程级真实数据，只提供“学习反馈 / 学习行为”两个互斥视图按钮；学习反馈默认前 5 条，可查看全部；学习行为固定展示 6 个稳定指标，由 lessonProgress、lessonCheckResponses、practiceSubmissions 与 real_ai_evidence_recorded 确定性聚合。内容治理项只保留在 01 统计中，学员影响显示 unavailable / —，不再通过点击切换 02。顶部四阶段流程条继续沿用已批准的“系统发现 → 人工确认 → AI 诊断 → 课程维护”四卡结构。课程健康队列当前只保留“搜索课程 + 风险筛选”两项：搜索用于快速定位课程；风险筛选为全部风险 / 需要检查 / 关注 / 正常。问题类型和排序控件退出当前 V2.1，默认排序继续由确定性 Core 固定执行。前端已进一步拆分为 Queue / Course Header / Issue Summary / Evidence Panel / Course Decision / View Model，主 Workbench 只负责筛选、选择与课程级 Human Gate 1 状态协调；双栏视觉采用左窄右宽，右侧优先承载阅读与判断。

当前 Course Health Core 使用现有真实数据生成：累计反馈数、累计问题数、未处理问题数、最老未处理问题时间、学习问题的学员影响人数、课程首次问题时间、最近问题时间、正式处理次数，以及按 issueCategory 聚合的 occurrenceCount / firstSeenAt / lastSeenAt / affectedUserCount；内容治理项不计入学员影响人数。累计反馈唯一 owner 为课程级 `learningFeedback` 全量记录按 lessonId 统计，不使用 Course Insight 数量代替反馈数；02“学习反馈”与顶部“累计反馈”必须使用相同课程级口径，不再按当前 Issue 过滤。正式处理次数唯一 owner 为 `lessons.version`，规则固定为 `max(0, version - 1)`，只代表已正式发布的课程更新，不统计 DRAFT / REVIEW / CANCELLED。时间来源固定为现有 courseInsights / learningFeedback 的 createdAt / updatedAt；不使用 updatedAt 冒充首次时间。当前仍没有统一 owner 的上线时间、学习人数、完成率、近 7/30 天趋势，因此不会在 UI 中预造。

课程风险排序由确定性 Core 完成，并固定使用“当前未处理问题”而不是历史累计问题：未处理问题 ≥10 → ATTENTION（红）；未处理问题 5～9 → WATCH（黄）；未处理问题 0～4 → NORMAL（绿）；Visual Review 绿色样本固定使用 ≤1。REVIEWED / DISMISSED 不继续抬高风险。默认排序权重固定为红 > 黄 > 绿；同颜色内只按 oldestOpenIssueAt 从早到晚排序，积压越久越靠前；时间完全一致时仅按 courseKey 稳定排序。openIssueCount、affectedUserCount、最近更新时间均不得参与同颜色默认排序。该规则只用于当前 Course Health 排序与提示，不属于 AI 自动评分。

V2 Patch 当前只允许替换现有 AdminCourseSnapshot 的字符串叶子字段；不允许 AI 增删 Step / 卡片 / Check / Practice，不允许修改 ID、questionType、correctValues / correctAnswer、passScore / 分值、权限、状态或版本。需要结构变化时必须返回 `REQUIRES_MANUAL_STRUCTURE_CHANGE`，另开明确人工任务。

Development DB 当前临时保留一组明确标记“模拟测试”的学习洞察数据用于 Phase 1 回归。模拟数据真实业务按钮已禁用；这些数据不属于正式事实，本轮回归完成后必须通过当前清理脚本精准删除，且不得进入 Production 或正式统计。

Development `opc_ai_dev` 当前已应用 Drizzle migration `0000`～`0025`（26 条）。本地应用使用最小权限账号 `opc_ai_dev_app`，Migration 使用独立 `DATABASE_MIGRATION_URL`。本地开发固定通过 SSH 隧道 `127.0.0.1:15432` 连接 TencentDB；`npm run dev` 由 `scripts/start-local-dev.cjs` 统一执行“检查隧道 → 必要时自动建立 → 最小 DB 连通性验证 → 启动 Next.js”，`npm run dev:check` 只做该确定性预检。后续若 Auth Session 查询出现连接类错误，先按此开发基线恢复隧道/DB，不重复推断 Schema、不新增 Auth migration 或认证补丁，除非有独立 Schema 证据。2026-10-01 的 Auth Session 报错已确认是隧道中断。

用户与权益当前真实能力：用户搜索、ACTIVE / DISABLED、学习概况、会员开始/到期/永久/延长/取消，以及管理员审计。历史 `users.admin_note` 仅作为数据库兼容字段，不属于当前产品 contract。

Phase 1 Visual Review / 回归使用的模拟课程健康数据已全部清理：当前 Workbench `simulation=true` 课程为 0，本轮 8 门 / 60 条模拟 Issue、35 条模拟 learningFeedback、专用测试用户，以及更早遗留的 2 条 `demo-learning-*` 模拟 Insight 均已删除。一次性 Visual Review provisioning 脚本已退出 current tree。

AI 日报、热点能力练习、实操项目和课程维护可以共享 Event / Source，但不共享内容模板。当前后台课程更新直接维护现有正式课程 snapshot，不调用 Course Builder Workflow；Course Builder 继续只负责独立的课程生产流程。

## 8. 会员与公众号

当前产品策略固定为：
- 免费用户：AI 日报精选 Top3；
- 公众号关注权益：全部日报；
- OPC 会员：进阶练习、实操项目、进阶内容，以及独立个人 AI 工作台使用权；
- 个人 AI 工作台不属于 OPC AI 前台导航，是独立会员产品界面；
- 工作台正式开放前状态仍为 PLANNED，不把原型入口当作已交付会员功能；
- 会员失效后不得删除用户浏览器 IndexedDB 中已有的个人素材与产物。

真实公众号关注验证、完整订单/支付仍未接入，属于后续 Identity / Commerce 阶段。

## 9. 数据与存储方向

数据库技术边界继续使用标准 PostgreSQL；正式托管目标确定为 TencentDB for PostgreSQL。

Workbench 当前数据边界：
- PostgreSQL：身份、Workspace、权限、Workflow/Prompt/Skill 配置、最小运行状态、第三方连接，以及 OPC AI 官方业务事实；
- 浏览器 IndexedDB + 导出文件：普通用户素材、AI 输出、草稿和产物；
- 飞书：用户授权后的外部整理目标，单向写入用户勾选字段；
- 对象存储：仅 OPC AI 官方内容或未来显式云存储能力需要时使用；
- 第一阶段不引入独立 Vector DB / Redis / Kafka；
- Worker 早期仅承担低并发控制型任务，用户模型推理与媒体计算不在平台服务器执行。
- Development 数据库固定命名 `opc_ai_dev`；Production 固定命名 `opc_ai_prod`；
- Dev / Prod 使用不同账号；本地开发不得持有 Production 数据库账号；
- Production Web/API 优先通过腾讯云 VPC 内网连接 TencentDB；
- 当前 migration 入口已增加安全 Gate：Supabase target 会被直接拒绝。

## 10. AI 架构方向

模型调用通过 Provider Adapter / Model Gateway，不把业务逻辑绑定某一家：
- 普通用户第一版 BYOK：DeepSeek / 豆包 / OpenAI；平台不承担用户 Token；
- 普通用户 raw input/output 默认不长期保存服务器；
- OPC AI 官方任务使用平台自己的模型配置，并保留完整 AI Run provenance。

## 11. 当前下一步

当前状态：`LEARNING INSIGHT WORKBENCH V2.1 / PHASE 1 IMPLEMENTED / UI REVIEW PENDING`。

课程维护、81/81 Learning Identity、81/81 AdminCourseSnapshot、Evidence Detail 与 Insight → Course Maintenance Bridge 均已具备。Workbench V2.1 Phase 1 已完成课程健康队列、课程健康详情、问题分类聚合、真实 first/last 时间、至少影响人数、确定性风险排序、Evidence drill-down、模拟数据动作保护与课程级 Human Gate 1；Contract / V2.1 Phase 1 Validator、Typecheck、Build 与 Development DB acceptance 已通过。当前必须停在 Visual Human Review Gate，等待产品负责人实际体验并明确 USER_APPROVED；未批准前不进入 AI Task A / Human Gate 2 / Task B / Human Gate 3。

## 12. Repository Governance 状态

- Repository Governance：COMPLETE / PASS；
- Current tree 只保留正式 current owners、正式实现和必要兼容重定向；未批准原型与重复运行路径退出 current tree；
- Course current owner：7 份 learning docs；
- Current executable scripts：由 `npm run scripts:current:check` 管理，不维护易漂移的手工数量；
- 历史 task-results / Track-Batch 一次性脚本 / legacy static prototype / Course Builder Preview 路由：退出 current tree，使用 Git history 追溯；
- 正式课程内容已从 `fixtures` 迁至 `lib/learning/course-content/*`；`fixtures/course-builder` 只保留 Validator/Acceptance 测试样例；
- 已删除 Brief / Audit / Research 文件若作为冻结课程历史 provenance 保留，只允许使用 `git-history:` 前缀，不得作为 current context。
Learning Insight V2.1 当前 Evidence 导航事实：学习问题的上一条 / 下一条导航已从 02 标题右侧退出，只在“学习反馈”内容下方显示；内容治理项若同类存在多条，则导航位于治理说明下方。
学习反馈当前规则：课程级反馈默认显示前 5 条，超过 5 条只使用“查看全部 / 收起”；学习反馈区域不再使用 Issue 的上一条 / 下一条导航，避免与反馈总数形成第二套计数。03 Human Gate 1 操作顺序固定为“无需处理 → 继续观察 → AI 综合分析课程”，决策说明与按钮整体靠右；“无需处理”在模拟禁用状态下仍保持完整红底白字，不使用透明度弱化。

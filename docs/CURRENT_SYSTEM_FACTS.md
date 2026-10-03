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
- 当前生产应用已重新部署到 main 基线 `89a58c3`；部署目录为 `/var/www/opc-ai`。

## 2. 技术基线

```text
Frontend / Web        Next.js 15 App Router
Runtime               Node.js 20
Database              PostgreSQL + Drizzle
Production DB         Local PostgreSQL 14 / opc_ai_prod / 127.0.0.1:5432
Development DB        TencentDB PostgreSQL / opc_ai_dev / SSH tunnel 127.0.0.1:15432
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

`/admin/courses` 以 `learningTracks` + `formalLessonSpecs` 作为 5 Track / 81 Lesson 正式身份源。课程更新固定走 `DRAFT → REVIEW → PUBLISHED`；正式发布通过 Course Maintenance version 能力写入历史，并同步 Learning Path / Lesson Runtime / 目录标题。81/81 Lesson 的 Published Check、Practice 与 Admin Snapshot identity 已对齐；课程维护不调用 Course Builder Workflow，也不重新生成课程内容。

Learning Insight V2 已完成真实闭环：正式课程列表固定来自 81 Lesson Registry；Effective Evidence Set 是 AI 证据唯一入口；流程为 Human Gate 1 → Task A 整课诊断 → Task B 文本替换 Patch → 学员观感 Before / After Preview → Human 发布。Issue Cycle 只按当前周期计算风险，`REVIEWED / DISMISSED / WATCHING` 退出当前未处理风险；红/黄/绿排序仍由确定性 Core 控制。AI 不拥有课程结构、Issue 状态或最终发布权。

当前可重跑验收、历史 simulation、人工临时验收和一次性修复过程不再写入本文件；过程证据通过 Git history、validators 和 acceptance scripts 追溯。

知识更新 / Knowledge Proposal 仍可通过现有 Bridge 进入 Course Maintenance DRAFT，用于非 Learning Insight AI 自动更新场景；该 Bridge 保留 sourceContext、冲突保护与可重跑 acceptance。Learning Insight V2 的 AI 更新链已不再复用这条二次提交路径：Human 在学员观感 Before / After Preview 完成最终确认后，由 Core 复用现有 Course Maintenance 发布能力直接生成正式新版本并留下 PUBLISHED 历史；已有人工 DRAFT / REVIEW 时仍 fail-closed，不静默合并或覆盖。

学习洞察 V2 current owners 固定为 `docs/learning-insight/` 下四份契约：`LEARNING_INSIGHT_WORKBENCH_V2_PRODUCT_CONTRACT.md`、`LEARNING_INSIGHT_AI_PROMPT_CONTRACT.md`、`LEARNING_INSIGHT_STRUCTURED_OUTPUT_CONTRACT.md`、`LEARNING_INSIGHT_DETERMINISTIC_VALIDATOR_CONTRACT.md`。Repository Governance 只允许这四份 current owner。

V2 的职责边界固定为：机械代码负责采集、聚合、阈值、去重、课程定位、状态、Patch 校验与最终发布动作；Human 只保留两次明确 Gate——Gate 1“是否交给 AI 分析”和 Final Preview Gate“是否发布最终版本”；AI 只做 Task A“整课诊断 + 判断当前课程是否需要修改”和 Task B“为当前单一课程生成文本替换 Patch”。Task A / Task B 均使用固定 Prompt 与纯 JSON Schema，所有 evidence_ref / course_id / path / current_value 必须通过确定性校验；AI 不直接拥有 Learning Issue 状态，也不拥有最终发布权。

Learning Insight 数据边界已增加 Source Matrix：当前确定性自动聚合只包括 Step 3 Check 异常、Step 4 Practice 困难、提示使用率高和帮助度低；`still_confused` 当前属于“已有事件采集但尚未形成聚合规则”。内容疑似错误 / 内容待更新核查当前没有统一自动入口，必须来自管理员、知识更新、内容采集或可信来源 Evidence，不能由学员反馈直接生成，也不能由 AI 凭模型常识自行声明。Task A 输入已收敛为课程级 `course_issue_bundle + course_issue_timeline + data_availability`，必须一次分析当前课程累计问题；缺失数据明确 unavailable，不允许补造。

Learning Insight Workbench 已按 V2.1「学习洞察」重构：左侧为“课程诊断”状态列表，一行只代表一门课程；右侧主工作区按“课程抬头 → 01 问题汇总 → 02 真实数据 → 03 处理这门课程 → 04 AI 综合诊断”组织。01 问题汇总只做课程级统计，不可点击、不保存问题选中状态，也不驱动 02。02 唯一事实入口为 Effective Evidence Set，只提供“学习反馈 / 学习行为”两个互斥视图；反馈默认前 5 条并支持查看全部，行为按指标卡展示，并叠加有效 / 仅供参考 / 排除摘要。03 固定为“无需处理 → 继续观察 → 人工修正 → AI分析/更新对照”；04 只承载整课诊断。顶部流程条当前固定为“系统发现 → 人工确认 → AI 诊断 → 确认发布”。课程诊断列表只保留“搜索课程 + 风险筛选”，默认按确定性 Core 的排列顺序检查。

当前 Course Health Core 使用现有真实数据生成：累计反馈数、累计问题数、未处理问题数、最老未处理问题时间、学习问题的学员影响人数、课程首次问题时间、最近问题时间、正式处理次数，以及按 issueCategory 聚合的 occurrenceCount / firstSeenAt / lastSeenAt / affectedUserCount；内容治理项不计入学员影响人数。累计反馈唯一 owner 为课程级 `learningFeedback` 全量记录按 lessonId 统计，不使用 Course Insight 数量代替反馈数；02“学习反馈”与顶部“累计反馈”必须使用相同课程级口径，不再按当前 Issue 过滤。正式处理次数唯一 owner 为 `lessons.version`，规则固定为 `max(0, version - 1)`，只代表已正式发布的课程更新，不统计 DRAFT / REVIEW / CANCELLED。时间来源固定为现有 courseInsights / learningFeedback 的 createdAt / updatedAt；不使用 updatedAt 冒充首次时间。当前仍没有统一 owner 的上线时间、学习人数、完成率、近 7/30 天趋势，因此不会在 UI 中预造。

课程风险排序由确定性 Core 完成，并固定使用“当前未处理问题”而不是历史累计问题：未处理问题 ≥10 → ATTENTION（红）；未处理问题 5～9 → WATCH（黄）；未处理问题 0～4 → NORMAL（绿）；Visual Review 绿色样本固定使用 ≤1。REVIEWED / DISMISSED 不继续抬高风险。默认排序权重固定为红 > 黄 > 绿；同颜色内只按 oldestOpenIssueAt 从早到晚排序，积压越久越靠前；时间完全一致时仅按 courseKey 稳定排序。openIssueCount、affectedUserCount、最近更新时间均不得参与同颜色默认排序。该规则只用于当前 Course Health 排序与提示，不属于 AI 自动评分。

V2 Patch 当前只允许替换现有 AdminCourseSnapshot 的字符串叶子字段；不允许 AI 增删 Step / 卡片 / Check / Practice，不允许修改 ID、questionType、correctValues / correctAnswer、passScore / 分值、权限、状态或版本。需要结构变化时必须返回 `REQUIRES_MANUAL_STRUCTURE_CHANGE`，另开明确人工任务。

Development `opc_ai_dev` 与 Production `opc_ai_prod` 当前均为 Drizzle migration `0000`～`0025`（26 条）。本地开发继续通过 SSH 隧道 `127.0.0.1:15432` 连接 TencentDB Development；Production 已迁到轻量服务器本机 PostgreSQL 14，仅监听 `127.0.0.1:5432`，应用账号为 `opc_ai_prod_app`。生产数据库每天 03:30 自动备份，保留 7 天。

用户与权益当前真实能力：用户搜索、ACTIVE / DISABLED、学习概况、会员开始/到期/永久/延长/取消，以及管理员审计。历史 `users.admin_note` 仅作为数据库兼容字段，不属于当前产品 contract。

“用户与权益”历史测试账号 `test-*@dev.opcai.local` 共 11 个已清除，真实管理员保留。内容采集历史 E2E / acceptance / 演示数据已从 Development 与 Production 的全部 `content_*` 表清场；当前内容采集从空数据基线开始，不再把历史两条 Content Draft、E2E Source、Raw Item、Event、Review 或 Audit 当作正式事实。

历史模拟课程、模拟 Issue、模拟 learningFeedback、Visual Review 课程数据与旧 `demo-learning-*` 均已清理。Development 不再保留额外的模拟 Track 01 课程；需要测试 Learning Insight 时，只允许使用不会注册为正式课程、不会写入正式 Runtime PUBLISHED Check / Practice 的隔离测试数据。

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

数据库技术边界固定为标准 PostgreSQL + Drizzle；当前 Production 使用轻量服务器本机 PostgreSQL，Development 暂时继续使用 TencentDB。

Workbench 当前数据边界：
- PostgreSQL：身份、Workspace、权限、Workflow/Prompt/Skill 配置、最小运行状态、第三方连接，以及 OPC AI 官方业务事实；
- 浏览器 IndexedDB + 导出文件：普通用户素材、AI 输出、草稿和产物；
- 飞书：用户授权后的外部整理目标，单向写入用户勾选字段；
- 对象存储：仅 OPC AI 官方内容或未来显式云存储能力需要时使用；
- 第一阶段不引入独立 Vector DB / Redis / Kafka；
- Worker 早期仅承担低并发控制型任务，用户模型推理与媒体计算不在平台服务器执行。
- Development 数据库固定命名 `opc_ai_dev`；Production 固定命名 `opc_ai_prod`；
- Dev / Prod 使用不同账号；本地开发不得持有 Production 数据库账号；
- Production Web/API 通过本机 loopback 连接 `opc_ai_prod`，PostgreSQL 不对公网监听；
- 当前 migration 入口已增加安全 Gate：Supabase target 会被直接拒绝。

## 10. AI 架构方向

模型调用通过 Provider Adapter / Model Gateway，不把业务逻辑绑定某一家：
- 普通用户第一版 BYOK：DeepSeek / 豆包 / OpenAI；平台不承担用户 Token；
- 普通用户 raw input/output 默认不长期保存服务器；
- OPC AI 官方任务使用平台自己的模型配置，并保留完整 AI Run provenance。

Task A 当前实现事实：共享 owner `lib/server/learning-insights/task-a.ts` 只在课程级 Human Gate 1 已完整授权且不存在 OPEN / REVIEW_REQUIRED 残留时允许运行。AI 证据唯一入口已收敛为 `lib/server/learning-insights/effective-evidence.ts` 的 `buildEffectiveLearningEvidenceSet(courseKey)`；正式 Task A 固定使用 PRODUCTION mode，不再直接扫描 Evidence Detail / learningFeedback / courseInsights 原始行拼 Prompt。Effective Evidence Set 负责测试来源隔离、真实用户 identity 校验、反馈去重、最小样本、行为事件 Allowlist、确定性阈值、VALID / SUPPORTING_ONLY 分级和 data_availability。正式 Production API 永远不能通过 query 参数切换到测试证据模式。

Task A 统一复用 `lib/server/ai/configured-chat.ts` 的 `OPC_AI_ANALYSIS_*` 配置与 `callConfiguredChatJson`，审计写 `ai_runs`：taskType=`LEARNING_INSIGHT_TASK_A`。AI 输出必须经过 `learning_issue_diagnosis_v2` Schema / Evidence / Course / Step Validator；Task A 本身禁止 Patch、Candidate 与 Course Maintenance 写入。管理员界面不暴露 issue:1、course_id、EXPLAIN/CHECK/PRACTICE 等内部值，Evidence、课程与 Step 均由确定性 Code 映射为中文可读信息。

Task A 已通过静态 Validator、Typecheck、Development DB mock acceptance 与真实 DeepSeek `deepseek-flash` Provider Acceptance。当前整课诊断显式使用 120 秒请求超时；Prompt 提供 exact schema，Provider 输出若被 Validator 拒绝则 FAILED ai_runs 保存 rawOutput 供内部审计，不进入正式诊断。

Task B 当前共享 owner 为 `lib/server/learning-insights/task-b.ts`。独立 Human Gate 2 已退出：管理员点击一次“AI分析”后，Task A 若判定当前课程 CHANGE_RECOMMENDED / MODIFY，前端 Orchestrator 自动继续 Task B。Task B 仍只允许当前课程、mutable_path_catalog 中已有字符串叶子 REPLACE。当前已实现 Before / After 对照弹窗：不再使用后台第二套课程 renderer，而是左右两侧直接复用学员正式 `GenericLessonRuntimePanel` 的 previewMode；左右同步当前 Step，右侧列出本步 AI 修改位置，Human 可展开“修改”并直接编辑建议文本；把某项改回原文即视为不采纳该项。真实课程 Human 点击发布前有二次确认，Core 重新校验 baseline/path/structure 后通过现有 Course Maintenance Candidate/version 能力完成发布，历史 updateReason 固定“课程反馈更新”。若流程在 SAVE/SUBMIT/PUBLISH 中途失败，本次 Learning Insight 创建的候选会自动取消；已有人工 DRAFT / REVIEW 仍 fail-closed 且绝不覆盖。正式发布成功后，Code 只关闭本次 Task B 创建时间以前已经存在的当前课程问题；分析后新出现的问题继续保留。课程已成功发布而问题闭环单独失败时只记录内部 warning，不向前端伪报“课程未发布”。

03「处理这门课程」当前按钮顺序固定为“无需处理 → 继续观察 → 人工修正 → AI分析”。人工修正使用显式 URL `/admin/courses?course=<maintenanceKey>&intent=edit` + sessionStorage fallback：课程维护 Server Page 把目标课程与 EDIT intent 直接传入 Registry；已有 DRAFT/REVIEW 直接打开对应候选，无活动候选则创建人工 DRAFT 并立即进入 EDIT，不再只落到课程维护首页。AI 分析运行中按钮显示“AI分析中…”，Task A→Task B 成功后同一按钮变为“更新对照”，不再显示第二个“生成具体修正方案”。

## 11. 当前下一步

当前状态：`LEARNING INSIGHT V2 CLOSED LOOP / ISSUE CYCLE / PASS`。

课程维护与 Learning Insight 的正式课程基线统一以当前前台已部署的 81 节正式课程为准。模拟 / acceptance 数据只能作为隔离测试证据存在，不得替代、删减或改写正式课程目录身份。

## 12. Repository Governance 状态

- Repository Governance：COMPLETE / PASS；
- Current tree 只保留正式 current owners、正式实现和必要兼容重定向；未批准原型与重复运行路径退出 current tree；
- Course current owner：7 份 learning docs；
- Current executable scripts：由 `npm run scripts:current:check` 管理，不维护易漂移的手工数量；
- 历史 task-results / Track-Batch 一次性脚本 / legacy static prototype / Course Builder Preview 路由：退出 current tree，使用 Git history 追溯；
- 2026-10-03 完成 Legacy Course Route Cleanup：旧 `ai-literacy` / `chatgpt-worker` 两套静态课程已从 `lib/courses.ts`、路由 renderer、LessonSpec Registry、Seed 与测试身份中退出；Frontend Lesson Route 已从 89 收敛为 81，与 Formal Registry / Course Catalog / Admin Course Registry 完全一致。公众号关注解锁策略已迁移到正式 `foundation-ai / phase1`，Development DB 无旧 entitlement 需要迁移。
- 正式课程内容已从 `fixtures` 迁至 `lib/learning/course-content/*`；`fixtures/course-builder` 只保留 Validator/Acceptance 测试样例；
- 已删除 Brief / Audit / Research 文件若作为冻结课程历史 provenance 保留，只允许使用 `git-history:` 前缀，不得作为 current context。
Learning Insight V2.1 当前 02 不再使用 Issue 或 Feedback 的上一条 / 下一条导航。02 直接读取 Effective Evidence Set；学习反馈恢复行式展示并支持超过 5 条时“查看全部 / 收起”，学习行为恢复 3 列指标卡展示，同时保留“有效 / 仅供参考”角标与测试数据、样本不足、非允许事件等排除摘要。顶部“累计反馈”仍代表原始课程反馈总量，因此不要求与 02 有效反馈数量相等。03 Human Gate 1 操作顺序固定为“无需处理 → 继续观察 → 人工修正 → AI分析 / 更新对照”。

Learning Insight Task A 当前 AI Provider 事实：Development 已通过现有 OpenAI-compatible Adapter 接通 DeepSeek，当前模型为 `deepseek-flash`，密钥只存在 `.env.local`，不进入仓库。最小 JSON 连接测试已 PASS。
Task A 真实 Provider Acceptance 已 PASS：使用一门正式课程完整 Step 1～6 + 临时 acceptance Issue，通过 Human Gate 1 后调用真实 DeepSeek，输出通过 `learning_issue_diagnosis_v2` Schema / Evidence / Course / Step Validator；测试 Issue 与本次 AI Run 已精准清理，未创建 Course Candidate。
真实 Provider 回归暴露并已修正两项工程边界：整课诊断请求超时由通用 45 秒改为 Task A 显式 120 秒；Prompt 现在向模型提供 allowed fields / enums / exact_shape。Provider 返回但 Validator 拒绝时，FAILED ai_runs 保存 rawOutput 用于审计，不进入正式诊断。
当前真实 Development 学习数据尚不足以产生 Learning Issue：lesson_check_responses、practice_submissions、LESSON_HELPFULNESS、hint_revealed 当前无可聚合样本，因此 Task A 产品态 Human Review 暂无真实课程可运行；不得为进入 Task A 人工伪造正式问题。

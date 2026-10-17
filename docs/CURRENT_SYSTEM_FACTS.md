# CURRENT_SYSTEM_FACTS.md — OPC AI 当前系统事实

> 本文件只记录“现在真实存在什么”。历史过程只通过 Git 追溯；未来计划只放 TASKS / DEVELOPMENT_ROADMAP。

## 1. 当前产品阶段

- 2026-10-17用户明确授权生产上线与Git同步，P4确定性事件/材料链、栏目算法配置与图表、来源采集频率、同版本发布去重和Radar精简列表/按需详情已同版部署。Node/SYSTEM为p4-radar；Deno生产为`relay-radar-materials-v17`（revision `6wexxr6b40np`，预览验证`ktmnn7y62fa0`），协议仍为public-source-routes-v3 / public-practice-routes-v5。watchlist/author v1、public sources v2、机器准入on；理解/关系/表达三项AI开关off，Brave/GitHub Release新路径未启用，本轮真实付费模型调用为0。完整栏目质量仍NOT_ACCEPTED / RELEASE_NOT_READY。

- Pixaroma作者站固定材料Provider已发布至Deno生产Relay（当前Relay版本见本节首段）；腾讯云生产SYSTEM已独立发布材料增量并登记单一作者Source，生产实采及即时幂等通过。现有唯一timer继续负责调度，资格仍CONDITIONAL，长期观察未完成。无发布日期材料只保存Raw/Observation，不生成当前Event；开发既有聚合作者参考关联creatorSourceId。Web/P0界面与实践分类现已同版发布。验收结果见TASKS。
- 其他公开作者候选的核验元数据保存在Raw.creatorReview并审计；生产代码阻断需登录/关注/人工会话的路由和材料。固定Comfy正文/B站匿名字幕及ZIP逐篇说明适配器，已部署腾讯云SYSTEM与Deno生产并验证重复Raw回执持久化；通用正文/字幕覆盖缺口仍存在，不把搜索描述或共享安装步骤当全文。验收明细见TASKS。


- Track 01～05 共 81 节正式课程，保持冻结基线；本轮只治理来源管理 → 热点追踪生产链，不改变课程前端。
- 后台内容域当前只保留三个产品 Owner：`/admin/sources` 来源管理、`/admin/intelligence` 热点追踪、内容工作台兼容入口。后者的新选题入口待独立规划，不由热点追踪采集质量标签驱动。旧人工采集产品、独立 Automatic Collection workbench、Rising/上升趋势产品路径均已退出 current owner。
- **Source Management 是唯一 Source 资产入口；SYSTEM Collection 是唯一正式采集执行基准。** 未来新增来源只能经 Discover → Check/Preview → Register → Qualify 后进入同一 SYSTEM Collection。
- 正式生产闭环固定为：`Source Management → SYSTEM Collection → Raw/Observation → Dedup → Event/Evidence → Source-managed Discovery Expansion → Practical Evidence → AI Hotspot Practice / Topic Momentum / Curation → Radar Snapshot → 热点追踪`。
- Discovery Expansion证据刷新owner为 `refreshSourceManagedEventExpansion`，消费current Source已采Raw；168h bounded，成功6h cooldown、失败1h retry，不自动调用AI。生产代码支持已管理搜索Source的有界实践参考发现，详细边界见采集架构合同“实践主题与汇总内容边界”；生产来源是否可执行仍由现有资格与opt-in决定。
- 精选 owner 为 `bole-daily-curation-v6-recall-balanced`：Hard Gate 保持 AI relevance + ≤72h + CONFIRMED_OFFICIAL/CONFIRMED_MEDIA + MAJOR/NORMAL；在不降低事实门槛的前提下，提高 Freshness / Evidence Quality / Importance 权重，降低 Practical / Independence / Corroboration 对新近单源官方更新的早期惩罚；FEATURED≥66；TOP_PICK≥78 且要求更强 value/evidence gate。
- 当前热点 owner 为 `topic-momentum-v7-independent-institutions-decay`：榜单统计过去 7 天，同一 Event 的独立账号/机构按 `originPublisher / author / Source identity` 归一；聚合器仅转发、且没有可识别原始账号/机构时不作为独立参与者；重复采集只算一次；每个参与者按 72 小时半衰期衰减。热度衡量讨论活跃度，不是报道质量，不改变 Fact Authority。趋势只允许比较持续覆盖的同一组参与者；缺少可比历史时 `trend=null`，不展示趋势线。
- AI HOT 当前是 Source Directory 中一个 Aggregated Discovery Source（`source_radar_ai_hot`），通过 PUBLIC_JSON_API 进入 SYSTEM Collection；`factualSource=false / signalSource=true / referenceOnly=true`。AI HOT 与直连原站共享 originPublisher 去重，不取得 Fact Authority，也不拥有独立采集入口。
- 国内综合热点仍由单一 `source_radar_dailyhot_domestic` 承载，不把 DailyHot 子 Route 拆成多个 Source Identity。
- Current SYSTEM Source 数量和健康状态以 Source Directory / recent SYSTEM Run 实时读取为准，不保留固定数量或过期全绿结论；Qualification 仍以 recent N runs first 保守治理。
- `/admin/intelligence` 沿用已确认的日历布局：北京时间完整七日、当天展开/其他折叠、历史每次一个有内容日期，到底明确显示；无120首批截断。当前持久化快照为radar-snapshot-v17-compact-storage，兼容现役v16-audit-fixes并保持原API展开结构，统计/列表同源。管理员可记录采集质量正负评价、原因、来源归因并撤销；评价不改变自动栏目或采集。来源详情显示30日评价样本与问题原因；AI热点练习独立触发并持久展示。热点追踪与来源管理首读显示读取态，可见页面每5分钟重读、切回页面且距上次请求至少1分钟时追赶；两处界面已获产品负责人实际体验并明确批准，规则唯一见采集合同§16、§22、§23。
- 2026-10-16生产`content_sources`共65条，其中22个`source_runtime_trend_*`为旧趋势记录，10个有历史Run且最新停在2026-10-15，不在当前SYSTEM组合。P3真实自动准入误将Together主页登记为已有博客的第二身份；已通过Source管理Core归档误登记项，保留审计且不恢复。固定五站主页/列表/Feed身份归一已修复并经开发PG复用验收；归档冲突继续阻断。现役目录数量以运行时读取为准；聚合带出的原发布者名称不代表独立可管理Source。
- 当前架构正文唯一 owner：`docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md`；实现映射唯一 owner：`docs/content/COLLECTION_IMPLEMENTATION_MAPPING.md`。历史 Phase/Acceptance 只通过 Git 追溯，不再复制到 Current Facts。

- 来源管理筛选词已接入所有SYSTEM候选的Raw前过滤；新增词扩展标题召回，排除优先，后续Run读取并记录规则版本。保存/注册与审计同事务，不追删历史。网站/主页支持标准Feed自动发现与受限Sitemap备用检测；Simon/TIL/Comfy公开路径经腾讯云+Deno实测。注册仅证明可采，不授予Fact Authority或AUTO_READY；边界唯一见采集合同。

## 2. 技术基线

仓库独立开发工具 `tools/task-manager` 已实现本机 Node 回环服务，读取 current owners 与 Git 展示任务、版本记录和治理建议；AI推进分析复用既有configured-chat与DeepSeek配置，输出经过确定性校验的优先顺序和Codex Prompt，结果与正式任务状态隔离。不接入业务前后台、数据库或生产部署。入口和验证见 [工具说明](../tools/task-manager/README.md)。

```text
Frontend / Web        Next.js 15 App Router
Runtime               Node.js 20
Database              PostgreSQL + Drizzle
Production DB         Local PostgreSQL 14 / opc_ai_prod / 127.0.0.1:5432
Development DB        Local PostgreSQL 14 / opc_ai_dev / SSH tunnel 127.0.0.1:15432
Process manager       PM2
Reverse proxy         Nginx
Production OS         Ubuntu 22.04
Production server     Tencent Cloud 2C2G / 40G
```

采集部署：腾讯云唯一opc-collection.timer使用每分钟calendar tick，SYSTEM按Source已保存间隔及现役治理有效间隔判定到期，未到期不采；不改变资格/Route。current指向`/opt/opc-services/opc-collection-runtime/releases/20261017-p4-radar`；CPU50%、MemoryMax512M。Web为`/opt/opc-services/opc-admin-web-p4-radar-20261017`，root PM2 opc-ai运行并保存，Node堆512MB；Web/SYSTEM的821个候选源码文件SHA256一致。root600配置为`/var/www/opc-ai/.env.local`；公网健康200、匿名管理API401，timer enabled/active。Deno只做无状态海外获取。

数据库迁移history仍40条，本轮无新增迁移，只读预检pending=[]、运行角色非superuser。发布前备份`/var/backups/opc-ai-db/opc_ai_prod_pre_p4_radar_20261017.dump`已通过pg_restore --list校验。同版回退为旧Web `opc-admin-web-p3-gap-fix-20261016` 与SYSTEM `releases/20261016-p3-gap-fix`，受保护配置位于`/etc/opc-ai/p4-radar-rollback.config.cjs`、`p4-radar-pre-release.env.backup`与`p4-radar-pre-release.timer`；Relay前版revision为`0rmfttv53pc6`。备份和配置均不进入Git。

生产实测（2026-10-17 15:14–15:16北京时间）：同版本发布定向补聚类selected30/reconciled11/alreadyCurrent19，failed/deferred=0，截图Gemini发布/渠道报道合为7篇报道主事件；教程/评测和普通评论仍独立。快照480 Event、热点6、练习0，数量仅为该次观察，不代表质量通过。认证接口compact约8.88MB/661ms，listing约2.48MB/145ms，负载减少72%；完整详情约15KB/52ms，与原story深比较通过。匿名401、非法详情400、缺失404，频率45源/统计/算法接口200。最终Linux build与86项quick/typecheck通过；首次真实SYSTEM周期15:15:46成功，后续15:16:45周期failures=[]并正常退出，无内存终止。该短期观察不替代7–14日持续质量验收。

新增UI提供过实际暂存操作体验；本轮用户授权上线，不另记为USER_APPROVED。完整质量、连续发现延迟和真实AI效果仍待独立验收。

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
- 平台：运营总览；
- 内容：来源管理、热点追踪；
- 课程：课程维护、学习洞察；
- 用户：用户与权益。

`/admin/intelligence` 是唯一「热点追踪」产品入口；`/admin/sources` 是唯一来源配置入口。旧 `/admin/manual-collection` 只保留兼容重定向，不再拥有工作区、Task 或 Result。
- `/admin/sources` 统一承担 Source / Creator / Qualification / Route / Onboarding；current acquisition 不提供认证 Connection / Login Runner。
- 新增信息源采用 capability-first：先识别 URL / Creator，再用当前已部署的 server-native 能力做 bounded live Check / Probe，必须拿到真实 Preview 样本并通过重复检查后才可入库；理论支持、浏览器能打开、账号已登录或未来可开发能力都不能代替可采证据。
- Website / Creator 当前以 RSS / Atom / Sitemap / 公开 API 或其他 server-native Route 的 live sample 为准；没有无需用户登录且服务器可运行的 Route 时保持 UNRESOLVED。
- 国内热点发现继续复用 AI HOT / DailyHot / RSSHub / current Trend Discovery provider；国内 Browser Trend Runner 不再自动创建微博/抖音/小红书/知乎第二套 Trend Source。

AI 能力配置与系统域仅保留产品边界，底层能力未完成前不暴露正式页面或导航。兼容路由 `/admin/platform`、`/admin/memberships` 只做重定向。

旧 `/admin/content` 不再拥有“热点追踪”或“采集策略”正式入口：默认重定向 `/admin/intelligence`；内容工作台兼容入口继续服务 AI Daily 链路，不再扩展第二套采集策略。
- Current Collection 不再按“继续增加站点专用 Collector”扩张；默认复用通用 Acquisition Family：RSS/Atom、Sitemap、公开 API/JSON、generated feed/feed bridge、bounded Reader/parser、server-native Platform API、Search/Trend/Transcript。Browser/Login Session 不属于 current family。HN、GitHub、DailyHot 等只是逻辑 Source / provider 配置，不应各自复制一套采集生命周期。
- Collector 固定 `REFERENCE_ONLY`，只返回引用、文本、指标与 metadata，不拥有长期保存媒体的权限。
- Raw Item 的 canonical URL 去重只是第一级确定性去重；同一事实不同 URL 继续通过 normalized title / entity+action+version / Event semantic clustering 聚合。Observation 保存多 Source / Platform 发现事实，禁止把“URL 不同”误当成“Event 不同”。
- 同一事实若由多个来源发现，不因“工具重复”删除来源观察：相同 canonical URL 只保留一个 Raw Item，但 `content_raw_item_observations` 分别保留来源 / 平台发现事实；不同原文 URL、不同报道角度或不同观点继续作为独立 Raw Item，在 Event / Cluster 层再聚合，不提前抹平观点差异。
## 7A. 发现与采集当前收口

- 自动链与人工AI已分离；生产迁移与唯一SYSTEM timer切换已完成。部署位置见§2，当前能力缺口见§7B，运行规则见采集架构合同§13。

- Current 架构只认 `docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md`；Current 代码映射只认 `docs/content/COLLECTION_IMPLEMENTATION_MAPPING.md`。
- Source / Creator / Qualification / Acquisition Route 的产品 Owner 只有 Source Management；Collection executor 只有 SYSTEM Collection；fixed tick 只有 `run-server-native-automatic-cycle.ts`。
- Fact / Signal / Presentation / Operations Authority 严格隔离：Aggregator / Trend / Engagement / Topic Momentum 不提升 Fact Authority；Coverage-critical Source 不自动停用。
- 当前生产链不依赖 Login/Browser Session；X / 小红书旧 Runner、Manual Collection Core、Rising Score/Shadow 以及 hidden Expansion Source 均不属于 current runtime。

## 7B. 来源管理 / 热点追踪已实现与缺口（2026-10-15代码核对）

- 已实现：Source Identity与Acquisition Route分离、显式路由/资格、SYSTEM唯一周期、规则召回、Raw/Observation去重、Event/Evidence、Momentum/Curation及共享实践门槛。来源目录为实时数据，不能以固定数量作为产品事实。
- 海外出口仅部分统一：RSS中DeepMind显式走Relay，其余海外Feed仍可能直连；Deno当前固定六类provider，不是任意URL代理。统一Egress是目标，尚未实现全源覆盖。
- HTTP尚未保存ETag/Last-Modified或处理304跳过；已有cadence/治理与有限网络重试，不等同已具备按七日产出的自适应频率和完整失败退避。
- 列表已有Feed正文优先、字段完整性和七日可获取窗口记录；没有完整的按需详情队列、全源分页积压/正文缺口诊断或可验证原创率。七日补采不保证上游完整历史。
- Radar读取保持完整窗口计数与30分钟过期提示，客户端阻止旧响应回写。旧 Decision/Event 状态写入已退役；新采集质量标签与审计同事务、锁定 Event 行，旧决策表和字段仅留历史审计。
- P0已部署来源启停、operator归档/恢复、规则与资格阶段的事务审计；恢复保留实际资格且保持停用，禁用状态不冒充AUTO_READY。onboarding阶段从真实资格派生，不再固定QUALIFIED。用户已明确批准新版页面上线，已发布。
- 当前发现以URL预览/注册及已有来源目录为基础；尚无独立候选来源待审表。主题规则召回不证明实践作者覆盖充分。
- 证据限度：部署、迁移与单轮真实采集已验证；连续72小时稳定性、来源发现召回率、长期页面使用反馈仍需观察。本轮P0已完成本地开发库真实验收及腾讯云隔离代码包直连开发库验收（约3.6秒），同版生产统一周期已重新验收通过，不代表连续72小时稳定。

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

数据库技术边界固定为标准 PostgreSQL + Drizzle；当前 Development / Production 均使用轻量服务器本机 PostgreSQL，以独立数据库与账号隔离。原按量 TencentDB PostgreSQL 已销毁并进入隔离/回收流程，且已退出 current runtime path。

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

## 10A. AI Collection System Current Architecture

`Source Management / Onboarding → Source Identity → Acquisition Route → Qualification → SYSTEM Collection → Relevance → Raw/Observation → Layered Dedup → Event/Evidence → Source-managed Discovery Expansion → Practical Evidence → AI Hotspot Practice / Topic Momentum / Curation → Radar Snapshot → Hot Tracking`

固定边界：
- `runSourceCollection` / `runSystemSourcePortfolio` 负责正式采集；operator-added Source 与 baseline Source 走同一执行链。
- `run-server-native-automatic-cycle.ts` 是 fixed tick 唯一 owner，并依次执行 due Source、Qualification、bounded Discovery Expansion、bounded Topic Momentum、Radar Snapshot。
- Discovery Expansion 与 Topic Momentum 都只能复用 Source Management 已采 Raw；不得创建第二来源池。
- AI HOT / DailyHot 等聚合器只提供 Discovery / Hot Signal；origin 去重后才计独立来源；事实确认仍来自合格 Fact Source。
- 旧 Rising Score / Formal Rising、Manual Collection 产品与 Login/Browser acquisition owner 已退出 current tree。
- 热点追踪页面只接上述数据，不改现有排版和 CSS。

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

- 临时 Cluster Human Review 测试面已退出 current 产品：`/admin/cluster-review`、对应 API、AdminClusterHumanReview、Development review service 与专用 review script/package entry 已物理删除；后台不再存在「内部 / Cluster 审核」菜单。正式 Event clustering / ground-truth / calibration 核心能力保持不变，不因测试页面退出而删除。

- 内容域当前能力与缺口见§7B；历史Expansion和E2E清理过程退出当前事实正文。

## AI热点练习当前状态

独立触发和持久展示已随v16快照上线，合同唯一见采集架构§23；界面已获产品负责人明确批准。共享材料获取及既有质量反馈继续运行。

## 来源与栏目当前诊断边界

- 大Feed此前为Relay已收到上游200、腾讯侧未压缩正文在20秒内未读完；已支持gzip及DeepMind重复正文兼容协商，保留20秒预算。预览实测OpenAI JSON约803KB→135216传输字节、Latent约918KB→251148字节；不将单次比例推广全源。宝玉旧Feed实际301至s.baoyu.io/feed.xml，已用固定映射修复，不泛化重定向。
- 五个现役源最近Run成功不等于持续健康：Latent Space独立生产复探仍出现BODY_TIMEOUT，预览也曾超时；DeepMind预览有过HEADERS_NETWORK_FAILED。错误已分层、正常退避保留；不通过宿主机直连绕开Relay，也不把旧失败改为成功。Hamel持续资格仍待真实周期验证。
- 练习原输入遗漏已解析AIHOT原始报道、作者实际Feed及已关联扩展报道；现按采集合同复核原始身份、URL与标题锚点后参与，Source/Fact Authority及完整材料Gate保持独立。真实Muse Wonder/Muse Spark、Learning、Google/vibe、PrismaCoder/Nemotron误关联反例已阻断，历史Evidence保留审计。8条当前练习中7条围绕同一模型发布，尚未完成P4聚类，不代表8个独立主题。
- 23:39只读全窗口拒绝原因非互斥：练习缺多独立发布者439、缺分析/应用234、主题不明确/汇总233；热点缺多源445、多作者447、多日447、跨平台/实践多样性399、互动356。不能从这些数量推断全量漏报率；当前热点算法未改。新增只读诊断入口见实现映射；as-of只限定读取窗口，不是历史DB快照或所有内部时钟冻结。7–14日持续覆盖、72h效果及18MB响应性能仍待后续。

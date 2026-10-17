# COLLECTION_IMPLEMENTATION_MAPPING.md

Status: CURRENT IMPLEMENTATION ONLY
Contract: docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md

历史 Phase 与已删除文件由 Git 追溯。本文件不保存 superseded runtime 清单。

## 1. Current Owners

### 事件证据、动量历史、暂存报告与缺口计划

- 时间/主资料：`lib/server/content/event-story-read-model.ts`；SYSTEM首见继续复用`system-discovery-receipt.ts`。
- 同源排名/回放：`topic-momentum.ts` / `intelligence-read-model.ts`；实际历史：`topic-momentum-history.ts`，仅`radar-snapshot.ts`的SYSTEM刷新写入Event.metadata.topicMomentumHistory。
- 练习候选：`ai-hotspot-practice.ts` / `ai-hotspot-practice-store.ts`，复用Event.metadata.aiPracticeCandidate；正式历史仍aiHotspotPractice。
- 报告Skill/Schema：`skills/event-value-analysis/v1.ts`；证据/Validator/运行：`event-value-context.ts`、`event-value-policy.ts`、`event-value-runtime.ts`。管理员GET `/api/admin/content/intelligence?view=event-value&eventId=<uuid>`只读暂存结果，现有UI不变。
- 缺口Skill/Schema：`skills/event-discovery-plan/v1.ts`；`event-gap-context.ts` / `event-gap-policy.ts` / `event-gap-runtime.ts`；`practice-discovery-policy.ts`识别缺口并由`collection-expansion.ts`复用受管搜索执行。
- 编排：`scripts/run-server-native-automatic-cycle.ts`的EVENT_GAP_PLAN / EVENT_VALUE；现有ai_runs任务EVENT_GAP / EVENT_VALUE。开关及运行边界唯一见架构合同，生产启用事实见CURRENT_SYSTEM_FACTS。
- 验证入口：`npm run content:event-value:check`、`content:event-gap:check`、`content:momentum-history:check`；开发PG：`content:event-value:accept -- --confirm=EVENT-VALUE-DEVELOPMENT`（mock Provider、夹具finally清理）；已纳入`content:discovery-collection:regression -- --quick`。
- 质量回放：`scripts/replay-radar-quality.ts`分别输出工程命中目标和未验收质量状态；真实发现/栏目/报告语义验收不由该脚本授予。

### Source Management
- services/overseas-collector-relay/github-releases.js / github-releases.d.ts — 4个固定仓库的精确Release页请求与数字ID Link别名核验；是传输限制，不是Source注册名单。GITHUB_RELEASES按开关启用；部署状态见CURRENT_SYSTEM_FACTS。
- lib/server/content/github-release-pagination.ts — page/per_page、首页与前页重叠、最多3页/30秒、下一页进度/末页与页限回执、稳定ID去重与非完整历史声明；source-acquisition-runtime-adapters.ts导出，collection-runner.ts仅对显式PUBLIC_JSON_API/GITHUB_RELEASES Route接入。
- lib/server/content/collection-runner.ts — githubReleaseCheckpoints按Route ID+URL隔离，成功处理后与成功Run/Source同事务提交；回填/资格不推进，不借用Feed/AIHOT validator。
- scripts/validate-github-release-pagination.ts / accept-github-release-pagination.ts — 重启/新头部/重复ID/末页/非法结构/Link/页限/429/302及配置失败反例；开发库验收--confirm=GITHUB-RELEASE-DEVELOPMENT仅独有夹具，含Raw失败不推进及Route隔离。
- scripts/inspect-github-release-pagination.ts — --mode=local-handler或relay，单个固定仓库最多3页公开只读探测；无数据库写入，不注册/恢复Source，不等同生产服务器验收。
- services/overseas-collector-relay/conditional-http.js / conditional-http.d.ts — Node/Deno共用的条件Header校验与URI作用域；协议source-conditional-http-v1。JS文件随Deno入口一起发布，旧200回执兼容；部署状态见CURRENT_SYSTEM_FACTS。
- lib/content/source-watchlist-policy.ts / lib/server/content/source-coverage-report.ts — 四组重点对象只读覆盖诊断，区分缺失、已有停用、重复身份；只投影Source和既有current判定，配置存在不代表实时可采。
- lib/server/content/source-portfolio-runtime.ts — seed不恢复停用/归档/退出目录记录；数据库更新谓词再次保护并发操作，metadata原子合并。
- services/overseas-collector-relay/watchlist-feeds.js / watchlist-feeds.d.ts — 12个现有Source的13个精确Feed URL传输白名单；WATCHLIST_FEED拒绝重定向，条件回执复用现役协议。不是新增来源注册或通用HTTP代理。
- scripts/inspect-source-watchlist.ts — 默认只读开发库配置报告；生产显式--production-read-only；可选--probe=local-handler或relay有界公开Feed探测，明确区分本地handler与远端Relay，均不修改Source或授予Qualification。
- scripts/validate-source-watchlist.ts / validate-watchlist-feed-relay.ts / accept-source-watchlist.ts — 身份/声明路由一致性、导入文件存在性、停用保护、精确URL/条件请求/禁重定向验收；开发库谓词验收仅独有夹具，--confirm=SOURCE-WATCHLIST-DEVELOPMENT，不执行整批seed。部署与开关顺序唯一见services/overseas-collector-relay/DEPLOYMENT.md。
- lib/server/content/overseas-collector-relay-client.ts / services/overseas-collector-relay/deno.ts — 现有PUBLIC_SOURCE_DOCUMENT/DEEPMIND_FEED透传条件头和可信304；白名单、逐跳检查、预算与错误脱敏保持。
- lib/server/content/source-acquisition-runtime-adapters.ts / collection-runner.ts — AIHOT固定JSON条件快照/数字稳定ID、有界容量回执；apiCheckpoints与成功Run同事务，仅持久化成功才推进；非分页/cursor实现。
- scripts/validate-relay-feed-incremental.ts / validate-api-incremental.ts / accept-incremental-transports.ts — URI作用域/旧回执/304/非法头/超时/JSON与容量反例，开发库三链路模拟上游真实PG验收；后者要求--confirm=INCREMENTAL-TRANSPORTS-DEVELOPMENT，不等同生产或真实上游验收。
- lib/server/content/source-auto-admission-policy.ts / source-auto-admission.ts — Raw真实主页链接→固定Relay同源Feed→onboarding条件登记；持久job租约/输入CAS/退避、2条/65秒阶段预算；范围与回滚见采集合同“机器来源准入”。
- lib/server/content/source-onboarding.ts — 自动模式复用Source/审计事务与锁；校验Raw发现租约，包含历史记录的身份/Route查重，禁止自动恢复归档或禁用来源。
- lib/server/content/source-qualification.ts / source-qualification-runtime.ts — 成熟与运行退化仅消费当前runtime/checkpoint生产Run，不借旧路由成绩；source-runtime-governance-execution.ts对AUTOMATIC登记实行有界观察，不新增人工队列。
- scripts/run-server-native-automatic-cycle.ts — 唯一SYSTEM锁内SOURCE_AUTO_ADMISSION阶段；无AI调用或新调度。新来源从后续周期参与采集。
- scripts/validate-source-auto-admission.ts / accept-source-auto-admission.ts — 纯策略反例与开发库模拟Relay/真实PG验收；后者要求--confirm=SOURCE-ADMISSION-DEVELOPMENT，持有SYSTEM锁并清理测试数据，不证明真实上游可达。
- lib/server/content/practice-discovery-policy.ts — 共享原文发布者补证决策、专属成功/失败/运行冷却、aging与可执行名额选择；由intelligence-read-model/collection-expansion共用，正式栏目门槛不变。
- lib/server/content/collection-runner.ts — Feed/API条件请求/空结果/304、按Route和URI隔离validator、成功Run与Source checkpoint原子提交；旧Relay无支持时不宣称已节省请求。
- lib/server/content/practice-material-backfill.ts — 7日一致性分页扫描、到期FIFO与站点轮转、跨页面站点退避；共享JS/PG工具标题词边界，扫描超限明确失败。
- scripts/validate-practice-discovery-policy.ts / validate-feed-incremental.ts / validate-public-practice-content.ts — 补证自锁、身份/冷却、空Feed/304/非法XML、分页公平行为断言。
- scripts/accept-feed-incremental.ts — 仅开发库、SYSTEM同锁、测试Feed响应；验证真实持久化、Raw提交失败不推进ETag、下一轮304，finally清理测试来源。
- lib/server/content/public-feed-discovery.ts — htmlparser2实现标准RSS/Atom自动发现，复用下载结果与有限备用路径；网络安全由现有Collector负责。
- lib/server/content/source-onboarding.ts — 网络取消预算、实时采样、事务注册/审计与并发重复检查；注册不授予事实权或成熟资格。
- lib/server/content/source-management-policy.ts / discovery-filter.ts / collection-runner.ts — 同一份后台规则进入SYSTEM cheap/full过滤，排除优先、标题新增词召回，Run记录规则版本；不追删历史。
- scripts/validate-source-input-runtime.ts / accept-source-input-runtime.ts — 确定性反例及开发库真实Feed注册、保存、过滤、Raw验收；后者要求--confirm=SOURCE-INPUT-DEVELOPMENT，结束恢复规则，生产库拒绝执行。
- lib/server/content/practice-materials.ts — 逐篇公开服务器获取回执、完整正文/字幕及步骤/实际配置/工作流、输入材料与产出校验；缺失原因分开返回，条件以采集合同为准。
- scripts/validate-practice-materials.ts — 当前公开材料反例校验；数据库分类由现役来源与采集验收覆盖。
- lib/server/content/pixaroma-source.ts — 固定作者公开材料实采后事务注册/审计、SYSTEM onboarding与既有候选关联；保留资格观察，不授予事实权。
- lib/server/content/public-workflow-materials.ts — Deno材料消费、ZIP/JSON内存结构校验及明确材料缺口；复用runtime adapter进入SYSTEM。
- scripts/accept-pixaroma-public-source.ts / scripts/validate-pixaroma-route.ts — 服务器验收与确定性路由/ZIP/去重测试；生产必须显式`--confirm=PIXAROMA-PRODUCTION`，预览地址仅开发可用，实采复用SYSTEM advisory lock。
- lib/server/content/public-practice-access.ts — 材料访问依赖与作者注册必要条件；不按播放量授予原创资格。
- lib/server/content/public-creator-probe.ts — 有限公开B站详情/列表/字幕探测；海外缺路由失败关闭，禁止Cookie/Browser回退。
- scripts/accept-public-creator-candidates.ts — development-only逐候选评估，--apply写Raw核验状态与事务审计，不自动注册。
- lib/server/content/managed-practice-search.ts — 真实探测后显式登记定向搜索Source与事务审计；作者候选沿Raw保存。
- scripts/accept-managed-practice-search-live.ts — development-only探测/登记/持久化验收；默认只读，--probe联网、--configure写开发、--verify检查。
- app/admin/sources/page.tsx
- components/AdminSourceManagementWorkspace.tsx
- app/api/admin/content/source-management/route.ts
- lib/server/content/source-management.ts
- lib/server/content/source-onboarding.ts
- lib/server/content/source-target.ts
- lib/server/content/source-connection.ts

### Acquisition Routing
- lib/server/content/source-acquisition-plan.ts
- lib/server/content/source-acquisition-runtime-adapters.ts
- Source Identity 与 Route 分离
- Primary / Fallback / cost / runtime support / fallback reason

### Qualification
- lib/server/content/source-qualification.ts
- lib/server/content/source-qualification-runtime.ts
- lib/server/content/adapter-qualification.ts
- lib/server/content/collection-capability-router.ts
- lib/server/content/source-capability-audit.ts

Runtime Health/Audit 状态与 Source Qualification 分离：
- Health 描述“当前是否可运行”
- Qualification 描述“是否有足够证据长期自动运行”
- current evidence owner：`source-qualification-runtime.ts`的`currentQualificationEvidencePredicate()`统一SQL证据过滤；`listSourceQualificationSnapshots()`在每Source排名前匹配当前checkpoint，最多读取12条payload并使用最近5条；`refreshSourceRuntimeQualification()`同谓词先过滤再取最多6条。时间与资格规则唯一见采集合同，部署事实见CURRENT_SYSTEM_FACTS。
- Evidence Sufficiency：INSUFFICIENT / EARLY / MATURE；AUTO_READY 只允许 MATURE。
- 正式 Run 写 `system-collection-runtime-v2` + current qualification checkpoint；checkpoint 绑定 Route/runtime/schema，不回读 qualification result version。
- 旧 `sourceRuntimeAllowsAutomaticCollection()` 同步第二口径已删除；current Qualification Snapshot 是唯一资格 read owner。
- `scripts/validate-qualification-evidence-window.ts / accept-qualification-evidence-window.ts`：纯函数与开发库独有夹具验收；`content:qualification-evidence:check / accept`，开发库确认参数`--confirm=QUALIFICATION-EVIDENCE-DEVELOPMENT`，同SYSTEM锁、无网络请求、finally清理。`accept-discovery-collection-boundary.ts`以当前checkpoint纯选择对照真实数据库有界查询。

### Unified SYSTEM Collection Boundary
- lib/server/content/collection-runner.ts
- lib/server/content/source-portfolio-runtime.ts
- lib/content/radar-source-portfolio.ts
- scripts/run-server-native-automatic-cycle.ts
- deploy/systemd/opc-collection.service / opc-collection.timer（同一主链的服务器模板，未安装不代表已部署）
- lib/server/content/collection-deployment.ts + scripts/check-collection-deployment.ts：只读事务检查采集所需表/列、表权限与管理员身份；users/分析结果只读，不要求账号变更权限。不运行迁移、不安装 timer；READY 仅表示这些结构前提通过，不证明索引、类型、RLS 或真实采集可用。
- scripts/validate-collection-deployment.ts：缺列/缺权限、只读身份、管理员/超管阻断、启动网络参数一致性回归；入口 content:collection:deployment:check。
- content:collection:deployment:preflight：部署前只读预检，环境由服务器受保护文件或进程提供；不输出连接串，失败非零退出。
- 统一 CLI / systemd 启动为 Node 多地址连接保留 2000ms 单次尝试预算，整体 fetch 仍由原有超时约束；避免服务器 Node 默认短尝试超时导致可达 Feed 被误判断网。无全局网络设置变更。

正式 runtime：
fixed tick → current SYSTEM source discovery → Governance due selection → runSystemSourcePortfolio(due IDs) → Qualification reconcile → bounded Topic Momentum due follow-up → Radar snapshot

无 due：NO_SOURCE_DUE

Topic Momentum queue reconcile 与 due selection 使用同一 follow-up eligibility，排除已明确 aiRelevant=false / operationalUsefulness.eligible=false 或归档的 Event；不改变 Momentum 计算与展示门槛。

### Collection Quality
- lib/server/content/discovery-filter.ts
- lib/server/content/pollution-syndication-gate.ts
- lib/server/content/entity-resolution.ts
- lib/server/content/entity-registry.ts
- lib/server/content/source-policy.ts

顺序：Cheap Relevance → Deterministic/Pollution → Entity/Full Relevance

### Raw / Dedup
- lib/server/content/discovery.ts
- lib/server/content/raw-relevance-dedup.ts
- 原文不可被 Presentation 覆盖
- `ingestRawItem` 将 Raw/Observation 和 Run 的 `metadata.rawItemIds` 写入同一事务；`collection-runner.ts` 失败收尾合并 metadata，保留部分提交归属。`runFreshScan` 在正式 Source Run 中续接缺少 Event 关联的非历史 Raw，并返回 `recoveredRawItemIds` 供同一 Event 策略刷新。`createEventSeed` 原子提交 Event 与 Raw 关联。

### Event / Evidence
- lib/server/content/event-seed-clustering.ts
- lib/server/content/event-clustering.ts + scripts/validate-event-seed-recall.ts — Event Seed v3 / Event Cluster v5 完整候选扫描、同新闻中英文改写与误合并反例；新规则作用于后续运行，历史回填需另行审计。
- lib/server/content/event-clustering.ts
- lib/server/content/event-relevance-gate.ts
- lib/server/content/event-policy.ts
- lib/server/content/event-signal.ts
- `app/api/admin/content/discovery/events/route.ts` 仅保留管理员 Event 列表 GET；正式 Event Seed 写入由 SYSTEM Source Run 触发，不提供独立 POST。

### Expansion / Creator / Momentum
- lib/server/content/collection-expansion.ts
- Event 扩展证据删除与替换由 `collection-expansion.ts` 在同一事务中提交。
- lib/server/content/event-expansion-budget.ts
- lib/server/content/event-expansion-coverage-gap.ts
- lib/server/content/creator-coverage-qualification.ts
- lib/server/content/topic-momentum.ts
- lib/server/content/topic-momentum-runtime.ts
- scripts/run-server-native-automatic-cycle.ts（唯一生产 scheduler owner）
- scripts/accept-topic-momentum-runtime-live.ts（Development live acceptance only）

Topic Momentum v9：身份/时间/衰减、复燃与稳定交集趋势规则唯一见采集架构合同§10/§16；`participant-name.ts`承接原名称别名，`participant-identity.ts`统一解析身份并提供独立实测判定。

### Presentation
- lib/server/content/review-localization.ts
- lib/server/content/presentation-enrichment.ts
- Presentation 不拥有 Event identity / Verification / Fact Authority

### Runtime Utility / Governance
- lib/server/content/source-runtime-utility.ts
- lib/server/content/source-runtime-governance.ts
- lib/server/content/source-runtime-governance-execution.ts
- lib/server/content/source-runtime-operations.ts

读取 bounded，Human Gate 保留。

### Radar
- lib/server/content/intelligence-read-model.ts
- lib/server/content/radar-snapshot.ts
- 快照 schema `radar-snapshot-v16-audit-fixes` 使旧健康统计失效并重建；生产切换仍要求 Web/SYSTEM 同版，不涉及 v17 存储方案。
- lib/server/content/today-intelligence-readiness.ts
- app/api/admin/content/intelligence/route.ts
- components/AdminIntelligenceWorkspace.tsx
- lib/content/radar-snapshot-wire.ts（Radar 页面选择 listing 精简传输；compact及原API完整响应保留；event-detail认证后按需读取完整story/时间线，历史日期和asOf受原有界限校验；按Event ID还原排序，缺失引用显式报错）


旧 Event 决策 route/writer、人工 Expansion POST、旧 `IGNORED` 可见性过滤、内容工作台兼容控件及评论挖旧决策读取已退出；`content_candidate_decisions` 和 `discoveryStatus` 仍保留历史审计。采集质量反馈由 `lib/server/content/collection-quality-feedback.ts`、独立表和 admin-only API 拥有，热点追踪与来源管理只消费标签。生产路径见 `docs/CURRENT_SYSTEM_FACTS.md`。`refreshSourceManagedEventExpansion` 在 `topic-momentum-runtime.ts` 和 SYSTEM 中的自动调用必须保留。

### Comment Demand
- lib/server/content/comment-insight.ts
- app/api/admin/content/discovery/events/[eventId]/demand-signals/route.ts
- Trigger-based、bounded、无 Fact / Verification / Hotspot authority

## 2. Legacy Manual Compatibility — RETIRED PRODUCT OWNER

仅保留：
- /admin/manual-collection redirect /admin/sources
- /api/admin/manual-collection 410 tombstone

没有 Manual Collection Core，没有 Manual Event Candidate owner，没有新写入路径。
Current `runSourceCollection` 为 SYSTEM-only；Source Run API 不再接受 `manualUrl`，Source Onboarding 无可维护 route 时返回 UNRESOLVED。

## 3. Server-native Optional Adapters

Current 只允许无需用户交互登录、可由服务器持续运行的 Adapter。X / 小红书 Browser Runner、China Trend Browser Runner、Connection API 与 Browser fallback 已物理退出 current tree。保留的 optional adapter 必须满足：
- Source / Route 先存在且通过 live Probe
- 服务器无需人工登录或续期即可持续运行
- payload 必须进入 runSourceCollection
- Signal 与 Fact Authority 保持分离
- 不建第二 Event pipeline

## 4. Current Implementation Boundaries

- 自动执行：run-server-native-automatic-cycle.ts → Source Portfolio → Qualification → Discovery Expansion → Topic Momentum → Radar Snapshot；无模型调用，生产目标与互斥规则见采集架构合同 §13。
- 主题召回：discovery-filter.ts 保留 Cheap → Entity → Full Filter；支持 REA 官方仓库、ComfyUI、MCP 与带具体 AI/实践上下文的 Skill；关键词仅作候选信号，不授予 Fact / Hot 权限。
- 资格读取：source-qualification.ts 的 listSourceQualificationSnapshots 先对有效 SYSTEM production Run 分来源 row_number，再最多读取每来源 12 条 metadata；原有最近 5 条成熟度规则不变，accept-discovery-collection-boundary.ts 对照真实数据库取样计数。
- 人工 AI：events/[eventId]/analysis POST 沿用管理员鉴权；content-understanding-enrichment.ts / event-ai-analysis.ts 保留后续分析与表达能力，退出定时调用链。
- Story：event-story-read-model.ts 由 canonical Event / public Evidence 派生；overview/latest/digest/reportTimeline/relatedEvents 不拥有 Event truth。heatSeries 为 DERIVED_REPLAY，不声称持久化历史。
- Radar Snapshot 实现：`radar-snapshot-storage.ts` 将持久化 payload 的精选/当前热点压缩为七日 Event 引用，`radar-snapshot.ts` 读回时还原为原 API 结构；读路径兼容既有 v16 快照。该步只减少数据库快照重复存储，不减少浏览器响应体，后者仍需按 Event 详情懒加载与版本重取。
- `aihot-heat-shadow.ts` 仍由 `intelligence-read-model.ts` 用于 Event Story 的 48 小时 `DERIVED_REPLAY` 曲线，并随只读 Event 数据输出；它不决定 Current Hot、精选或 AI 热点练习资格。`selection-shadow-*` 是独立实验/人工评估入口，不属于正式采集决策。不能把前者误判为无引用旧文件直接删除；已结束批次报告和一次性阈值探索脚本不保留在 current tree。
- 回归：run-discovery-collection-full-regression.ts 汇总全部失败，不以首个失败掩盖后续检查；validate-discovery-collection-boundary.ts 验证召回正反例、人工 AI 边界和锁生命周期。

## 5. Validation Owners

Current commands:
- npm run scripts:current:check
- npm run content:collection-current:check
- npm run content:source-management:check
- npm run content:source-acquisition-routing:check
- npm run content:adapter-qualification:check
- npm run content:source-qualification:v2:check
- npm run content:source-coverage-precision:check
- npm run content:collection-runner:check
- npm run content:collection-quality-gates:check
- npm run content:ai-discovery-filter:check
- npm run content:raw-relevance-dedup:005:check
- npm run content:presentation-enrichment:006:check
- npm run content:topic-momentum:check
- npm run content:source-runtime-utility:008:check
- npm run content:source-runtime-governance:009:check
- npm run content:source-runtime-governance-execution:010:check
- npm run content:intelligence-read-model:check
- npm run content:radar-collection:check
- npm run content:radar-read-path:check
- npm run content:collection-realignment:check
- npm run content:source-management-console:018:check
- npm run content:server-only-source-cleanup:019:check
- npm run content:server-only-source-expansion:020:check
- npm run content:source-stability-consolidation:021:check
- npm run content:source-management-unification:022:check
- npm run content:source-management-dashboard:023:check
- npm run content:source-management-learning-style:025:check
- npm run content:source-management-workspace-modes:027:check
- npm run content:hot-tracking-curation:audit
- npm run content:platform-source-route:audit
- npm run content:current-source-production-runs:audit
- npm run content:pending-source-production:028:check
- npm run content:pending-source-production:028:accept
- npm run typecheck
- npm run build

Standalone DB audit / acceptance 必须关闭 DB client。

## 7. UI Boundary

`/admin/sources` 保留 Fast Index + Lazy Detail：顶部四项统计 + 左约 31% 发现渠道 + 右约 69% 来源管理。左侧 7 个渠道始终展开、内部滚动，点击后筛选右侧 Source；右侧单行筛选为搜索 + 语言 + 统一状态 + 采集方式。Platform capability 与 DailyHot Route 不再作为左侧独立目录。
`/admin/intelligence` 产品名为「热点追踪」，消费 Event / Curation / Momentum 与 AI热点练习数据。当前热点追踪和来源管理两页均已获产品负责人实际体验并批准；后续视觉改动仍须重新审核。
任何后续新的可视化能力仍必须先体验审核，再继续下一阶段。

## Reliability / Incremental Runtime

- `services/overseas-collector-relay/deno.ts`：海外Relay入口，复用固定材料路由及条件HTTP模块；上游总预算16秒，YouTube search10秒/stats5秒、Google12秒、固定来源文档每跳10秒；统计失败保留搜索结果，错误正文不透传。
- `lib/server/content/overseas-collector-relay-client.ts`：20秒调用期限；保留allowlist错误码；不把任意响应正文放进异常。
- `lib/server/content/trend-discovery.ts`：Relay请求前预留101单位配额；缺失统计不虚构0、不以缺失stats触发直连。
- `lib/server/content/topic-momentum-runtime.ts`：SQL筛选合格due事件并LIMIT；当前UTC ISO时间戳文本比较，非canonical旧值进入有界修复；不再先全量reconcile写库；jsonb局部更新保留并发owner元数据。同值状态不写；快照继续按周期更新以反映时间衰减。
- `scripts/check-collection-deployment.ts --migration-plan`：只读核对journal/SQL SHA256前缀与破坏性语句，历史不可读/漂移均BLOCKED；不授予权限、不执行DDL。
- `npm run content:collection:reliability:check`：Deno故障、指标降级、配额预留、安全错误的确定性夹具。
- `npm run content:collection:incremental:accept`：Development-only PostgreSQL临时表；应用账号无TEMP权限时可由本地postgres会话显式添加`--local-admin-fixtures`，不修改业务表或应用权限。

### Quality / seven-day backfill / unified practice eligibility

- `collection-item-quality.ts`：字段完整性和原始发布时间窗口；不推断完整历史/原创比例。
- `collection-runner.ts`：先筛backfill时间，再走既有Cheap Filter/Policy/Raw/Observation/Event；实体解析显式allowAi:false；Feed优先content字段；metadata记录质量/窗口缺口。
- `source-asset-cleanup.ts`：明确退役Manual/Browser路径归档，保留历史事实。
- `scripts/manage-collection-quality.ts`：默认只读审计；Development-only `--apply-cleanup` / `--backfill` / `--refresh-baseline` 使用原SYSTEM锁/collector串行执行，不作为定时器。
- `content:collection:quality-window:check`：完整性、Feed内容优先、时间边界、未来窗口、禁止隐式实体AI和跨读取路径实践门槛。
- `services/overseas-collector-relay/DEPLOYMENT.md`：受保护迁移连接与Deno发布操作。Deno新增DeepMind/GitHub固定路径，必须health确认后才启用public-sources=v2；未覆盖其他公共Feed不标为Relay已完成。

### 采集质量反馈与运营状态

- `collection-quality-feedback.ts`：Event 行锁、Event/Source 归因、追加式标签、请求幂等、反馈当时的自动状态快照和同事务审计；不写 Event 状态。
- `radar-snapshot.ts`：只读覆盖归档状态；旧忽略不再隐藏 Event。基础缓存不缓存人工标签。
- `content:operations:check / content:quality-feedback:accept`：快照覆盖及开发库样本、幂等、归因和审计验收。界面已获产品负责人明确 USER_APPROVED；后续视觉改动仍需重新审核。

### 日历时间线与真实漏斗

- `lib/content/radar-calendar.ts`：北京时间日期、自然日半开区间、唯一Event稳定排序；无条数上限。
- `intelligence-read-model.ts::listRadarCalendarRange / listRadarTimelinePage`：完整七日只读事务、逐日历史、固定asOf与归档排除；下一日期仅来自同规则可见历史，无合格内容返回null，界面显示到底且不追加空历史日。
- `collection-funnel.ts / collection-runner.ts / discovery.ts`：Run版本化计数、历史未知、Raw去重及Event新建/归并；不改Schema或增加AI。
- `source-runtime-operations.ts`：今日/七日/最近100次独立窗口，只投影统计所需元数据，排除资格探测与Manual。
- `content:radar-calendar:check / content:radar-calendar:accept`：午夜/边界/400同时间事件与真实数据库只读验收；生产必须显式`--production-read-only`，不刷新生产快照。

### 实践主题与汇总排除

- `intelligence-read-model.ts / radar-snapshot.ts`：直接实践列表和快照共享主题投影；汇总退出热点及参与者；模型发布不改写成实操。
- `collection-expansion.ts`：SYSTEM每周期一实践主题、现役B站/YouTube一个主来源与一个不同Provider备用共享至多三查询×五结果；P3A实现/验收范围见采集合同；原文主题校验、无隐藏Source、失败隔离。无合格来源返回缺口，不能视为联网验证通过。
- `topic-momentum.ts / topic-momentum-runtime.ts`：汇总Raw不贡献独立参与者；不改变原有热度权重。

### 逐篇正文/字幕实现

- `lib/server/content/public-practice-content.ts`：固定公开正文/字幕适配器、材料缓存与仅材料字段合并；SYSTEM接入点为collection-runner，重复Raw接入点为discovery。
- `services/overseas-collector-relay/deno.ts`：PUBLIC_PRACTICE_DOCUMENT仅接受Comfy教程白名单，有限下载工作流和查询官方模型清单；不是任意URL代理。
- `lib/server/content/public-workflow-materials.ts`：受限ZIP内的人类说明与逐篇操作步骤，不执行附件。
- `scripts/validate-public-practice-content.ts`：边界/回执/字幕反例；`scripts/accept-public-practice-content.ts`：腾讯云公开材料实测及明确开发库现有作者SYSTEM去重持久化验收。

### 同版生产发布校验

Web与SYSTEM必须同版并使用当前snapshot schema；生成完整快照后再由新版Web消费。发布必须核对PM2实际exec cwd、SYSTEM current链接、唯一timer和生产items=total=唯一数/日期合计；仅收到reload成功不是目录已切换的证据。PM2配置使用JSON，Linux临时脚本固定LF。旧release保留显式回退，不作为current入口；课程文件对比保持不变。

`AdminIntelligenceWorkspace.tsx`与`AdminSourceManagementWorkspace.tsx`：首读显示读取态；可见页面5分钟重读、回到页面且上次请求已过1分钟则追赶。后台重读保留管理员筛选、已加载历史和来源编辑输入；热点/AI热点练习同读一个Radar Snapshot。UI已获产品负责人体验批准。

## PUBLIC-PRACTICE-MATERIALS — 2026-10-16

- Owner：本节仅记录现役实现；栏目门槛仍由既有合同负责。公开正文使用 Mozilla Readability＋静态 DOM，Deno 固定允许路由覆盖 LangChain、n8n、Comfy、AWS；Comfy 指定公开工作流下载后记录字节、SHA256、节点与获取时间，不宣称执行成功。
- SYSTEM 唯一周期在 PRACTICE_MATERIALS 阶段全局串行补最多2篇，复用原 advisory lock；不再逐 Source 另开详情预算。成功正文复用，失败指数退避，同站首次网络失败后停止本批后续请求。七日候选仅取真实发布时间，不造日期，不新增 Raw/Event/Source。
- `lib/server/content/practice-material-backfill.ts` 为 Core；`scripts/backfill-public-practice-materials.ts` 默认为只读计划，生产 apply 需显式确认。写入仅限 Raw 材料元数据和审计，原始身份、关注配置及事实不改。

## AI热点练习

规则唯一owner见采集合同§23。
- `ai-hotspot-practice.ts`：工具主题、独立原发布者去重、实质讨论、独立URL已验证材料合并及存量过滤；广义热点研究入口 `shouldExpandHotDiscussion` 保留模型研究覆盖。
- `ai-hotspot-practice-store.ts` / `radar-snapshot.ts`：持久触发审计、canonical归一、原始分类/标题复查与旧快照工具过滤；无新表/定时器。
- `topic-momentum.ts` / `intelligence-read-model.ts`：现行合格原文讨论身份投影与热点门槛；规则见采集架构合同，部署状态见CURRENT_SYSTEM_FACTS。
- `event-clustering.ts` / `run-server-native-automatic-cycle.ts`：历史规则版本补聚类，沿唯一SYSTEM锁运行。
- `lib/content/radar-snapshot-wire.ts` / `validate-radar-read-path.ts`：界面消费字段保留、内部/重复大字段裁剪与wire roundtrip验证。
- `validate-ai-hotspot-practice.ts` / `validate-topic-momentum.ts` / `validate-practice-discovery-policy.ts`：纯模型、同站别名、独立教程URL、无材料、时间窗口与广义研究反例。
- `accept-canonical-event.ts` / `accept-event-expression.ts`：真实开发PG历史补聚类、工具练习、AI表达回退与CAS，使用mock且清理夹具。
- `scripts/fixtures/radar-independent-official-v1.json` / `inspect-source-radar-gaps.ts --full-funnel --production-read-only`：先冻结官方Feed独立分母、再只读对账；无栏目真值标签时精确率/召回率为UNKNOWN。范围与实测见执行计划Task5G，不把局部Feed覆盖称为全网召回。

## P2 异步材料理解（实现映射）

规则唯一owner见采集架构合同“P2 持久异步材料理解”。

- `lib/server/ai/configured-chat.ts`：可选输出上限/思考控制、请求尝试与实际usage回执；旧调用默认行为保留。
- `lib/server/content/content-understanding-enrichment.ts`：版本化输入hash、材料指纹、中文理解提示/Validator、最多一次修复；无全文翻译调用。旧兼容入口委托持久runtime。
- `lib/server/content/content-understanding-runtime.ts`：Raw持久任务、PG锁/租约、退避、revision CAS、ai_runs审计及部分用量未知状态。
- `lib/server/content/presentation-enrichment.ts` / `intelligence-read-model.ts`：完整Raw校验当前指纹，过期理解回退，复用原展示字段；不修改UI组件。
- `scripts/run-server-native-automatic-cycle.ts`：同锁CONTENT_UNDERSTANDING阶段在采集/补证后、快照前；失败不阻断快照。
- `scripts/validate-configured-chat-controls.ts` / `validate-async-content-understanding.ts`：纯Gateway协议/usage、无翻译、幂等/版本/预算/修复/读模型边界。
- `scripts/accept-async-content-understanding.ts`：仅开发库、SYSTEM同锁、真实PG+mock模型，验证当前展示/重复/并发/revision/退避/旧租约/来源停用与用量缺口；要求`--confirm=ASYNC-UNDERSTANDING-DEVELOPMENT`，finally清理，无付费调用。

## P3A 受管搜索持久计划（实现协议）

- `lib/server/content/managed-practice-query-policy.ts`：计划键及六小时generation、同轮query完成去重、24h六次预算、租约/Provider退避、两无新增参考停止及单主/单备共享三次请求。
- `lib/server/content/collection-expansion.ts`：Event/Source锁内复核与ExpansionRun事务领取，网络在事务外；持久审计/成功失败记录、三个互补实践角度、失败备用与机械证据刷新。Source权限与身份规则保持。
- `scripts/validate-managed-practice-query.ts`：请求边界/重启历史/去重/无新增/旧历史/退避/备用和B站错误响应行为测试。
- `scripts/accept-managed-practice-query.ts`：独有开发库Source/Event/Run、同SYSTEM锁、模拟上游；计划重复/输入变更不逃逸预算/并发领取/回滚/退避/停用，finally清理；`--confirm=MANAGED-QUERY-DEVELOPMENT`。开发库真实PG验收通过，独有providerRef与现有来源隔离；无真实搜索/付费调用。

## P3B 通用网页搜索（实现映射）

规则唯一owner见采集架构合同P3B。

- `services/overseas-collector-relay/brave-search.js` / `.d.ts`：Node/Deno共享结果协议、公开引用URL/结构/去重、片段与无日期边界。
- `services/overseas-collector-relay/deno.ts`：固定Brave接口、仅Relay环境Key、禁止重定向、流式容量和请求时限。
- `lib/server/content/overseas-collector-relay-client.ts`：非Secret开关与安全错误码。
- `lib/server/content/managed-practice-search.ts`：有界探测/身份登记/审计与停用前置；`collection-expansion.ts`复用P3A并提供确定性来源主备选择。
- `scripts/validate-brave-search.ts`：模拟Node→Relay→上游协议、错误/容量/URL、片段/日期和主备选择行为；`content:brave-search:check`。
- `scripts/accept-brave-search.ts`：开发库同SYSTEM锁、真实PG+mock上游，独有夹具无生产/付费调用，要求`--confirm=BRAVE-SEARCH-DEVELOPMENT`；`content:brave-search:accept`。
- `scripts/accept-managed-practice-search-live.ts`：开发库现役管理工具支持显式`--provider=BRAVE_SEARCH`，默认保持B站/YouTube；不自动执行或采购。

## P3C 固定源头正文与无日期参考补证（实现映射）

规则唯一owner见采集架构合同P3C。

- `services/overseas-collector-relay/public-practice-routes.js` / `.d.ts`：固定Hugging Face博客、Simon日期文章与TIL分类文章路径及共享路由协议；Deno health声明此协议，当前版本见部署手册。
- `lib/server/content/public-practice-content.ts` / `public-article-extraction.ts`：复用已有受限抓取、静态Readability正文提取、材料收据与附件不足判定，未新建正文执行链。
- `lib/server/content/practice-material-backfill.ts`：有效关联Event的近期无日期待审参考入队，原已日期队列保持；提交前输入/来源/关联资格复核、原子材料合并与Audit；可限定rawItemIds但不跳过条件。
- `scripts/validate-practice-reference-body.ts`：固定路径/越权/Node→本地Relay→mock上游、正文/片段、重定向/容量/缺附件；`content:practice-reference-body:check`。
- `scripts/accept-practice-reference-body.ts`：仅开发库、SYSTEM同锁、真实PG+mock，验证日期与无日期SQL、非法/过期/归档/未来关联、收据复用、输入变更/来源停用/抓取中归档拒绝；finally清理，要求`--confirm=PRACTICE-REFERENCE-DEVELOPMENT`；`content:practice-reference-body:accept`。

## P3D 现役Feed固定迁移出口（实现映射）

规则唯一owner见采集架构合同P3D。

- `services/overseas-collector-relay/watchlist-feeds.js` / `.d.ts`：固定迁移映射、有效目标与v2协议；`validate-source-watchlist.ts`校验与既有身份目录一致。
- `services/overseas-collector-relay/deno.ts` / `lib/server/content/overseas-collector-relay-client.ts`：双端URI条件隔离及迁移回执验证；复用现役采集器、事务checkpoint与去重，不修改Source目录。
- `scripts/validate-watchlist-feed-migration.ts`：Node→本地Relay→mock上游，版本/URI/状态、条件读取和固定目标拒绝反例；`content:feed-migration:check`。
- `scripts/accept-watchlist-feed-migration.ts`：开发库SYSTEM同锁、真实PG+mock，Route隔离/Raw去重/提交失败与429不推进/304/身份保护，finally清理；`content:feed-migration:accept -- --confirm=FEED-MIGRATION-DEVELOPMENT`。

## P3F 固定作者Feed与源头准入（实现映射）

规则唯一owner见采集架构合同P3F。

- `services/overseas-collector-relay/public-source-routes.js / .d.ts`：共享固定Source路径、作者域名与首页别名；Node与Deno共用，非Source注册清单。`public-practice-routes.js`复用固定文章范围，当前协议见部署手册。
- `overseas-collector-relay-client.ts / deno.ts`：作者开关、协议回执、逐跳origin与条件读取；`source-auto-admission.ts / source-auto-admission-policy.ts / source-onboarding.ts`：候选域名、观察首页与既有身份别名去重/停用保护。均在`lib/server/content`及既有Relay路径，无新调度。
- `scripts/validate-author-feed-routes.ts`：固定路径/首页/Feed发现与条件200/304、旧回执/越界/开关反例；`content:author-feed:check`。
- `scripts/accept-author-feed-source.ts`：开发库同SYSTEM锁真实PG+mock，关闭零请求、CONDITIONAL登记/幂等/单身份/归档首页别名保护与静态材料收据；finally清理，仅`content:author-feed:accept -- --confirm=AUTHOR-FEED-DEVELOPMENT`，无真实付费调用。

## P3G Eugene固定Feed声明与文章别名（实现映射）

规则唯一owner见采集架构合同P3G。

- `public-source-routes.js / .d.ts`提供固定RSS anchor与文章别名；`public-feed-discovery.ts`仅从实际根主页观察声明，并遵循base。共享路由位置仍在`services/overseas-collector-relay`，发现位于`lib/server/content`。
- `collection-runner.ts`的Feed解析与`discovery.ts`的canonical身份复用固定别名；`overseas-collector-relay-client.ts / deno.ts`双端隔离条件凭证并保持协议拒绝；不迁移历史Raw或创建新Source Owner。
- `scripts/validate-eugene-feed.ts` / `content:eugene-feed:check`覆盖实际声明/错误base/域名路径/Feed链接与canonical/协议/别名条件读取。
- 复用`accept-author-feed-source.ts --author=eugene`（省略仍为Hamel），要求既有开发库确认参数；真实PG+mock验证登记/身份/归档/材料与不同标题及hash的别名去重，独有夹具清理。

## P3H 收尾（实现映射）

规则唯一owner见采集架构合同P3H；生产健康见CURRENT_SYSTEM_FACTS。

- `lib/content/requested-source-targets.ts`：两组39对象唯一目标清单；`source-watchlist-policy.ts`新增requestedSources只读匹配投影，沿`source-coverage-report.ts`及`content:source-watchlist:inspect`输出，不注册来源。
- `services/overseas-collector-relay/curated-publisher-feeds.js / .d.ts`：五个发布者固定Feed与文章范围；Source/Practice共享并由Deno间接加载，`public-feed-discovery.ts`复用固定候选。作者候选SQL自动沿既有共享域名集合，无新Runner。
- `lib/server/content/source-publisher-identity.ts`：只将五站声明的主页/列表/Feed映射为同一发布者，自动登记复用现役身份；`source-onboarding.ts`继续先执行归档/停用/歧义保护。`validate-curated-publisher-feeds.ts`覆盖正负例；PyTorch开发PG夹具验证已有列表页身份不会被登记为第二主页来源。
- `lib/server/content/aihot-discovery-metadata.ts`：两个既有AIHOT适配器的提示Schema校验；`source-acquisition-runtime-adapters.ts`保留低分/hasNext截断，`trend-discovery.ts`保留分类理由和原文引用，不新增Provider或API请求。
- `scripts/validate-curated-publisher-feeds.ts` / `content:curated-publisher-feeds:check`：五站固定路径、目录拒绝、发现与Deno请求；`validate-api-incremental.ts`覆盖两条AIHOT适配器的提示/低分/日期/截断，无数据库依赖；现有watchlist检查覆盖39目标及停用/重复/假域名反例。
- `accept-author-feed-source.ts --author=pytorch|modal|apple_ml|together|vllm`复用现有开发库确认参数和独有夹具清理；Hamel/Eugene参数保持。`validate-eugene-feed.ts`另直接调用Deno验证别名validator剥离，不依赖Node先处理。

## 生产缺口诊断与练习报道输入

规则唯一owner见采集合同§23及固定Feed出口；运行事实见CURRENT_SYSTEM_FACTS。

- `lib/server/content/ai-hotspot-practice.ts`组装直接/扩展报道，复核标题锚点、限定原作者例外并归一参与者；`intelligence-read-model.ts`提供同源输入，完整材料状态保持独立。
- `scripts/validate-ai-hotspot-practice.ts`覆盖有原文聚合/作者Feed、同URL/host、纯趋势、错误版本、同品牌异模型和通用词误关联；不以模拟结果宣称召回率。
- `scripts/inspect-source-radar-gaps.ts` / `content:source-radar-gaps:inspect`只读当前来源近5次Run及七日栏目原因分布、最多20条可追溯样本；生产要求`--production-read-only`，可用`--as-of=ISO_DATE`限定窗口，但不是历史数据库快照或冻结所有内部时钟。无网络、模型调用或业务写入。
- `radar-quality-benchmark.ts`与`scripts/fixtures/radar-quality-v1.json`提供有出处的冻结关系/观察参考队列；`content:radar-quality:replay`回放当前评分器正反方向与冻结成员归属，质量目标与基线稳定性分开。`content:radar-quality:check`校验引用、日期、重复对、UNKNOWN/零分母及真实评分器冻结结果，并接入采集quick回归。参考队列仅OBSERVED_ONLY，全量发现召回率保持UNKNOWN；精选拒绝原因与正向信号分开统计。基线结果与验收限制见执行计划Task5A。
- `deno.ts`与`overseas-collector-relay-client.ts`提供兼容gzip、重复Feed字段协商和安全分层传输错误；`validate-relay-feed-incremental.ts`验证完整正文还原及旧版兼容。固定迁移表包含宝玉，迁移验证遍历全部映射并隔离条件凭证。

## P4B canonical事件与成员证据（实现映射）

规则唯一owner见采集架构合同P4B；实施边界与验收见执行计划Task5B，生产事实仍见CURRENT_SYSTEM_FACTS。

- lib/server/content/canonical-event.ts：有效成员、稳定canonical身份/代表/时间线与历史练习投影；event-clustering.ts：v6对象冲突、complete-link及事务串行化，原关联可追溯。
- event-policy.ts：共享projectEventPolicy与持久刷新；intelligence-read-model.ts：全成员Raw/Expansion聚合、去重及policy/栏目重算；以上路径均在lib/server/content。
- ai-hotspot-practice.ts / ai-hotspot-practice-store.ts：首次/末次时间与所有链接合并、历史只读归一和归档主成员的触发路由，保留原记录。
- scripts/validate-canonical-event.ts / content:canonical-event:check：冻结150对、版本/动作/桥接、有效成员与事实权限反例，加入采集quick回归；冻结评分基线v6保留previous v5，原冻结线上成员归属不改。
- scripts/accept-canonical-event.ts / content:canonical-event:accept -- --confirm=CANONICAL-EVENT-DEVELOPMENT：断言development/opc_ai_dev，SYSTEM同锁独有PG夹具，验证并发/幂等、成员证据/Expansion、归档主事件与新触发、时间线及已有簇冲突；finally清理，无上游或模型请求。

## P4C AI关系建议（实现映射）

规则唯一owner见采集架构合同P4C，实施/验收见执行计划Task5C。

- skills/event-relation/v1.ts及skills/REGISTRY.md：独立版本化关系Skill、输入输出类型和提示，不调用数据库或拥有状态。
- lib/server/content/event-relation-policy.ts：稳定完整组输入hash、结构/引用/逐对校验、对象/原发时间保护和缓存到期判断；event-clustering.ts提供语义路径硬冲突保护及既有Core簇写入函数。
- lib/server/content/event-relation-runtime.ts：anchor与候选游标、SYSTEM证据、ai_runs租约/缓存/usage/退避/CAS、事务映射与前状态审计；scripts/run-server-native-automatic-cycle.ts接独立EVENT_RELATION阶段，异常仍刷新快照。
- scripts/validate-event-relation.ts / content:event-relation:check：原文/标题错版本与独立动作、共用依赖版本遮蔽、原发时间缺失/过期、缺引用/跨对、UNKNOWN与低置信度、密钥不参与hash等行为反例，加入采集quick回归。
- scripts/accept-event-relation.ts / content:event-relation:accept -- --confirm=EVENT-RELATION-DEVELOPMENT：强制development/opc_ai_dev，SYSTEM锁及独有PG夹具+mock Gateway；缓存/退避/租约恢复与并发、来源/归档/开关/标题/成员CAS、无实体阻塞及第41候选、已有双成员簇全跨对与原Event保留；finally清理，0真实模型调用。

## P4E 完整漏斗（实现映射）

规则唯一owner见采集架构合同P4E，实施与验收见执行计划Task5E。

- `lib/server/content/radar-funnel.ts`：参考校验、逐层原因、时延/UNKNOWN、独立标签指标及严格配对比较；`radar-funnel-store.ts`：有界一致性只读事务、直接/扩展血缘与当前栏目/持久快照诊断。
- `scripts/inspect-source-radar-gaps.ts`：保留旧入口，`content:radar-funnel:audit`默认60条观察参考；`--references=...`接收references数组，`--as-of=...`冻结时间，`--compare=...`比较同样本输出；生产额外要求`--production-read-only`。本批没有生产执行或独立金标。
- `event-policy.ts`：逐Raw相关性与SYSTEM事实权限；`intelligence-read-model.ts`仅诊断opt-in提供证据ID，默认产品返回不增加该字段；`canonical-event.ts`/`radar-snapshot.ts`按有效成员叠加操作状态。
- `content:radar-funnel:check`、`content:canonical-snapshot:check`及既有canonical反例纳入quick；`content:radar-funnel:accept -- --confirm=RADAR-FUNNEL-DEVELOPMENT`强制开发库、SYSTEM锁、隔离PG夹具与finally清理，无采集/模型请求。

## P4D canonical事件表达（实现映射）

规则唯一owner见采集架构合同P4D，实施/验收见执行计划Task5D。

- skills/event-expression/v1.ts / skills/REGISTRY.md：版本化输入输出类型与有界表达提示；无数据库权限。
- lib/server/content/event-expression-policy.ts：去重/指纹、逐字段引用和有界保护、当前表达读取；event-expression-context.ts：SYSTEM/Source事实权限与共享canonical输入；event-expression-runtime.ts：ai_runs缓存恢复、租约/退避/usage、提交CAS。
- lib/server/content/presentation-enrichment.ts / intelligence-read-model.ts：事件卡片/详情当前表达与原文回退；ai-hotspot-practice-store.ts：批量证据投影同canonical文案并保留original字段；无UI组件修改。
- scripts/run-server-native-automatic-cycle.ts：唯一SYSTEM的EVENT_EXPRESSION阶段；scripts/validate-event-expression.ts / content:event-expression:check：证据/捏造/版本/动作/传言裁剪、重复与失效行为反例，纳入quick。
- scripts/accept-event-expression.ts / content:event-expression:accept -- --confirm=EVENT-EXPRESSION-DEVELOPMENT：仅开发库PG+mock Gateway，验证真实卡片/练习投影、并发、缓存恢复、退避/租约/usage、输入/Source/成员/开关CAS与Signal/参考/未来/非SYSTEM排除；finally清理，无真实付费调用。

### P4H 工具资料覆盖

- `ai-hotspot-practice.ts`：直接报道与扩展材料均逐URL投影材料资格。
- `practice-materials.ts` / `public-practice-access.ts`：操作/配置与架构说明分辨、必需人工审批凭据及对应可选依赖范围；规则见采集合同。
- `scripts/fixtures/radar-independent-tools-v1.json`：两条预选官方Feed冻结17个URL及8篇正文的探索性资料判定；栏目标签保留UNKNOWN，不用于授予栏目资格。验收结果见执行计划Task5H。

### P4I 基于成熟实现的增量发现

- `system-discovery-receipt.ts` / `discovery.ts`：Observation创建覆盖、首SYSTEM回执/Run血缘及数据库冲突保护；legacy跨来源UNKNOWN不回填。`radar-funnel-store.ts`只用可证明首次时间。
- `managed-practice-query-policy.ts` / `collection-expansion.ts`：现有冷却周期的查询generation及Web中英轮转，保留原主备/租约/日请求约束。
- `validate-system-discovery-receipt.ts` / `accept-system-discovery-receipt.ts` / `accept-radar-funnel.ts`：首次重访/并发/上游时间伪造/历史跨来源未知与真实Run事务验收；accept只允许独立开发库。
- `scripts/fixtures/tool-author-editorial-pool-v1.json`：探索性原作者资料/栏目理由，原validator校验引用与UNKNOWN；非runtime权威、非完整金标。方案证据见一手研究附件，实测与限制见执行计划Task5I。

### P4J 当期独立证据核查

- `scripts/fixtures/current-tool-evidence-v1.json`：单独冻结当期原创身份、讨论精确时间、固定revision研究材料、真实出口差额及连续Run证据；不替代运行态Source/Qualification/Evidence。
- `scripts/validate-radar-quality-benchmark.ts`：校验分栏正例的独立日期/发布者、讨论Signal隔离、练习材料资格及首见缺失时延迟UNKNOWN；未执行材料检查保留null，不能算负例。
- 研究依据、限定路由实取与未通过项见执行计划Task5J及其一手研究附件；本批只补证据/验证，无业务算法、来源目录或UI变更。


## 来源管理栏目算法与采集观测

- lib/content/radar-algorithm-policy.ts — 共享Schema、默认配置、参数标签/范围及正向/排除规则。
- lib/server/content/radar-algorithm-store.ts — 管理员配置持久化、版本CAS、事务审计；复用content_radar_snapshots的独立配置键。
- topic-momentum.ts / topic-momentum-runtime.ts、bole-daily-curation.ts、ai-hotspot-practice.ts / ai-hotspot-practice-store.ts — 显式消费配置，默认结果保持；固定证据Gate不变。
- intelligence-read-model.ts / radar-snapshot.ts / radar-funnel-store.ts / intelligence API — 共享配置与版本，包含练习诊断。
- lib/server/content/source-collection-analytics.ts — 当前目录SYSTEM正式运行的有界只读按日/来源/状态聚合，定义见采集合同。
- app/api/admin/content/source-management/route.ts — algorithm/analytics读取与SAVE_RADAR_ALGORITHM管理员写入。
- components/SourceAlgorithmControls.tsx / AdminSourceManagementWorkspace.tsx / app/admin/sources/sources.css — 筛选规则后新增算法菜单，双栏下方新增图表与明细；UI体验状态见PROJECT_STATUS。
- scripts/validate-radar-algorithm-policy.ts / accept-radar-algorithm-controls.ts — 参数影响/非法输入回归及隔离15433 PG保存/CAS/审计/统计排除/同快照版本验收；不证明生产发布或整体栏目质量。

## 来源采集频率

- lib/content/source-collection-schedule.ts：5–1440分钟Schema、覆盖读取与正式Run水位谓词。
- lib/server/content/source-collection-schedule-store.ts：当前Source单源/批量读写、锁行CAS与原子审计；source-runtime-governance-execution.ts复用覆盖值及有效Run选择。
- lib/server/content/collection-runner.ts：创建RUNNING时即写探测/回填意图，所有完成/失败分支保持标记。
- components/SourceCollectionFrequency.tsx与source-management API：第五菜单、基础/有效/到期投影和管理员操作；deploy/systemd/opc-collection.timer为唯一分钟检查候选模板。
- scripts/validate-source-collection-schedule.ts / accept-source-collection-schedule.ts：纯边界与真实隔离PG/CAS/批量/Runner/失败探测/虚拟时钟到期查询验收；后者固定开发15433并需--confirm=SOURCE-SCHEDULE-STAGING，禁止生产写入和外网。

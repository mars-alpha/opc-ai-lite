# COLLECTION_IMPLEMENTATION_MAPPING.md

Status: CURRENT IMPLEMENTATION ONLY
Contract: docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md
Task: COLLECTION-ARCHITECTURE-REALIGNMENT-001

历史 Phase 与已删除文件由 Git 追溯。本文件不保存 superseded runtime 清单。

## 1. Current Owners

### Source Management
- lib/server/content/public-feed-discovery.ts — htmlparser2实现标准RSS/Atom自动发现，复用下载结果与有限备用路径；网络安全由现有Collector负责。
- lib/server/content/source-onboarding.ts — 网络取消预算、实时采样、事务注册/审计与并发重复检查；注册不授予事实权或成熟资格。
- lib/server/content/source-management-policy.ts / discovery-filter.ts / collection-runner.ts — 同一份后台规则进入SYSTEM cheap/full过滤，排除优先、标题新增词召回，Run记录规则版本；不追删历史。
- scripts/validate-source-input-runtime.ts / accept-source-input-runtime.ts — 确定性反例及开发库真实Feed注册、保存、过滤、Raw验收；后者要求--confirm=SOURCE-INPUT-DEVELOPMENT，结束恢复规则，生产库拒绝执行。
- lib/server/content/practice-materials.ts — 逐篇公开服务器获取回执、完整正文/字幕及步骤/实际配置/工作流、输入材料与产出校验；缺失原因分开返回，条件以采集合同为准。
- scripts/validate-practice-materials.ts / scripts/accept-practice-boundaries.ts — 材料反例与真实数据库只读分类验收（生产必须显式--production-read-only）。
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
- 011/012 current evidence owner：`listSourceQualificationSnapshots()` 按 Source 读取 recent runs first；每 Source 扫描上限12、业务只使用最近5条 SYSTEM production Run；180d 仅 query safety fallback，不再有30d hard filter。
- Evidence Sufficiency：INSUFFICIENT / EARLY / MATURE；AUTO_READY 只允许 MATURE。
- 正式 Run 写 `system-collection-runtime-v2` + current qualification checkpoint；checkpoint 绑定 Route/runtime/schema，不回读 qualification result version。
- 旧 `sourceRuntimeAllowsAutomaticCollection()` 同步第二口径已删除；current Qualification Snapshot 是唯一资格 read owner。

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

### Event / Evidence
- lib/server/content/event-seed-clustering.ts
- lib/server/content/event-clustering.ts
- lib/server/content/event-relevance-gate.ts
- lib/server/content/event-policy.ts
- lib/server/content/event-signal.ts

### Expansion / Creator / Momentum
- lib/server/content/collection-expansion.ts
- lib/server/content/event-expansion-budget.ts
- lib/server/content/event-expansion-coverage-gap.ts
- lib/server/content/creator-coverage-qualification.ts
- lib/server/content/topic-momentum.ts
- lib/server/content/topic-momentum-runtime.ts
- scripts/run-server-native-automatic-cycle.ts（唯一生产 scheduler owner）
- scripts/accept-topic-momentum-runtime-live.ts（Development live acceptance only）

Topic Momentum：过去 7 天 / 168h，独立账号与机构去重，72h half-life，authority=PRESENTATION_ONLY；只有当前与前一 72h 窗口持续覆盖完全相同的至少 2 个参与者 cohort 时才输出趋势。

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
- lib/server/content/today-intelligence-readiness.ts
- app/api/admin/content/intelligence/route.ts
- components/AdminIntelligenceWorkspace.tsx

内部 Read Model：Latest / Worth Practicing / Unverified / Current Hot；正式产品界面仍为既有“当前热点 + 今日值得做 + 精选 / 全部动态”排版。

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

## 4. Retired Physical Owners

以下 current 文件/入口已物理删除：
- automatic-collection.ts
- /admin/automatic-collection
- /api/admin/content/automatic-collection
- /api/admin/content/discovery/runtime
- media-discovery.ts
- research-discovery.ts
- real-trend-runtime.ts
- manual-event-candidate-gate.ts
- trend-rising.ts
- 独立 Topic Momentum systemd service/timer
- govern-server-native-auto-sources.ts
- accept-server-native-auto-baseline.ts
- reset/probe Radar Source Portfolio 一次性脚本
- migrate-development-legacy-source-registry.ts
- 对应 run scripts / old phase qualification scripts / old backtest entrypoint

这些名字不得重新成为 current runtime dependency。

## 5. Current Implementation Boundaries

- 自动执行：run-server-native-automatic-cycle.ts → Source Portfolio → Qualification → Discovery Expansion → Topic Momentum → Radar Snapshot；无模型调用，生产目标与互斥规则见采集架构合同 §13。
- 主题召回：discovery-filter.ts 保留 Cheap → Entity → Full Filter；支持 REA 官方仓库、ComfyUI、MCP 与带具体 AI/实践上下文的 Skill；关键词仅作候选信号，不授予 Fact / Hot 权限。
- 资格读取：source-qualification.ts 的 listSourceQualificationSnapshots 先对有效 SYSTEM production Run 分来源 row_number，再最多读取每来源 12 条 metadata；原有最近 5 条成熟度规则不变，accept-discovery-collection-boundary.ts 对照真实数据库取样计数。
- 人工 AI：events/[eventId]/analysis POST 沿用管理员鉴权；content-understanding-enrichment.ts / event-ai-analysis.ts 保留后续分析与表达能力，退出定时调用链。
- Story：event-story-read-model.ts 由 canonical Event / public Evidence 派生；overview/latest/digest/reportTimeline/relatedEvents 不拥有 Event truth。heatSeries 为 DERIVED_REPLAY，不声称持久化历史。
- Shadow：aihot-heat-shadow.ts、selection-shadow-* 保持独立实验/人工评估用途，不参与正式采集决策；不保留已结束批次报告与一次性阈值探索脚本。
- 既定 Hot Tracking、Worth Practicing、Curation、UI 与数据库 Schema 本轮保持。
- 回归：run-discovery-collection-full-regression.ts 汇总全部失败，不以首个失败掩盖后续检查；validate-discovery-collection-boundary.ts 验证召回正反例、人工 AI 边界和锁生命周期。

## 6. Validation Owners

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
`/admin/intelligence` 产品名为「热点追踪」，保持既有页面排版，只接新的 Event / Curation / Momentum 数据。当前两页均为 `HUMAN_REVIEW_PENDING`，体验通过前不新增平行 UI 或第二套热点算法。
任何后续新的可视化能力仍必须先体验审核，再继续下一阶段。

## Reliability / Incremental Runtime

- `services/overseas-collector-relay/deno.ts`：海外 Relay 单文件；上游总预算16秒，YouTube search10秒/stats5秒，Google/X12秒；统计失败保留搜索结果，错误正文不透传。
- `lib/server/content/overseas-collector-relay-client.ts`：20秒调用期限；保留allowlist错误码；不把任意响应正文放进异常。
- `lib/server/content/trend-discovery.ts`：Relay请求前预留101单位配额；缺失统计不虚构0、不以缺失stats触发直连。
- `lib/server/content/topic-momentum-runtime.ts`：SQL筛选合格due事件并LIMIT；当前UTC ISO时间戳文本比较，非canonical旧值进入有界修复；不再先全量reconcile写库；jsonb局部更新保留并发owner元数据。同值状态不写；快照继续按周期更新以反映时间衰减。
- `scripts/check-collection-deployment.ts --migration-plan`：只读核对journal/SQL SHA256前缀与破坏性语句，历史不可读/漂移均BLOCKED；不授予权限、不执行DDL。
- `npm run content:collection:reliability:check`：Deno故障、指标降级、配额预留、安全错误的确定性夹具。
- `npm run content:collection:incremental:accept`：Development-only PostgreSQL临时表；应用账号无TEMP权限时可由本地postgres会话显式添加`--local-admin-fixtures`，不修改业务表或应用权限。

### Quality / seven-day backfill / unified practice eligibility

- `collection-item-quality.ts`：字段完整性和原始发布时间窗口；不推断完整历史/原创比例。
- `collection-runner.ts`：先筛backfill时间，再走既有Cheap Filter/Policy/Raw/Observation/Event；实体解析显式allowAi:false；Feed优先content字段；metadata记录质量/窗口缺口。
- `practical-evidence-actionability.ts::isWorthPracticingEligible`：时间线pool、直接实践列表及radar-snapshot共享2证据/2来源/2类型门槛。
- `source-asset-cleanup.ts`：明确退役Manual/Browser路径归档，保留历史事实。
- `scripts/manage-collection-quality.ts`：默认只读审计；Development-only `--apply-cleanup` / `--backfill` / `--refresh-baseline` 使用原SYSTEM锁/collector串行执行，不作为定时器。
- `content:collection:quality-window:check`：完整性、Feed内容优先、时间边界、未来窗口、禁止隐式实体AI和跨读取路径实践门槛。
- `services/overseas-collector-relay/DEPLOYMENT.md`：受保护迁移连接与Deno发布操作。Deno新增DeepMind/GitHub固定路径，必须health确认后才启用public-sources=v2；未覆盖其他公共Feed不标为Relay已完成。

### P0 operations consistency

- `discovery.ts::recordCandidateDecision`：Event行锁、Decision/Event状态及审计事务；返回discoveryStatus。
- `workbench.ts::recordContentAudit`：可接受调用方事务executor，既有调用保持兼容。
- `radar-snapshot.ts`：v12日历窗口与漏斗、完整窗口Event索引、当前运营状态只读覆盖、30分钟时效；基础缓存不缓存运营覆盖。
- `source-management.ts / source-management-policy.ts`：启停、归档、恢复和Policy事务审计；归档来源可在原列表恢复为禁用。
- `source-onboarding.ts`：阶段从真实资格/正式Run/探测派生，局部元数据更新与审计同事务。
- `content:operations:check / content:operations:accept`：时效、榜单覆盖、开发库回滚/并发/跨进程与夹具清理。UI仍需真实体验审核，不能用这些校验替代USER_APPROVED。

### 日历时间线与真实漏斗

- `lib/content/radar-calendar.ts`：北京时间日期、自然日半开区间、唯一Event稳定排序；无条数上限。
- `intelligence-read-model.ts::listRadarCalendarRange / listRadarTimelinePage`：完整七日只读事务、逐日历史、固定asOf与归档排除；下一日期仅来自同规则可见历史，无合格内容返回null，界面显示到底且不追加空历史日。
- `collection-funnel.ts / collection-runner.ts / discovery.ts`：Run版本化计数、历史未知、Raw去重及Event新建/归并；不改Schema或增加AI。
- `source-runtime-operations.ts`：今日/七日/最近100次独立窗口，只投影统计所需元数据，排除资格探测与Manual。
- `content:radar-calendar:check / content:radar-calendar:accept`：午夜/边界/400同时间事件与真实数据库只读验收；生产必须显式`--production-read-only`，不刷新生产快照。

### 实践主题与汇总排除

- `practical-evidence-actionability.ts`：汇总识别、发布主体排除、具体任务/操作判定、六小时搜索冷却；实践资格唯一门槛保持。
- `practice-topics.ts`：formal actionable链接按明确tool/goal归并，复算证据/来源/类型，保留父Event并使用教程标题；未知身份或目标保持候选。
- `intelligence-read-model.ts / radar-snapshot.ts`：直接实践列表和快照共享主题投影；汇总退出热点及参与者；模型发布不改写成实操。
- `collection-expansion.ts`：SYSTEM每周期最多一实践主题、一个已管理健康B站/YouTube搜索来源、两查询×五结果；原文主题校验、无隐藏Source、失败隔离。无合格来源返回缺口，不能视为联网验证通过。
- `topic-momentum.ts / topic-momentum-runtime.ts`：汇总Raw不贡献独立参与者；不改变原有热度权重。
- `content:practice-topics:check / content:practice-expansion:check / content:practical-actionability:check`：新闻附着教程、同作者、不同任务、未知身份、资格失败关闭、发布伪教程与汇总反例。

### 逐篇正文/字幕实现

- `lib/server/content/public-practice-content.ts`：固定公开正文/字幕适配器、材料缓存与仅材料字段合并；SYSTEM接入点为collection-runner，重复Raw接入点为discovery。
- `services/overseas-collector-relay/deno.ts`：PUBLIC_PRACTICE_DOCUMENT仅接受Comfy教程白名单，有限下载工作流和查询官方模型清单；不是任意URL代理。
- `lib/server/content/public-workflow-materials.ts`：受限ZIP内的人类说明与逐篇操作步骤，不执行附件。
- `scripts/validate-public-practice-content.ts`：边界/回执/字幕反例；`scripts/accept-public-practice-content.ts`：腾讯云公开材料实测及明确开发库现有作者SYSTEM去重持久化验收。

### 同版生产发布校验

Web与SYSTEM必须同版并使用当前snapshot schema；生成完整快照后再由新版Web消费。发布必须核对PM2实际exec cwd、SYSTEM current链接、唯一timer和生产items=total=唯一数/日期合计；仅收到reload成功不是目录已切换的证据。PM2配置使用JSON，Linux临时脚本固定LF。旧release保留显式回退，不作为current入口；课程文件对比保持不变。

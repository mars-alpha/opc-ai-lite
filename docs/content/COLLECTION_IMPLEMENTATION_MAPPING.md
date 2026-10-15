# COLLECTION_IMPLEMENTATION_MAPPING.md

Status: CURRENT IMPLEMENTATION ONLY
Contract: docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md
Task: COLLECTION-ARCHITECTURE-REALIGNMENT-001

历史 Phase 与已删除文件由 Git 追溯。本文件不保存 superseded runtime 清单。

## 1. Current Owners

### Source Management
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
